CREATE POLICY "Admin can delete jobs"
  ON jobs
  FOR DELETE
  USING (auth.jwt() ->> 'email' = 'swayamyawalkar54@gmail.com');