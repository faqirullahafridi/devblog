import { randomBytes } from "node:crypto";
import { query } from "./db-pool.js";
import {
  getVisitorId,
  parseQuery,
  readJsonBody,
  sendJson,
  setCache,
  setNoCache,
  slugify,
  toIso,
  routeError,
} from "./route-utils.js";
import { ROADMAP_GOALS, ROADMAP_LEVELS, generateRoadmapPayload } from "./roadmap-data.js";

function runJavaScriptChallenge(code, testCases) {
  const start = Date.now();
  const visible = (testCases || []).filter((t) => !t.hidden);
  const cases = visible.length ? visible : testCases || [];
  try {
    const fn = new Function(
      `"use strict";\n${code}\nif (typeof solution !== 'function') throw new Error('Define a function named solution');\nreturn solution;`,
    )();
    if (typeof fn !== "function") {
      return { passed: false, runtimeMs: Date.now() - start, error: "Define a function named solution", results: [] };
    }
    const results = [];
    for (const tc of cases) {
      let input;
      try {
        input = JSON.parse(tc.input);
      } catch {
        input = tc.input;
      }
      let expected;
      try {
        expected = JSON.parse(tc.expected);
      } catch {
        expected = tc.expected;
      }
      const args = Array.isArray(input) ? input : [input];
      const actual = fn(...args);
      const ok = JSON.stringify(actual) === JSON.stringify(expected);
      results.push({ input: tc.input, expected: tc.expected, actual: JSON.stringify(actual), ok });
    }
    return { passed: results.every((r) => r.ok), runtimeMs: Date.now() - start, results };
  } catch (err) {
    return { passed: false, runtimeMs: Date.now() - start, error: err instanceof Error ? err.message : String(err), results: [] };
  }
}

async function handlePlaygroundsList(req, res) {
  setCache(res, 60);
  const q = parseQuery(req.url);
  const language = q.language;
  const search = q.search;
  const pageNum = Math.max(1, parseInt(q.page || "1", 10) || 1);
  const limitNum = Math.min(50, parseInt(q.limit || "12", 10) || 12);
  const offset = (pageNum - 1) * limitNum;
  const visitorId = getVisitorId(req, res);

  const conditions = [];
  if (q.publicOnly === undefined || q.publicOnly === "true") {
    conditions.push(`p.is_public = true`);
  } else {
    conditions.push(`(p.is_public = true OR p.visitor_id = '${visitorId}')`);
  }
  if (language) conditions.push(`p.language = '${language.replace("'", "''")}'`);
  if (search) conditions.push(`(p.title ILIKE '%${search.replace("'", "''")}%' OR p.slug ILIKE '%${search.replace("'", "''")}%')`);
  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  const { rows } = await query(
    `SELECT p.id, p.slug, p.title, p.language, p.is_public AS "isPublic", p.author_name AS "authorName",
            p.views, p.created_at AS "createdAt", p.updated_at AS "updatedAt"
     FROM playgrounds p ${where} ORDER BY p.updated_at DESC LIMIT $1 OFFSET $2`,
    [limitNum, offset],
  );
  const { rows: countRows } = await query(`SELECT COUNT(*)::int AS count FROM playgrounds p ${where}`);
  sendJson(
    res,
    200,
    {
      playgrounds: rows.map((r) => ({ ...r, createdAt: toIso(r.createdAt), updatedAt: toIso(r.updatedAt) })),
      total: countRows[0]?.count ?? 0,
      page: pageNum,
      limit: limitNum,
    },
  );
}

async function loadPlaygroundBySlug(slug) {
  const { rows } = await query(`SELECT * FROM playgrounds WHERE slug = $1 LIMIT 1`, [slug]);
  const pg = rows[0];
  if (!pg) return null;
  const filesRes = await query(
    `SELECT id, filename, content, sort_order AS "sortOrder" FROM playground_files WHERE playground_id = $1 ORDER BY sort_order`,
    [pg.id],
  );
  return { ...pg, files: filesRes.rows };
}

