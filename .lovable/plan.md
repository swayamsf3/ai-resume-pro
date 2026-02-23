

## Redesign Modern Template to Match Jake's Resume Format

### Overview

Completely restyle the Modern Template to match the classic "Jake's Resume" LaTeX template - a clean, professional, ATS-friendly format widely used in tech.

### Key Design Changes

**Header:**
- Name large and centered (not left-aligned)
- Contact info centered below name on one line, separated by pipes (phone | email | linkedin | portfolio)

**Section Headers:**
- Small caps / uppercase with a thin horizontal rule underneath
- Consistent across all sections

**Section Order:**
- Education, Experience, Projects, Technical Skills, Certifications (Education moves up before Experience)

**Education Section:**
- Row 1: Institution bold (left) + Location right-aligned
- Row 2: Degree italic (left) + Date range italic right-aligned
- GPA shown inline with degree if present

**Experience Section:**
- Row 1: Position bold (left) + Date range right-aligned
- Row 2: Company italic (left) + Location italic right-aligned
- Bullet points below

**Projects Section:**
- Row 1: Project name bold + pipe + technologies italic (left) + Date range right-aligned (if available)
- Bullet points below

**Technical Skills:**
- Single comma-separated list (matching existing data structure)

**Certifications:**
- Keep existing layout (name + issuer left, date right) - fits Jake's style naturally

### Technical Details

**File: `src/components/builder/templates/ModernTemplate.tsx`**

Full rewrite of the JSX layout:

1. **Header** - Change from `flex justify-between` to `text-center` for name and contact info
2. **Section headers** - Add a thin border-bottom line under each section title using small-caps styling
3. **Education** - Change from single-line flex to a two-line block per entry:
   - Line 1: `<div className="flex justify-between"><span className="font-bold">{institution}</span><span>{location}</span></div>`
   - Line 2: `<div className="flex justify-between"><span className="italic">{degree} in {field}</span><span className="italic">{dates}</span></div>`
4. **Experience** - Change to two-line header per entry:
   - Line 1: `<div className="flex justify-between"><span className="font-bold">{position}</span><span>{dates}</span></div>`
   - Line 2: `<div className="flex justify-between"><span className="italic">{company}</span><span className="italic">{location}</span></div>`
   - Keep bullet points as-is
5. **Projects** - Change first line to show name + technologies + dates:
   - `<div className="flex justify-between"><span><strong>{name}</strong> | <em>{technologies}</em></span><span>{dates}</span></div>`
6. **Section order** - Reorder: Summary (if present), Education, Experience, Projects, Skills, Certifications
7. **Remove Summary section heading styling change** - Keep it but make it match the overall style

No changes to `ResumeData` type or other templates.

