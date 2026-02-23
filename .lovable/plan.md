## Add Greenhouse and Lever ATS Job Ingestion

### Overview

Integrate two new free, public job APIs — **Greenhouse** and **Lever** — to ingest jobs directly from major Indian tech companies. No API keys needed; these are public endpoints. This can add 2,000-4,000+ jobs from ~20 companies.

### How It Works

Greenhouse and Lever are Applicant Tracking Systems (ATS) used by companies to manage hiring. Many companies expose their job listings publicly via JSON APIs:

- **Greenhouse**: `https://boards-api.greenhouse.io/v1/boards/{company}/jobs?content=true`
- **Lever**: `https://api.lever.co/v0/postings/{company}?mode=json`

We'll add a curated list of Indian tech companies and fetch all their open positions.

### Companies to Include


| Company       | ATS        | Slug         |
| ------------- | ---------- | ------------ |
| Razorpay      | Greenhouse | razorpay     |
| Swiggy        | Greenhouse | swiggy       |
| Zomato        | Greenhouse | zomato       |
| Flipkart      | Greenhouse | flipkart     |
| PhonePe       | Greenhouse | phonepe      |
| Meesho        | Greenhouse | meesho       |
| CRED          | Greenhouse | cred         |
| Groww         | Greenhouse | groww        |
| Zerodha       | Lever      | zerodha      |
| Postman       | Greenhouse | postman      |
| Notion        | Greenhouse | notion       |
| Atlassian     | Greenhouse | atlassian    |
| Coinbase      | Greenhouse | coinbase     |
| Stripe        | Greenhouse | stripe       |
| Freshworks    | Greenhouse | freshworks   |
| Browserstack  | Greenhouse | browserstack |
| Chargebee     | Greenhouse | chargebee    |
| Gojek         | Lever      | gojek        |
| Urban Company | Lever      | urbancompany |
| Ola           | Lever      | olacabs      |


(Note: Some slugs may need verification — the code will gracefully skip any that return errors.)

### Changes

#### 1. Edge Function: `supabase/functions/ingest-jobs/index.ts`

**Add two new fetcher functions:**

- `fetchGreenhouseJobs(companies)` — loops through Greenhouse company slugs, fetches all jobs from each, normalizes to `NormalizedJob` with `source: "greenhouse"` and `external_id: "greenhouse_{company}_{job_id}"`
- `fetchLeverJobs(companies)` — same pattern for Lever, `source: "lever"` and `external_id: "lever_{company}_{posting_id}"`

**Key details:**

- Both APIs are free with no API key required
- 10-second timeout per company request
- 500ms delay between companies to be respectful
- Skills extracted from job descriptions using existing `extractSkillsFromText()`
- Greenhouse description comes in HTML — strip tags before storing
- These run in both seed and daily modes (company job boards change frequently)
- No deactivation of stale jobs in daily mode (matching existing pattern)

**Integrate into main handler:**

- Add to the `Promise.all` alongside Adzuna, Muse, and JSearch
- Upsert results using existing `upsertAndDeactivate()` helper
- Include stats in the response

#### 2. Admin Dashboard: `src/pages/AdminJobs.tsx`

- Add "Greenhouse" and "Lever" to the source filter dropdown
- Add a combined stat card for "Greenhouse + Lever" count
- Add source badge styling for the new sources

#### 3. Jobs Page Source Filter: `src/pages/Jobs.tsx`

- No changes needed — jobs from these sources will appear automatically in recommendations since they go into the same `jobs` table

### Technical Details

```text
Greenhouse API Response Shape:
{
  "jobs": [
    {
      "id": 123,
      "title": "Software Engineer",
      "location": { "name": "Bangalore, India" },
      "content": "<p>HTML description...</p>",
      "updated_at": "2026-02-20T...",
      "absolute_url": "https://boards.greenhouse.io/..."
    }
  ]
}

Lever API Response Shape:
[
  {
    "id": "abc-123",
    "text": "Software Engineer",
    "categories": { "location": "Bangalore", "team": "Engineering" },
    "descriptionPlain": "Plain text description...",
    "createdAt": 1708000000000,
    "hostedUrl": "https://jobs.lever.co/..."
  }
]
```

### Files Changed

- `**supabase/functions/ingest-jobs/index.ts**` — Add `fetchGreenhouseJobs()` and `fetchLeverJobs()` functions, integrate into main handler
- `**src/pages/AdminJobs.tsx**` — Add new source filters and stats  
  
  
also add a button to run this injest process in admin panel without hitting it should not add jobs in my database  
  
  
1. DO NOT Run Them in Both Seed and Daily Mode
  This is dangerous:
  > “These run in both seed and daily modes”
  Bad idea.
  Why?
  - 20 companies × daily
  - Each may return 100+ jobs
  - That's 2,000+ jobs every day
  - Huge CPU + DB load
  - Edge function may timeout
  - Duplicate upserts every day
  ### ✅ Better Approach
  - Run Greenhouse + Lever ONLY in:
    - Seed mode
    - Or when “Run ATS Ingestion” button is clicked
  Keep daily mode lightweight.
  ---
  ## 🔴 2. You MUST Add Per-Company Deactivation Logic
  If you do:
  ```
  upsertAndDeactivate(supabase, "greenhouse", jobs)
  ```
  Then ALL greenhouse jobs across ALL companies are treated as one source.
  If Razorpay removes a job,  
    
  But Swiggy still has jobs,  
    
  Your deactivation may incorrectly mark others.
  ### ✅ Correct Design
  Use:
  ```
  source = "greenhouse_razorpay"
  source = "greenhouse_swiggy"
  ```
  OR pass company into deactivate helper.
  Deactivation must be per-company, not global per-source.
  Very important.
  ---
  ## 🔴 3. Add Concurrency Control
  You cannot do:
  ```
  await Promise.all(companies.map(fetchCompany))
  ```
  With 20 companies.
  Supabase Edge has:
  - Execution time limits
  - Memory limits
  Instead:
  ```
  for (const company of companies) {
    await fetchGreenhouseJobs(company);
    await delay(500);
  }
  ```
  Controlled, safe, predictable.  
    
