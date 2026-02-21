
-- Drop the partial index that doesn't work with upsert
DROP INDEX IF EXISTS idx_jobs_external_id;

-- Add a proper unique constraint on external_id
-- First, we need to handle NULL values - multiple NULLs are allowed with unique constraints in Postgres
ALTER TABLE public.jobs ADD CONSTRAINT jobs_external_id_unique UNIQUE (external_id);
