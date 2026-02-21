

## Fix: Prevent Daily Mode from Mass-Deactivating Seeded Jobs

### Root Cause
The `upsertAndDeactivate` function deactivates all active jobs from a source that are NOT in the current fetch batch. This worked fine when limited to 1000 rows, but now with paginated fetching, daily mode (which fetches only ~300 jobs) correctly finds and deactivates ALL other active jobs from that source -- wiping out thousands of seeded jobs.

### Solution
Only run the deactivation logic when in **seed mode**. In daily mode, we should only upsert new/updated jobs without deactivating old ones. Seeded jobs should remain active until the next seed run replaces them or they expire via the 60-day cleanup.

### Changes

#### 1. Edge Function: `supabase/functions/ingest-jobs/index.ts`

- Add a `deactivateStale` parameter to `upsertAndDeactivate`
- Pass `deactivateStale: true` only in seed mode, `false` in daily mode
- When `deactivateStale` is false, skip the stale-job query and deactivation entirely

#### 2. Re-activate the 4,146 deactivated jobs

- Run a SQL query to set `is_active = true` for all recently deactivated jobs (those deactivated in the last hour that were originally from the seed run)

### Technical Details

**Modified function signature:**
```text
async function upsertAndDeactivate(
  supabase, source, jobs, label, deactivateStale = true
)
```

**Call sites updated:**
- Seed mode: `upsertAndDeactivate(supabase, "adzuna", jobs, "Adzuna", true)`
- Daily mode: `upsertAndDeactivate(supabase, "adzuna", jobs, "Adzuna", false)`

**Recovery SQL:**
```sql
UPDATE jobs SET is_active = true WHERE is_active = false AND source IN ('adzuna','jsearch') AND created_at < now() - interval '1 hour';
```

**Files modified:**
- `supabase/functions/ingest-jobs/index.ts`
- One-time SQL migration to restore deactivated jobs

