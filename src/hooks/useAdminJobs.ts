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
      const PAGE_SIZE = 1000;
      let allJobs: any[] = [];
      let from = 0;
      while (true) {
        const { data, error } = await supabase
          .from("jobs")
          .select("*")
          .order("created_at", { ascending: false })
          .range(from, from + PAGE_SIZE - 1);
        if (error) throw error;
        allJobs = allJobs.concat(data || []);
        if (!data || data.length < PAGE_SIZE) break;
        from += PAGE_SIZE;
      }
      return allJobs;
    },
  });

  const ingestMutation = useMutation({
    mutationFn: async ({ secret, seedMode = false }: { secret: string; seedMode?: boolean }) => {
      const res = await fetch(EDGE_FUNCTION_URL, {
        method: "POST",
        headers: { "x-ingest-key": secret, "Content-Type": "application/json" },
        body: JSON.stringify({ seedMode }),
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

  const jsearchMutation = useMutation({
    mutationFn: async ({ secret, seedMode = false }: { secret: string; seedMode?: boolean }) => {
      const res = await fetch(EDGE_FUNCTION_URL, {
        method: "POST",
        headers: { "x-ingest-key": secret, "Content-Type": "application/json" },
        body: JSON.stringify({ jsearchOnly: true, seedMode }),
      });
      if (!res.ok) {
        const body = await res.text();
        throw new Error(body || `HTTP ${res.status}`);
      }
      return res.json();
    },
    onSuccess: (data) => {
      const results = data.results as Record<string, { upserted: number; deactivated: number }> | undefined;
      let description = "JSearch ingestion completed.";
      if (results) {
        const lines = Object.entries(results).map(
          ([source, stats]) => `${source}: ${stats.upserted} upserted, ${stats.deactivated} deactivated`
        );
        description = lines.join("\n");
      }
      toast({ title: "JSearch ingestion complete", description });
      queryClient.invalidateQueries({ queryKey: ["admin-jobs"] });
    },
    onError: (err: Error) => {
      toast({ title: "JSearch ingestion failed", description: err.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (jobId: string) => {
      const { error } = await supabase.from("jobs").delete().eq("id", jobId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Job deleted", description: "The job has been removed." });
      queryClient.invalidateQueries({ queryKey: ["admin-jobs"] });
    },
    onError: (err: Error) => {
      toast({ title: "Delete failed", description: err.message, variant: "destructive" });
    },
  });

  return { jobsQuery, ingestMutation, jsearchMutation, deleteMutation };
};
