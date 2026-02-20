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
    const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY");
    if (!GROQ_API_KEY) {
      throw new Error("GROQ_API_KEY is not configured");
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

      systemPrompt = `You are a professional resume writer. Take the user's input and craft a polished, compelling professional summary of 40-70 words. Expand on the input by adding relevant professional qualities, typical strengths, and common responsibilities associated with the mentioned role. Use confident, professional language. Highlight passion for the field, collaboration, problem-solving, and continuous learning where appropriate. Do NOT invent specific metrics, percentages, company names, or achievements. Do NOT change years of experience if mentioned. Output ONLY the summary text, nothing else.`;
      
      userPrompt = `Refine the following professional summary:\n\n"""\n${userSummary}\n"""`;

    } else if (type === "project") {
      const projectData = data as ProjectData;
      systemPrompt = `You are a professional resume writer. Generate 4-6 detailed bullet points for a resume project description. Each bullet should be 15-25 words and start with a strong action verb. Describe: what was built, key features implemented, technologies and tools used, architectural decisions, and the problem the project solves. Infer reasonable technical details based on the technologies mentioned. Do NOT invent specific metrics, percentages, or performance numbers. Total output should be 80-120 words. Use the • character to separate bullets. Output ONLY the bullet points, nothing else.`;
      
      userPrompt = `Write detailed bullet points for a resume project:
Project Name: ${projectData.name || "Project"}
Technologies: ${projectData.technologies || "modern technologies"}
Remember: 4-6 bullets, strong action verbs, 80-120 words total. Be descriptive about features and technical implementation.`;

    } else {
      throw new Error("Invalid type. Must be 'summary' or 'project'");
    }

    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          max_tokens: 250,
          temperature: 0.7,
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
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
