## Add JSearch (RapidAPI) as a Third Job Source

### Overview

Integrate the JSearch API from RapidAPI into the existing ingestion pipeline to significantly boost job count. JSearch aggregates listings from LinkedIn, Indeed, Glassdoor, and other major job boards, giving you access to thousands of additional Indian jobs.

### Setup Required

**Step 1: Get your RapidAPI key**

1. Go to [https://rapidapi.com/letscrape-6bRBa3QguO5/api/jsearch](https://rapidapi.com/letscrape-6bRBa3QguO5/api/jsearch)
2. Subscribe to the free tier (500 requests/month)
3. Copy your RapidAPI key from the dashboard

**Step 2: Save the key as a Supabase secret**
The key will be stored securely as `RAPIDAPI_KEY` in your Supabase project secrets.

### Changes to `supabase/functions/ingest-jobs/index.ts`

#### New JSearch Fetcher Function

Add a `fetchJSearchJobs()` function that:

- Searches for Indian jobs using queries like "developer India", "engineer India", "analyst India", "manager India", "designer India"
- Seed mode: 5 queries x 10 pages (20 results each) = up to 50 requests, ~1,000 jobs
- Daily mode: 3 queries x 2 pages = 6 requests, ~120 jobs
- Normalizes results into the existing `NormalizedJob` format
- Uses `external_id: jsearch_{job_id}` for deduplication
- Extracts skills from descriptions using existing `extractSkillsFromText()`
- Respects a 300ms delay between requests in seed mode

#### JSearch API Details

- Endpoint: `https://jsearch.p.rapidapi.com/search`
- Parameters: `query`, `page`, `num_pages`, `country=IN`
- Headers: `X-RapidAPI-Key`, `X-RapidAPI-Host: jsearch.p.rapidapi.com`
- Returns: title, company, location, description, salary, apply link

#### Main Handler Updates

- Add JSearch to the parallel fetch alongside Adzuna and The Muse
- Upsert JSearch jobs with source "jsearch"
- Include JSearch stats in the response

### Expected Job Counts After Integration


| Source        | Seed Mode       | Daily Mode            |
| ------------- | --------------- | --------------------- |
| Adzuna India  | 3,000-4,000     | ~300 refresh          |
| The Muse      | ~100            | ~100                  |
| JSearch (new) | ~800-1,000      | ~120 refresh          |
| **Total**     | **4,000-5,100** | Maintains + refreshes |


### Request Budget


| Mode  | Adzuna   | Muse | JSearch  | Total |
| ----- | -------- | ---- | -------- | ----- |
| Seed  | Up to 80 | 5    | Up to 50 | 135   |
| Daily | 6        | 5    | 6        | 17    |


The free JSearch tier allows 500 requests/month, so daily mode (6 requests/day x 30 days = 180) fits comfortably.

### Technical Details

- **File modified**: `supabase/functions/ingest-jobs/index.ts` -- add the JSearch fetcher and wire it into the main handler
- **Secret needed**: `RAPIDAPI_KEY` -- will be added via Supabase secrets
- **No database changes needed** -- jobs table schema already supports the new source  
  
Just GIVE Seperate injestion button we  want a seperate injest button for jsearch api