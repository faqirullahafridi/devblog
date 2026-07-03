-- Public site user accounts (email/password signup).
-- Run: pnpm --filter @workspace/db run migrate:site-users

CREATE TABLE IF NOT EXISTS site_users (
  id serial PRIMARY KEY,
  email text NOT NULL UNIQUE,
  username text NOT NULL UNIQUE,
  display_name text NOT NULL,
  password_hash text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS site_users_email_idx ON site_users (email);
CREATE INDEX IF NOT EXISTS site_users_username_idx ON site_users (username);
