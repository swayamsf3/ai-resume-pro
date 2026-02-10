

# Simplified Job Ingestion from Mock Employer Feeds

## Overview

Create a lightweight Edge Function that fetches job listings from 1-2 mock JSON feeds, normalizes them, and upserts into the `jobs` table. The mock feeds will be embedded as fallback test data within the function itself, simulating what real employer ATS endpoints would return.

## Database Changes

Add two columns to the `jobs` table:

| Column | Type | Default | Purpose |
|--------|------|---------|---------|
| `source` | text | `'manual'` | Tracks origin: `manual` or `employer_feed` |
| `external_id` | text, nullable | null | Deduplication key from feeds |

A partial unique index on `external_id` (where not null) enables upsert logic without affecting existing manual jobs.

## New Edge Function: `ingest-jobs`

A single file at `supabase/functions/ingest-jobs/index.ts` that:

1. Defines 2 mock feed configurations with embedded sample job data (simulating JSON API responses from "TechCorp" and "DataWorks")
2. Attempts to fetch each feed URL -- if the URL is unreachable, falls back to the embedded mock data
3. Normalizes each job record into the `jobs` table schema
4. Upserts using `external_id` for deduplication (new jobs are inserted, existing ones updated)
5. Deactivates stale jobs from that feed source that are no longer in the current batch

### Mock Feed Data (Embedded)

Two simulated employers, each providing 3-4 jobs:

**TechCorp** -- Web development roles:
- Senior React Developer (React, TypeScript, Node.js)
- Full Stack Engineer (Python, Django, PostgreSQL)
- DevOps Engineer (AWS, Docker, Kubernetes)

**DataWorks** -- Data/ML roles:
- Data Scientist (Python, SQL, Machine Learning)
- Backend Engineer (Go, PostgreSQL, REST)
- Cloud Architect (AWS, Azure, Terraform)

### Security

The endpoint requires an `INGEST_SECRET` passed via the `x-ingest-key` header. This secret will need to be added to the project's Edge Function secrets.

### Scalability

The feed configuration array is designed so adding new employers in the future is as simple as appending another object with the feed URL and field mapping. The core parsing and upsert logic stays the same.

## Config Update

Add to `supabase/config.toml`:
```
[functions.ingest-jobs]
verify_jwt = false
```

## Files Summary

| File | Action | Description |
|------|--------|-------------|
| SQL Migration | New | Add `source` and `external_id` columns |
| `supabase/functions/ingest-jobs/index.ts` | New | Ingestion function with mock feeds |
| `supabase/config.toml` | Modify | Register new function |

## Secret Required

An `INGEST_SECRET` secret must be added before calling the function. You will be prompted to set this value during implementation.

## What Stays the Same

- `match-jobs` function is unchanged (reads `is_active = true` jobs)
- Frontend Jobs page is unchanged
- All existing manually-seeded jobs remain untouched (`source = 'manual'`, `external_id = null`)

