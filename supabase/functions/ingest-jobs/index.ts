import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-ingest-key",
};

// ---------------------------------------------------------------------------
// Skills keyword list for extracting from descriptions
// ---------------------------------------------------------------------------
const SKILLS_KEYWORDS = [
  "JavaScript", "TypeScript", "Python", "Java", "C++", "C#", "Go", "Rust", "Ruby",
  "Swift", "Kotlin", "PHP", "Scala", "R", "SQL", "NoSQL", "GraphQL", "REST",
  "React", "Angular", "Vue", "Node.js", "Django", "Flask", "Spring", "Express",
  "Next.js", "Svelte", "Redux", "TailwindCSS", "Bootstrap",
  "AWS", "Azure", "GCP", "Docker", "Kubernetes", "Terraform", "CI/CD",
  "PostgreSQL", "MongoDB", "Redis", "Elasticsearch", "MySQL", "DynamoDB",
  "Machine Learning", "Deep Learning", "NLP", "Computer Vision", "TensorFlow", "PyTorch",
  "Git", "Linux", "Agile", "Scrum", "DevOps", "Microservices",
  "HTML", "CSS", "Sass", "Figma", "UI/UX", "Accessibility",
  "Data Science", "Data Engineering", "ETL", "Spark", "Hadoop",
  "Cybersecurity", "Networking", "Blockchain", "IoT",
  "Spring Boot", "Hibernate", ".NET", "Jenkins", "SonarQube", "Jira",
  "SAP", "Salesforce", "ServiceNow", "Power Automate", "Power BI",
  "Ansible", "Grafana", "Prometheus", "Kafka", "RabbitMQ",
  "Android", "iOS", "SwiftUI", "Jetpack Compose", "React Native",
  "ClickHouse", "Cassandra", "GitLab CI", "Excel",
];

function extractSkillsFromText(text: string): string[] {
  if (!text) return [];
  const lower = text.toLowerCase();
  return SKILLS_KEYWORDS.filter((skill) => lower.includes(skill.toLowerCase()));
}

// ---------------------------------------------------------------------------
// Normalized job type
// ---------------------------------------------------------------------------
interface NormalizedJob {
  title: string;
  company: string;
  location: string;
  type: string;
  salary: string | null;
  description: string | null;
  skills: string[];
  apply_url: string;
  external_id: string;
  source: string;
  is_active: boolean;
  posted_at: string;
}

// ---------------------------------------------------------------------------
// Adzuna API fetcher — India only, two modes
// ---------------------------------------------------------------------------

const SEED_CATEGORIES = ["it-jobs", "engineering-jobs", "accounting-finance-jobs", "hr-jobs", "consultancy-jobs"];
const DAILY_CATEGORIES = ["it-jobs", "engineering-jobs"];
const MAX_ADZUNA_REQUESTS = 80;

