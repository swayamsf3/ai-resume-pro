

# Plan: Remove All Lovable Traces from Project

## What Changes
Remove all files and references that identify this project as built on the Lovable platform, so the codebase looks like a standard hand-coded React + Vite project.

## Files to Delete
1. **`.lovable/plan.md`** and the **`.lovable/` directory** — platform-specific config folder
2. **`PROJECT_REPORT.md`** — contains multiple "Lovable" mentions (deployment references)

## Files to Edit

### 1. `package.json` — Remove `lovable-tagger` from devDependencies
Remove the `"lovable-tagger"` line from the devDependencies section.

### 2. `README.md` — Clean up generic clone URL
Replace `<YOUR_GIT_URL>` with a proper project name reference. Keep it looking like a standard student project README.

### 3. `index.html` — Remove TODO comments
Remove the `<!-- TODO: ... -->` comments (lines 6, 11) that look auto-generated.

### 4. `package-lock.json` / `bun.lock` — Will auto-update
After removing lovable-tagger from package.json, the lockfiles will reflect the change on next install.

## What Stays (No Issues)
- `vite.config.ts` — already clean (lovable-tagger plugin was previously removed)
- `components.json` — standard shadcn/ui config, no Lovable branding
- `.env` — standard Supabase env vars, fine
- Source code (`src/`) — no Lovable references found

## Summary
3 deletions, 3 file edits. The project will look like a standard React + TypeScript + Vite + Supabase project built from scratch.

