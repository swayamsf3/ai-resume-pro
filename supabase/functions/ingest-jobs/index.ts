import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-ingest-key",
};

// ---------------------------------------------------------------------------
// Feed configuration – add new employers by appending to this array
// ---------------------------------------------------------------------------

interface FeedJob {
  job_id: string;
  job_title: string;
  job_location: string;
  job_type: string;
  salary?: string;
  description: string;
  required_skills: string[];
  application_url: string;
}

interface FeedConfig {
  name: string;
  url: string; // real endpoint – falls back to mockData when unreachable
  mockData: FeedJob[];
}

const FEEDS: FeedConfig[] = [
  {
    name: "TechCorp",
    url: "https://techcorp.example.com/api/jobs.json",
    mockData: [
      {
        job_id: "tc-001",
        job_title: "Senior React Developer",
        job_location: "San Francisco, CA",
        job_type: "Full-time",
        salary: "$140,000 - $180,000",
        description:
          "Build and maintain modern web applications using React and TypeScript. Lead frontend architecture decisions and mentor junior developers.",
        required_skills: ["React", "TypeScript", "Node.js", "GraphQL", "CSS"],
        application_url: "https://techcorp.example.com/careers/tc-001",
      },
      {
        job_id: "tc-002",
        job_title: "Full Stack Engineer",
        job_location: "Austin, TX",
        job_type: "Full-time",
        salary: "$120,000 - $160,000",
        description:
          "Develop end-to-end features across our Python/Django backend and React frontend. Work closely with product and design teams.",
        required_skills: ["Python", "Django", "PostgreSQL", "React", "REST"],
        application_url: "https://techcorp.example.com/careers/tc-002",
      },
      {
        job_id: "tc-003",
        job_title: "DevOps Engineer",
        job_location: "Remote",
        job_type: "Full-time",
        salary: "$130,000 - $170,000",
        description:
          "Design and maintain CI/CD pipelines, manage cloud infrastructure on AWS, and champion containerisation best practices.",
        required_skills: ["AWS", "Docker", "Kubernetes", "Terraform", "CI/CD"],
        application_url: "https://techcorp.example.com/careers/tc-003",
      },
    ],
  },
  {
    name: "DataWorks",
    url: "https://dataworks.example.com/api/jobs.json",
    mockData: [
      {
        job_id: "dw-001",
        job_title: "Data Scientist",
        job_location: "New York, NY",
        job_type: "Full-time",
        salary: "$130,000 - $170,000",
        description:
          "Apply statistical modeling and machine learning techniques to solve business problems. Collaborate with engineering to productionize models.",
        required_skills: [
          "Python",
          "SQL",
          "Machine Learning",
          "Pandas",
          "Scikit-learn",
        ],
        application_url: "https://dataworks.example.com/careers/dw-001",
      },
      {
        job_id: "dw-002",
        job_title: "Backend Engineer",
        job_location: "Chicago, IL",
        job_type: "Full-time",
        salary: "$125,000 - $160,000",
        description:
          "Build high-performance backend services in Go. Design RESTful APIs and manage PostgreSQL databases at scale.",
        required_skills: ["Go", "PostgreSQL", "REST", "Docker", "Redis"],
        application_url: "https://dataworks.example.com/careers/dw-002",
      },
      {
        job_id: "dw-003",
        job_title: "Cloud Architect",
        job_location: "Remote",
        job_type: "Contract",
        salary: "$150,000 - $200,000",
        description:
          "Design multi-cloud architectures across AWS and Azure. Define infrastructure-as-code standards and lead cloud migration initiatives.",
        required_skills: ["AWS", "Azure", "Terraform", "Kubernetes", "Networking"],
        application_url: "https://dataworks.example.com/careers/dw-003",
      },
    ],
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function fetchFeedJobs(feed: FeedConfig): Promise<FeedJob[]> {
  try {
    const res = await fetch(feed.url, { signal: AbortSignal.timeout(5000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    // Accept either a raw array or { jobs: [...] }
    return Array.isArray(data) ? data : data.jobs ?? [];
  } catch {
    console.log(
      `Feed "${feed.name}" unreachable – using embedded mock data (${feed.mockData.length} jobs)`
    );
    return feed.mockData;
  }
}

function normalizeJob(
  feedName: string,
  raw: FeedJob
): Record<string, unknown> {
  return {
    title: raw.job_title,
    company: feedName,
    location: raw.job_location,
    type: raw.job_type || "Full-time",
    salary: raw.salary || null,
    description: raw.description || null,
    skills: raw.required_skills ?? [],
    apply_url: raw.application_url,
    external_id: `${feedName.toLowerCase().replace(/\s+/g, "_")}_${raw.job_id}`,
    source: "employer_feed",
    is_active: true,
    posted_at: new Date().toISOString(),
  };
}

// ---------------------------------------------------------------------------
// Main handler
// ---------------------------------------------------------------------------

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Auth check
  const INGEST_SECRET = Deno.env.get("INGEST_SECRET");
  if (!INGEST_SECRET || req.headers.get("x-ingest-key") !== INGEST_SECRET) {
    return new Response(
      JSON.stringify({ error: "Unauthorized" }),
      { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const results: Record<string, { upserted: number; deactivated: number }> = {};

    for (const feed of FEEDS) {
      const rawJobs = await fetchFeedJobs(feed);
      const normalized = rawJobs.map((j) => normalizeJob(feed.name, j));

      if (normalized.length === 0) {
        results[feed.name] = { upserted: 0, deactivated: 0 };
        continue;
      }

      // Upsert jobs using external_id for deduplication
      const { error: upsertError } = await supabase
        .from("jobs")
        .upsert(normalized, { onConflict: "external_id" });

      if (upsertError) {
        console.error(`Upsert error for ${feed.name}:`, upsertError);
        throw upsertError;
      }

      // Deactivate stale jobs from this feed that weren't in the current batch
      const currentExternalIds = normalized.map((j) => j.external_id as string);

      const { data: staleJobs, error: staleError } = await supabase
        .from("jobs")
        .select("id, external_id")
        .eq("source", "employer_feed")
        .eq("company", feed.name)
        .eq("is_active", true)
        .not("external_id", "in", `(${currentExternalIds.join(",")})`);

      if (staleError) {
        console.error(`Stale query error for ${feed.name}:`, staleError);
      }

      let deactivated = 0;
      if (staleJobs && staleJobs.length > 0) {
        const staleIds = staleJobs.map((j) => j.id);
        const { error: deactivateError } = await supabase
          .from("jobs")
          .update({ is_active: false })
          .in("id", staleIds);

        if (deactivateError) {
          console.error(`Deactivate error for ${feed.name}:`, deactivateError);
        } else {
          deactivated = staleIds.length;
        }
      }

      results[feed.name] = { upserted: normalized.length, deactivated };
    }

    return new Response(
      JSON.stringify({ success: true, results }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Ingestion error:", error);
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
