## Fresher-Only Job Recommendations

### Problem

Currently, all users see the same pool of jobs regardless of experience level. A fresher uploading their resume still sees "Senior Software Engineer" and "Lead Architect" roles they're not qualified for.

### Solution

Detect the user's experience level from their resume (or let them set it manually), store it in the database, and filter job recommendations accordingly.

### How It Works

1. **Detect experience level from resume text** during upload by looking for signals like:
  - Keywords: "fresher", "recent graduate", "0 years experience", "entry level"
  - Absence of a substantial work experience section
  - Graduation year close to current year
2. **Store experience level** in the `user_resumes` table as a new column: `experience_level` (values: `fresher`, `junior`, `mid`, `senior`)
3. **Filter jobs in the matching engine** -- if a user is a "fresher", exclude jobs with senior/lead/principal/staff keywords in the title
4. **Let users manually override** their experience level via the Skills Editor or Resume Status section

### Changes

#### 1. Database Migration

Add `experience_level` column to `user_resumes`:

```sql
ALTER TABLE user_resumes 
ADD COLUMN experience_level text NOT NULL DEFAULT 'unknown';
```

#### 2. Client-Side Experience Detector (`src/lib/experienceDetector.ts` -- new file)

A function `detectExperienceLevel(text: string): string` that analyzes resume text:

- Returns `"fresher"` if it finds keywords like "fresher", "recent graduate", "final year", graduation year within 1 year of now, or no work experience section
- Returns `"senior"` if it finds "senior", "lead", "principal", "manager", "8+ years", etc.
- Returns `"mid"` if it finds "3-5 years", "mid-level"
- Returns `"junior"` otherwise (has some experience but not senior signals)

#### 3. Resume Upload Hook (`src/hooks/useUserResume.ts`)

- After extracting text and skills, call `detectExperienceLevel(text)` 
- Save the detected level in the `experience_level` column during upsert
- Also save it when syncing from builder (default to `"unknown"`)

#### 4. Match Jobs Edge Function (`supabase/functions/match-jobs/index.ts`)

- Fetch `experience_level` alongside `skills` from `user_resumes`
- If `experience_level === "fresher"`, skip jobs whose title contains senior-level keywords:
  - "senior", "sr.", "lead", "principal", "staff", "architect", "director", "vp", "head of", "manager"
- Return `experience_level` in the response so the frontend knows

#### 5. UI: Experience Level Selector

- Add an experience level dropdown in the `ResumeStatus` component and `SkillsEditor` dialog
- Options: Fresher, Junior (0-2 years), Mid (3-5 years), Senior (5+ years)
- Saving this updates `user_resumes.experience_level` and re-triggers job matching

#### 6. Jobs Page (`src/pages/Jobs.tsx`)

- Show the detected experience level as a badge near the resume status
- Display a note like "Showing fresher-friendly jobs" when filtering is active

### Files Changed

- **New migration** -- add `experience_level` column to `user_resumes`
- `**src/lib/experienceDetector.ts**` -- new file for experience detection logic
- `**src/hooks/useUserResume.ts**` -- save detected experience level on upload
- `**supabase/functions/match-jobs/index.ts**` -- filter jobs based on experience level
- `**src/components/jobs/ResumeStatus.tsx**` -- show experience level badge + selector
- `**src/components/jobs/SkillsEditor.tsx**` -- add experience level dropdown
- `**src/hooks/useJobMatches.ts**` -- pass through `experience_level` from response
- `**src/pages/Jobs.tsx**` -- show filtering indicator

### Senior-Level Title Keywords to Filter Out (for freshers)


| Keyword   | Example Titles            |
| --------- | ------------------------- |
| senior    | Senior Software Engineer  |
| sr.       | Sr. Developer             |
| lead      | Lead Engineer             |
| principal | Principal Architect       |
| staff     | Staff Engineer            |
| architect | Cloud Solutions Architect |
| director  | Engineering Director      |
| head of   | Head of Engineering       |
| manager   | Engineering Manager       |
| vp        | VP Engineering            |


### Fresher-Friendly Title Keywords (boosted in ranking)


| Keyword                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | Example Titles                         |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------- |
| intern                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | Software Intern                        |
| trainee                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | Graduate Trainee                       |
| junior                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | Junior Developer                       |
| jr.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | Jr. Engineer                           |
| entry level                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | Entry Level Analyst                    |
| associate                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | Associate Engineer                     |
| fresher                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | Fresher Developer                      |
| graduate 1️⃣ Keep the DB ColumnThis is correct:ALTER TABLE user_resumes ADD COLUMN experience_level text NOT NULL DEFAULT 'unknown';Good design. Approve.---⚠️ 2️⃣ Move Detection to Edge Function (NOT Client)Right now the plan says:detectExperienceLevel in client-side JS❌ Not ideal.Why?- Users can manipulate it- Harder to maintain- Detection logic belongs to backendBetter:👉 Detect experience level inside `parse-resume` edge function 👉 Save `experience_level` server-sideThat’s cleaner architecture.---⚠️ 3️⃣ Don’t Fully Exclude Senior JobsThis part:If fresher, skip senior jobsBe careful.Hard filtering can:- Return too few jobs- Remove good edge cases- Hurt recommendationsBetter approach:Instead of:skip jobDo:reduce match scoreFor example:if (fresher && jobTitleContainsSeniorKeyword) { score -= 40; }That way:- Senior jobs drop to bottom- But still visible if needed- System feels smart, not rigidMuch better UX.---✅ 4️⃣ Manual Override Is VERY ImportantAbsolutely keep:Experience level dropdownAuto detection is never perfect.User must be able to say:- “I am mid-level”- “I am actually senior”This is critical.---⚠️ 5️⃣ Improve Detection LogicThe proposed detection:Check keywords + graduation yearGood start.But better logic:Fresher:- No experience section- Or only internships- Or graduation within 1–2 years- Or "fresher" keywordJunior:- 0–2 years experienceMid:- 3–5 yearsSenior:- 6+ years- Or title keywordsUse regex for:(\d+)\+?\s*years?Extract numeric years.Much more accurate. | Graduate Engineer&nbsp;&nbsp;&nbsp; |
