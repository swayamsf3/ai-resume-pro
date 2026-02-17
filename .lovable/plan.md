

## Save Generated Resume PDFs to Supabase Storage

### Overview
When a user clicks "Download PDF" in the Resume Builder, the generated PDF will also be automatically uploaded to Supabase Storage so they can access it later from their dashboard.

### What Changes

**1. Create a new storage bucket for generated PDFs**
- Add a SQL migration to create a `generated-resumes` storage bucket (private)
- Add RLS policies so users can only upload/read/delete their own files (path pattern: `{user_id}/...`)

**2. Update ResumePreview.tsx - Upload PDF to Supabase after generating**
- After `pdf.save(fileName)` (the local download), convert the PDF to a Blob using `pdf.output("blob")`
- Upload it to the `generated-resumes` bucket at path `{user_id}/{timestamp}_{filename}.pdf`
- This requires the user to be authenticated, so import `useAuth`
- If upload fails, still allow the local download (non-blocking) but show a warning toast
- Update the success toast to mention the PDF was also saved to their account

**3. Update Dashboard.tsx - Show saved generated resumes**
- Add a new section "My Generated Resumes" below the existing resume card
- Query `supabase.storage.from("generated-resumes").list(user.id)` to get the user's saved PDFs
- Display each PDF with its name, creation date, and download/delete buttons
- Download button fetches a signed URL and opens it
- Delete button removes the file from storage

### Technical Details

**Migration SQL:**
```sql
INSERT INTO storage.buckets (id, name, public) VALUES ('generated-resumes', 'generated-resumes', false);

CREATE POLICY "Users can upload their own resumes"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'generated-resumes' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can view their own resumes"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'generated-resumes' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can delete their own resumes"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'generated-resumes' AND (storage.foldername(name))[1] = auth.uid()::text);
```

**ResumePreview.tsx changes:**
- Import `useAuth` and `supabase`
- After `pdf.save()`, add upload logic:
  - `const blob = pdf.output("blob")`
  - Upload to `generated-resumes/{user.id}/{timestamp}_{fileName}`
  - Wrap in try/catch so upload failure doesn't block the download

**Dashboard.tsx changes:**
- Add a query to list files from `generated-resumes/{user.id}`
- Render a "Saved Resumes" card with file list, download (via `createSignedUrl`), and delete buttons

### Files to Create/Modify
- New migration file for the storage bucket and RLS policies
- `src/components/builder/ResumePreview.tsx` - add upload after PDF generation
- `src/pages/Dashboard.tsx` - add saved resumes section with download/delete

