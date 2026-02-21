
## Separate JSearch Seed Mode Limits

### Problem
Currently, JSearch seed mode shares the same 7-day cooldown check as Adzuna, which only checks Adzuna job counts. This means JSearch seed mode can be blocked by Adzuna's cooldown or run without its own protection. The limits should be independent.

### Changes

#### 1. Edge Function (`supabase/functions/ingest-jobs/index.ts`)

**Add a separate JSearch cooldown check:**
- New `checkJSearchSeedCooldown()` function that checks `jsearch` source jobs created in the last 3 days (shorter cooldown than Adzuna's 7 days, since JSearch has a smaller footprint)
- Threshold: if more than 200 jsearch jobs exist from the last 3 days, seed was recently run

**Update JSearch seed limits to differ from Adzuna:**

| Setting | Adzuna Seed | JSearch Seed |
|---------|-------------|--------------|
| Queries | 5 categories | 5 queries |
| Max pages | 20 | 5 (reduced from 10) |
| Request cap | 80 | 25 (reduced from 50) |
| Cooldown | 7 days | 3 days |
| Delay | 300ms | 500ms |

**Skip Adzuna cooldown for JSearch-only requests:**
- When `jsearchOnly` is true, only run `checkJSearchSeedCooldown()` instead of the Adzuna cooldown

#### 2. Admin UI (`src/pages/AdminJobs.tsx`)

- Update the JSearch seed mode label to reflect the new limits: "Seed Mode (5 queries x 5 pages -- up to 25 API requests, 3-day cooldown)"

### Technical Details

- **Files modified**: `supabase/functions/ingest-jobs/index.ts`, `src/pages/AdminJobs.tsx`
- Constants changed: `MAX_JSEARCH_REQUESTS` from 50 to 25, `maxPages` for JSearch seed from 10 to 5
- New function: `checkJSearchSeedCooldown()` with 3-day window and 200-job threshold
- The main handler will route to the correct cooldown check based on `jsearchOnly` flag