async function fetchAdzunaJobs(seedMode: boolean): Promise<{ jobs: NormalizedJob[]; apiRequests: number }> {
  const appId = Deno.env.get("ADZUNA_APP_ID");
  const appKey = Deno.env.get("ADZUNA_APP_KEY");
  if (!appId || !appKey) {
    console.log("Adzuna credentials not configured – skipping");
    return { jobs: [], apiRequests: 0 };
  }

  const categories = seedMode ? SEED_CATEGORIES : DAILY_CATEGORIES;
  const maxPages = seedMode ? 20 : 3;
  const allJobs: NormalizedJob[] = [];
  let apiRequests = 0;

  for (const category of categories) {
    for (let page = 1; page <= maxPages; page++) {
      if (apiRequests >= MAX_ADZUNA_REQUESTS) {
        console.log(`Adzuna request cap (${MAX_ADZUNA_REQUESTS}) reached — stopping`);
        break;
      }

      try {
        const url = `https://api.adzuna.com/v1/api/jobs/in/search/${page}?app_id=${appId}&app_key=${appKey}&results_per_page=50&category=${category}`;
        const res = await fetch(url, { signal: AbortSignal.timeout(15000) });
        apiRequests++;

        if (!res.ok) {
          console.error(`Adzuna in/${category} page ${page} error: HTTP ${res.status}`);
          continue;
        }
        const data = await res.json();
        const results = data.results ?? [];

        if (results.length === 0) {
          console.log(`Adzuna in/${category} page ${page}: empty — moving to next category`);
          break;
        }

        for (const job of results) {
          const salaryParts: string[] = [];
          if (job.salary_min) salaryParts.push(`₹${Math.round(job.salary_min).toLocaleString()}`);
          if (job.salary_max) salaryParts.push(`₹${Math.round(job.salary_max).toLocaleString()}`);
          const salary = salaryParts.length === 2 ? salaryParts.join(" - ") : salaryParts[0] || null;

          allJobs.push({
            title: job.title ?? "Untitled",
            company: job.company?.display_name ?? "Unknown",
            location: job.location?.display_name ?? "Unknown",
            type: job.contract_time === "part_time" ? "Part-time" : "Full-time",
            salary,
            description: job.description ?? null,
            skills: extractSkillsFromText(job.description ?? ""),
            apply_url: job.redirect_url ?? `https://www.adzuna.com/details/${job.id}`,
            external_id: `adzuna_${job.id}`,
            source: "adzuna",
            is_active: true,
            posted_at: job.created ? new Date(job.created).toISOString() : new Date().toISOString(),
          });
        }

        console.log(`Adzuna in/${category} page ${page}: fetched ${results.length} jobs`);

        // 300ms delay in seed mode to stay respectful
        if (seedMode) await new Promise((r) => setTimeout(r, 300));
      } catch (err) {
        console.error(`Adzuna in/${category} page ${page} fetch error:`, err);
      }
    }

    if (apiRequests >= MAX_ADZUNA_REQUESTS) break;
  }

  console.log(`Adzuna total: ${allJobs.length} jobs fetched using ${apiRequests} API requests`);
  return { jobs: allJobs, apiRequests };
}

// ---------------------------------------------------------------------------
// JSearch (RapidAPI) fetcher
// ---------------------------------------------------------------------------

const JSEARCH_SEED_QUERIES = ["developer India", "engineer India", "analyst India", "manager India", "designer India"];
const JSEARCH_DAILY_QUERIES = ["developer India", "engineer India", "analyst India"];
const MAX_JSEARCH_REQUESTS = 25;

