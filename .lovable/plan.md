

# Fix: Admin Cannot See Inactive Jobs

## Root Cause

The `jobs` table RLS SELECT policy is:
```sql
((auth.uid() IS NOT NULL) AND (is_active = true))
```

This filters out ALL inactive jobs at the database level. The admin query in `useAdminJobs.ts` does `select("*")` but RLS silently removes inactive rows before results are returned. That's why the count shows 0 inactive jobs, even though jobs do get deactivated by the ingestion process.

Meanwhile, when users click "Apply" on those deactivated jobs, the external URL returns "job no longer available" because the job genuinely expired on the source site — but your database still shows them as "active" from the admin's perspective because inactive ones are invisible.

## Fix

Add a new RLS policy allowing the admin to see ALL jobs (active and inactive):

```sql
CREATE POLICY "Admin can view all jobs"
ON public.jobs
FOR SELECT
TO authenticated
USING ((auth.jwt() ->> 'email') = 'swayamyawalkar54@gmail.com');
```

This is consistent with the existing "Admin can delete jobs" policy pattern. The existing policy for regular users remains unchanged — they still only see active jobs.

## Files Changed
- **Database migration only** — one new RLS policy, no code changes needed

