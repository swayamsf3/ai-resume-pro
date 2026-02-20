

## Switch to Native Gemini API Endpoint

### Problem
The OpenAI-compatible Gemini endpoint (`/v1beta/openai/chat/completions`) is returning 429 rate limit errors.

### Solution
Update `supabase/functions/generate-resume-content/index.ts` to use the native Gemini REST API instead.

### Changes in `supabase/functions/generate-resume-content/index.ts`

1. **API URL**: Change from `https://generativelanguage.googleapis.com/v1beta/openai/chat/completions` to `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`

2. **Request format**: Replace OpenAI-style messages with Gemini-native `contents` format -- combine `systemPrompt` and `userPrompt` into a single text part

3. **Auth header**: Remove the `Authorization: Bearer` header (key is now in the URL query param)

4. **Response parsing**: Change from `result.choices?.[0]?.message?.content` to `result.candidates?.[0]?.content?.parts?.[0]?.text`

5. **Remove 402 handling**: Gemini does not use credit exhaustion status codes

### What stays the same
- All prompt logic (system and user prompts)
- CORS headers
- Input validation
- Error handling structure (429 handling kept, 402 removed)
- Frontend code -- no changes needed

### Technical Details

The fetch call changes from:
```typescript
const response = await fetch("https://generativelanguage.googleapis.com/v1beta/openai/chat/completions", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${GEMINI_API_KEY}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    model: "gemini-2.0-flash",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    max_tokens: 150,
    temperature: 0.7,
  }),
});
```

To:
```typescript
const response = await fetch(
  `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
  {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [
        { parts: [{ text: systemPrompt + "\n\n" + userPrompt }] },
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 150,
      },
    }),
  }
);
```

Response parsing changes from:
```typescript
const content = result.choices?.[0]?.message?.content?.trim();
```
To:
```typescript
const content = result.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
```

After updating, the edge function will be redeployed.

