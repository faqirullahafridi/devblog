import { db, jobsTable } from "@workspace/db";
import { eq, sql, max } from "drizzle-orm";
import { slugify } from "./slugify";
import { JOB_FETCHERS, JOB_SOURCES, type ExternalJob } from "./job-providers";
import { logger } from "./logger";
import { isLongRunningServer } from "./runtime";

const JOB_TTL_DAYS = 45;

function syncIntervalMs(): number {
  const hours = Number(process.env.JOBS_SYNC_INTERVAL_HOURS ?? 24);
  return Math.max(1, hours) * 60 * 60 * 1000;
}

let lastSyncAt: Date | null = null;
let syncInProgress = false;
let lastSyncResult: SyncResult | null = null;

export type SyncResult = {
  syncedAt: string;
  upserted: number;
  newJobs: number;
  bySource: Record<string, number>;
  errors: Array<{ source: string; error: string }>;
};

function jobSlug(source: string, externalId: string): string {
  const base = slugify(`${source}-${externalId}`).slice(0, 80);
  return base || `${source}-${externalId}`.replace(/[^a-z0-9-]/gi, "-").toLowerCase();
}

function safeDate(value?: Date | string | number): Date | undefined {
  if (value == null) return undefined;
  const d = value instanceof Date ? value : new Date(value);
  return Number.isNaN(d.getTime()) ? undefined : d;
}

function expiresAt(postedAt?: Date): Date {
  const now = new Date();
  const fresh = new Date(now);
  fresh.setDate(fresh.getDate() + JOB_TTL_DAYS);

  const base = safeDate(postedAt);
  if (!base) return fresh;

  const exp = new Date(base);
  exp.setDate(exp.getDate() + JOB_TTL_DAYS);
  // Providers often return stale posted dates; if still in feed, keep listing active.
  return exp < now ? fresh : exp;
}

async function upsertExternalJob(job: ExternalJob): Promise<boolean> {
  const slug = jobSlug(job.source, job.externalId);
  const [existing] = await db
    .select({ id: jobsTable.id })
    .from(jobsTable)
    .where(eq(jobsTable.slug, slug))
    .limit(1);

  await db
    .insert(jobsTable)
    .values({
      slug,
      title: job.title,
      company: job.company,
      description: job.description,
      requirements: "",
      location: job.location,
      remote: job.remote,
      salaryRange: job.salaryRange,
      category: job.category,
      applyUrl: job.applyUrl,
      source: job.source,
      externalId: job.externalId,
      region: job.region,
      isActive: true,
      expiresAt: expiresAt(job.postedAt),
    })
    .onConflictDoUpdate({
      target: jobsTable.slug,
      set: {
        title: job.title,
        company: job.company,
        description: job.description,
        location: job.location,
        remote: job.remote,
        salaryRange: job.salaryRange,
        category: job.category,
        applyUrl: job.applyUrl,
        region: job.region,
        isActive: true,
        expiresAt: expiresAt(job.postedAt),
        updatedAt: new Date(),
      },
    });

  return !existing;
}

async function resolveLastSyncAt(): Promise<Date | null> {
  if (lastSyncAt) return lastSyncAt;
  const [row] = await db
    .select({ last: max(jobsTable.updatedAt) })
    .from(jobsTable)
    .where(sql`${jobsTable.source} IS NOT NULL`);
  return row?.last ?? null;
}

async function countJobsBySource(source: string): Promise<number> {
  const [row] = await db
    .select({ count: sql<number>`count(*)`.mapWith(Number) })
    .from(jobsTable)
    .where(eq(jobsTable.source, source));
  return row?.count ?? 0;
}

async function hasMissingConfiguredSources(): Promise<boolean> {
  if (process.env.JOOBLE_API_KEY?.trim() && (await countJobsBySource("jooble")) === 0) return true;
  if (process.env.EVER_JOBS_BASE_URL?.trim() && (await countJobsBySource("everjobs")) === 0) return true;
  return false;
}

export async function syncExternalJobs(force = false): Promise<SyncResult> {
  if (syncInProgress) {
    return lastSyncResult ?? { syncedAt: new Date().toISOString(), upserted: 0, newJobs: 0, bySource: {}, errors: [] };
  }

  const interval = syncIntervalMs();
  const previousSync = await resolveLastSyncAt();
  const missingSources = await hasMissingConfiguredSources();
  if (!force && !missingSources && previousSync && Date.now() - previousSync.getTime() < interval) {
    return lastSyncResult ?? {
      syncedAt: previousSync.toISOString(),
      upserted: 0,
      newJobs: 0,
      bySource: {},
      errors: [],
    };
  }

  syncInProgress = true;
  try {
    const bySource: Record<string, number> = {};
    const errors: Array<{ source: string; error: string }> = [];
    let newJobs = 0;
    let upserted = 0;

    for (const { source, fn, enabled } of JOB_FETCHERS) {
      if (!enabled()) continue;
      try {
        const sourceJobs = await fn();
        for (const job of sourceJobs) {
          const isNew = await upsertExternalJob(job);
          if (isNew) newJobs++;
          upserted++;
        }
        bySource[source] = sourceJobs.length;
        if (sourceJobs.length > 0) {
          logger.info({ source, count: sourceJobs.length }, "Job source synced");
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Fetch failed";
        errors.push({ source, error: msg });
        logger.warn({ source, err }, "Job source sync failed");
      }
    }

    const result: SyncResult = {
      syncedAt: new Date().toISOString(),
      upserted,
      newJobs,
      bySource,
      errors,
    };

    lastSyncAt = new Date();
    lastSyncResult = result;
    logger.info({ upserted, newJobs, bySource, errorCount: errors.length }, "External jobs synced");
    return result;
  } finally {
    syncInProgress = false;
  }
}

export function getJobSyncStatus() {
  return {
    lastSyncAt: lastSyncAt?.toISOString() ?? null,
    inProgress: syncInProgress,
    lastResult: lastSyncResult,
    syncIntervalHours: Number(process.env.JOBS_SYNC_INTERVAL_HOURS ?? 24),
    sources: JOB_SOURCES.map((s) => ({
      ...s,
      configured:
        !s.requiresKey ||
        (s.id === "jooble" && !!process.env.JOOBLE_API_KEY?.trim()) ||
        (s.id === "everjobs" && !!process.env.EVER_JOBS_BASE_URL?.trim()) ||
        s.id === "themuse",
    })),
  };
}

export function startJobSyncScheduler() {
  const enabled = process.env.JOBS_SYNC_ENABLED !== "false";
  if (!enabled) return;

  if (!isLongRunningServer()) {
    logger.info(
      "Job sync scheduler disabled in serverless runtime — use Vercel Cron (/api/jobs/sync/cron) or POST /api/jobs/sync",
    );
    return;
  }

  setTimeout(() => {
    syncExternalJobs().catch((err) => logger.error({ err }, "Initial job sync failed"));
  }, 5000);

  setInterval(() => {
    syncExternalJobs().catch((err) => logger.error({ err }, "Scheduled job sync failed"));
  }, syncIntervalMs());
}

export async function ensureFreshJobs(): Promise<void> {
  const previousSync = await resolveLastSyncAt();
  const interval = syncIntervalMs();
  const missingSources = await hasMissingConfiguredSources();
  if (missingSources || !previousSync || Date.now() - previousSync.getTime() >= interval) {
    await syncExternalJobs(missingSources);
  }
}
