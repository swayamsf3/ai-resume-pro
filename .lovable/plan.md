

## Fix: Blank PDF Download from Supabase Storage

### Root Cause

In `ResumePreview.tsx`, the hidden measurement div (`contentMeasureRef`) has `visibility: 'hidden'` as an inline style. When cloning this element for PDF generation (line 93), `cloneNode(true)` copies that inline style. The code resets many styles on the clone but **never resets `visibility`** — so `html2canvas` captures an invisible (blank white) element.

### Fix

One line addition in `src/components/builder/ResumePreview.tsx` — after the existing clone style overrides (around line 100), add:

```typescript
clone.style.visibility = 'visible';
```

This ensures the cloned content is visible when `html2canvas` renders it, producing a proper PDF with actual content.

### Files Changed
- `src/components/builder/ResumePreview.tsx` — Add `clone.style.visibility = 'visible'` after the other clone style resets

