## Clean Up Ingestion: Real Indian Jobs Only

### What Changes

**File: `supabase/functions/ingest-jobs/index.ts**` (complete rewrite of the function)

### 1. Remove All Mock Feeds

- Delete the entire `FEEDS` array (TechCorp, DataWorks, DesignHub, FinanceFirst, HealthTech, GreenEnergy, MediaStack, Infosys, TCS, Wipro, Razorpay, Zerodha, Flipkart, Freshworks, CRED)
- Delete `FeedConfig`, `FeedJob` interfaces
- Delete `fetchFeedJobs()` and `normalizeJob()` helper functions
- Remove the mock feed processing loop from the main handler (lines 829-871)

### 2. Adzuna: India Only, Two Modes

**Seed Mode** (triggered by passing `seedMode: true` in the POST body):

- Country: India only (`in`)
- Categories: `it-jobs`, `engineering-jobs`, `accounting-finance-jobs`, `hr-jobs`, `consultancy-jobs` (5 total)
- Pages: 1 through 20 per category
- Max requests: 5 categories x 20 pages = 100, but capped at 80 with an early-exit counter
- 300ms delay between page fetches
- Logs total API requests used

**Daily Mode** (default, `seedMode: false`):

- Country: India only (`in`)
- Categories: `it-jobs`, `engineering-jobs` (2 total)
- Pages: 1 through 3 per category
- Max requests: 2 x 3 = 6
- No extra delay needed (small number of requests)

### 3. The Muse: Cap at 5 Pages

- Change loop from `page < 2` to `page < 5`

### 4. Cleanup Step

- After upsert/deactivate, permanently delete jobs where `is_active = false` AND `created_at` is older than 60 days

### 5. Remove US Fetching

- Remove `"us"` from countries entirely
- Remove the `ADZUNA_COUNTRIES` array, hardcode `"in"`

### Expected Request Budget Per Run


| Mode  | Adzuna Requests | Muse Requests | Total |
| ----- | --------------- | ------------- | ----- |
| Seed  | Up to 80        | 5             | 85    |
| Daily | 6               | 5             | 11    |


### Expected Job Counts


| Source       | Seed Mode       | Daily Mode            |
| ------------ | --------------- | --------------------- |
| Adzuna India | 3,000-4,000     | Refreshes top ~300    |
| The Muse     | ~100            | ~100                  |
| **Total**    | **3,100-4,100** | Maintains + refreshes |


### How to Use

1. **First run**: Send POST with body `{"seedMode": true}` to bulk-load jobs
2. **Daily runs**: Normal POST (no body or `seedMode: false`) to refresh latest listings and clean up expired ones

### Technical Detail: Seed Mode Activation

The `seedMode` flag is read from the request JSON body. The admin panel's "Run Ingestion" button currently sends no body, so it defaults to daily mode. To trigger seed mode, you would call the function directly or we can add a checkbox to the admin UI.  
  
Add protection so seedMode cannot be executed more than once within 7 days.