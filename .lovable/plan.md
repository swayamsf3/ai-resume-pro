

## Reduce AI Project Description Output

### Change

**`supabase/functions/generate-resume-content/index.ts`**

Update the system prompt for the "project" type to request:
- Exactly 4 bullet points (instead of 4-6)
- Each bullet limited to approximately 10 words (instead of 20-30)
- Reduce overall word count target accordingly (around 40-50 words total)

### Technical Detail

Update the system prompt and user prompt in the project generation block:

```text
// System prompt change
systemPrompt = `You are a professional resume writer. Generate exactly 4 bullet points 
for a resume project description. Each bullet must be around 10 words and start with a 
strong action verb. Describe key features, technologies used, and the problem solved. 
Do NOT invent specific metrics or percentages. Use the bullet character to separate 
bullets. Output ONLY the bullet points.`;

// User prompt change
userPrompt = `Write bullet points for a resume project:
Project Name: ${projectData.name || "Project"}
Technologies: ${projectData.technologies || "modern technologies"}
Remember: exactly 4 bullets, each bullet around 10 words. Be concise.`;
```

### What stays the same
- Summary generation logic unchanged
- API key handling, error handling, CORS headers all unchanged
- Model and temperature settings unchanged

