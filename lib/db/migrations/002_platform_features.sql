/**
 * Platform feature tables — run after drizzle push or apply manually.
 * Prefer: pnpm --filter @workspace/db run push
 */
-- AI Assistant
CREATE TABLE IF NOT EXISTS ai_conversations (
  id SERIAL PRIMARY KEY,
  visitor_id TEXT NOT NULL,
  title TEXT NOT NULL DEFAULT 'New conversation',
  mode TEXT NOT NULL DEFAULT 'chat',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ai_messages (
  id SERIAL PRIMARY KEY,
  conversation_id INTEGER NOT NULL REFERENCES ai_conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  tokens_used INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ai_usage (
  id SERIAL PRIMARY KEY,
  visitor_id TEXT NOT NULL,
  mode TEXT NOT NULL,
  prompt_type TEXT NOT NULL DEFAULT 'general',
  tokens_in INTEGER NOT NULL DEFAULT 0,
  tokens_out INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS ai_conversations_visitor_idx ON ai_conversations(visitor_id);
CREATE INDEX IF NOT EXISTS ai_usage_created_idx ON ai_usage(created_at);

-- Playground
CREATE TABLE IF NOT EXISTS playgrounds (
  id SERIAL PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  language TEXT NOT NULL,
  is_public BOOLEAN NOT NULL DEFAULT FALSE,
  visitor_id TEXT NOT NULL,
  author_name TEXT NOT NULL DEFAULT 'Anonymous',
  forked_from_id INTEGER,
  views INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS playground_files (
  id SERIAL PRIMARY KEY,
  playground_id INTEGER NOT NULL REFERENCES playgrounds(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS playground_shares (
  id SERIAL PRIMARY KEY,
  playground_id INTEGER NOT NULL REFERENCES playgrounds(id) ON DELETE CASCADE,
  share_token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS playgrounds_public_idx ON playgrounds(is_public, language);

-- Roadmaps
CREATE TABLE IF NOT EXISTS roadmaps (
  id SERIAL PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  visitor_id TEXT NOT NULL,
  current_level TEXT NOT NULL,
  goal TEXT NOT NULL,
  title TEXT NOT NULL,
  payload JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS roadmap_progress (
  id SERIAL PRIMARY KEY,
  roadmap_id INTEGER NOT NULL REFERENCES roadmaps(id) ON DELETE CASCADE,
  item_key TEXT NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS roadmaps_goal_idx ON roadmaps(goal);

-- Challenges
CREATE TABLE IF NOT EXISTS challenges (
  id SERIAL PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  difficulty TEXT NOT NULL,
  category TEXT NOT NULL,
  starter_code TEXT NOT NULL DEFAULT '',
  solution_code TEXT,
  test_cases JSONB NOT NULL DEFAULT '[]',
  points INTEGER NOT NULL DEFAULT 10,
  is_daily BOOLEAN NOT NULL DEFAULT FALSE,
  daily_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS challenge_submissions (
  id SERIAL PRIMARY KEY,
  challenge_id INTEGER NOT NULL REFERENCES challenges(id) ON DELETE CASCADE,
  visitor_id TEXT NOT NULL,
  author_name TEXT NOT NULL DEFAULT 'Anonymous',
  code TEXT NOT NULL,
  language TEXT NOT NULL DEFAULT 'javascript',
  passed BOOLEAN NOT NULL DEFAULT FALSE,
  score INTEGER NOT NULL DEFAULT 0,
  runtime_ms INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS challenge_scores (
  id SERIAL PRIMARY KEY,
  visitor_id TEXT NOT NULL UNIQUE,
  author_name TEXT NOT NULL DEFAULT 'Anonymous',
  total_points INTEGER NOT NULL DEFAULT 0,
  challenges_solved INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS challenge_streaks (
  id SERIAL PRIMARY KEY,
  visitor_id TEXT NOT NULL UNIQUE,
  current_streak INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0,
  last_activity_date DATE
);

-- Jobs
CREATE TABLE IF NOT EXISTS job_categories (
  id SERIAL PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT
);

CREATE TABLE IF NOT EXISTS jobs (
  id SERIAL PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  company TEXT NOT NULL,
  description TEXT NOT NULL,
  requirements TEXT NOT NULL DEFAULT '',
  location TEXT NOT NULL DEFAULT 'Remote',
  remote BOOLEAN NOT NULL DEFAULT TRUE,
  salary_range TEXT,
  category TEXT NOT NULL,
  apply_url TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS job_bookmarks (
  id SERIAL PRIMARY KEY,
  job_id INTEGER NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  visitor_id TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(job_id, visitor_id)
);

CREATE INDEX IF NOT EXISTS jobs_category_idx ON jobs(category, is_active);

-- Community
CREATE TABLE IF NOT EXISTS community_users (
  id SERIAL PRIMARY KEY,
  visitor_id TEXT NOT NULL UNIQUE,
  username TEXT NOT NULL,
  reputation INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS community_tags (
  id SERIAL PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS community_questions (
  id SERIAL PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  visitor_id TEXT NOT NULL,
  author_name TEXT NOT NULL,
  tags JSONB NOT NULL DEFAULT '[]',
  views INTEGER NOT NULL DEFAULT 0,
  score INTEGER NOT NULL DEFAULT 0,
  accepted_answer_id INTEGER,
  status TEXT NOT NULL DEFAULT 'open',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS community_answers (
  id SERIAL PRIMARY KEY,
  question_id INTEGER NOT NULL REFERENCES community_questions(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  visitor_id TEXT NOT NULL,
  author_name TEXT NOT NULL,
  score INTEGER NOT NULL DEFAULT 0,
  is_accepted BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS community_votes (
  id SERIAL PRIMARY KEY,
  target_type TEXT NOT NULL,
  target_id INTEGER NOT NULL,
  visitor_id TEXT NOT NULL,
  value INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(target_type, target_id, visitor_id)
);

CREATE TABLE IF NOT EXISTS community_reports (
  id SERIAL PRIMARY KEY,
  target_type TEXT NOT NULL,
  target_id INTEGER NOT NULL,
  reason TEXT NOT NULL,
  visitor_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS community_questions_score_idx ON community_questions(score DESC);
