import { db, developerProfileTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { DEFAULT_DEVELOPER_PROFILE } from "./developer-profile-defaults";

type ProfileRow = typeof developerProfileTable.$inferSelect;

export function formatProfile(row: ProfileRow) {
  return {
    id: row.id,
    name: row.name,
    headline: row.headline,
    phone: row.phone,
    email: row.email,
    location: row.location,
    portfolioUrl: row.portfolioUrl,
    aboutMe: row.aboutMe,
    workExperience: row.workExperience ?? [],
    education: row.education ?? [],
    projects: row.projects ?? [],
    technicalSkills: row.technicalSkills ?? [],
    languages: row.languages ?? [],
    status: row.status,
    updatedAt: row.updatedAt.toISOString(),
  };
}

async function getStoredProfile() {
  const [row] = await db.select().from(developerProfileTable).limit(1);
  return row ?? null;
}

export async function ensureDeveloperProfile() {
  const existing = await getStoredProfile();
  if (existing) return existing;

  const [created] = await db
    .insert(developerProfileTable)
    .values(DEFAULT_DEVELOPER_PROFILE)
    .returning();
  return created;
}

export async function getPublishedDeveloperProfile() {
  const profile = await ensureDeveloperProfile();
  if (profile.status !== "published") return null;
  return formatProfile(profile);
}

export async function getDeveloperProfileForAdmin() {
  const profile = await ensureDeveloperProfile();
  return formatProfile(profile);
}

export type ProfileUpdateInput = Partial<{
  name: string;
  headline: string;
  phone: string;
  email: string;
  location: string;
  portfolioUrl: string;
  aboutMe: string;
  workExperience: ProfileRow["workExperience"];
  education: ProfileRow["education"];
  projects: ProfileRow["projects"];
  technicalSkills: ProfileRow["technicalSkills"];
  languages: ProfileRow["languages"];
  status: string;
}>;

export async function updateDeveloperProfile(data: ProfileUpdateInput) {
  const existing = await ensureDeveloperProfile();
  const [updated] = await db
    .update(developerProfileTable)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(developerProfileTable.id, existing.id))
    .returning();
  return formatProfile(updated);
}
