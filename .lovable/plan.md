

## Switch from Gemini to Groq API

### What Changes

One edge function update and one new secret.

### Steps

1. **Store your Groq API key** as a Supabase secret named `GROQ_API_KEY`
   - You can get a free API key from [console.groq.com](https://console.groq.com)

2. **Update `supabase/functions/generate-resume-content/index.ts`**:
   - Replace `GEMINI_API_KEY` with `GROQ_API_KEY`
   - Change the API endpoint to Groq's OpenAI-compatible endpoint: `https://api.groq.com/openai/v1/chat/completions`
   - Switch to OpenAI-style `messages` format (system + user messages)
   - Use model `llama-3.3-70b-versatile` (fast and capable)
   - Parse response as `result.choices[0].message.content`

3. **Deploy** the updated edge function

### Technical Summary

| Setting | Before (Gemini) | After (Groq) |
|---------|-----------------|--------------|
| Secret | `GEMINI_API_KEY` | `GROQ_API_KEY` |
| Endpoint | `generativelanguage.googleapis.com/v1beta/models/...` | `api.groq.com/openai/v1/chat/completions` |
| Model | `gemini-2.0-flash` | `llama-3.3-70b-versatile` |
| Format | Gemini-native `contents` | OpenAI-compatible `messages` |

### No other files affected
- Frontend calls this via `supabase.functions.invoke` -- no changes needed
- All prompts, CORS headers, and error handling stay the same

### Technical Details

The fetch call changes from:
```text
fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`, {
  body: JSON.stringify({
    contents: [{ parts: [{ text: systemPrompt + "\n\n" + userPrompt }] }],
    generationConfig: { temperature: 0.7, maxOutputTokens: 150 },
  }),
})
```

To:
```text
fetch("https://api.groq.com/openai/v1/chat/completions", {
  headers: {
    Authorization: `Bearer ${GROQ_API_KEY}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    model: "llama-3.3-70b-versatile",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    max_tokens: 150,
    temperature: 0.7,
  }),
})
```

Response parsing changes from:
```text
result.candidates?.[0]?.content?.parts?.[0]?.text?.trim()
```
To:
```text
result.choices?.[0]?.message?.content?.trim()
```

