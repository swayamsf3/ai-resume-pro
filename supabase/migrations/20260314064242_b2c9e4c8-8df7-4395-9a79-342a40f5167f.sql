CREATE POLICY "Admin can view all jobs"
ON public.jobs
FOR SELECT
TO authenticated
USING ((auth.jwt() ->> 'email') = 'swayamyawalkar54@gmail.com');