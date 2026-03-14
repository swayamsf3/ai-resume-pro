

# Plan: One-Click "Remove All Inactive Jobs" Button

## What it does
Adds a single button in the admin dashboard stats/actions area that deletes all inactive jobs from the database in one click, with a brief confirmation dialog.

## Changes

### 1. `src/hooks/useAdminJobs.ts`
- Add `bulkDeleteInactiveMutation` that runs `supabase.from("jobs").delete().eq("is_active", false)`
- Returns count of deleted jobs in the success toast

### 2. `src/pages/AdminJobs.tsx`
- Add a "Remove Inactive Jobs" button (with `Trash2` icon) next to the stats section or in the Jobs card header
- Wrapped in an `AlertDialog` for one-click confirmation: "Delete all {N} inactive jobs? This cannot be undone."
- Button disabled when there are 0 inactive jobs or mutation is pending

No database changes needed — the existing "Admin can delete jobs" RLS policy already covers this.

### Files Changed
- `src/hooks/useAdminJobs.ts`
- `src/pages/AdminJobs.tsx`

