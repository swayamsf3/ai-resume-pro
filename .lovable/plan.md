

## Fix: Date Alignment and Certification Date Display Across All Templates

### Problem
1. Dates in experience (and education in some templates) are not consistently right-aligned to the far right corner as shown in your screenshot
2. Certification dates are not being displayed at all in any template

### Changes

#### 1. Experience Section - Right-align dates (all 4 templates)

The screenshot shows: position name on the left, date range flush to the right edge. Most templates already use `flex justify-between`, but some need minor fixes to ensure the date stays at the rightmost corner.

**ClassicTemplate.tsx** - Already correct layout (flex justify-between), no change needed for experience.

**ModernTemplate.tsx** - Already correct layout, no change needed for experience.

**ProfessionalTemplate.tsx** - Already correct layout, no change needed for experience.

**NormalTemplate.tsx** - Already correct layout, no change needed for experience.

#### 2. Education Section - Right-align dates (all 4 templates)

Currently, education dates are inline with text (e.g., `B Tech in CSe | Institution | Oct 2017 - Aug 2024`). This needs to change to a two-column layout with dates on the far right.

**ClassicTemplate.tsx (lines 88-98):**
Change from inline `<p>` to `flex justify-between` layout:
- Left side: degree, field, institution, GPA
- Right side: date range pushed to far right

**ModernTemplate.tsx (lines 120-130):**
Same change - split into flex layout with dates on the right.

**ProfessionalTemplate.tsx (lines 126-135):**
Same change - split into flex layout with dates on the right.

**NormalTemplate.tsx (lines 46-58):**
Already has a two-line layout. Change to add date on the right side using flex justify-between.

#### 3. Certifications Section - Show dates (all 4 templates)

Currently, certification dates (`cert.date`) are completely ignored in the rendering. Each template needs to display the date.

**ClassicTemplate.tsx (line 120):**
Change from inline text to a flex layout showing each certification with its date on the right.

**ModernTemplate.tsx (line 152):**
Same change - show date for each certification.

**ProfessionalTemplate.tsx (line 159):**
Same change - show date for each certification.

**NormalTemplate.tsx (lines 152-162):**
Already has a list layout. Add `formatDate(cert.date)` to each list item, right-aligned.

### Technical Details

**Education layout change (example for ClassicTemplate):**
```
// Before (inline)
<p className="resume-item text-[10px]">
  <span className="font-semibold">B Tech in CSe</span> | Institution | Oct 2017 - Aug 2024 | GPA: 7/10
</p>

// After (flex with right-aligned date)
<div className="resume-item text-[10px] flex justify-between">
  <span>
    <span className="font-semibold">B Tech in CSe</span> | Institution | GPA: 7/10
  </span>
  <span className="text-gray-600 whitespace-nowrap">Oct 2017 - Aug 2024</span>
</div>
```

**Certifications layout change (example for ClassicTemplate):**
```
// Before (no date shown)
{certifications.map((cert) => `${cert.name} (${cert.issuer})`).join(" . ")}

// After (each cert on its own line with date on right)
{certifications.map((cert) => (
  <div key={cert.id} className="flex justify-between text-[10px]">
    <span>{cert.name}{cert.issuer ? ` (${cert.issuer})` : ""}</span>
    {cert.date && <span className="text-gray-600 whitespace-nowrap">{formatDate(cert.date)}</span>}
  </div>
))}
```

All four template files will be updated with these two changes.

