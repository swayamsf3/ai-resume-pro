

## Fix: Password Reset 404 on Vercel

### Problem

Vercel returns `404: NOT_FOUND` when the user clicks the password reset link in their email. This happens because:

1. Supabase redirects to `https://ai-resume-pro-vert.vercel.app/reset-password`
2. Vercel looks for an actual `/reset-password` file/folder on the server
3. Since this is a React SPA with client-side routing (React Router), no such file exists
4. Vercel returns 404 instead of serving `index.html` and letting React Router handle the route

### Solution

Create a `vercel.json` file in the project root that tells Vercel to rewrite all routes to `index.html`. This is a standard requirement for any SPA deployed on Vercel.

### Changes

#### 1. Create `vercel.json` (new file)

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

This single rule catches all routes and serves `index.html`, allowing React Router to handle routing on the client side. This fixes `/reset-password` and also prevents 404s on any other route if a user refreshes the page (e.g., `/dashboard`, `/builder`, `/jobs`).

### After Implementation

After the file is created, you will need to redeploy on Vercel for the change to take effect. If you have automatic deployments from Git, just push the change. Otherwise, trigger a manual redeploy.

