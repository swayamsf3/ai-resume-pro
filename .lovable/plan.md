

# Admin Dashboard for Job Ingestion Management

## Overview

Create a new `/admin/jobs` page that displays all jobs (active and inactive), shows source/status info, and lets an admin manually trigger the `ingest-jobs` Edge Function. Access is restricted by a frontend check against a predefined admin email -- no RLS changes needed.

## Access Control

The admin page will check the logged-in user's email against a hardcoded admin email (`admin@swayam.com`). If the email does not match, the user is redirected away (e.g., to `/dashboard`). This is a simple frontend guard -- the existing RLS policy on the `jobs` table remains unchanged, meaning the admin page will only display active jobs (same as regular users). This is acceptable for the current scope since the primary value of the admin page is the ingestion trigger and source visibility.

A constant will be defined in the admin page:

```typescript
const ADMIN_EMAIL = "admin@swayam.com";
```

## New Files

### 1. `src/pages/AdminJobs.tsx`

The admin dashboard page with:

**Access guard** -- Checks `user.email === ADMIN_EMAIL`. If not, redirects to `/dashboard` with a toast message.

**Stats bar** -- Cards showing:
- Total jobs count
- Jobs by source (manual vs employer_feed)
- Active vs inactive count (based on visible data)

**Ingestion trigger section** -- Contains:
- A text input for the INGEST_SECRET value (stored in component state only, never persisted)
- A "Run Ingestion" button that POSTs to the `ingest-jobs` Edge Function with the `x-ingest-key` header
- Loading state and success/error feedback via toast
- Auto-refetch of jobs list after successful run

**Jobs table** -- Sortable table with columns:
- Title
- Company
- Location
- Source (badge: "manual" or "employer_feed")
- External ID
- Status (active/inactive badge)
- Posted date

Uses existing UI components: Card, Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Badge, Button, Input.

### 2. `src/hooks/useAdminJobs.ts`

Custom hook using TanStack Query:
- `useQuery` to fetch jobs from the `jobs` table (ordered by `created_at` desc)
- A mutation function that calls the Edge Function URL (`https://qswjxgjfynphxvobaitl.supabase.co/functions/v1/ingest-jobs`) with the provided secret
- Invalidates the jobs query on successful ingestion

## Modified Files

### 3. `src/App.tsx`

Add a new route:
```
<Route path="/admin/jobs" element={<ProtectedRoute><AdminJobs /></ProtectedRoute>} />
```

### 4. `src/components/layout/Header.tsx`

Add an "Admin" navigation link to `/admin/jobs`, visible only when the logged-in user's email matches `ADMIN_EMAIL`. Added to both desktop and mobile navigation sections.

## What Does NOT Change

- No database migrations
- No RLS policy changes -- the existing policy ("Authenticated users can view active jobs") stays as-is
- No changes to `match-jobs`, `ingest-jobs`, or any other Edge Function
- No changes to the Jobs page or any other existing page
- Regular users continue to see only active jobs everywhere

## Files Summary

| File | Action | Description |
|------|--------|-------------|
| `src/pages/AdminJobs.tsx` | New | Admin dashboard with stats, table, and ingestion trigger |
| `src/hooks/useAdminJobs.ts` | New | TanStack Query hook for admin job data |
| `src/App.tsx` | Modify | Add `/admin/jobs` route |
| `src/components/layout/Header.tsx` | Modify | Add conditional Admin nav link |

## Note on Data Visibility

Since the existing RLS policy only returns `is_active = true` jobs, the admin table will show active jobs only. Inactive (deactivated) jobs will not appear. If full visibility into inactive jobs is needed later, a dedicated RLS policy or a server-side admin endpoint can be added as a follow-up.

