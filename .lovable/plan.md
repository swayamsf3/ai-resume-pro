

# Fix Resume Skill Extraction Logic

## Problem

The current `parse-resume` Edge Function extracts skills from the **entire resume text**, causing false matches. For example:
- "go" matches from sentences like "go above and beyond"
- "r" matches single-letter occurrences
- "rest" matches from "the rest of the team"
- "agile" matches from generic adjective usage

## Solution

Rewrite the skill extraction in `supabase/functions/parse-resume/index.ts` with three key changes:

### 1. Detect and extract the SKILLS section

Add a function that finds common resume section headers like "SKILLS", "TECHNICAL SKILLS", "KEY SKILLS", "CORE COMPETENCIES", etc., and extracts only the text between that header and the next section header.

Common section headers to detect (case-insensitive):
- Skills, Technical Skills, Key Skills
- Core Competencies, Technologies, Tech Stack
- Tools & Technologies, Proficiencies, Areas of Expertise

If no skills section is found, fall back to full text but with stricter matching rules (require comma/pipe/bullet separators to avoid matching prose).

### 2. Replace the skills dictionary with a curated whitelist

Remove ambiguous entries (single letters like "r", "c"; short generic words like "go", "rest") and replace with a comprehensive but safe whitelist. The whitelist will include:

- **Data and Analytics**: python, sql, excel, power bi, pandas, numpy, matplotlib, mysql, postgresql, tableau, data analysis, machine learning, statistics, scikit-learn, data science, data engineering, spark, hadoop, airflow, kafka, etl, deep learning, nlp, tensorflow, pytorch, keras
- **Web Development**: javascript, typescript, react, angular, vue.js, svelte, next.js, node.js, express, django, flask, fastapi, html, css, sass, tailwind, bootstrap, graphql, webpack, vite
- **Backend and Infrastructure**: java, spring boot, ruby on rails, asp.net, laravel, docker, kubernetes, terraform, aws, azure, gcp, linux, nginx, redis, mongodb, elasticsearch, dynamodb, firebase, supabase
- **Programming Languages** (safe multi-char only): python, java, javascript, typescript, kotlin, swift, scala, matlab, rust, perl, powershell, bash, shell
- **Mobile**: react native, flutter, ios development, android development, xamarin
- **Tools and Practices**: git, github, gitlab, jira, confluence, figma, ci/cd, agile methodology, scrum, microservices
- **Soft Skills**: leadership, project management, communication, problem-solving, mentoring, teamwork

Key exclusions (false-positive prone): "r", "c", "c++", "c#", "go", "rest", "php", "ruby" as standalone entries. These will only match if found with contextual patterns (e.g., "C++" or "C#" in a comma-separated list).

### 3. Match with context awareness

- In the skills section: match against the whitelist using word boundaries
- Apply minimum skill length of 2 characters
- Normalize all results to lowercase
- Deduplicate before returning
- For ambiguous skills (C++, C#, R, Go), only match if they appear in a comma/pipe/bullet-delimited list within the skills section (not in prose)

## Technical Details

### File: `supabase/functions/parse-resume/index.ts`

**Replace** `SKILLS_DICTIONARY` with a curated `SKILLS_WHITELIST` array (removing all single-letter and ambiguous short entries).

**Add** `findSkillsSection(text)` function:
- Uses regex to match section headers: `/^[\s]*(?:technical\s+)?skills|core\s+competencies|technologies|tech\s+stack|tools\s*(?:&|and)\s*technologies|proficiencies|areas\s+of\s+expertise/im`
- Extracts text from the matched header to the next section header (detected by common patterns like all-caps lines, lines ending with colon, etc.)
- Returns the section text, or `null` if not found

**Add** `extractAmbiguousSkills(sectionText)` function:
- Specifically handles skills like C++, C#, R (the language), Go (the language)
- Only matches these if found in comma-separated, pipe-separated, or bullet-point lists
- Uses patterns like `/(?:^|,|;|\||\u2022)\s*(?:c\+\+|c#|r\b|go\b)/im`

**Rewrite** `extractSkillsFromText(text)`:
1. Call `findSkillsSection(text)` to get the skills section
2. If found, match whitelist skills against the section text only
3. Also run `extractAmbiguousSkills` on the section text
4. If no section found, match against full text but only for multi-word skills and unambiguous entries (safer subset)
5. Normalize to lowercase, deduplicate, and return

### No changes needed to other files

- `src/hooks/useUserResume.ts` -- unchanged (already normalizes/deduplicates on the client side)
- `supabase/functions/match-jobs/index.ts` -- unchanged (already has its own alias-based matching)
- `supabase/functions/ingest-jobs/index.ts` -- unchanged (uses its own skill extraction for job descriptions, which is appropriate for that context)

## Expected Behavior After Fix

| Scenario | Before | After |
|----------|--------|-------|
| Resume with "SKILLS: Python, SQL, Excel, Power BI" | Extracts 15+ random skills from entire text | Extracts exactly: python, sql, excel, power bi |
| Resume with "go above and beyond" in experience | Falsely extracts "go" | No false "go" match |
| Resume with "for the rest of the team" | Falsely extracts "rest" | No false "rest" match |
| Resume with "R" in a skills list | May or may not match | Correctly matches "r" from list context |
| Resume with no skills section | Extracts many false matches | Uses stricter full-text matching, fewer false positives |

