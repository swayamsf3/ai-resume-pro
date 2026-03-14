CREATE POLICY "Admin can update jobs"
ON public.jobs
FOR UPDATE
TO authenticated
USING ((auth.jwt() ->> 'email') = 'swayamyawalkar54@gmail.com')
WITH CHECK ((auth.jwt() ->> 'email') = 'swayamyawalkar54@gmail.com');