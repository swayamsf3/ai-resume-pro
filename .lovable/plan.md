

## Fix: Email Verification Links Being Consumed by Email Scanners

### Problem

When you sign up, Supabase sends a confirmation email. However, Gmail's link protection scanners automatically visit the verification URL before you click it. Since the verification token is single-use, it gets consumed by Google's scanner, and when you actually click the link, you get "Email link is invalid or has expired."

Evidence from auth logs:
- Request from `173.194.97.64` (Google scanner IP) hits `/verify` first
- Your request from `157.32.140.41` then hits `/verify` and gets "One-time token not found"
- Login attempt then fails with "Email not confirmed"

### Solution

**Add an `/auth/callback` route** that handles the token exchange on the client side using PKCE flow. This prevents scanners from consuming tokens because the actual verification happens client-side, not via a direct server link.

### Changes

#### 1. Create `src/pages/AuthCallback.tsx` (new file)

This page handles the auth callback after email verification. It:
- Extracts the auth code from URL parameters
- Exchanges it for a session using `supabase.auth.exchangeCodeForSession()`
- Redirects the user to the dashboard on success or shows an error

#### 2. Update `src/App.tsx`

Add the `/auth/callback` route:
```
<Route path="/auth/callback" element={<AuthCallback />} />
```

#### 3. Update `src/pages/Auth.tsx`

Change the `emailRedirectTo` in the signup handler to point to the callback route:
```typescript
emailRedirectTo: `${window.location.origin}/auth/callback`,
```

#### 4. Update Supabase Redirect URLs (manual step)

You need to add `https://ai-resume-pro-vert.vercel.app/auth/callback` to your Supabase project's allowed redirect URLs:
1. Go to Supabase Dashboard > Authentication > URL Configuration
2. Add `https://ai-resume-pro-vert.vercel.app/auth/callback` to the Redirect URLs list

### Technical Details

The PKCE (Proof Key for Code Exchange) flow works differently from the default flow:
- Instead of a one-time magic link that can be consumed by scanners, Supabase redirects to your app with a `code` parameter
- Your app then exchanges this code for a session client-side
- The code exchange requires the original browser context, so scanners cannot complete it

