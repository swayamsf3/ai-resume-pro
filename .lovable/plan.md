

## Change AI Summary Button to Refine Existing Text

Currently, the "AI Generate" button creates a brand-new professional summary from scratch. You want it to instead **refine and improve** the user's existing summary text without adding or inventing anything.

### What Changes

**1. Edge Function (`supabase/functions/generate-resume-content/index.ts`)**
- Update the `summary` branch to use your new prompt:
  - System prompt: "You are a professional resume editor. Improve grammar and clarity only. Do NOT add new skills, experience, or achievements. Do NOT exaggerate or change years of experience. Only refine wording while keeping the original meaning."
  - User prompt: Pass the user's existing summary text as `{user_summary}`
- Accept a new `summary` field in the request data so the user's current text is sent to the AI

**2. Frontend (`src/components/builder/ResumeForm.tsx`)**
- In `generateAISummary`, send the current `resumeData.personalInfo.summary` text to the edge function
- Add validation: if the summary field is empty, show a toast telling the user to write a summary first before refining
- Update button label from "AI Generate" to "AI Refine" to reflect the new behavior
- Update success toast message to say "Summary Refined!" instead of "Summary Generated!"

### Technical Details

- The edge function request body for summary will include `summary: string` (the user's existing text)
- The system prompt enforces strict rules: no new skills, no exaggeration, no invented achievements
- Word limit stays at ~30-35 words for the output
- All other functionality (project description generation) remains unchanged
