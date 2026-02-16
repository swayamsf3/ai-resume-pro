
## Fix AI Refine Returning Identical Text

### Problem
The current prompt is too restrictive. It only allows grammar/clarity fixes, so when the input is already grammatically correct (e.g., "Data analyst with 2 years of experience"), the AI has nothing to change and returns the same text.

### Solution
Update the system prompt to instruct the AI to **enhance and expand** the user's summary into a polished, professional resume summary, while still respecting the core constraints (no invented skills, no fake achievements, no exaggerated experience).

### What Changes

**Edge Function (`supabase/functions/generate-resume-content/index.ts`)**

Update the system prompt from the current "only refine wording" approach to:

```
You are a professional resume editor. Take the following professional summary 
and enhance it into a polished, compelling resume summary in 30-50 words. 
Improve grammar, clarity, and professional tone. You may rephrase and expand 
the writing to sound more impactful. Do NOT add skills the user did not mention. 
Do NOT invent achievements or metrics. Do NOT change years of experience. 
Keep the core meaning intact. Output ONLY the refined summary text, nothing else.
```

This gives the AI room to rephrase and expand a short input into a proper professional summary while still honoring the user's original content.

No frontend changes needed.
