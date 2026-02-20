

## Move PDF Parsing to Frontend with pdfjs-dist and OCR Fallback

### Problem
The current edge function downloads the PDF and calls `.text()` on the raw binary blob, which does not properly extract text from PDF files. PDFs have a complex binary structure that requires a dedicated parser.

### Solution
Move text extraction to the frontend using `pdfjs-dist` (for normal PDFs) and `tesseract.js` (for scanned/image-based PDFs as fallback). Send the extracted text and skills directly to the backend instead of relying on server-side parsing.

### New Files

**1. `src/lib/pdfTextExtractor.ts`** -- PDF text extraction utility
- Import `pdfjs-dist` and configure `GlobalWorkerOptions.workerSrc` using the CDN URL matching the installed version (avoids bundler/CORS issues)
- `extractTextFromPDF(file: File): Promise<string>` function that:
  - Reads file as ArrayBuffer via FileReader (wrapped in a Promise)
  - Loads the PDF document with `pdfjsLib.getDocument()`
  - Loops through all pages, calls `page.getTextContent()`
  - Combines all text items into a single string with newlines between pages
- Returns the full extracted text

**2. `src/lib/ocrExtractor.ts`** -- OCR fallback for scanned PDFs
- Import `tesseract.js` (createWorker)
- `extractTextWithOCR(file: File): Promise<string>` function that:
  - Creates a Tesseract worker with English language
  - Recognizes text from the file
  - Returns extracted text
  - Terminates the worker after use

**3. `src/lib/skillExtractor.ts`** -- Frontend skill matching (mirrors edge function logic)
- Copy the skills whitelist, ambiguous skills list, and extraction functions from `parse-resume/index.ts`
- Export `extractSkillsFromText(text: string): string[]`
- Reuse the same section-aware matching logic (find skills section header, whitelist matching, ambiguous skill context matching)

### Modified Files

**4. `src/hooks/useUserResume.ts`** -- Update upload mutation
- Import `extractTextFromPDF`, `extractTextWithOCR`, and `extractSkillsFromText`
- In `uploadResume.mutationFn`:
  - After file selection, extract text using `extractTextFromPDF(file)`
  - If extracted text is too short (less than 50 chars), fall back to `extractTextWithOCR(file)`
  - Run `extractSkillsFromText(text)` on the result
  - Still upload file to Supabase storage for record-keeping
  - Instead of calling the `parse-resume` edge function, directly upsert to `user_resumes` table with the extracted skills, text, file URL, and file name
  - This eliminates the server-side parsing dependency entirely

**5. `src/components/jobs/ResumeUploader.tsx`** -- Add progress feedback
- Add a `status` state to show extraction stages: "Uploading...", "Extracting text...", "Running OCR...", "Detecting skills..."
- Display the status text in the button/loading area so users know what's happening during the multi-step process

### Dependencies to Install
- `pdfjs-dist` -- PDF text extraction
- `tesseract.js` -- OCR fallback for scanned documents

### Flow After Changes

```text
User selects PDF
  --> Frontend reads file as ArrayBuffer
  --> pdfjs-dist extracts text from all pages
  --> If text is too short (<50 chars), tesseract.js OCR runs as fallback
  --> Frontend runs skill matching against whitelist
  --> File uploaded to Supabase storage (for record-keeping)
  --> Skills + text + file URL upserted directly to user_resumes table
  --> UI shows detected skills
```

### What Stays the Same
- The `parse-resume` edge function stays deployed (existing data references it) but is no longer called for new uploads
- ResumeStatus, SkillsEditor, and job matching logic are unchanged
- The skills whitelist and matching algorithm remain identical (just duplicated to frontend)
- File validation (PDF/DOCX, 10MB limit) in ResumeUploader stays the same

### Technical Notes
- `pdfjs-dist` worker will be loaded from CDN (`https://cdnjs.cloudflare.com/ajax/libs/pdf.js/{version}/pdf.worker.min.js`) to avoid Vite bundling issues
- Tesseract.js worker also loads from CDN automatically, no special config needed
- Both libraries work in the browser without CORS issues when loaded from CDN
- DOCX files will continue to use the filename-only fallback (pdfjs-dist is PDF-only); a future enhancement could add DOCX parsing with `mammoth.js`

