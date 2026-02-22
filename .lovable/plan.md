

## Fix: Professional Summary Alignment in Minimal Template

### Problem
The professional summary text in the Minimal Template uses `text-center` alignment, causing text to start from the center rather than being evenly distributed across the page width.

### Change
**File: `src/components/builder/templates/MinimalTemplate.tsx` (line 35)**

Change the summary paragraph's class from `text-center` to `text-justify` so the text is evenly distributed between margins.

```
// Before
<p className="text-[11px] leading-snug text-center">

// After
<p className="text-[11px] leading-snug text-justify">
```

This is a one-line change that switches the CSS `text-align` property from `center` to `justify`.

