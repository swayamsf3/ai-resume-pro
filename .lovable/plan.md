
## Fix PDF Skill Extraction - Two Broken Steps

### Root Cause Analysis
1. **pdfjs-dist text extraction fails silently** -- the extracted text is less than 50 characters, triggering the OCR fallback
2. **OCR fallback crashes** -- `tesseract.js` receives a PDF File directly, but it only accepts images (PNG/JPG). This causes `"Error attempting to read image"` and returns nothing
3. Result: `text` stays empty, `extractSkillsFromText("")` returns 0 skills

### Fixes

**1. `src/lib/pdfTextExtractor.ts` -- Harden PDF extraction**
- Add `console.log` to show extracted text length for debugging
- Add a try/catch around `getDocument` with a more descriptive error
- Try using `useWorkerFetch: false` and `isEvalSupported: false` in the `getDocument` options to avoid worker/eval issues in the Lovable sandbox environment

**2. `src/lib/ocrExtractor.ts` -- Fix: render PDF pages to canvas images first**
- Import `pdfjs-dist` to render each page onto a canvas element
- Convert each canvas to a Blob (PNG image)
- Pass each page image to `tesseract.js` for recognition
- Combine text from all pages
- This fixes the "Error attempting to read image" crash

**3. `src/lib/skillExtractor.ts` -- Add missing skills from your resume**
- Add to whitelist: `"seaborn"`, `"opencv"`, `"jupyter notebook"`, `"vs code"`, `"manual testing"`, `"sdlc"`, `"stlc"`, `"speech recognition"`
- These are legitimate skills present in your resume that the current whitelist misses

**4. `src/hooks/useUserResume.ts` -- Better error logging**
- Add `console.log` after each extraction step showing the text length and first 200 characters
- This helps debug future extraction issues without guessing

### Technical Details

Updated `ocrExtractor.ts` approach:
```text
import * as pdfjsLib from "pdfjs-dist";
import { createWorker } from "tesseract.js";

export async function extractTextWithOCR(file: File): Promise<string> {
  // 1. Load PDF with pdfjs-dist
  // 2. For each page, render to an offscreen canvas
  // 3. Convert canvas to Blob (PNG)
  // 4. Pass each Blob to tesseract worker.recognize()
  // 5. Combine all page texts
}
```

Updated `pdfTextExtractor.ts` options:
```text
const pdf = await pdfjsLib.getDocument({
  data: arrayBuffer,
  useWorkerFetch: false,
  isEvalSupported: false,
  useSystemFonts: true,
}).promise;
```

### What stays the same
- ResumeUploader UI and progress bar
- ResumeStatus component
- Upload flow and Supabase storage/upsert logic
- Skill matching algorithm (section-aware, whitelist + ambiguous)

### Expected result after fix
Your resume should extract skills including: python, sql, pandas, numpy, matplotlib, seaborn, mysql, github, c++, opencv, fastapi, and others.
