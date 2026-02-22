## Speed Up Job Recommendations Page

### Root Cause

Three compounding performance issues:

1. **All 4,701 jobs render at once** -- no pagination or virtualization
2. **Staggered animation delay per card** -- `delay: 0.1 + index * 0.05` means the 4,701st card waits 235 seconds to animate
3. **Duplicate job IDs** in the data causing React key warnings (visible in console logs)

### Solution

Add client-side pagination with a "Load More" button and fix the animation performance.

### Changes

#### 1. `src/pages/Jobs.tsx`

- Add pagination state: `const [visibleCount, setVisibleCount] = useState(20)`
- Slice `filteredJobs` to only render the first `visibleCount` items
- Add a "Load More" button at the bottom that increases `visibleCount` by 20
- Reset `visibleCount` to 20 when filters/search change

#### 2. `src/components/jobs/JobCard.tsx`

- Cap the animation delay so it never exceeds a reasonable value (e.g., max 0.5s)
- Change line 39 from `transition={{ delay: 0.1 + index * 0.05 }}` to `transition={{ delay: Math.min(0.1 + index * 0.05, 0.5) }}`

#### 3. `supabase/functions/match-jobs/index.ts`

- Add deduplication logic to filter out jobs with duplicate IDs (fixes the React key warning)

### Technical Details

**Pagination in Jobs.tsx:**

```typescript
const JOBS_PER_PAGE = 20;
const [visibleCount, setVisibleCount] = useState(JOBS_PER_PAGE);

// Reset when filters change
useEffect(() => {
  setVisibleCount(JOBS_PER_PAGE);
}, [searchQuery, selectedLocation, minMatchPercentage, showSavedOnly]);

const visibleJobs = filteredJobs.slice(0, visibleCount);
const hasMore = visibleCount < filteredJobs.length;
```

**Animation cap in JobCard.tsx:**

```typescript
transition={{ delay: Math.min(0.1 + index * 0.05, 0.5) }}
```

**Deduplication in match-jobs edge function:**

```typescript
// Deduplicate jobs by ID
const seen = new Set<string>();
const uniqueJobs = allJobs.filter(job => {
  if (seen.has(job.id)) return false;
  seen.add(job.id);
  return true;
});
```

### Files Modified

- `src/pages/Jobs.tsx` -- add pagination with "Load More"
- `src/components/jobs/JobCard.tsx` -- cap animation delay
- `supabase/functions/match-jobs/index.ts` -- deduplicate jobs  
  
  
  
Small Improvement (Optional but Smart)
  Instead of deduplicating by `job.id`, make sure it's:
  ```
  job.external_id || job.id
  ```
  Because multiple sources may generate overlapping internal IDs.
  Better:
  ```
  const seen = new Set<string>();
  const uniqueJobs = allJobs.filter(job => {
    const key = job.external_id || job.id;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  ```
  This avoids cross-source duplication.