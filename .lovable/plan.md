

# Integrate Adzuna + The Muse Real Job APIs

## Overview

Replace mock employer feeds with live job data from two real APIs -- **Adzuna** and **The Muse** -- while keeping the existing mock feeds as fallbacks. This gives users access to hundreds of real, current job listings.

## API Details

### Adzuna
- Free tier: 250 requests/month
- Endpoint: `https://api.adzuna.com/v1/api/jobs/{country}/search/{page}?app_id=X&app_key=Y`
- Returns jobs with title, company, location, salary, description, redirect URL
- Skills must be extracted from the description (not provided as a field)

### The Muse
- Free, no key required for basic access
- Endpoint: `https://www.themuse.com/api/public/jobs?page=1&descending=true`
- Returns jobs with name, company, locations, categories, landing page URL
- Simpler data -- no salary or skills fields

## Architecture

The `ingest-jobs` edge function will gain two new "real API" feed handlers alongside the existing mock feeds. Mock feeds remain as fallback data.

```
Ingestion Flow:
  1. Fetch from Adzuna API (multiple categories)
  2. Fetch from The Muse API (multiple pages)
  3. Process existing mock feeds (fallback data)
  4. Normalize all results -> upsert into jobs table
  5. Deactivate stale listings per source
```

## New Secrets Required

Two new secrets need to be added before implementation:

| Secret | Description | Where to get it |
|--------|-------------|-----------------|
| `ADZUNA_APP_ID` | Adzuna application ID | Sign up at https://developer.adzuna.com and create an app |
| `ADZUNA_APP_KEY` | Adzuna API key | Same dashboard, shown after app creation |

The Muse API does not require authentication for basic job listing access.

## Changes

### 1. Add Secrets

Prompt the user to provide `ADZUNA_APP_ID` and `ADZUNA_APP_KEY` via the secrets tool.

### 2. Update `supabase/functions/ingest-jobs/index.ts`

**Add Adzuna fetcher function:**
- Call `/v1/api/jobs/us/search/1` with configurable search categories (e.g., "it-jobs", "engineering-jobs", "finance-jobs")
- Fetch up to 50 results per category
- Normalize each result: map `title`, `company.display_name`, `location.display_name`, `salary_min`/`salary_max` to salary string, `redirect_url` to `apply_url`
- Extract basic skills from the description using keyword matching against a predefined skills list
- Use `external_id` format: `adzuna_{id}`

**Add The Muse fetcher function:**
- Call `/api/public/jobs?page=1&descending=true` (fetch first 2 pages for ~40 jobs)
- Normalize each result: map `name` to title, `company.name`, `locations[0].name`, `refs.landing_page` to `apply_url`
- Extract skills from categories and job level
- Use `external_id` format: `themuse_{id}`

**Update main handler:**
- Run Adzuna and The Muse fetchers before processing mock feeds
- Group results by source for the deactivation logic
- Return combined stats in the response

**Keep existing mock feeds:**
- Mock feeds remain in the `FEEDS` array as they are
- They serve as fallback data if the real APIs are down or rate-limited

### 3. Update `src/hooks/useAdminJobs.ts`

Update the success toast to show per-source breakdown from the new response format:
```
results: {
  "Adzuna": { upserted: 50, deactivated: 2 },
  "The Muse": { upserted: 40, deactivated: 0 },
  "TechCorp": { upserted: 3, deactivated: 0 },
  ...
}
```

### 4. Update `src/pages/AdminJobs.tsx`

- Add a new stat card showing "Real API" job count (source = "adzuna" or "themuse")
- Add a source filter dropdown to the jobs table so the admin can filter by Adzuna / The Muse / mock feeds

## Files Summary

| File | Action | Description |
|------|--------|-------------|
| `supabase/functions/ingest-jobs/index.ts` | Modify | Add Adzuna and The Muse API fetchers, update main handler |
| `src/hooks/useAdminJobs.ts` | Modify | Update success toast for new response format |
| `src/pages/AdminJobs.tsx` | Modify | Add real API stats card and source filter |

## Important Notes

- Adzuna free tier is limited to 250 requests/month -- the function fetches ~3-5 requests per ingestion run, so you can run it roughly 50-80 times/month
- The Muse is free but rate-limited; we add a small delay between page fetches
- No database schema changes needed -- the existing `jobs` table supports all fields
- The `source` field will be set to `"adzuna"` or `"themuse"` for real API jobs (instead of `"employer_feed"`)
