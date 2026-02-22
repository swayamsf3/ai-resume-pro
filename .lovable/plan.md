## Save Generated Resumes with Account Name

### Problem

Currently, generated resumes are saved to Supabase storage using the name entered in the resume builder form (`personalInfo.fullName`). The user wants the file to be saved using their **account name** from their profile instead.

### Solution

Fetch the user's profile name from the `profiles` table and use it as the file name when uploading to Supabase storage.

### Changes

**File: `src/components/builder/ResumePreview.tsx**`

1. Query the user's profile (full_name) from the `profiles` table using the authenticated user's ID
2. When saving to storage, use the profile's `full_name` instead of `personalInfo.fullName` for the storage file path
3. Keep the local download name as-is (using `personalInfo.fullName`) since that reflects the resume content

**Before (line ~183):**

```typescript
const storagePath = `${user.id}/${Date.now()}_${fileName}`;
```

**After:**

```typescript
// Fetch account name from profiles table
const { data: profile } = await supabase
  .from("profiles")
  .select("full_name")
  .eq("user_id", user.id)
  .maybeSingle();

const accountName = profile?.full_name
  ? profile.full_name.replace(/\s+/g, "_")
  : "Resume";

const storageName = `${accountName}_Resume.pdf`;
const storagePath = `${user.id}/${Date.now()}_${storageName}`;
```

### Files Modified

- `src/components/builder/ResumePreview.tsx` -- use account name for storage file naming  
  
  
Small Improvement You Should Add
  Instead of:
  ```
  const storageName = `${accountName}_Resume.pdf`;
  ```
  Use:
  ```
  const storageName = `${accountName}_Resume_${Date.now()}.pdf`;
  ```
  Why?
  Without timestamp in filename:
  - Every upload overwrites previous resume
  - User cannot keep multiple versions
  Right now you already add timestamp in path, but keeping it in filename is cleaner and more readable in dashboard.
  So final recommended version:
  ```
  const storageName = `${accountName}_Resume_${Date.now()}.pdf`;
  const storagePath = `${user.id}/${storageName}`;
  ```
  Cleaner structure.
  ---
  # 🧠 Also Important
  Make sure:
  ```
  .eq("id", user.id)
  ```
  NOT:
  ```
  .eq("user_id", user.id)
  ```
  It depends on your `profiles` table schema.
  If your `profiles` table uses:
  ```
  id = auth.uid()
  ```
  Then correct query is:
  ```
  .eq("id", user.id)
  ```
  Check that carefully.