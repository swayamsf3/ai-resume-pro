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
      toast({ title: "Ingestion complete", description: `Inserted: ${data.inserted}, Updated: ${data.updated}, Deactivated: ${data.deactivated}` });
      queryClient.invalidateQueries({ queryKey: ["admin-jobs"] });
    },
    onError: (err: Error) => {
      toast({ title: "Ingestion failed", description: err.message, variant: "destructive" });
    },
  });

  return { jobsQuery, ingestMutation };
};
