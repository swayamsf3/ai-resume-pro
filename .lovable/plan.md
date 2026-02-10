

# Add More Employer Job Feeds

## Overview

Expand the `ingest-jobs` Edge Function from 2 mock feeds (6 jobs) to 7 feeds (21+ jobs) covering diverse industries and roles, providing a much richer job browsing experience.

## New Feeds to Add

| Employer | Industry | Jobs | Roles |
|----------|----------|------|-------|
| TechCorp | Tech (existing) | 3 | React Dev, Full Stack, DevOps |
| DataWorks | Data/Cloud (existing) | 3 | Data Scientist, Backend, Cloud Architect |
| DesignHub | Design/Creative | 3 | UI/UX Designer, Product Designer, Frontend Developer |
| FinanceFirst | Finance/Fintech | 3 | Quantitative Analyst, Security Engineer, Full Stack (Fintech) |
| HealthTech Solutions | Healthcare Tech | 3 | ML Engineer (Healthcare), Backend Engineer, Mobile Developer |
| GreenEnergy Co | Clean Energy | 3 | Embedded Systems Engineer, Data Analyst, Platform Engineer |
| MediaStack | Media/Entertainment | 3 | Video Streaming Engineer, Content Platform Developer, QA Automation Engineer |

## Total: 21 jobs across 7 feeds

## Technical Details

### File Modified

**`supabase/functions/ingest-jobs/index.ts`** -- append 5 new `FeedConfig` entries to the `FEEDS` array, each with:
- A unique `name` and placeholder `url`
- 3 mock jobs with realistic titles, locations (mix of on-site, remote, hybrid), salary ranges, detailed descriptions, and relevant skill arrays
- Unique `job_id` prefixes per feed (e.g., `dh-001`, `ff-001`, `ht-001`, `ge-001`, `ms-001`)

### Skill Diversity

The new feeds will introduce skills not currently covered, improving the matching algorithm's usefulness:
- **Design**: Figma, Sketch, Adobe XD, User Research, Design Systems, Accessibility
- **Finance**: Python, R, Quantitative Modeling, Cybersecurity, SOC2, Penetration Testing
- **Healthcare**: TensorFlow, PyTorch, HIPAA, FHIR, React Native, Swift, Kotlin
- **Energy**: C, C++, RTOS, Embedded Linux, Tableau, Power BI, ETL
- **Media**: FFmpeg, WebRTC, HLS, Elasticsearch, Cypress, Selenium, k6

### No Schema Changes

The existing `jobs` table schema supports all new data. No migrations needed.

### No New Secrets

Mock feeds use the same fallback pattern as existing feeds -- no new API keys required.