async function handlePlaygroundGet(req, res, slug) {
  const visitorId = getVisitorId(req, res);
  const data = await loadPlaygroundBySlug(slug);
  if (!data) return sendJson(res, 404, { error: "Not found" });
  if (!data.is_public && data.visitor_id !== visitorId) return sendJson(res, 403, { error: "Private snippet" });
  await query(`UPDATE playgrounds SET views = views + 1 WHERE id = $1`, [data.id]);
  sendJson(res, 200, { ...data, createdAt: toIso(data.created_at), updatedAt: toIso(data.updated_at) });
}

async function handlePlaygroundShareGet(req, res, token) {
  const { rows } = await query(`SELECT * FROM playground_shares WHERE share_token = $1 LIMIT 1`, [token]);
  const share = rows[0];
  if (!share) return sendJson(res, 404, { error: "Share link not found" });
  if (share.expires_at && new Date(share.expires_at) < new Date()) return sendJson(res, 410, { error: "Share link expired" });
  const { rows: pgRows } = await query(`SELECT * FROM playgrounds WHERE id = $1 LIMIT 1`, [share.playground_id]);
  const pg = pgRows[0];
  if (!pg) return sendJson(res, 404, { error: "Snippet not found" });
  const data = await loadPlaygroundBySlug(pg.slug);
  if (!data) return sendJson(res, 404, { error: "Not found" });
  sendJson(res, 200, { ...data, createdAt: toIso(data.created_at), updatedAt: toIso(data.updated_at), shareToken: share.share_token });
}

