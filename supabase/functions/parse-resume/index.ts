import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Curated whitelist – no single-letter or ambiguous short words
const SKILLS_WHITELIST = [
  // Data & Analytics
  "python","sql","excel","power bi","pandas","numpy","matplotlib","mysql",
  "postgresql","tableau","data analysis","machine learning","statistics",
  "scikit-learn","data science","data engineering","spark","hadoop","airflow",
  "kafka","etl","deep learning","nlp","tensorflow","pytorch","keras",
  // Web Development
  "javascript","typescript","react","angular","vue.js","svelte","next.js",
  "node.js","express","django","flask","fastapi","html","css","sass",
  "tailwind","bootstrap","graphql","webpack","vite",
  // Backend & Infrastructure
  "java","spring boot","ruby on rails","asp.net","laravel","docker",
  "kubernetes","terraform","aws","azure","gcp","linux","nginx","redis",
  "mongodb","elasticsearch","dynamodb","firebase","supabase",
  // Programming Languages (safe multi-char)
  "kotlin","swift","scala","matlab","rust","perl","powershell","bash","shell",
  // Mobile
  "react native","flutter","ios development","android development","xamarin",
  // Tools & Practices
  "git","github","gitlab","jira","confluence","figma","ci/cd",
  "agile methodology","scrum","microservices",
  // Soft Skills
  "leadership","project management","communication","problem-solving",
  "mentoring","teamwork",
];

// Ambiguous skills that need list-context to match
const AMBIGUOUS_SKILLS = ["c++", "c#", "r", "go", "php", "ruby"];

// Common resume section headers
const SECTION_HEADER_RE =
  /^[\s]*(?:(?:technical\s+|key\s+|core\s+)?skills|core\s+competencies|technologies|tech\s+stack|tools\s*(?:&|and)\s*technologies|proficiencies|areas\s+of\s+expertise)\s*:?\s*$/im;

// Generic section header (used to find end of skills section)
const GENERIC_SECTION_RE =
  /^[\s]*(?:[A-Z][A-Z\s&]{2,})\s*:?\s*$/m;

function findSkillsSection(text: string): string | null {
  const match = SECTION_HEADER_RE.exec(text);
  if (!match) return null;

  const startIdx = match.index + match[0].length;
  const remaining = text.substring(startIdx);

  // Find the next section header
  const nextSection = GENERIC_SECTION_RE.exec(remaining);
  const sectionText = nextSection
    ? remaining.substring(0, nextSection.index)
    : remaining.substring(0, 2000); // cap at 2000 chars if no next header

  return sectionText;
}

function matchWhitelistSkills(text: string): string[] {
  const normalizedText = text.toLowerCase();
  const found = new Set<string>();

  for (const skill of SKILLS_WHITELIST) {
    const escaped = skill.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const pattern = new RegExp(`\\b${escaped}\\b`, "i");
    if (pattern.test(normalizedText)) {
      found.add(skill.toLowerCase());
    }
  }

  return Array.from(found);
}

function extractAmbiguousSkills(sectionText: string): string[] {
  const found: string[] = [];
  for (const skill of AMBIGUOUS_SKILLS) {
    const escaped = skill.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    // Only match if preceded by a list delimiter (comma, pipe, bullet, semicolon, line start)
    const pattern = new RegExp(
      `(?:^|,|;|\\||•|\\u2022|\\n)\\s*${escaped}\\s*(?:,|;|\\||•|\\u2022|\\n|$)`,
      "im"
    );
    if (pattern.test(sectionText)) {
      found.push(skill.toLowerCase());
    }
  }
  return found;
}

function extractSkillsFromText(text: string): string[] {
  const skillsSection = findSkillsSection(text);

  let skills: string[];

  if (skillsSection) {
    // Match whitelist + ambiguous against the skills section only
    const whitelistMatches = matchWhitelistSkills(skillsSection);
    const ambiguousMatches = extractAmbiguousSkills(skillsSection);
    skills = [...whitelistMatches, ...ambiguousMatches];
  } else {
    // Fallback: only match multi-word skills and unambiguous entries against full text
    const safeSkills = SKILLS_WHITELIST.filter((s) => s.length >= 4);
    const normalizedText = text.toLowerCase();
    const found = new Set<string>();
    for (const skill of safeSkills) {
      const escaped = skill.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const pattern = new RegExp(`\\b${escaped}\\b`, "i");
      if (pattern.test(normalizedText)) {
        found.add(skill.toLowerCase());
      }
    }
    skills = Array.from(found);
  }

  // Deduplicate & normalize
  return [...new Set(skills.map((s) => s.toLowerCase()))];
}

async function extractTextFromFile(
  supabaseAdmin: any,
  fileUrl: string
): Promise<string> {
  const urlParts = fileUrl.split("/storage/v1/object/public/resumes/");
  if (urlParts.length < 2) {
    throw new Error("Invalid file URL format");
  }
  const filePath = urlParts[1];

  const { data, error } = await supabaseAdmin.storage
    .from("resumes")
    .download(filePath);

  if (error) {
    throw new Error(`Failed to download file: ${error.message}`);
  }

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

    const body = await req.json();
    const { file_url, file_name } = body;

    if (!file_url) {
      return new Response(
        JSON.stringify({ error: "Missing file_url" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let text: string;
    try {
      text = await extractTextFromFile(supabaseAdmin, file_url);
    } catch (e) {
      text = file_name || "";
    }

    const skills = extractSkillsFromText(text);

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
        message: `Extracted ${skills.length} skills from resume`,
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
