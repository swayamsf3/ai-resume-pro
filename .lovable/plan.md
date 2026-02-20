

## Increase Project Description Bullet Length

### Problem
The current project description bullets are too short. Each bullet needs to be at least 12 words for a more substantial, professional description.

### What Changes

**File:** `supabase/functions/generate-resume-content/index.ts`

**System prompt (line 54):** Update the per-bullet word requirement and total word count:
- Change "Each bullet should be 15-25 words" to "Each bullet MUST be at least 20-30 words"
- Change total output target from "80-120 words" to "120-180 words"
- Add explicit instruction: "Never write a bullet shorter than 12 words"

**User prompt (line 59):** Update reminder to "each bullet must be 20-30 words, 120-180 words total"

**max_tokens (line 80):** Increase from 250 to 400 to accommodate longer output

### No other files change

