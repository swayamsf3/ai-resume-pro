

## Fix: Admin Dashboard Capped at 1000 Jobs

### Root Cause
Supabase PostgREST enforces a server-side `max_rows = 1000` limit. The `.range(0, 4999)` call does NOT override this -- PostgREST still caps the response at 1000 rows. The database actually has **4,701 jobs**.

### Solution
Replace the single query with a paginated loop that fetches all jobs in batches of 1000, identical to the pattern already used in the edge functions.

### Changes

**File: `src/hooks/useAdminJobs.ts`**

Replace the `jobsQuery` function with a paginated fetch loop:

```typescript
jobsQuery = useQuery({
  queryKey: ["admin-jobs"],
  queryFn: async () => {
    const PAGE_SIZE = 1000;
    let allJobs: any[] = [];
    let from = 0;
    while (true) {
      const { data, error } = await supabase
        .from("jobs")
        .select("*")
        .order("created_at", { ascending: false })
        .range(from, from + PAGE_SIZE - 1);
      if (error) throw error;
      allJobs = allJobs.concat(data || []);
      if (!data || data.length < PAGE_SIZE) break;
      from += PAGE_SIZE;
    }
    return allJobs;
  },
});
```

### Important Note
The RLS policy on the `jobs` table only allows viewing **active** jobs (`is_active = true`). Since all 4,701 jobs are currently active, this will work. However, the admin dashboard's "Active / Inactive" stat will always show 0 inactive because RLS hides inactive jobs from the client. If you want the admin to see inactive jobs too, a separate RLS policy or a service-role edge function would be needed.

### Files Modified
- `src/hooks/useAdminJobs.ts` -- paginated fetching loop
