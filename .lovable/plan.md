
# Job Recommendation System with Resume Skills Matching

## Overview

This implementation creates a job recommendation system where:
- Jobs are stored in the database (admin-managed) with **apply URLs**
- Users can upload a resume (PDF/DOCX) OR sync skills from the Resume Builder
- The app matches user skills with job requirements and shows personalized recommendations
- Each job has an **Apply Now** button that links to the external application page

---

## How It Works

```text
User Journey:
                                                
+------------------+     +------------------+
|  Upload Resume   |     | Use Resume       |
|  (PDF/DOCX)      | OR  | Builder Data     |
+--------+---------+     +--------+---------+
         |                        |
         v                        v
+------------------------------------------------------------------+
|              Extract & Store User Skills                         |
|         (saved to user_resumes table in Supabase)                |
+------------------------------------------------------------------+
                              |
                              v
+------------------------------------------------------------------+
|                    Skill Matching Engine                         |
|   - Compare user skills with job required skills                 |
|   - Calculate match % = (matching / required) x 100              |
|   - Sort jobs by match percentage                                |
+------------------------------------------------------------------+
                              |
                              v
+------------------------------------------------------------------+
|              Display Personalized Job Recommendations            |
|   - Jobs sorted by match %, matching skills highlighted          |
|   - Apply Now button links to external job application           |
+------------------------------------------------------------------+
```

---

## Phase 1: Database Setup

### 1.1 Create `jobs` Table

Stores all job listings with their required skills and **apply links**:

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| title | text | Job title (e.g., "Senior Frontend Developer") |
| company | text | Company name |
| location | text | Job location (e.g., "Remote", "New York, NY") |
| type | text | Full-time, Part-time, Contract |
| salary | text | Salary range (e.g., "$120k - $160k") |
| description | text | Full job description |
| skills | text[] | Array of required skills (lowercase) |
| **apply_url** | **text** | **External URL for job application** |
| posted_at | timestamptz | When posted |
| is_active | boolean | Whether visible to users |
| created_at | timestamptz | Record creation time |

RLS Policies:
- All authenticated users can view active jobs

### 1.2 Create `user_resumes` Table

Stores user resume data and extracted skills:

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| user_id | uuid | Links to auth.users |
| resume_file_url | text | URL to uploaded file (if uploaded) |
| resume_file_name | text | Original filename |
| skills | text[] | Extracted/synced skills (lowercase) |
| source | text | 'upload' or 'builder' |
| raw_data | jsonb | Full resume data for reference |
| created_at | timestamptz | When created |
| updated_at | timestamptz | Last update |

RLS Policies:
- Users can only access their own resume data

### 1.3 Create `saved_jobs` Table

Tracks jobs saved by users:

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| user_id | uuid | Links to auth.users |
| job_id | uuid | Links to jobs table |
| created_at | timestamptz | When saved |

### 1.4 Create Storage Bucket

Create a `resumes` bucket for uploaded resume files with proper access policies.

### 1.5 Seed Sample Jobs with Apply Links

Insert sample job data with real-looking apply URLs:

```text
Sample Jobs:
1. Senior Frontend Developer - TechCorp Inc.
   Skills: react, typescript, node.js, graphql
   Apply: https://techcorp.com/careers/senior-frontend-developer

2. Full Stack Engineer - StartupXYZ
   Skills: react, python, aws, postgresql
   Apply: https://startupxyz.com/jobs/full-stack-engineer

3. React Developer - Digital Agency Pro
   Skills: react, javascript, css, tailwind
   Apply: https://digitalagencypro.com/apply/react-developer

... (10-15 sample jobs total)
```

---

## Phase 2: Resume Upload & Skills Extraction

### 2.1 Resume Uploader Component

Location: `src/components/jobs/ResumeUploader.tsx`

Features:
- Drag-and-drop or click to upload PDF/DOCX
- File validation (max 10MB, PDF/DOCX only)
- Upload to Supabase Storage
- Call edge function to parse and extract skills
- Show extracted skills with ability to edit

### 2.2 Parse Resume Edge Function

Location: `supabase/functions/parse-resume/index.ts`

Process:
1. Download uploaded file from Supabase Storage
2. Extract text content from PDF/DOCX
3. Use keyword matching to identify skills from text
4. Common skill keywords list (200+ skills like React, Python, AWS, etc.)
5. Save skills to `user_resumes` table
6. Return extracted skills to frontend

### 2.3 Sync from Resume Builder

Add a "Use Resume Builder Skills" button that:
- Fetches skills from the user's Resume Builder data (skills array)
- Saves to `user_resumes` with source = 'builder'
- No file upload needed

---

## Phase 3: Skills Matching Logic

### 3.1 Match Jobs Edge Function

Location: `supabase/functions/match-jobs/index.ts`

The matching algorithm:

```text
Input: user_id

1. Fetch user's skills from user_resumes table
2. Fetch all active jobs from jobs table
3. For each job:
   - user_skills = user's skills (all lowercase)
   - job_skills = job's required skills (all lowercase)
   - matching_skills = intersection of both
   - match_percentage = (count(matching) / count(job_skills)) * 100
4. Sort jobs by match_percentage descending
5. Return jobs with:
   - match_percentage
   - matching_skills (highlighted)
   - apply_url (for Apply button)
```

Example:
- User skills: ["react", "typescript", "node.js", "css"]
- Job requires: ["react", "typescript", "graphql"]
- Matching: ["react", "typescript"] = 2 skills
- Match: 2/3 = 67%

---

## Phase 4: Updated Jobs Page UI

### 4.1 Resume Status Section

At the top of the Jobs page, show:
- Whether user has uploaded/synced a resume
- List of user's skills as badges
- Buttons: "Upload Resume" or "Sync from Builder"
- "Edit Skills" button for manual adjustments

