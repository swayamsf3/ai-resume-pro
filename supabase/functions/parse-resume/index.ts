 import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
 
 const corsHeaders = {
   "Access-Control-Allow-Origin": "*",
   "Access-Control-Allow-Headers":
     "authorization, x-client-info, apikey, content-type",
 };
 
 // Common technical skills to match against
 const SKILLS_DICTIONARY = [
   // Programming Languages
   "javascript", "typescript", "python", "java", "c++", "c#", "go", "rust", "ruby", "php",
   "swift", "kotlin", "scala", "perl", "r", "matlab", "shell", "bash", "powershell",
   // Frontend
   "react", "angular", "vue", "vue.js", "svelte", "next.js", "nextjs", "nuxt", "gatsby",
   "html", "css", "sass", "scss", "less", "tailwind", "tailwindcss", "bootstrap", "material ui",
   "styled-components", "emotion", "framer motion", "gsap",
   // Backend
   "node.js", "nodejs", "express", "express.js", "fastify", "koa", "nest.js", "nestjs",
   "django", "flask", "fastapi", "spring", "spring boot", "rails", "ruby on rails",
   "asp.net", ".net", "laravel", "symfony",
   // Databases
   "sql", "mysql", "postgresql", "postgres", "mongodb", "redis", "elasticsearch",
   "dynamodb", "cassandra", "firebase", "supabase", "sqlite", "oracle", "mariadb",
   // Cloud & DevOps
   "aws", "azure", "gcp", "google cloud", "docker", "kubernetes", "k8s", "terraform",
   "ansible", "jenkins", "github actions", "gitlab ci", "circleci", "travis ci",
   "nginx", "apache", "linux", "unix",
   // Data & ML
   "tensorflow", "pytorch", "keras", "scikit-learn", "pandas", "numpy", "spark",
   "hadoop", "airflow", "kafka", "machine learning", "deep learning", "nlp",
   "data science", "data analysis", "data engineering",
   // Mobile
   "react native", "flutter", "ios", "android", "swift", "kotlin", "xamarin",
   // APIs & Protocols
   "rest", "restful", "graphql", "grpc", "websocket", "oauth", "jwt",
   // Tools & Others
   "git", "github", "gitlab", "bitbucket", "jira", "confluence", "figma", "sketch",
   "agile", "scrum", "kanban", "ci/cd", "tdd", "bdd", "microservices", "monorepo",
   // Soft Skills
   "leadership", "communication", "teamwork", "problem-solving", "project management",
   "mentoring", "collaboration", "presentation", "analytical",
 ];
 
 function extractSkillsFromText(text: string): string[] {
   const normalizedText = text.toLowerCase();
   const foundSkills = new Set<string>();
 
   for (const skill of SKILLS_DICTIONARY) {
     // Create a regex pattern that matches the skill as a whole word
     const pattern = new RegExp(`\\b${skill.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i");
     if (pattern.test(normalizedText)) {
       foundSkills.add(skill.toLowerCase());
     }
   }
 
   return Array.from(foundSkills);
 }
 
 async function extractTextFromFile(
   supabaseAdmin: any,
   fileUrl: string
 ): Promise<string> {
   // Parse the file path from the URL
   const urlParts = fileUrl.split("/storage/v1/object/public/resumes/");
   if (urlParts.length < 2) {
     throw new Error("Invalid file URL format");
   }
   const filePath = urlParts[1];
 
   // Download the file
   const { data, error } = await supabaseAdmin.storage
     .from("resumes")
     .download(filePath);
 
   if (error) {
     throw new Error(`Failed to download file: ${error.message}`);
   }
 
    // Extract text and strip null bytes that PostgreSQL cannot store
    const text = await data.text();
    return text.replace(/\0/g, "");
 }
 
 Deno.serve(async (req) => {
   if (req.method === "OPTIONS") {
     return new Response(null, { headers: corsHeaders });
   }
 
   try {
     const authHeader = req.headers.get("Authorization");
     if (!authHeader) {
       return new Response(
         JSON.stringify({ error: "Missing authorization header" }),
         { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
       );
     }
 
     const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
     const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
     const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
 
     // Create client with user's token to get user info
     const supabaseUser = createClient(supabaseUrl, supabaseAnonKey, {
       global: { headers: { Authorization: authHeader } },
     });
 
     // Get user
     const { data: { user }, error: userError } = await supabaseUser.auth.getUser();
     if (userError || !user) {
       return new Response(
         JSON.stringify({ error: "Unauthorized" }),
         { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
       );
     }
 
     // Create admin client for storage operations
     const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
 
     const body = await req.json();
     const { file_url, file_name } = body;
 
     if (!file_url) {
       return new Response(
         JSON.stringify({ error: "Missing file_url" }),
         { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
       );
     }
 
     // Extract text from the uploaded file
     let text: string;
     try {
       text = await extractTextFromFile(supabaseAdmin, file_url);
     } catch (e) {
       // If we can't read the file directly, use the filename for skill hints
       text = file_name || "";
     }
 
     // Extract skills from text
     const skills = extractSkillsFromText(text);
 
     // Upsert the user's resume data
     const { error: upsertError } = await supabaseAdmin
       .from("user_resumes")
       .upsert({
         user_id: user.id,
         resume_file_url: file_url,
         resume_file_name: file_name,
         skills: skills,
         source: "upload",
         raw_data: { extracted_text: text.substring(0, 5000) },
         updated_at: new Date().toISOString(),
       }, {
         onConflict: "user_id",
       });
 
     if (upsertError) {
       console.error("Upsert error:", upsertError);
       return new Response(
         JSON.stringify({ error: "Failed to save resume data" }),
         { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
       );
     }
 
     return new Response(
       JSON.stringify({ 
         success: true, 
         skills,
         message: `Extracted ${skills.length} skills from resume` 
       }),
       { headers: { ...corsHeaders, "Content-Type": "application/json" } }
     );
 
   } catch (error) {
     console.error("Error processing resume:", error);
     return new Response(
       JSON.stringify({ error: (error as Error).message }),
       { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
     );
   }
 });