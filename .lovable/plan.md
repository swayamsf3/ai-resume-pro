

## Fix: Slow Job Recommendations Page and Skill Matching

### Problem

The `match-jobs` edge function is fetching **all 4,701 active jobs** from the database, running skill matching on every single one in memory, then returning the entire dataset to the browser. This takes ~4.2 seconds on the server, plus additional time to transfer and parse the large JSON payload on the client.

The skill matching algorithm IS running (logs show 200 responses), but the massive data volume makes it feel broken due to the long wait.

### Solution

Move the heavy lifting to the database side and only return the top matched jobs, drastically reducing both server processing time and payload size.

### Changes

#### 1. Update `supabase/functions/match-jobs/index.ts`

- Instead of fetching ALL 4,701 jobs and processing in JS, fetch jobs in batches but only keep the top results
- Limit the response to the **top 100 matched jobs** (users rarely scroll past this)
- Add a `limit` parameter so the client can request more if needed
- Skip jobs with 0 skills (they can never match) when user has a resume

#### 2. Update `src/hooks/useJobMatches.ts`

- Add a loading timeout fallback so the UI doesn't hang indefinitely
- Increase `staleTime` to 10 minutes since the data doesn't change frequently
- Add `gcTime` (garbage collection time) to cache results longer

#### 3. Update `src/pages/Jobs.tsx`

- Add a skeleton loading state instead of just a spinner, so the page feels responsive while data loads
- Show a "Loading jobs..." message with progress indication

### Technical Details

**Edge Function Optimization (`match-jobs/index.ts`):**

The key change is processing efficiency:
- Fetch only the columns needed (`id, title, company, location, type, salary, skills, apply_url, posted_at`) instead of `SELECT *` (avoids transferring large `description` fields during matching)
- Process matching the same way but cap the returned results at 100 jobs sorted by match percentage
- For users without a resume (no skills), return only the most recent 100 jobs instead of all 4,701

**Client-side caching (`useJobMatches.ts`):**
- Increase `staleTime` from 5 to 10 minutes
- Add `gcTime: 1000 * 60 * 30` (30 min) to keep cached data available longer

**Loading UX (`Jobs.tsx`):**
- Replace the single spinner with skeleton cards that show the layout shape while loading
- This makes the page feel faster even if the actual load time is similar

