

# Plan: Bulk Deactivation for Admin Dashboard

## Problem
Admin currently cannot mark jobs as inactive from the dashboard. There's no UPDATE RLS policy on the `jobs` table for the admin.

## Changes

### 1. Database Migration
Add an RLS policy allowing the admin to update jobs:
```sql
CREATE POLICY "Admin can update jobs"
ON public.jobs
FOR UPDATE
TO authenticated
USING ((auth.jwt() ->> 'email') = 'swayamyawalkar54@gmail.com')
WITH CHECK ((auth.jwt() ->> 'email') = 'swayamyawalkar54@gmail.com');
```

### 2. `src/hooks/useAdminJobs.ts`
- Add a `deactivateMutation` that takes an array of job IDs and sets `is_active = false` via `supabase.from("jobs").update({ is_active: false }).in("id", jobIds)`

### 3. `src/pages/AdminJobs.tsx`
- Add `selectedJobs` state (Set of job IDs)
- Add a checkbox column in the table header (select all visible) and each row
- Add a "Deactivate Selected" button above the table (visible when selections exist), with a confirmation dialog
- Wire it to the new `deactivateMutation`

### Files Changed
- New migration SQL — admin UPDATE policy
- `src/hooks/useAdminJobs.ts` — add `deactivateMutation`
- `src/pages/AdminJobs.tsx` — checkboxes, select-all, deactivate button with confirmation

