-- Admin credentials + OTP tables for secure admin login
CREATE TABLE IF NOT EXISTS admin_credentials (
  id serial PRIMARY KEY,
  username text NOT NULL UNIQUE,
  password_hash text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS admin_otp_codes (
  id serial PRIMARY KEY,
  purpose text NOT NULL,
  username text NOT NULL,
  code_hash text NOT NULL,
  attempts integer NOT NULL DEFAULT 0,
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS admin_otp_codes_lookup_idx
  ON admin_otp_codes (purpose, username, expires_at);
