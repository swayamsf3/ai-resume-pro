import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface SummaryData {
  fullName: string;
  skills: string[];
  experience: Array<{ position: string; company: string }>;
}

interface ProjectData {
  name: string;
  technologies: string;
}

interface RequestBody {
  type: "summary" | "project";
  data: SummaryData | ProjectData;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const { type, data }: RequestBody = await req.json();

    let systemPrompt: string;
    let userPrompt: string;

  if (type === "summary") {
      const summaryData = data as SummaryData;
      const userSummary = (summaryData as any).summary as string;
      
      if (!userSummary || userSummary.trim().length === 0) {
        throw new Error("Please write a summary first before refining.");
      }

      systemPrompt = `You are a professional resume editor. Improve the grammar and clarity of the following professional summary. Do NOT add new skills. Do NOT add new experience. Do NOT exaggerate. Do NOT change years of experience. Do NOT invent achievements. Only refine wording while keeping the original meaning. Output ONLY the refined summary text, nothing else.`;
      
      userPrompt = `Refine the following professional summary:\n\n"""\n${userSummary}\n"""`;

    } else if (type === "project") {
      const projectData = data as ProjectData;
      systemPrompt = `You are a professional resume writer. Generate 3-4 concise bullet points for a resume project description. Each bullet should be 10-15 words max and start with an action verb. Focus on: what was built, technologies used, impact/results. Total output must NOT exceed 50 words. Use • character to separate bullets. Output ONLY the bullet points, nothing else.`;
      
      userPrompt = `Write bullet points for a resume project:
Project Name: ${projectData.name || "Project"}
Technologies: ${projectData.technologies || "modern technologies"}
Remember: 3-4 bullets, action verbs, 50 words maximum total.`;

    } else {
      throw new Error("Invalid type. Must be 'summary' or 'project'");
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        max_tokens: 150,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add credits to your workspace." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const result = await response.json();
    const content = result.choices?.[0]?.message?.content?.trim();

    if (!content) {
      throw new Error("No content generated from AI");
    }

    return new Response(
      JSON.stringify({ content }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("generate-resume-content error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
