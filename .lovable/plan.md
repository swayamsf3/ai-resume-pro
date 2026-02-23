
## Update: Reduce Project Description Bullets to 3-4

### Change
Update both the system prompt and user prompt in `supabase/functions/generate-resume-content/index.ts` to generate 3-4 bullets instead of 4-5. Word limits per bullet (20-25 words) and total output (120-180 words) stay unchanged.

### Edits

**Line 54 (system prompt):** Change "Generate 4-5 detailed bullet points" to "Generate 3-4 detailed bullet points"

**Line 59 (user prompt):** Change "4-5 bullets" to "3-4 bullets"

### File
`supabase/functions/generate-resume-content/index.ts` -- redeploy after edit