async function fetchJSearchJobs(seedMode: boolean): Promise<{ jobs: NormalizedJob[]; apiRequests: number }> {
  const rapidApiKey = Deno.env.get("RAPIDAPI_KEY");
  if (!rapidApiKey) {
    console.log("RAPIDAPI_KEY not configured – skipping JSearch");
    return { jobs: [], apiRequests: 0 };
  }

  const queries = seedMode ? JSEARCH_SEED_QUERIES : JSEARCH_DAILY_QUERIES;
  const maxPages = seedMode ? 5 : 2;
  const allJobs: NormalizedJob[] = [];
  let apiRequests = 0;

  for (const query of queries) {
    for (let page = 1; page <= maxPages; page++) {
      if (apiRequests >= MAX_JSEARCH_REQUESTS) {
        console.log(`JSearch request cap (${MAX_JSEARCH_REQUESTS}) reached — stopping`);
        break;
      }

      try {
        const url = `https://jsearch.p.rapidapi.com/search?query=${encodeURIComponent(query)}&page=${page}&num_pages=1&country=IN`;
        const res = await fetch(url, {
          headers: {
            "X-RapidAPI-Key": rapidApiKey,
            "X-RapidAPI-Host": "jsearch.p.rapidapi.com",
          },
          signal: AbortSignal.timeout(15000),
        });
        apiRequests++;

        if (!res.ok) {
          console.error(`JSearch "${query}" page ${page} error: HTTP ${res.status}`);
          continue;
        }

        const data = await res.json();
        const results = data.data ?? [];

        if (results.length === 0) {
          console.log(`JSearch "${query}" page ${page}: empty — next query`);
          break;
        }

        for (const job of results) {
          if (!job.job_id) continue;

          const salaryParts: string[] = [];
          if (job.job_min_salary) salaryParts.push(`₹${Math.round(job.job_min_salary).toLocaleString()}`);
          if (job.job_max_salary) salaryParts.push(`₹${Math.round(job.job_max_salary).toLocaleString()}`);
          const salary = salaryParts.length === 2 ? salaryParts.join(" - ") : salaryParts[0] || null;

          const desc = job.job_description ?? "";

          allJobs.push({
            title: job.job_title ?? "Untitled",
            company: job.employer_name ?? "Unknown",
            location: job.job_city
              ? `${job.job_city}, ${job.job_state ?? job.job_country ?? "India"}`
              : job.job_country ?? "India",
            type: job.job_employment_type === "PARTTIME" ? "Part-time"
              : job.job_employment_type === "CONTRACTOR" ? "Contract"
              : "Full-time",
            salary,
            description: desc.slice(0, 2000) || null,
            skills: extractSkillsFromText(desc),
            apply_url: job.job_apply_link ?? `https://www.google.com/search?q=${encodeURIComponent(job.job_title + " " + job.employer_name)}`,
            external_id: `jsearch_${job.job_id}`,
            source: "jsearch",
            is_active: true,
            posted_at: job.job_posted_at_datetime_utc
              ? new Date(job.job_posted_at_datetime_utc).toISOString()
              : new Date().toISOString(),
          });
        }

        console.log(`JSearch "${query}" page ${page}: fetched ${results.length} jobs`);

        if (seedMode) await new Promise((r) => setTimeout(r, 500));
      } catch (err) {
        console.error(`JSearch "${query}" page ${page} fetch error:`, err);
      }
    }

    if (apiRequests >= MAX_JSEARCH_REQUESTS) break;
  }

  console.log(`JSearch total: ${allJobs.length} jobs fetched using ${apiRequests} API requests`);
  return { jobs: allJobs, apiRequests };
}

// ---------------------------------------------------------------------------
// The Muse API fetcher — capped at 5 pages
// ---------------------------------------------------------------------------

async function fetchMuseJobs(): Promise<NormalizedJob[]> {
  const allJobs: NormalizedJob[] = [];

  for (let page = 0; page < 5; page++) {
    try {
      const url = `https://www.themuse.com/api/public/jobs?page=${page}&descending=true`;
      const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
      if (!res.ok) {
        console.error(`The Muse page ${page} error: HTTP ${res.status}`);
        continue;
      }
      const data = await res.json();
      const results = data.results ?? [];

      for (const job of results) {
        const categories = (job.categories ?? []).map((c: { name: string }) => c.name);
        const levels = (job.levels ?? []).map((l: { name: string }) => l.name);
        const skills = [...new Set([...categories, ...levels])].slice(0, 5);

        allJobs.push({
          title: job.name ?? "Untitled",
          company: job.company?.name ?? "Unknown",
          location: job.locations?.[0]?.name ?? "Remote",
          type: "Full-time",
          salary: null,
          description: job.contents ? job.contents.replace(/<[^>]*>/g, "").slice(0, 2000) : null,
          skills,
          apply_url: job.refs?.landing_page ?? `https://www.themuse.com/jobs/${job.id}`,
          external_id: `themuse_${job.id}`,
          source: "themuse",
          is_active: true,
          posted_at: job.publication_date ? new Date(job.publication_date).toISOString() : new Date().toISOString(),
        });
      }

      console.log(`The Muse page ${page}: fetched ${results.length} jobs`);
      if (page < 4) await new Promise((r) => setTimeout(r, 500));
    } catch (err) {
      console.error(`The Muse page ${page} fetch error:`, err);
    }
  }

  return allJobs;
}

// ---------------------------------------------------------------------------
// Upsert + deactivate helper
// ---------------------------------------------------------------------------

