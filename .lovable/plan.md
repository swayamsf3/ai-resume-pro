

## Plan: Show "Email Confirmed" page instead of redirecting to dashboard

### Problem
When a user clicks the email verification link, `AuthCallback.tsx` exchanges the code for a session and immediately redirects to `/dashboard`. The user wants to see a confirmation message telling them their email is verified and to close the tab.

### Solution

**Modify `src/pages/AuthCallback.tsx`** to detect that the callback is for email verification (signup confirmation) and show a static "Email Confirmed" page instead of redirecting.

Changes:
1. After successfully exchanging the code for a session, check if this was a signup/email confirmation flow (the URL will have a `type` parameter or we can infer from context)
2. Instead of always navigating to `/dashboard`, show a confirmation screen with:
   - A green checkmark icon
   - "Email Confirmed!" heading
   - "Your email has been successfully verified. You can now close this tab and return to the app." message
   - A "Go to Dashboard" button as a fallback option
3. The page will NOT auto-redirect — the user stays on it until they close the tab or click the button

### Technical Details

- The Supabase PKCE flow passes a `code` query param. We'll add a `confirmed` state that, when true, renders the confirmation UI instead of redirecting.
- For non-verification callbacks (e.g., OAuth), continue redirecting to `/dashboard` as before. We can differentiate by checking for a `type` query parameter — Supabase typically includes `type=signup` for email confirmations.
- Uses existing project UI components (Card, Button) and Lucide icons (CheckCircle) for consistency.

