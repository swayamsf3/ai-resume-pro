

# Plan: Reduce Resume PDF File Size

## Problem Analysis

The current PDF generation creates files of 14-15 MB due to:
- **3x rendering scale** producing extremely high-resolution images (1785 x 2526 pixels per page)
- **PNG format** which is lossless and uncompressed
- Each page being stored as a full-resolution raster image

## Solution Overview

Reduce the PDF size to 4-5 MB while maintaining good visual quality by:
1. Lowering the canvas scale from 3x to 2x
2. Switching from PNG to JPEG format with quality optimization
3. Adding PDF compression

---

## Implementation Details

### File: `src/components/builder/ResumePreview.tsx`

#### Change 1: Reduce canvas rendering scale
```tsx
// Before (line 101-102)
const canvas = await html2canvas(clone, {
  scale: 3,

// After
const canvas = await html2canvas(clone, {
  scale: 2,
```
**Impact**: Reduces image size by ~55% (from 3x to 2x means 4/9th of the pixels). Text remains crisp at 2x for A4 documents.

#### Change 2: Switch from PNG to JPEG with quality setting
```tsx
// Before (line 154-156)
pdf.addImage(
  pageCanvas.toDataURL('image/png'),
  'PNG',

// After
pdf.addImage(
  pageCanvas.toDataURL('image/jpeg', 0.92),
  'JPEG',
```
**Impact**: JPEG with 0.92 quality provides ~70-80% size reduction compared to PNG while maintaining excellent visual quality for text-heavy documents.

#### Change 3: Enable PDF compression
```tsx
// Before (line 121)
const pdf = new jsPDF("p", "mm", "a4");

// After
const pdf = new jsPDF({
  orientation: "p",
  unit: "mm",
  format: "a4",
  compress: true
});
```
**Impact**: Enables built-in jsPDF compression, typically providing 10-20% additional reduction.

---

## Expected Results

| Metric | Before | After |
|--------|--------|-------|
| Canvas Scale | 3x | 2x |
| Image Format | PNG (lossless) | JPEG (0.92 quality) |
| PDF Compression | Off | On |
| **File Size** | 14-15 MB | **3-5 MB** |

## Quality Assurance

- Text remains sharp and readable at 2x scale (standard for PDF exports)
- JPEG artifacts are minimal at 0.92 quality, invisible on resume text/layouts
- Multi-page functionality remains unchanged
- No visual difference when printed

---

## Technical Notes

- The 2x scale produces 1190 x 1684 pixel images per page, which is sufficient for 150+ DPI when printed on A4
- JPEG quality of 0.92 is the sweet spot—higher provides diminishing returns, lower may show artifacts on thin text
- jsPDF's `compress: true` uses DEFLATE algorithm on the internal PDF streams

