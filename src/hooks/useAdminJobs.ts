import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const EDGE_FUNCTION_URL =
  "https://qswjxgjfynphxvobaitl.supabase.co/functions/v1/ingest-jobs";

export const useAdminJobs = () => {
  const queryClient = useQueryClient();

  const jobsQuery = useQuery({
    queryKey: ["admin-jobs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("jobs")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const ingestMutation = useMutation({
    mutationFn: async (secret: string) => {
      const res = await fetch(EDGE_FUNCTION_URL, {
        method: "POST",
        headers: { "x-ingest-key": secret },
      });
      if (!res.ok) {
        const body = await res.text();
        throw new Error(body || `HTTP ${res.status}`);
      }
      return res.json();
    },
    onSuccess: (data) => {
      const results = data.results as Record<string, { upserted: number; deactivated: number }> | undefined;
      let description = "Ingestion completed successfully.";
      if (results) {
        const lines = Object.entries(results).map(
          ([source, stats]) => `${source}: ${stats.upserted} upserted, ${stats.deactivated} deactivated`
        );
        description = lines.join("\n");
      }
      toast({ title: "Ingestion complete", description });
      queryClient.invalidateQueries({ queryKey: ["admin-jobs"] });
    },
    onError: (err: Error) => {
      toast({ title: "Ingestion failed", description: err.message, variant: "destructive" });
    },
  });

  return { jobsQuery, ingestMutation };
};
