

## Make "Jobs Saved" Clickable + Add Saved Jobs View

### Problem
The "Jobs Saved" stat on the Dashboard is a static card with no click behavior. Users expect to click it and see their saved jobs, but nothing happens.

### Solution
1. Make the "Jobs Saved" stat card on the Dashboard clickable, linking to `/jobs?filter=saved`
2. Add a "Saved Jobs" tab/filter on the Jobs page that shows only saved jobs
3. Read the `filter=saved` query param on the Jobs page to auto-activate the saved filter

### Changes

#### 1. `src/pages/Dashboard.tsx`
- Wrap the "Jobs Saved" stat card in a `<Link to="/jobs?filter=saved">` so clicking it navigates to the saved jobs view
- Add a cursor pointer style to indicate it's clickable

#### 2. `src/pages/Jobs.tsx`
- Read `?filter=saved` from the URL search params
- Add a "Saved Jobs" toggle button alongside the existing match percentage filters
- When active, filter the job list to only show jobs whose IDs are in the user's `savedJobIds`
- Pull `savedJobIds` from the existing `useSavedJobs` hook (already imported)

#### 3. `src/hooks/useSavedJobs.ts`
- No changes needed -- it already exposes `savedJobIds` and `isJobSaved`

### Technical Details

**Dashboard link:**
```typescript
// Wrap the "Jobs Saved" stat card
<Link to="/jobs?filter=saved">
  <Card className="border-border hover:shadow-lg transition-shadow cursor-pointer">
    ...
  </Card>
</Link>
```

**Jobs page filter logic:**
```typescript
const [searchParams] = useSearchParams();
const [showSavedOnly, setShowSavedOnly] = useState(
  searchParams.get("filter") === "saved"
);

// Add to filteredJobs logic:
if (showSavedOnly && !isJobSaved(job.id)) return false;
```

**Files modified:**
- `src/pages/Dashboard.tsx` -- make stat card clickable
- `src/pages/Jobs.tsx` -- add saved jobs filter with URL param support