### 4.2 Enhanced Job Cards with Apply Links

Each job card will display:
- Job title, company, location, salary, type
- Real match percentage based on skill comparison
- Color coding: Green (90%+), Yellow (70-89%), Gray (<70%)
- Skills badges highlighting matches vs missing
- **Apply Now button** - opens `apply_url` in new tab
- Save button to bookmark jobs

```text
+----------------------------------------------------------+
|  [Logo]  Senior Frontend Developer                       |
|          TechCorp Inc.                    [95% Match]    |
|          San Francisco | Full-time | $120k-160k          |
|                                                          |
|  Skills: [React ✓] [TypeScript ✓] [Node.js ✓] [GraphQL]  |
|                                                          |
|  We're looking for a Senior Frontend Developer...        |
|                                                          |
|  [Apply Now →]  [Save]                                   |
+----------------------------------------------------------+
         ↓
   Opens: https://techcorp.com/careers/senior-frontend-developer
```

### 4.3 Apply Button Behavior

The "Apply Now" button will:
- Open the job's `apply_url` in a new browser tab
- Use `target="_blank"` with `rel="noopener noreferrer"` for security
- Show an external link icon to indicate it opens externally
- Optionally track click events in the database for analytics

### 4.4 Filters

- Filter by job type (Full-time, Part-time, Remote)
- Filter by minimum match percentage
- Search by title, company, or skill

---

## File Changes Summary

### New Files

| File | Purpose |
|------|---------|
| `src/components/jobs/ResumeUploader.tsx` | Upload resume UI with drag-drop |
| `src/components/jobs/ResumeStatus.tsx` | Shows user's current skills |
| `src/components/jobs/SkillsEditor.tsx` | Manual skills editing dialog |
| `src/components/jobs/JobCard.tsx` | Individual job card with apply link |
| `src/hooks/useUserResume.ts` | Hook for resume/skills management |
| `src/hooks/useJobMatches.ts` | Hook to fetch matched jobs |
| `src/hooks/useSavedJobs.ts` | Hook for saving/unsaving jobs |
| `supabase/functions/parse-resume/index.ts` | Resume parsing edge function |
| `supabase/functions/match-jobs/index.ts` | Job matching edge function |

### Modified Files

| File | Changes |
|------|---------|
| `src/pages/Jobs.tsx` | Replace mock data, add resume section, use real apply links |

### Database Migrations

| Migration | Purpose |
|-----------|---------|
| Create `jobs` table | Store job listings with skills and apply_url |
| Create `user_resumes` table | Store user skills data |
| Create `saved_jobs` table | Track saved jobs per user |
| Create `resumes` storage bucket | Store uploaded resume files |
| Insert sample jobs | Provide initial job data with apply links |

---

## Sample Jobs Data

The seeded jobs will include apply URLs pointing to placeholder career pages:

| Job Title | Company | Apply URL |
|-----------|---------|-----------|
| Senior Frontend Developer | TechCorp Inc. | https://techcorp.example.com/careers/frontend |
| Full Stack Engineer | StartupXYZ | https://startupxyz.example.com/jobs/fullstack |
| React Developer | Digital Agency Pro | https://digitalagency.example.com/apply/react |
| Software Engineer II | Enterprise Solutions | https://enterprise.example.com/careers/swe2 |
| Frontend Web Developer | Creative Studio | https://creativestudio.example.com/jobs/frontend |
| Backend Engineer | CloudTech Systems | https://cloudtech.example.com/careers/backend |
| DevOps Engineer | Infrastructure Co | https://infra.example.com/apply/devops |
| Mobile Developer | AppWorks Inc | https://appworks.example.com/jobs/mobile |
| Data Engineer | DataFlow Analytics | https://dataflow.example.com/careers/data |
| UI/UX Developer | DesignFirst | https://designfirst.example.com/apply/uiux |

These are placeholder URLs. In production, you would replace them with actual job posting URLs from company career pages, LinkedIn, Indeed, etc.

---

## Technical Details

### Skill Normalization

All skills are normalized before storage and comparison:
- Convert to lowercase
- Trim whitespace
- Remove duplicates
- Handle common variations (e.g., "Node.js" = "nodejs" = "node")

### PDF/DOCX Parsing

The edge function will use:
- Text extraction for PDFs
- Text extraction for DOCX (XML parsing)
- Keyword matching against a predefined skills list

### Skills Dictionary

A comprehensive list of 200+ common technical and professional skills:
- Programming: JavaScript, TypeScript, Python, Java, C++, Go, Rust, etc.
- Frameworks: React, Angular, Vue, Django, Express, Spring, etc.
- Tools: Git, Docker, Kubernetes, AWS, Azure, GCP, etc.
- Databases: PostgreSQL, MySQL, MongoDB, Redis, etc.
- Soft skills: Leadership, Communication, Problem-solving, etc.

---

## Implementation Order

1. **Database**: Create tables, storage bucket, and seed sample jobs with apply URLs
2. **Edge Functions**: Build parse-resume and match-jobs functions
3. **Hooks**: Create React hooks for data management
4. **Components**: Build ResumeUploader, ResumeStatus, SkillsEditor, JobCard
5. **Jobs Page**: Update to use real data and new components with working apply links
6. **Testing**: Verify end-to-end flow including apply link functionality

---

## Important Notes

- Users must be logged in to use job matching (protected route)
- Jobs are managed by admins directly in the Supabase dashboard
- Apply URLs should link to real job application pages
- The "Apply Now" button opens links in new tabs for better UX
- The matching is performed server-side for security and performance
- Skills from Resume Builder are extracted from the `skills` array in the resume data
