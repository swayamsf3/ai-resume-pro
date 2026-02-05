-- Create jobs table
CREATE TABLE public.jobs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  company TEXT NOT NULL,
  location TEXT NOT NULL,
  type TEXT NOT NULL,
  salary TEXT,
  description TEXT,
  skills TEXT[] NOT NULL DEFAULT '{}',
  apply_url TEXT NOT NULL,
  posted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS for jobs
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;

-- All authenticated users can view active jobs
CREATE POLICY "Authenticated users can view active jobs"
ON public.jobs
FOR SELECT
USING (auth.uid() IS NOT NULL AND is_active = true);

-- Create user_resumes table
CREATE TABLE public.user_resumes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  resume_file_url TEXT,
  resume_file_name TEXT,
  skills TEXT[] NOT NULL DEFAULT '{}',
  source TEXT NOT NULL DEFAULT 'upload',
  raw_data JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS for user_resumes
ALTER TABLE public.user_resumes ENABLE ROW LEVEL SECURITY;

-- Users can only access their own resume data
CREATE POLICY "Users can view their own resume"
ON public.user_resumes
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own resume"
ON public.user_resumes
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own resume"
ON public.user_resumes
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own resume"
ON public.user_resumes
FOR DELETE
USING (auth.uid() = user_id);

-- Create saved_jobs table
CREATE TABLE public.saved_jobs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, job_id)
);

-- Enable RLS for saved_jobs
ALTER TABLE public.saved_jobs ENABLE ROW LEVEL SECURITY;

-- Users can only access their own saved jobs
CREATE POLICY "Users can view their own saved jobs"
ON public.saved_jobs
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can save jobs"
ON public.saved_jobs
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unsave jobs"
ON public.saved_jobs
FOR DELETE
USING (auth.uid() = user_id);

-- Create trigger for updated_at on user_resumes
CREATE TRIGGER update_user_resumes_updated_at
BEFORE UPDATE ON public.user_resumes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create resumes storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('resumes', 'resumes', false);

-- Storage policies for resumes bucket
CREATE POLICY "Users can upload their own resume"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own resume"
ON storage.objects
FOR SELECT
USING (bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own resume"
ON storage.objects
FOR DELETE
USING (bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Seed sample jobs with apply URLs
INSERT INTO public.jobs (title, company, location, type, salary, description, skills, apply_url, posted_at) VALUES
('Senior Frontend Developer', 'TechCorp Inc.', 'San Francisco, CA', 'Full-time', '$120k - $160k', 'We''re looking for a Senior Frontend Developer to join our growing team and build amazing user experiences using modern web technologies.', ARRAY['react', 'typescript', 'node.js', 'graphql'], 'https://techcorp.example.com/careers/frontend', now() - interval '2 days'),
('Full Stack Engineer', 'StartupXYZ', 'Remote', 'Full-time', '$100k - $140k', 'Join our mission to revolutionize the industry with cutting-edge technology. Work on both frontend and backend systems.', ARRAY['react', 'python', 'aws', 'postgresql'], 'https://startupxyz.example.com/jobs/fullstack', now() - interval '1 week'),
('React Developer', 'Digital Agency Pro', 'New York, NY', 'Contract', '$80/hr', 'Looking for a talented React developer to work on exciting client projects with modern design systems.', ARRAY['react', 'javascript', 'css', 'tailwind'], 'https://digitalagency.example.com/apply/react', now() - interval '3 days'),
('Software Engineer II', 'Enterprise Solutions Ltd', 'Austin, TX', 'Full-time', '$110k - $150k', 'Build scalable enterprise solutions that power businesses worldwide using microservices architecture.', ARRAY['javascript', 'java', 'microservices', 'docker'], 'https://enterprise.example.com/careers/swe2', now() - interval '5 days'),
('Frontend Web Developer', 'Creative Studio', 'Remote', 'Part-time', '$50/hr', 'Create beautiful, responsive websites for our diverse portfolio of clients using modern frameworks.', ARRAY['html', 'css', 'javascript', 'vue.js'], 'https://creativestudio.example.com/jobs/frontend', now() - interval '1 day'),
('Backend Engineer', 'CloudTech Systems', 'Seattle, WA', 'Full-time', '$130k - $170k', 'Design and implement robust backend services for our cloud platform serving millions of users.', ARRAY['python', 'django', 'postgresql', 'redis', 'kubernetes'], 'https://cloudtech.example.com/careers/backend', now() - interval '4 days'),
('DevOps Engineer', 'Infrastructure Co', 'Remote', 'Full-time', '$125k - $165k', 'Manage and optimize our CI/CD pipelines and cloud infrastructure for maximum reliability.', ARRAY['aws', 'terraform', 'docker', 'kubernetes', 'jenkins'], 'https://infra.example.com/apply/devops', now() - interval '6 days'),
('Mobile Developer', 'AppWorks Inc', 'Los Angeles, CA', 'Full-time', '$115k - $155k', 'Build cross-platform mobile applications that delight users with smooth performance.', ARRAY['react native', 'typescript', 'ios', 'android', 'firebase'], 'https://appworks.example.com/jobs/mobile', now() - interval '2 days'),
('Data Engineer', 'DataFlow Analytics', 'Chicago, IL', 'Full-time', '$120k - $160k', 'Design data pipelines and analytics systems that provide actionable insights at scale.', ARRAY['python', 'sql', 'spark', 'airflow', 'aws'], 'https://dataflow.example.com/careers/data', now() - interval '3 days'),
('UI/UX Developer', 'DesignFirst', 'Remote', 'Full-time', '$95k - $130k', 'Bridge the gap between design and development, creating pixel-perfect implementations.', ARRAY['react', 'figma', 'css', 'tailwind', 'framer motion'], 'https://designfirst.example.com/apply/uiux', now() - interval '1 day'),
('Node.js Backend Developer', 'API Masters', 'Boston, MA', 'Full-time', '$105k - $145k', 'Build high-performance APIs and backend services using Node.js and modern practices.', ARRAY['node.js', 'typescript', 'express', 'mongodb', 'graphql'], 'https://apimasters.example.com/careers/nodejs', now() - interval '4 days'),
('Angular Developer', 'FinTech Solutions', 'New York, NY', 'Full-time', '$110k - $150k', 'Develop secure financial applications using Angular and enterprise-grade practices.', ARRAY['angular', 'typescript', 'rxjs', 'ngrx', 'java'], 'https://fintech.example.com/jobs/angular', now() - interval '5 days'),
('Cloud Solutions Architect', 'MultiCloud Inc', 'Remote', 'Full-time', '$150k - $200k', 'Design multi-cloud architectures that optimize for cost, performance, and reliability.', ARRAY['aws', 'azure', 'gcp', 'terraform', 'kubernetes'], 'https://multicloud.example.com/careers/architect', now() - interval '1 week'),
('Junior Frontend Developer', 'GrowthLab', 'Denver, CO', 'Full-time', '$70k - $90k', 'Great opportunity for early-career developers to learn and grow with experienced mentors.', ARRAY['html', 'css', 'javascript', 'react'], 'https://growthlab.example.com/apply/junior-frontend', now() - interval '2 days'),
('Machine Learning Engineer', 'AI Innovations', 'San Francisco, CA', 'Full-time', '$140k - $190k', 'Build and deploy machine learning models that power our intelligent products.', ARRAY['python', 'tensorflow', 'pytorch', 'sql', 'docker'], 'https://aiinnovations.example.com/careers/ml', now() - interval '3 days');