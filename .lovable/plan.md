

## Add Missing Skills and Normalize OCR Text

### Changes

**1. `src/lib/skillExtractor.ts` -- Expand whitelist and add text normalization**

Add these skills to the whitelist:
- `"html5"`, `"css3"`, `"restful api"`, `"rest api"`, `"oop"`, `"object oriented programming"`, `"dsa"`, `"data structures"`, `"algorithms"`

Move `"c"` to the `AMBIGUOUS_SKILLS` list (single letter, needs list-context matching like `"r"` and `"go"`). `"c++"` is already there.

Add a `normalizeText()` function that runs before matching:
- Convert to lowercase
- Replace multiple spaces/tabs with a single space
- Remove or normalize special characters like `/`, `-`, `_` that OCR may inject between words (e.g. "C / C++" becomes "C C++")
- Trim whitespace

Apply this normalization in `matchWhitelistSkills`, `extractAmbiguousSkills`, and the fallback path.

**2. `src/lib/ocrExtractor.ts` -- Add console log of first 300 chars**

Add a `console.log` showing the first 300 characters of OCR output per page so you can verify formatting in the browser console.

### What stays the same
- Upload flow, ResumeUploader UI, progress bar
- Supabase storage/upsert logic
- Section-aware matching algorithm structure
- PDF text extractor (no changes needed)

### Expected result
Your resume should now also detect: html, html5, css, css3, c, c++, restful api, oop, dsa, data structures, algorithms -- in addition to all previously detected skills.

