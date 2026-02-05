 import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
 
 const corsHeaders = {
   "Access-Control-Allow-Origin": "*",
   "Access-Control-Allow-Headers":
     "authorization, x-client-info, apikey, content-type",
 };
 
 interface Job {
   id: string;
   title: string;
   company: string;
   location: string;
   type: string;
   salary: string;
   description: string;
   skills: string[];
   apply_url: string;
   posted_at: string;
   is_active: boolean;
   created_at: string;
 }
 
 interface MatchedJob extends Job {
   match_percentage: number;
   matching_skills: string[];
   missing_skills: string[];
 }
 
 function normalizeSkill(skill: string): string {
   return skill.toLowerCase().trim()
     .replace(/\.js$/, "")
     .replace(/\./, "")
     .replace(/-/g, " ");
 }
 
 function skillsMatch(userSkill: string, jobSkill: string): boolean {
   const normalizedUser = normalizeSkill(userSkill);
   const normalizedJob = normalizeSkill(jobSkill);
   
   // Direct match
   if (normalizedUser === normalizedJob) return true;
   
   // Handle common variations
   const variations: Record<string, string[]> = {
     "nodejs": ["node", "node.js"],
     "javascript": ["js"],
     "typescript": ["ts"],
     "postgresql": ["postgres", "psql"],
     "react native": ["reactnative"],
     "vue": ["vuejs", "vue.js"],
     "next": ["nextjs", "next.js"],
     "tailwind": ["tailwindcss"],
   };
   
   for (const [key, aliases] of Object.entries(variations)) {
     const allForms = [key, ...aliases];
     if (allForms.includes(normalizedUser) && allForms.includes(normalizedJob)) {
       return true;
     }
   }
   
   return false;
 }
 
 function calculateMatch(userSkills: string[], jobSkills: string[]): {
   matchPercentage: number;
   matchingSkills: string[];
   missingSkills: string[];
 } {
   if (!jobSkills || jobSkills.length === 0) {
     return { matchPercentage: 0, matchingSkills: [], missingSkills: [] };
   }
 
   const matchingSkills: string[] = [];
   const missingSkills: string[] = [];
 
   for (const jobSkill of jobSkills) {
     const hasMatch = userSkills.some(userSkill => skillsMatch(userSkill, jobSkill));
     if (hasMatch) {
       matchingSkills.push(jobSkill);
     } else {
       missingSkills.push(jobSkill);
     }
   }
 
   const matchPercentage = Math.round((matchingSkills.length / jobSkills.length) * 100);
 
   return { matchPercentage, matchingSkills, missingSkills };
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
     const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
     const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
 
     // Create client with user's token
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
 
     // Create admin client for database operations
     const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
 
     // Get user's skills
     const { data: userResume, error: resumeError } = await supabaseAdmin
       .from("user_resumes")
       .select("skills")
       .eq("user_id", user.id)
       .single();
 
     if (resumeError && resumeError.code !== "PGRST116") {
       console.error("Resume fetch error:", resumeError);
     }
 
     const userSkills: string[] = userResume?.skills || [];
 
     // Get all active jobs
     const { data: jobs, error: jobsError } = await supabaseAdmin
       .from("jobs")
       .select("*")
       .eq("is_active", true)
       .order("posted_at", { ascending: false });
 
     if (jobsError) {
       console.error("Jobs fetch error:", jobsError);
       return new Response(
         JSON.stringify({ error: "Failed to fetch jobs" }),
         { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
       );
     }
 
     // Calculate match for each job
     const matchedJobs: MatchedJob[] = (jobs || []).map((job: Job) => {
       const { matchPercentage, matchingSkills, missingSkills } = calculateMatch(
         userSkills,
         job.skills || []
       );
 
       return {
         ...job,
         match_percentage: matchPercentage,
         matching_skills: matchingSkills,
         missing_skills: missingSkills,
       };
     });
 
     // Sort by match percentage (highest first)
     matchedJobs.sort((a, b) => b.match_percentage - a.match_percentage);
 
     return new Response(
       JSON.stringify({
         jobs: matchedJobs,
         user_skills: userSkills,
         has_resume: userSkills.length > 0,
       }),
       { headers: { ...corsHeaders, "Content-Type": "application/json" } }
     );
 
   } catch (error) {
     console.error("Error matching jobs:", error);
     return new Response(
       JSON.stringify({ error: (error as Error).message }),
       { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
     );
   }
 });