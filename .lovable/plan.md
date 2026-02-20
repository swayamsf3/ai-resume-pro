

## Improve AI Project Description Output

### Problem
The project description prompt limits output to 3-4 bullets with a strict 50-word cap, producing thin, unhelpful descriptions.

### Solution
Update the project description system prompt and user prompt in `supabase/functions/generate-resume-content/index.ts` to allow richer output.

### What Changes

**File:** `supabase/functions/generate-resume-content/index.ts`

**Line 54 -- System prompt**: Replace the current restrictive prompt with one that requests 4-6 detailed bullet points (15-25 words each), up to 120 words total. Encourage the AI to describe key features built, technical challenges addressed, architecture decisions, and user-facing impact -- while still not fabricating metrics.

Replace:
```text
You are a professional resume writer. Generate 3-4 concise bullet points for a resume project description. Each bullet should be 10-15 words max and start with an action verb. Focus on: what was built and technologies used. Do NOT invent metrics, percentages, accuracy numbers, or performance claims. Do NOT fabricate results the user did not provide. Total output must NOT exceed 50 words. Use . character to separate bullets. Output ONLY the bullet points, nothing else.
```

With:
```text
You are a professional resume writer. Generate 4-6 detailed bullet points for a resume project description. Each bullet should be 15-25 words and start with a strong action verb. Describe: what was built, key features implemented, technologies and tools used, architectural decisions, and the problem the project solves. Infer reasonable technical details based on the technologies mentioned. Do NOT invent specific metrics, percentages, or performance numbers. Total output should be 80-120 words. Use the . character to separate bullets. Output ONLY the bullet points, nothing else.
```

**Lines 56-59 -- User prompt**: Update to match the new expectations:

Replace:
```text
Write bullet points for a resume project:
Project Name: ${projectData.name || "Project"}
Technologies: ${projectData.technologies || "modern technologies"}
Remember: 3-4 bullets, action verbs, 50 words maximum total.
```

With:
```text
Write detailed bullet points for a resume project:
Project Name: ${projectData.name || "Project"}
Technologies: ${projectData.technologies || "modern technologies"}
Remember: 4-6 bullets, strong action verbs, 80-120 words total. Be descriptive about features and technical implementation.
```

### Expected Result

Before (example for "Portfolio Website" with "React, Tailwind"):
- Built a portfolio website using React and Tailwind CSS
- Implemented responsive design for mobile compatibility
- Deployed application to production environment

After (example):
- Designed and developed a responsive portfolio website using React and Tailwind CSS with component-based architecture
- Implemented dynamic routing and smooth page transitions to enhance user navigation experience
- Built reusable UI components with Tailwind utility classes for consistent styling across all pages
- Integrated responsive design principles ensuring seamless display across desktop, tablet, and mobile devices
- Optimized application performance through lazy loading and efficient state management patterns

### No other files change
- max_tokens already set to 250 (sufficient for the new output length)
- Frontend, CORS, error handling all unchanged
