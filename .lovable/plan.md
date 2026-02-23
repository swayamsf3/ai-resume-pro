

## Update Project Description AI Prompts

### Change
Update the system prompt and user prompt in `supabase/functions/generate-resume-content/index.ts` for the `project` type.

### Details

**System prompt** (line 52-53): Replace with the user's new version:
- Change "4-6" to "4-5" bullet points
- Change "20-30 words" to "20-25 words"
- Remove the sentence about "Total output should be 120-180 words" duplication

**User prompt** (lines 55-58): Update to match:
- Change "4-6 bullets" to "4-5 bullets"
- Change "20-30 words" to "20-25 words"

### File
`supabase/functions/generate-resume-content/index.ts` -- lines 52-58

