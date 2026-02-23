

## Add Delete Button to Admin Jobs Panel

### Overview
Add a delete button on each job row in the admin panel, allowing the admin to remove jobs from the database. This requires both a database policy change (to allow deletes) and a frontend UI update.

### 1. Database: Add RLS DELETE Policy for Admin

Currently the `jobs` table has no DELETE policy. We need to add one that only allows the admin (identified by email) to delete jobs.

```sql
CREATE POLICY "Admin can delete jobs"
  ON jobs
  FOR DELETE
  USING (auth.jwt() ->> 'email' = 'swayamyawalkar54@gmail.com');
```

This uses the JWT claim to verify the admin email, matching the existing frontend check.

### 2. Frontend: Add Delete Mutation to `useAdminJobs.ts`

Add a `deleteMutation` using `supabase.from("jobs").delete().eq("id", jobId)` with success/error toasts and query invalidation.

### 3. Frontend: Add Delete Button to `AdminJobs.tsx`

- Import `Trash2` icon from lucide-react
- Add a new "Actions" column to the jobs table
- Add a delete button (small, destructive variant) in each row
- Include a confirmation dialog (using `AlertDialog`) before deleting to prevent accidental deletions
- Show a loading spinner on the button while deletion is in progress

### Files Changed
- **SQL Migration**: Add DELETE RLS policy on `jobs` table
- **`src/hooks/useAdminJobs.ts`**: Add `deleteMutation`
- **`src/pages/AdminJobs.tsx`**: Add Actions column with delete button + confirmation dialog

