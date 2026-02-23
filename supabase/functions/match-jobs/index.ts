import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface Job {
  id: string;
  external_id: string | null;
  title: string;
  company: string;
  location: string;
  type: string;
  salary: string;
  description: string | null;
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
  
  if (normalizedUser === normalizedJob) return true;
  
  const variations: Record<string, string[]> = {
    "nodejs": ["node", "nodejs", "node js"],
    "javascript": ["js", "ecmascript", "es6", "es2015"],
    "typescript": ["ts"],
    "react": ["reactjs"],
    "react native": ["reactnative", "rn"],
    "vue": ["vuejs", "vue 3"],
    "angular": ["angularjs"],
    "next": ["nextjs"],
    "nuxt": ["nuxtjs"],
    "express": ["expressjs"],
    "tailwind": ["tailwindcss", "tailwind css"],
    "css": ["css3", "cascading style sheets"],
    "sass": ["scss"],
    "postgresql": ["postgres", "psql", "pg"],
    "mongodb": ["mongo"],
    "mysql": ["mariadb"],
    "sql": ["structured query language"],
    "aws": ["amazon web services", "amazon aws"],
    "gcp": ["google cloud", "google cloud platform"],
    "azure": ["microsoft azure"],
    "kubernetes": ["k8s"],
    "docker": ["containerization"],
    "python": ["py", "python3"],
    "csharp": ["c#", "c sharp", "dotnet", "net"],
    "golang": ["go"],
    "cpp": ["c++"],
    "graphql": ["gql"],
    "rest": ["restful", "rest api"],
    "ci cd": ["cicd", "continuous integration", "continuous deployment"],
    "machine learning": ["ml"],
    "artificial intelligence": ["ai"],
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

const MAX_RESULTS = 100;
const SELECT_COLUMNS = "id, external_id, title, company, location, type, salary, skills, apply_url, posted_at, is_active, created_at";

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

    const supabaseUser = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: userError } = await supabaseUser.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Get user's skills and experience level
    const { data: userResume, error: resumeError } = await supabaseAdmin
      .from("user_resumes")
      .select("skills, experience_level")
      .eq("user_id", user.id)
      .single();

    if (resumeError && resumeError.code !== "PGRST116") {
      console.error("Resume fetch error:", resumeError);
    }

    const userSkills: string[] = userResume?.skills || [];
    const experienceLevel: string = userResume?.experience_level || "unknown";
    const hasSkills = userSkills.length > 0;

    const SENIOR_TITLE_KEYWORDS = [
      "senior", "sr.", "lead", "principal", "staff", "architect",
      "director", "vp", "head of", "manager",
    ];
    const FRESHER_TITLE_KEYWORDS = [
      "intern", "trainee", "junior", "jr.", "entry level",
      "associate", "fresher", "graduate",
    ];

    // If no skills, just return the most recent jobs (no matching needed)
    if (!hasSkills) {
      const { data: recentJobs, error: jobsError } = await supabaseAdmin
        .from("jobs")
        .select(SELECT_COLUMNS)
        .eq("is_active", true)
        .order("posted_at", { ascending: false })
        .limit(MAX_RESULTS);

      if (jobsError) {
        console.error("Jobs fetch error:", jobsError);
        return new Response(
          JSON.stringify({ error: "Failed to fetch jobs" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const jobs = (recentJobs || []).map((job: Job) => ({
        ...job,
        description: null,
        match_percentage: 0,
        matching_skills: [],
        missing_skills: job.skills || [],
      }));

      return new Response(
        JSON.stringify({ jobs, user_skills: userSkills, has_resume: false, experience_level: experienceLevel }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch jobs with skills in batches, keeping only top matches
    const PAGE_SIZE = 1000;
    let topJobs: MatchedJob[] = [];
    let from = 0;
    const seen = new Set<string>();

    while (true) {
      const { data, error: jobsError } = await supabaseAdmin
        .from("jobs")
        .select(SELECT_COLUMNS)
        .eq("is_active", true)
        .order("posted_at", { ascending: false })
        .range(from, from + PAGE_SIZE - 1);

      if (jobsError) {
        console.error("Jobs fetch error:", jobsError);
        return new Response(
          JSON.stringify({ error: "Failed to fetch jobs" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (!data || data.length === 0) break;

      for (const job of data as Job[]) {
        const key = job.external_id || job.id;
        if (seen.has(key)) continue;
        seen.add(key);

        // Skip jobs with no skills - they can never match
        if (!job.skills || job.skills.length === 0) continue;

        const { matchPercentage, matchingSkills, missingSkills } = calculateMatch(
          userSkills,
          job.skills
        );

        // Only keep jobs with at least some match
        if (matchPercentage > 0) {
          let adjustedScore = matchPercentage;

          // Experience-level score adjustment (not hard filter)
          if (experienceLevel === "fresher") {
            const titleLower = job.title.toLowerCase();
            if (SENIOR_TITLE_KEYWORDS.some((kw) => titleLower.includes(kw))) {
              adjustedScore -= 40; // Penalize senior jobs heavily
            }
            if (FRESHER_TITLE_KEYWORDS.some((kw) => titleLower.includes(kw))) {
              adjustedScore += 15; // Boost fresher-friendly jobs
            }
          } else if (experienceLevel === "senior") {
            const titleLower = job.title.toLowerCase();
            if (FRESHER_TITLE_KEYWORDS.some((kw) => titleLower.includes(kw))) {
              adjustedScore -= 20; // Penalize intern/trainee jobs for seniors
            }
          }

          topJobs.push({
            ...job,
            description: null,
            match_percentage: Math.max(0, Math.min(100, adjustedScore)),
            matching_skills: matchingSkills,
            missing_skills: missingSkills,
          });
        }
      }

      if (data.length < PAGE_SIZE) break;
      from += PAGE_SIZE;
    }

    // Sort by match percentage and cap at MAX_RESULTS
    topJobs.sort((a, b) => b.match_percentage - a.match_percentage);
    topJobs = topJobs.slice(0, MAX_RESULTS);

    return new Response(
      JSON.stringify({
        jobs: topJobs,
        user_skills: userSkills,
        has_resume: true,
        experience_level: experienceLevel,
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
