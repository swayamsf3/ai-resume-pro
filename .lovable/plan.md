

## Fix: PDF Content Cut Off - Section-Based PDF Generation

### Problem
The current approach renders the entire resume as one big canvas with `html2canvas`, then tries to slice it into pages. This fails because the hidden measurement div's `scrollHeight` is unreliable (it uses `position: absolute` which can collapse), resulting in an incomplete canvas. Page 2 shows overlapping/duplicate content from page 1.

### Solution: Full-Image Pagination (Proven Approach)
Instead of trying to fix the container height measurement, use a simpler and more reliable pagination method. Render the full resume content into a single image, then use `addImage` with negative Y offsets to place the correct portion on each page. This avoids canvas slicing entirely.

### Technical Details

**File: `src/components/builder/ResumePreview.tsx`**

Replace the `handleDownload` function's rendering and pagination logic:

1. **Use a visible-but-offscreen container** with `position: fixed; left: -9999px; visibility: hidden` (not `absolute`) and explicit `display: block` to ensure the browser computes layout correctly.

2. **Replace canvas slicing with full-image pagination:**
   - Render the full resume clone to a single canvas
   - Calculate the image's total height in mm: `imgHeightMm = (canvas.height * 210) / canvas.width`
   - Convert the full canvas to a single image data URL
   - For each page, call `pdf.addImage()` with a negative Y offset to shift the image up, showing the correct portion:
     ```
     Page 0: y = 0
     Page 1: y = -297
     Page 2: y = -594
     ```
   - jsPDF automatically clips content outside the page bounds

3. **Critical container fix** - also fix the hidden measurement div (line 295-307) to use `visibility: hidden` instead of relying on `absolute left-[-9999px]`, ensuring `scrollHeight` is computed correctly by the browser.

### Code Changes

**Pagination logic replacement (lines 130-185):**
```typescript
// Convert full canvas to image
const imgData = canvas.toDataURL('image/jpeg', 0.92);
const pdfWidth = 210;
const pdfHeight = 297;

// Calculate total image height in mm (proportional to width)
const imgHeightMm = (canvas.height * pdfWidth) / canvas.width;
const totalPages = Math.ceil(imgHeightMm / pdfHeight);

const pdf = new jsPDF({
  orientation: "p",
  unit: "mm",
  format: "a4",
  compress: true
});

for (let page = 0; page < totalPages; page++) {
  if (page > 0) pdf.addPage();
  // Place the full image with negative Y offset to show correct page slice
  pdf.addImage(imgData, 'JPEG', 0, -(page * pdfHeight), pdfWidth, imgHeightMm);
}
```

**Hidden measurement div fix (line 296-304):**
Change from `className="absolute left-[-9999px]"` to use inline styles with `position: fixed; left: -9999px; visibility: hidden` to ensure the browser computes layout/height correctly.

### Why This Works
- `addImage` with a negative Y offset is a well-known jsPDF pattern for multi-page image PDFs
- No canvas slicing needed - jsPDF handles clipping automatically at page boundaries
- The full image is generated once and reused for all pages
- Simpler code, fewer failure points

### Files Changed
- `src/components/builder/ResumePreview.tsx` (only file)

