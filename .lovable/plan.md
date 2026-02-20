

## Replace Lovable AI Gateway with Your Gemini API Key

### What Changes

One edge function file and one new secret.

### Steps

1. **Store your Gemini API key** as a Supabase secret named `GEMINI_API_KEY`

2. **Update `supabase/functions/generate-resume-content/index.ts`**:
   - Replace `LOVABLE_API_KEY` with `GEMINI_API_KEY`
   - Change the API URL from `https://ai.gateway.lovable.dev/v1/chat/completions` to `https://generativelanguage.googleapis.com/v1beta/openai/chat/completions`
   - Change the model from `google/gemini-3-flash-preview` to `gemini-1.5-flash`
   - All prompts, error handling, and CORS headers stay the same

3. **Deploy** the updated edge function

### Technical Summary

| Setting | Before | After |
|---------|--------|-------|
| Secret | `LOVABLE_API_KEY` | `GEMINI_API_KEY` |
| Endpoint | `https://ai.gateway.lovable.dev/v1/chat/completions` | `https://generativelanguage.googleapis.com/v1beta/openai/chat/completions` |
| Model | `google/gemini-3-flash-preview` | `gemini-1.5-flash` |

### No other files affected
- Frontend code calls this via `supabase.functions.invoke` and needs no changes
- `parse-resume` function uses no AI -- unchanged