async function handlePlaygroundsCreate(req, res) {
  const visitorId = getVisitorId(req, res);
  const body = await readJsonBody(req);
  const { title, language, isPublic, authorName, files, forkedFromId } = body;
  if (!title || !language || !files?.length) return sendJson(res, 400, { error: "title, language, and files are required" });
  const baseSlug = slugify(title) || "snippet";
  const slug = `${baseSlug}-${randomBytes(3).toString("hex")}`;
  const { rows } = await query(
    `INSERT INTO playgrounds (slug, title, language, is_public, visitor_id, author_name, forked_from_id)
     VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
    [slug, title, language, !!isPublic, visitorId, (authorName || "Anonymous").trim(), forkedFromId ?? null],
  );
  const pg = rows[0];
  await query(
    `INSERT INTO playground_files (playground_id, filename, content, sort_order) VALUES ${files
      .map((_, i) => `($1, $${i * 3 + 2}, $${i * 3 + 3}, $${i * 3 + 4})`)
      .join(", ")}`,
    [pg.id, ...files.flatMap((f, i) => [f.filename, f.content])],
  ).catch(() => {});
  const loaded = await loadPlaygroundBySlug(slug);
  sendJson(res, 201, loaded);
}

async function handlePlaygroundsPatch(req, res, slug) {
  const visitorId = getVisitorId(req, res);
  const body = await readJsonBody(req);
  const { title, isPublic, files } = body;
  const { rows } = await query(`SELECT * FROM playgrounds WHERE slug = $1 LIMIT 1`, [slug]);
  const pg = rows[0];
  if (!pg) return sendJson(res, 404, { error: "Not found" });
  if (pg.visitor_id !== visitorId) return sendJson(res, 403, { error: "Not your snippet" });
  const updates = [];
  const params = [];
  let idx = 1;
  if (title !== undefined) {
    updates.push(`title = $${idx++}`);
    params.push(title);
  }
  if (isPublic !== undefined) {
    updates.push(`is_public = $${idx++}`);
    params.push(!!isPublic);
  }
  if (updates.length) {
    params.push(pg.id);
    await query(`UPDATE playgrounds SET ${updates.join(", ")} WHERE id = $${idx}`, params);
  }
  if (files?.length) {
    await query(`DELETE FROM playground_files WHERE playground_id = $1`, [pg.id]);
    const vals = files.flatMap((f, i) => [pg.id, f.filename, f.content]);
    await query(
      `INSERT INTO playground_files (playground_id, filename, content, sort_order) VALUES ${files
        .map((_, i) => `($${i * 3 + 1}, $${i * 3 + 2}, $${i * 3 + 3}, ${i})`)
        .join(", ")}`,
      vals,
    ).catch(() => {});
  }
  const loaded = await loadPlaygroundBySlug(slug);
  sendJson(res, 200, loaded);
}

async function handlePlaygroundsShareCreate(req, res, slug) {
  const visitorId = getVisitorId(req, res);
  const { rows } = await query(`SELECT * FROM playgrounds WHERE slug = $1 LIMIT 1`, [slug]);
  const pg = rows[0];
  if (!pg) return sendJson(res, 404, { error: "Not found" });
  if (pg.visitor_id !== visitorId) return sendJson(res, 403, { error: "Not your snippet" });
  const shareToken = randomBytes(12).toString("hex");
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30);
  const { rows: sRows } = await query(
    `INSERT INTO playground_shares (playground_id, share_token, expires_at) VALUES ($1,$2,$3) RETURNING *`,
    [pg.id, shareToken, expiresAt],
  );
  sendJson(res, 200, { shareToken: sRows[0].share_token, expiresAt: sRows[0].expires_at?.toISOString() });
}

async function handleChallengesList(req, res) {
  setCache(res, 60);
  const q = parseQuery(req.url);
  const pageNum = Math.max(1, parseInt(q.page || "1", 10) || 1);
  const limitNum = Math.min(50, parseInt(q.limit || "20", 10) || 20);
  const offset = (pageNum - 1) * limitNum;
  const conditions = [];
  if (q.difficulty) conditions.push(`difficulty = '${q.difficulty.replace("'", "''")}'`);
  if (q.category) conditions.push(`category = '${q.category.replace("'", "''")}'`);
  if (q.search) conditions.push(`(title ILIKE '%${q.search.replace("'", "''")}%' OR slug ILIKE '%${q.search.replace("'", "''")}%')`);
  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const { rows } = await query(`SELECT * FROM challenges ${where} ORDER BY created_at DESC LIMIT $1 OFFSET $2`, [limitNum, offset]);
  const { rows: countRows } = await query(`SELECT COUNT(*)::int AS count FROM challenges ${where}`);
  sendJson(res, 200, { challenges: rows.map((r) => ({ ...r, createdAt: toIso(r.created_at) })), total: countRows[0]?.count ?? 0, page: pageNum, limit: limitNum });
}

async function handleChallengeGet(req, res, slug) {
  setCache(res, 120);
  const { rows } = await query(`SELECT * FROM challenges WHERE slug = $1 LIMIT 1`, [slug]);
  const c = rows[0];
  if (!c) return sendJson(res, 404, { error: "Challenge not found" });
  sendJson(res, 200, { ...c, createdAt: toIso(c.created_at) });
}

async function handleChallengeDaily(req, res) {
  setCache(res, 300);
  const today = new Date().toISOString().slice(0, 10);
  let { rows } = await query(`SELECT * FROM challenges WHERE daily_date = $1 LIMIT 1`, [today]);
  let daily = rows[0];
  if (!daily) {
    const rs = await query(`SELECT * FROM challenges ORDER BY created_at DESC LIMIT 1`);
    daily = rs.rows[0];
  }
  if (!daily) return sendJson(res, 404, { error: "No challenges yet" });
  sendJson(res, 200, { ...daily, createdAt: toIso(daily.created_at) });
}

async function handleChallengeLeaderboard(req, res) {
  setCache(res, 120);
  const q = parseQuery(req.url);
  const limitNum = Math.min(50, parseInt(q.limit || "20", 10) || 20);
  const { rows } = await query(`SELECT * FROM challenge_scores ORDER BY total_points DESC LIMIT $1`, [limitNum]);
  sendJson(res, 200, rows.map((r) => ({ ...r, updatedAt: toIso(r.updated_at) })));
}

async function handleChallengeSubmit(req, res, slug) {
  const visitorId = getVisitorId(req, res);
  const body = await readJsonBody(req);
  const { code, authorName, language = "javascript" } = body;
  if (!code?.trim()) return sendJson(res, 400, { error: "code is required" });
  const { rows } = await query(`SELECT * FROM challenges WHERE slug = $1 LIMIT 1`, [slug]);
  const c = rows[0];
  if (!c) return sendJson(res, 404, { error: "Challenge not found" });
  const testCases = c.test_cases ?? [];
  const result = runJavaScriptChallenge(code, testCases);
  const score = result.passed ? c.points : 0;
  const name = (authorName?.trim()) || "Anonymous";
  const { rows: subRows } = await query(
    `INSERT INTO challenge_submissions (challenge_id, visitor_id, author_name, code, language, passed, score, runtime_ms)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
    [c.id, visitorId, name, code, language, result.passed, score, result.runtimeMs],
  );
  const submission = subRows[0];
  if (result.passed) {
    const { rows: existingRows } = await query(`SELECT * FROM challenge_scores WHERE visitor_id = $1 LIMIT 1`, [visitorId]);
    const existing = existingRows[0];
    if (existing) {
      await query(`UPDATE challenge_scores SET total_points = $1, challenges_solved = $2, author_name = $3 WHERE id = $4`, [
        existing.total_points + score,
        existing.challenges_solved + 1,
        name,
        existing.id,
      ]);
    } else {
      await query(`INSERT INTO challenge_scores (visitor_id, author_name, total_points, challenges_solved) VALUES ($1,$2,$3,$4)`, [
        visitorId,
        name,
        score,
        1,
      ]);
    }
    const today = new Date().toISOString().slice(0, 10);
    const { rows: streakRows } = await query(`SELECT * FROM challenge_streaks WHERE visitor_id = $1 LIMIT 1`, [visitorId]);
    const streak = streakRows[0];
    if (streak) {
      const last = streak.last_activity_date;
      let current = streak.current_streak;
      if (last !== today) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const y = yesterday.toISOString().slice(0, 10);
        current = last === y ? current + 1 : 1;
      }
      await query(`UPDATE challenge_streaks SET current_streak = $1, longest_streak = $2, last_activity_date = $3 WHERE id = $4`, [
        current,
        Math.max(streak.longest_streak, current),
        today,
        streak.id,
      ]);
    } else {
      await query(`INSERT INTO challenge_streaks (visitor_id, current_streak, longest_streak, last_activity_date) VALUES ($1,1,1,$2)`, [
        visitorId,
        today,
      ]);
    }
  }
  sendJson(res, 200, { submission: { ...submission, createdAt: toIso(submission.created_at) }, result });
}

async function handleRoadmapsOptions(req, res) {
  setCache(res, 3600);
  sendJson(res, 200, {
    levels: ROADMAP_LEVELS,
    goals: ROADMAP_GOALS.map((g) => ({ slug: g, label: g.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) })),
  });
}

async function handleRoadmapsGenerate(req, res) {
  const body = await readJsonBody(req);
  const { goal, currentLevel } = body;
  if (!goal || !currentLevel) return sendJson(res, 400, { error: "currentLevel and goal are required" });
  if (!ROADMAP_GOALS.includes(goal) || !ROADMAP_LEVELS.includes(currentLevel)) {
    return sendJson(res, 400, { error: "Invalid goal or currentLevel" });
  }
  const payload = generateRoadmapPayload(goal, currentLevel);
  const slug = `${goal}-${currentLevel}-${randomBytes(4).toString("hex")}`;
  const visitorId = getVisitorId(req, res);
  const { rows } = await query(
    `INSERT INTO roadmaps (slug, visitor_id, current_level, goal, title, payload) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
    [slug, visitorId, currentLevel, goal, payload.title, payload],
  );
  const r = rows[0];
  sendJson(res, 201, { slug: r.slug, payload, title: r.title, createdAt: toIso(r.created_at) });
}

async function handleRoadmapGet(req, res, slug) {
  setCache(res, 120);
  const visitorId = getVisitorId(req, res);
  const { rows } = await query(`SELECT * FROM roadmaps WHERE slug = $1 LIMIT 1`, [slug]);
  const r = rows[0];
  if (!r) return sendJson(res, 404, { error: "Roadmap not found" });
  const { rows: progressRows } = await query(`SELECT * FROM roadmap_progress WHERE roadmap_id = $1 ORDER BY created_at`, [r.id]);
  sendJson(res, 200, { ...r, createdAt: toIso(r.created_at), progress: progressRows, isOwner: r.visitor_id === visitorId });
}

async function handleRoadmapsMeList(req, res) {
  const visitorId = getVisitorId(req, res);
  const { rows } = await query(`SELECT * FROM roadmaps WHERE visitor_id = $1 ORDER BY created_at DESC LIMIT 50`, [visitorId]);
  sendJson(res, 200, rows.map((r) => ({ ...r, createdAt: toIso(r.created_at) })));
}

async function handleRoadmapProgress(req, res, slug) {
  const visitorId = getVisitorId(req, res);
  const body = await readJsonBody(req);
  const itemKey = body.itemKey || body.stepKey;
  const completed = body.completed;
  if (!itemKey) return sendJson(res, 400, { error: "itemKey is required" });
  const { rows } = await query(`SELECT * FROM roadmaps WHERE slug = $1 LIMIT 1`, [slug]);
  const r = rows[0];
  if (!r) return sendJson(res, 404, { error: "Not found" });
  if (r.visitor_id !== visitorId) return sendJson(res, 403, { error: "Not your roadmap" });
  const { rows: existing } = await query(`SELECT * FROM roadmap_progress WHERE roadmap_id = $1 AND item_key = $2 LIMIT 1`, [
    r.id,
    itemKey,
  ]);
  if (existing[0]) {
    await query(`UPDATE roadmap_progress SET completed = $1, completed_at = $2 WHERE id = $3`, [
      !!completed,
      completed ? new Date() : null,
      existing[0].id,
    ]);
  } else {
    await query(`INSERT INTO roadmap_progress (roadmap_id, item_key, completed, completed_at) VALUES ($1,$2,$3,$4)`, [
      r.id,
      itemKey,
      !!completed,
      completed ? new Date() : null,
    ]);
  }
  sendJson(res, 200, { ok: true });
}

async function handleCommunityQuestionsList(req, res) {
  setCache(res, 30);
  const q = parseQuery(req.url);
  const pageNum = Math.max(1, parseInt(q.page || "1", 10) || 1);
  const limitNum = Math.min(50, parseInt(q.limit || "15", 10) || 15);
  const offset = (pageNum - 1) * limitNum;
  const conditions = [];
  if (q.search) conditions.push(`(title ILIKE '%${q.search.replace("'", "''")}%' OR body ILIKE '%${q.search.replace("'", "''")}%')`);
  if (q.tag) conditions.push(`${"tags"} @> '${JSON.stringify([q.tag])}'::jsonb`);
  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const { rows } = await query(`SELECT * FROM community_questions ${where} ORDER BY score DESC, created_at DESC LIMIT $1 OFFSET $2`, [
    limitNum,
    offset,
  ]);
  const { rows: countRows } = await query(`SELECT COUNT(*)::int AS count FROM community_questions ${where}`);
  sendJson(res, 200, { questions: rows.map((r) => ({ ...r, createdAt: toIso(r.created_at), updatedAt: toIso(r.updated_at) })), total: countRows[0]?.count ?? 0, page: pageNum, limit: limitNum });
}

async function handleCommunityQuestionGet(req, res, idStr) {
  const id = parseInt(idStr, 10);
  const { rows } = await query(`SELECT * FROM community_questions WHERE id = $1 LIMIT 1`, [id]);
  const q = rows[0];
  if (!q) return sendJson(res, 404, { error: "Question not found" });
  await query(`UPDATE community_questions SET views = COALESCE(views,0) + 1 WHERE id = $1`, [id]);
  const { rows: answers } = await query(`SELECT * FROM community_answers WHERE question_id = $1 ORDER BY is_accepted DESC, score DESC`, [id]);
  sendJson(res, 200, { ...q, createdAt: toIso(q.created_at), updatedAt: toIso(q.updated_at), answers: answers.map((a) => ({ ...a, createdAt: toIso(a.created_at) })) });
}

async function handleCommunityQuestionCreate(req, res) {
  const visitorId = getVisitorId(req, res);
  const body = await readJsonBody(req);
  const { title, body: b, tags, authorName } = body;
  if (!title?.trim() || !b?.trim()) return sendJson(res, 400, { error: "title and body required" });
  const slug = `${slugify(title)}-${randomBytes(3).toString("hex")}`;
  const { rows } = await query(`INSERT INTO community_questions (slug, title, body, visitor_id, author_name, tags) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`, [
    slug,
    title.trim(),
    b.trim(),
    visitorId,
    (authorName?.trim()) || null,
    tags ?? [],
  ]);
  const q = rows[0];
  sendJson(res, 201, { ...q, createdAt: toIso(q.created_at), updatedAt: toIso(q.updated_at) });
}

async function handleCommunityAnswerCreate(req, res, idStr) {
  const visitorId = getVisitorId(req, res);
  const qid = parseInt(idStr, 10);
  const body = await readJsonBody(req);
  const { body: content, authorName } = body;
  if (!content?.trim()) return sendJson(res, 400, { error: "body required" });
  const { rows: qrows } = await query(`SELECT id FROM community_questions WHERE id = $1 LIMIT 1`, [qid]);
  if (!qrows[0]) return sendJson(res, 404, { error: "Question not found" });
  const { rows } = await query(`INSERT INTO community_answers (question_id, body, visitor_id, author_name) VALUES ($1,$2,$3,$4) RETURNING *`, [
    qid,
    content.trim(),
    visitorId,
    (authorName?.trim()) || null,
  ]);
  const a = rows[0];
  sendJson(res, 201, { ...a, createdAt: toIso(a.created_at) });
}

async function handleCommunityVote(req, res) {
  const visitorId = getVisitorId(req, res);
  const body = await readJsonBody(req);
  const { targetType, targetId, value } = body;
  if (!targetType || !targetId || ![1, -1].includes(value ?? 0)) return sendJson(res, 400, { error: "Invalid vote" });
  const { rows: existingRows } = await query(
    `SELECT * FROM community_votes WHERE target_type = $1 AND target_id = $2 AND visitor_id = $3 LIMIT 1`,
    [targetType, targetId, visitorId],
  );
  const existing = existingRows[0];
  const table = targetType === "question" ? "community_questions" : "community_answers";
  const delta = value - (existing?.value ?? 0);
  if (existing) {
    await query(`UPDATE community_votes SET value = $1 WHERE id = $2`, [value, existing.id]);
  } else {
    await query(`INSERT INTO community_votes (target_type, target_id, visitor_id, value) VALUES ($1,$2,$3,$4)`, [targetType, targetId, visitorId, value]);
  }
  await query(`UPDATE ${table} SET score = COALESCE(score,0) + $1 WHERE id = $2`, [delta, targetId]);
  sendJson(res, 200, { ok: true });
}

async function handleCommunityProfile(req, res, username) {
  setCache(res, 120);
  const { rows } = await query(`SELECT * FROM community_users WHERE username = $1 LIMIT 1`, [username]);
  const user = rows[0];
  if (!user) return sendJson(res, 404, { error: "User not found" });
  const { rows: questions } = await query(`SELECT * FROM community_questions WHERE visitor_id = $1 ORDER BY created_at DESC LIMIT 10`, [user.visitor_id]);
  sendJson(res, 200, { user, questions });
}

const PLAYGROUND_RESERVED_SLUGS = new Set(["stats"]);
const ROADMAP_RESERVED_SLUGS = new Set(["stats", "options", "generate", "me"]);

export function isPlatformRoutePath(path, method) {
  const m = (method || "GET").toUpperCase();
  if (path === "/api/playgrounds" && m === "GET") return true;
  if (path === "/api/playgrounds" && m === "POST") return true;
  if (/^\/api\/playgrounds\/share\/[^/]+$/.test(path) && m === "GET") return true;
  if (/^\/api\/playgrounds\/[^/]+$/.test(path) && (m === "GET" || m === "PATCH")) {
    const slug = path.split("/").pop();
    if (PLAYGROUND_RESERVED_SLUGS.has(slug)) return false;
    return true;
  }
  if (/^\/api\/playgrounds\/[^/]+\/share$/.test(path) && m === "POST") return true;
  if (path === "/api/challenges" && m === "GET") return true;
  if (path === "/api/challenges/daily" && m === "GET") return true;
  if (path === "/api/challenges/leaderboard" && m === "GET") return true;
  if (/^\/api\/challenges\/[^/]+\/submit$/.test(path) && m === "POST") return true;
  if (/^\/api\/challenges\/[^/]+$/.test(path) && m === "GET") return true;
  if (path === "/api/roadmaps/options" && m === "GET") return true;
  if (path === "/api/roadmaps/generate" && m === "POST") return true;
  if (/^\/api\/roadmaps\/me\/list$/.test(path) && m === "GET") return true;
  if (/^\/api\/roadmaps\/[^/]+\/progress$/.test(path) && m === "POST") return true;
  if (/^\/api\/roadmaps\/[^/]+$/.test(path) && m === "GET") {
    const slug = path.split("/").pop();
    if (ROADMAP_RESERVED_SLUGS.has(slug)) return false;
    return true;
  }
  if (path === "/api/community/questions" && m === "GET") return true;
  if (path === "/api/community/questions" && m === "POST") return true;
  if (/^\/api\/community\/questions\/\d+\/answers$/.test(path) && m === "POST") return true;
  if (/^\/api\/community\/questions\/\d+$/.test(path) && m === "GET") return true;
  if (path === "/api/community/vote" && m === "POST") return true;
  if (/^\/api\/community\/profile\/[^/]+$/.test(path) && m === "GET") return true;
  return false;
}

export async function tryPlatformRoute(path, req, res) {
  const method = (req.method || "GET").toUpperCase();
  try {
    if (method === "GET" && path === "/api/playgrounds") {
      await handlePlaygroundsList(req, res);
      return true;
    }
    if (method === "GET" && /^\/api\/playgrounds\/share\/[^/]+$/.test(path)) {
      const m = path.match(/^\/api\/playgrounds\/share\/([^/]+)$/);
      await handlePlaygroundShareGet(req, res, decodeURIComponent(m[1]));
      return true;
    }
    if (method === "GET" && /^\/api\/playgrounds\/[^/]+$/.test(path)) {
      const m = path.match(/^\/api\/playgrounds\/([^/]+)$/);
      const slug = decodeURIComponent(m[1]);
      if (PLAYGROUND_RESERVED_SLUGS.has(slug)) return false;
      await handlePlaygroundGet(req, res, slug);
      return true;
    }
    if (method === "POST" && path === "/api/playgrounds") {
      await handlePlaygroundsCreate(req, res);
      return true;
    }
    if (method === "PATCH" && /^\/api\/playgrounds\/[^/]+$/.test(path)) {
      const m = path.match(/^\/api\/playgrounds\/([^/]+)$/);
      await handlePlaygroundsPatch(req, res, decodeURIComponent(m[1]));
      return true;
    }
    if (method === "POST" && /^\/api\/playgrounds\/[^/]+\/share$/.test(path)) {
      const m = path.match(/^\/api\/playgrounds\/([^/]+)\/share$/);
      await handlePlaygroundsShareCreate(req, res, decodeURIComponent(m[1]));
      return true;
    }

    if (method === "GET" && path === "/api/challenges") {
      await handleChallengesList(req, res);
      return true;
    }
    if (method === "GET" && path === "/api/challenges/daily") {
      await handleChallengeDaily(req, res);
      return true;
    }
    if (method === "GET" && path === "/api/challenges/leaderboard") {
      await handleChallengeLeaderboard(req, res);
      return true;
    }
    if (method === "GET" && /^\/api\/challenges\/[^/]+$/.test(path)) {
      const m = path.match(/^\/api\/challenges\/([^/]+)$/);
      const slug = decodeURIComponent(m[1]);
      if (["daily", "leaderboard", "admin", "stats"].includes(slug)) return false;
      await handleChallengeGet(req, res, slug);
      return true;
    }
    if (method === "POST" && /^\/api\/challenges\/[^/]+\/submit$/.test(path)) {
      const m = path.match(/^\/api\/challenges\/([^/]+)\/submit$/);
      await handleChallengeSubmit(req, res, decodeURIComponent(m[1]));
      return true;
    }

    if (method === "GET" && path === "/api/roadmaps/options") {
      await handleRoadmapsOptions(req, res);
      return true;
    }
    if (method === "POST" && path === "/api/roadmaps/generate") {
      await handleRoadmapsGenerate(req, res);
      return true;
    }
    if (method === "GET" && path === "/api/roadmaps/me/list") {
      await handleRoadmapsMeList(req, res);
      return true;
    }
    if (method === "GET" && /^\/api\/roadmaps\/[^/]+$/.test(path)) {
      const m = path.match(/^\/api\/roadmaps\/([^/]+)$/);
      const slug = decodeURIComponent(m[1]);
      if (ROADMAP_RESERVED_SLUGS.has(slug)) return false;
      await handleRoadmapGet(req, res, slug);
      return true;
    }
    if (method === "POST" && /^\/api\/roadmaps\/[^/]+\/progress$/.test(path)) {
      const m = path.match(/^\/api\/roadmaps\/([^/]+)\/progress$/);
      await handleRoadmapProgress(req, res, decodeURIComponent(m[1]));
      return true;
    }

    if (method === "GET" && path === "/api/community/questions") {
      await handleCommunityQuestionsList(req, res);
      return true;
    }
    if (method === "POST" && path === "/api/community/questions") {
      await handleCommunityQuestionCreate(req, res);
      return true;
    }
    if (method === "GET" && /^\/api\/community\/questions\/\d+$/.test(path)) {
      const m = path.match(/^\/api\/community\/questions\/(\d+)$/);
      await handleCommunityQuestionGet(req, res, m[1]);
      return true;
    }
    if (method === "POST" && /^\/api\/community\/questions\/\d+\/answers$/.test(path)) {
      const m = path.match(/^\/api\/community\/questions\/(\d+)\/answers$/);
      await handleCommunityAnswerCreate(req, res, m[1]);
      return true;
    }
    if (method === "POST" && path === "/api/community/vote") {
      await handleCommunityVote(req, res);
      return true;
    }
    if (method === "GET" && /^\/api\/community\/profile\/[^/]+$/.test(path)) {
      const m = path.match(/^\/api\/community\/profile\/([^/]+)$/);
      await handleCommunityProfile(req, res, decodeURIComponent(m[1]));
      return true;
    }

    return false;
  } catch (err) {
    routeError(res, err, "[platform-routes]");
    return true;
  }
}

