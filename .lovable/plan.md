

## Bring More Indian Jobs Into Your Database

### Current State
Your ingestion pipeline fetches jobs from:
- **Adzuna** (US only - `api/jobs/us/search`)
- **The Muse** (global, mostly US-focused)
- **Mock employer feeds** (hardcoded US-based companies)

### Strategy to Get Indian Jobs

#### 1. Adzuna India Support (Quick Win)
Adzuna already supports India. We just need to change the country code from `us` to `in` (or fetch both). This will immediately bring in real Indian tech jobs from Adzuna's India listings.

- Fetch from both `api/jobs/us/search` AND `api/jobs/in/search`
- Add India-relevant categories like `"it-jobs"`, `"engineering-jobs"`
- Adjust salary formatting from `$` to INR

#### 2. Add Indian Mock Employer Feeds
Add curated job data from well-known Indian companies and startups as mock feeds (similar to the existing TechCorp, DataWorks pattern). These serve as seed data and can later be replaced with real career page scraping.

Companies to include:
- **Infosys** - Software Engineer, Data Analyst roles (Bangalore, Pune, Hyderabad)
- **TCS** - Full Stack Developer, Cloud Engineer roles (Mumbai, Chennai)
- **Wipro** - DevOps Engineer, QA roles (Bangalore, Noida)
- **Razorpay** - Backend Engineer, Frontend Developer (Bangalore)
- **Zerodha** - Platform Engineer, Data Engineer (Bangalore)
- **Flipkart** - ML Engineer, Mobile Developer (Bangalore)
- **Freshworks** - SRE, Product Designer (Chennai)
- **CRED** - iOS/Android Developer, Backend Engineer (Bangalore)

Each company will have 2-3 realistic job listings with Indian locations, INR salaries, and relevant skills.

#### 3. Add India-Specific Skills Keywords
Expand the `SKILLS_KEYWORDS` list with technologies popular in Indian job market:
- Frameworks: Spring Boot, Hibernate, .NET
- Tools: Jenkins, SonarQube, Jira
- Skills: SAP, Salesforce, ServiceNow, Power Automate

### Technical Changes

**File: `supabase/functions/ingest-jobs/index.ts`**

1. **Modify `fetchAdzunaJobs()`** to fetch from both US and India endpoints in parallel
2. **Add 8 new Indian company mock feeds** to the `FEEDS` array with realistic India-based job listings (salaries in INR format like "12,00,000 - 18,00,000 per year")
3. **Expand `SKILLS_KEYWORDS`** with India-market-relevant technologies
4. **Deploy** the updated edge function

### What Stays the Same
- The Muse fetcher (already global)
- Upsert/deactivate logic
- Admin dashboard and ingestion trigger
- Database schema (no changes needed)
- All existing US jobs remain untouched

### Future Enhancement (Not in This Plan)
For scraping real company career pages (e.g., careers.google.com, careers.infosys.com), you could use the Firecrawl connector to scrape career pages periodically. That would be a separate feature to build later.

