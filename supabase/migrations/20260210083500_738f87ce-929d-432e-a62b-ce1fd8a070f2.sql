
-- Add source column to track job origin
ALTER TABLE public.jobs ADD COLUMN source text NOT NULL DEFAULT 'manual';

-- Add external_id for deduplication from feeds
ALTER TABLE public.jobs ADD COLUMN external_id text;

-- Partial unique index for upsert logic (only on non-null external_ids)
CREATE UNIQUE INDEX idx_jobs_external_id ON public.jobs (external_id) WHERE external_id IS NOT NULL;