async function upsertAndDeactivate(
  supabase: ReturnType<typeof createClient>,
  source: string,
  jobs: NormalizedJob[],
  label: string
): Promise<{ upserted: number; deactivated: number }> {
  if (jobs.length === 0) return { upserted: 0, deactivated: 0 };

  // Upsert in batches of 500 to avoid payload limits
  const BATCH_SIZE = 500;
  for (let i = 0; i < jobs.length; i += BATCH_SIZE) {
    const batch = jobs.slice(i, i + BATCH_SIZE);
    const { error: upsertError } = await supabase
      .from("jobs")
      .upsert(batch, { onConflict: "external_id" });

    if (upsertError) {
      console.error(`Upsert error for ${label} batch ${i / BATCH_SIZE + 1}:`, upsertError);
      throw upsertError;
    }
  }

  const currentExternalIds = jobs.map((j) => j.external_id);

  // Query stale jobs in batches too (Supabase has query limits)
  const { data: staleJobs, error: staleError } = await supabase
    .from("jobs")
    .select("id, external_id")
    .eq("source", source)
    .eq("is_active", true)
    .not("external_id", "in", `(${currentExternalIds.join(",")})`);

  if (staleError) {
    console.error(`Stale query error for ${label}:`, staleError);
  }

  let deactivated = 0;
  if (staleJobs && staleJobs.length > 0) {
    const staleIds = staleJobs.map((j) => j.id);
    const { error: deactivateError } = await supabase
      .from("jobs")
      .update({ is_active: false })
      .in("id", staleIds);

    if (deactivateError) {
      console.error(`Deactivate error for ${label}:`, deactivateError);
    } else {
      deactivated = staleIds.length;
    }
  }

  return { upserted: jobs.length, deactivated };
}

// ---------------------------------------------------------------------------
// Seed mode cooldown check (7-day protection)
// ---------------------------------------------------------------------------

async function checkSeedCooldown(supabase: ReturnType<typeof createClient>): Promise<boolean> {
  // Check if any adzuna job was created within the last 7 days with a large batch
  // We detect seed runs by checking if there are more than 500 adzuna jobs created in a single day
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const { count, error } = await supabase
    .from("jobs")
    .select("*", { count: "exact", head: true })
    .eq("source", "adzuna")
    .gte("created_at", sevenDaysAgo);

  if (error) {
    console.error("Seed cooldown check error:", error);
    return false; // Allow if we can't check
  }

  // If more than 500 adzuna jobs were created in the last 7 days, seed was likely run recently
  return (count ?? 0) > 500;
}

// ---------------------------------------------------------------------------
// JSearch seed cooldown check (3-day protection)
// ---------------------------------------------------------------------------

async function checkJSearchSeedCooldown(supabase: ReturnType<typeof createClient>): Promise<boolean> {
  const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();

  const { count, error } = await supabase
    .from("jobs")
    .select("*", { count: "exact", head: true })
    .eq("source", "jsearch")
    .gte("created_at", threeDaysAgo);

  if (error) {
    console.error("JSearch seed cooldown check error:", error);
    return false;
  }

  return (count ?? 0) > 200;
}

// ---------------------------------------------------------------------------
// Cleanup: delete inactive jobs older than 60 days
// ---------------------------------------------------------------------------

async function cleanupOldInactiveJobs(supabase: ReturnType<typeof createClient>): Promise<number> {
  const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString();

  const { data, error } = await supabase
    .from("jobs")
    .delete()
    .eq("is_active", false)
    .lt("created_at", sixtyDaysAgo)
    .select("id");

  if (error) {
    console.error("Cleanup error:", error);
    return 0;
  }

  const count = data?.length ?? 0;
  if (count > 0) console.log(`Cleanup: deleted ${count} inactive jobs older than 60 days`);
  return count;
}

