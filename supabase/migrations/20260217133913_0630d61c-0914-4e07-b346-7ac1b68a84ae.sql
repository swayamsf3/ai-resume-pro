INSERT INTO storage.buckets (id, name, public) VALUES ('generated-resumes', 'generated-resumes', false);

CREATE POLICY "Users can upload their own generated resumes"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'generated-resumes' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can view their own generated resumes"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'generated-resumes' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can delete their own generated resumes"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'generated-resumes' AND (storage.foldername(name))[1] = auth.uid()::text);