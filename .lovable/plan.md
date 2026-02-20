

## Improve AI Summary Quality for Short Inputs

### Problem
When a user provides brief input like "software developer with 2 years of experience," the AI returns an equally brief, unhelpful summary because the prompt is too restrictive -- it forbids adding anything the user didn't mention, leaving the AI no room to elaborate.

### Solution
Update the system prompt in `supabase/functions/generate-resume-content/index.ts` to:

1. **Increase target word count** from 30-50 to 40-70 words for richer output
2. **Encourage elaboration** -- tell the AI to infer and add relevant professional qualities, typical responsibilities, and strengths based on the role mentioned
3. **Raise max_tokens** from 150 to 250 to allow longer responses
4. **Keep guardrails** -- still no fabricated metrics, percentages, or specific achievements

### What Changes

**File:** `supabase/functions/generate-resume-content/index.ts`

- Line 48: Replace the system prompt with a more descriptive one that encourages the AI to expand on minimal input by adding relevant professional qualities and typical responsibilities for the mentioned role
- Line 80: Change `max_tokens` from `150` to `250`

### Updated Prompt (line 48)

Replace:
```text
You are a professional resume editor. Take the following professional summary and enhance it into a polished, compelling resume summary in 30-50 words. Improve grammar, clarity, and professional tone. You may rephrase and expand the writing to sound more impactful. Do NOT add skills the user did not mention. Do NOT invent achievements or metrics. Do NOT change years of experience. Keep the core meaning intact. Output ONLY the refined summary text, nothing else.
```

With:
```text
You are a professional resume writer. Take the user's input and craft a polished, compelling professional summary of 40-70 words. Expand on the input by adding relevant professional qualities, typical strengths, and common responsibilities associated with the mentioned role. Use confident, professional language. Highlight passion for the field, collaboration, problem-solving, and continuous learning where appropriate. Do NOT invent specific metrics, percentages, company names, or achievements. Do NOT change years of experience if mentioned. Output ONLY the summary text, nothing else.
```

### Expected Result

Input: "software developer with 2 years of experience"

Before: "Results-driven software developer with 2 years of experience."

After (example): "Dedicated software developer with 2 years of experience building and maintaining web applications. Passionate about writing clean, efficient code and collaborating with cross-functional teams to deliver high-quality solutions. Committed to continuous learning and staying current with emerging technologies to drive innovation and improve user experiences."

### No other files change
- Frontend code stays the same
- Project description prompt stays the same
- CORS, validation, error handling unchanged