// ---------------------------------------------------------------------------
// Main handler
// ---------------------------------------------------------------------------

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const INGEST_SECRET = Deno.env.get("INGEST_SECRET");
  if (!INGEST_SECRET || req.headers.get("x-ingest-key") !== INGEST_SECRET) {
    return new Response(
      JSON.stringify({ error: "Unauthorized" }),
      { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    // Parse request body for seedMode and jsearchOnly flags
    let seedMode = false;
    let jsearchOnly = false;
    try {
      const body = await req.json();
      seedMode = body?.seedMode === true;
      jsearchOnly = body?.jsearchOnly === true;
    } catch {
      // No body or invalid JSON — default to daily mode
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Seed mode cooldown check
    if (seedMode) {
      if (jsearchOnly) {
        const recentlySeeded = await checkJSearchSeedCooldown(supabase);
        if (recentlySeeded) {
          return new Response(
            JSON.stringify({
              error: "JSearch seed mode was already run within the last 3 days. Use daily mode instead.",
            }),
            { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      } else {
        const recentlySeeded = await checkSeedCooldown(supabase);
        if (recentlySeeded) {
          return new Response(
            JSON.stringify({
              error: "Seed mode was already run within the last 7 days. Use daily mode instead.",
            }),
            { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      }
    }

    const modeLabel = jsearchOnly ? "JSEARCH-ONLY" : seedMode ? "SEED" : "DAILY";
    console.log(`Ingestion started — mode: ${modeLabel}`);

    const results: Record<string, { upserted: number; deactivated: number }> = {};
    let adzunaApiRequests = 0;
    let jsearchApiRequests = 0;

    if (jsearchOnly) {
      // JSearch-only mode
      const jsearchResult = await fetchJSearchJobs(seedMode);
      jsearchApiRequests = jsearchResult.apiRequests;

      if (jsearchResult.jobs.length > 0) {
        results["JSearch"] = await upsertAndDeactivate(supabase, "jsearch", jsearchResult.jobs, "JSearch");
      } else {
        results["JSearch"] = { upserted: 0, deactivated: 0 };
      }
    } else {
      // Full ingestion: Adzuna + The Muse + JSearch in parallel
      const [adzunaResult, museJobs, jsearchResult] = await Promise.all([
        fetchAdzunaJobs(seedMode),
        fetchMuseJobs(),
        fetchJSearchJobs(seedMode),
      ]);

      adzunaApiRequests = adzunaResult.apiRequests;
      jsearchApiRequests = jsearchResult.apiRequests;

      // Upsert Adzuna
      if (adzunaResult.jobs.length > 0) {
        results["Adzuna"] = await upsertAndDeactivate(supabase, "adzuna", adzunaResult.jobs, "Adzuna");
      } else {
        results["Adzuna"] = { upserted: 0, deactivated: 0 };
      }

      // Upsert The Muse
      if (museJobs.length > 0) {
        results["The Muse"] = await upsertAndDeactivate(supabase, "themuse", museJobs, "The Muse");
      } else {
        results["The Muse"] = { upserted: 0, deactivated: 0 };
      }

      // Upsert JSearch
      if (jsearchResult.jobs.length > 0) {
        results["JSearch"] = await upsertAndDeactivate(supabase, "jsearch", jsearchResult.jobs, "JSearch");
      } else {
        results["JSearch"] = { upserted: 0, deactivated: 0 };
      }
    }

    // Cleanup old inactive jobs
    const deletedCount = await cleanupOldInactiveJobs(supabase);

    console.log(`Ingestion complete — mode: ${modeLabel}, Adzuna requests: ${adzunaApiRequests}, JSearch requests: ${jsearchApiRequests}`);

    return new Response(
      JSON.stringify({
        success: true,
        mode: jsearchOnly ? "jsearch-only" : seedMode ? "seed" : "daily",
        adzunaApiRequests,
        jsearchApiRequests,
        deletedInactiveJobs: deletedCount,
        results,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Ingestion error:", error);
    return new Response(
      JSON.stringify({ error: error.message ?? "Internal error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
