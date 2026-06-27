-- External job source tracking for aggregated listings
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS source TEXT;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS external_id TEXT;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS region TEXT NOT NULL DEFAULT 'global';

CREATE UNIQUE INDEX IF NOT EXISTS jobs_source_external_idx
  ON jobs (source, external_id)
  WHERE source IS NOT NULL AND external_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS jobs_source_idx ON jobs (source, is_active);
CREATE INDEX IF NOT EXISTS jobs_region_idx ON jobs (region, is_active);
