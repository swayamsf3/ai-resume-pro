
## Fix Project Description AI Inventing Fake Metrics

### Problem
The current system prompt for project descriptions tells the AI to focus on "impact/results," which causes it to fabricate statistics (e.g., "94% classification accuracy," "reducing screening time by 40%") that the user never provided.

### Solution
Update the system prompt in the Edge Function to strictly forbid inventing metrics, percentages, or results. The AI should only describe what was built and which technologies were used.

### What Changes

**Edge Function (`supabase/functions/generate-resume-content/index.ts`)**

Replace the current project system prompt with:

```
You are a professional resume writer. Generate 3-4 concise bullet points 
for a resume project description. Each bullet should be 10-15 words max 
and start with an action verb. Focus on: what was built and technologies used. 
Do NOT invent metrics, percentages, accuracy numbers, or performance claims. 
Do NOT fabricate results the user did not provide. 
Total output must NOT exceed 50 words. Use the bullet character to separate bullets. 
Output ONLY the bullet points, nothing else.
```

This removes the "impact/results" instruction and adds explicit constraints against fabricating data.

No frontend changes needed.
