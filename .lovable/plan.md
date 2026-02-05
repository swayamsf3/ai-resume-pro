

# Fix Multi-Page Resume Layout with CSS-Based Pagination

## Overview

Implementing a proper multi-page resume system with CSS-based pagination rules, dynamic layouts, and proper page break handling.

---

## Changes Summary

### 1. CSS Print Rules (src/index.css)

Add comprehensive CSS rules for pagination:

```css
/* Resume Print & Preview Styles */
.resume-section {
  page-break-inside: avoid;
  break-inside: avoid;
}

/* Large sections that should start on new page if insufficient space */
.resume-section-large {
  page-break-inside: avoid;
  break-inside: avoid;
  break-before: auto;
}

/* Force page break before a section when needed */
.resume-page-break-before {
  break-before: page;
  page-break-before: always;
}

/* Individual items within sections should stay together */
.resume-item {
  page-break-inside: avoid;
  break-inside: avoid;
}

@media print {
  .resume-page {
    page-break-after: always;
    width: 210mm;
    height: 297mm;
    margin: 0;
    padding: 20px;
    box-sizing: border-box;
  }

  .resume-section, .resume-section-large, .resume-item {
    page-break-inside: avoid;
    break-inside: avoid;
  }

  /* Prevent orphaned headings */
  h2, h3 {
    page-break-after: avoid;
    break-after: avoid;
  }
}
```

---

### 2. Update All 5 Templates

Apply CSS classes to each template for proper pagination:

**Classes Applied:**
- `resume-section` - For smaller sections (Summary, Skills, Education, Certifications)
- `resume-section-large` - For large sections that may need page breaks (Experience, Projects)
- `resume-item` - For individual entries within sections
- `height: auto` - Ensure no fixed heights anywhere

**Example (applied to all templates):**
```tsx
{/* Experience - Large section */}
{experience.length > 0 && (
  <section className="resume-section-large">
    <h2>Experience</h2>
    <div className="space-y-1.5">
      {experience.map((exp) => (
        <div key={exp.id} className="resume-item">
          {/* Content */}
        </div>
      ))}
    </div>
  </section>
)}

{/* Skills - Regular section */}
{skills.length > 0 && (
  <section className="resume-section">
    <h2>Skills</h2>
    <p>{skills.join(" • ")}</p>
  </section>
)}
```

---

### 3. Fix ResumePreview.tsx

**Key Changes:**

1. **Correct Page Height Calculation:**
```typescript
const PAGE_WIDTH_PX = 595;
const PAGE_HEIGHT_PX = 842;
const CONTENT_PADDING = 20;
const USABLE_PAGE_HEIGHT = PAGE_HEIGHT_PX - (CONTENT_PADDING * 2); // 802px
```

2. **Fix Page Offset for Preview:**
```typescript
// Correct: Use USABLE_PAGE_HEIGHT for proper slicing
<div style={{
  position: 'absolute',
  top: `-${pageIndex * USABLE_PAGE_HEIGHT}px`,
  left: 0,
  right: 0,
  padding: `${CONTENT_PADDING}px`,
}}>
  {renderTemplate()}
</div>
```

3. **PDF Generation Fix:**
- Create temp container with proper padding
- Use scale: 3 for crisp text
- Calculate `canvasPageHeight` correctly for PDF slicing
- Ensure white backgrounds on all pages

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/index.css` | Add CSS pagination rules |
| `src/components/builder/ResumePreview.tsx` | Fix page offset calculation & PDF generation |
| `src/components/builder/templates/ClassicTemplate.tsx` | Add resume-section/resume-item classes |
| `src/components/builder/templates/ModernTemplate.tsx` | Add resume-section/resume-item classes |
| `src/components/builder/templates/MinimalTemplate.tsx` | Add resume-section/resume-item classes |
| `src/components/builder/templates/ProfessionalTemplate.tsx` | Add resume-section/resume-item classes |
| `src/components/builder/templates/NormalTemplate.tsx` | Add resume-section/resume-item classes |

---

## Your Additional Requirements (Addressed)

1. **CSS-based pagination over JS slicing**: Using `page-break-inside: avoid` and `break-inside: avoid` CSS rules
2. **break-before: page for large sections**: Added `resume-section-large` class with `break-before: auto` (browser decides) and optional `resume-page-break-before` class for forced breaks
3. **Minimum remaining-space check**: CSS `page-break-inside: avoid` naturally handles this - if a section can't fit, it moves to next page

---

## Expected Results

After implementation:
- Content flows naturally across pages without clipping
- Sections stay together (no mid-section breaks)
- Experience/Projects can trigger new page if insufficient space
- Individual items (job entries, projects) never split
- A4 dimensions maintained (210mm x 297mm)
- Crisp PDF output at 3x scale
- No font size changes - content flows to new pages

