-- Fix 1: Improve handle_new_user() function with input validation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  safe_name TEXT;
BEGIN
  -- Sanitize and limit full_name to 100 characters
  safe_name := substring(COALESCE(NEW.raw_user_meta_data->>'full_name', ''), 1, 100);
  INSERT INTO public.profiles (user_id, full_name, email)
  VALUES (NEW.id, NULLIF(trim(safe_name), ''), NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Fix 2: Add constraints to user_resumes for skills validation
-- Limit skills array to 100 elements
ALTER TABLE public.user_resumes ADD CONSTRAINT skills_array_max_size 
  CHECK (array_length(skills, 1) IS NULL OR array_length(skills, 1) <= 100);

-- Create a function to validate skill lengths (check constraint can't use subqueries directly)
CREATE OR REPLACE FUNCTION public.validate_skills_length(skills TEXT[])
RETURNS BOOLEAN AS $$
DECLARE
  skill TEXT;
BEGIN
  IF skills IS NULL THEN
    RETURN TRUE;
  END IF;
  FOREACH skill IN ARRAY skills LOOP
    IF length(skill) > 50 THEN
      RETURN FALSE;
    END IF;
  END LOOP;
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql IMMUTABLE SET search_path = public;

-- Add constraint using the validation function
ALTER TABLE public.user_resumes ADD CONSTRAINT skills_length_valid 
  CHECK (public.validate_skills_length(skills));