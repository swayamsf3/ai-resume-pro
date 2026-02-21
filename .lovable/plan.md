

## Fix 1000-Row Query Limit

### Problem
Supabase returns a maximum of 1000 rows per query by default. Since the database now has more than 1000 active jobs, users only see 1000 jobs on the Jobs page, and the admin dashboard is similarly limited.

### Changes

#### 1. Edge Function: `supabase/functions/match-jobs/index.ts`
- Replace the single `.select("*")` call with a **paginated loop** that fetches all active jobs in batches of 1000
- This ensures all jobs are fetched, scored, and returned to the user

#### 2. Edge Function: `supabase/functions/ingest-jobs/index.ts`
- Update the stale-job query in `upsertAndDeactivate()` to use **paginated fetching** so deactivation works correctly beyond 1000 rows

#### 3. Hook: `src/hooks/useAdminJobs.ts`
- Add `.range(0, 4999)` or implement pagination to allow the admin dashboard to display more than 1000 jobs
- Alternatively, fetch only a count + recent subset for performance

### Technical Details

**match-jobs pagination pattern:**
```typescript
// Fetch all active jobs in pages of 1000
let allJobs: Job[] = [];
let from = 0;
const PAGE_SIZE = 1000;
while (true) {
  const { data, error } = await supabaseAdmin
    .from("jobs")
    .select("*")
    .eq("is_active", true)
    .order("posted_at", { ascending: false })
    .range(from, from + PAGE_SIZE - 1);
  if (error) throw error;
  allJobs = allJobs.concat(data || []);
  if (!data || data.length < PAGE_SIZE) break;
  from += PAGE_SIZE;
}
```

**Admin jobs query** will use `.range(0, 4999)` to raise the limit to 5000 for the dashboard view.

**Stale jobs query** in `ingest-jobs` will use the same paginated pattern to ensure all stale jobs are found and deactivated.

**Files modified:**
- `supabase/functions/match-jobs/index.ts`
- `supabase/functions/ingest-jobs/index.ts`
- `src/hooks/useAdminJobs.ts`
