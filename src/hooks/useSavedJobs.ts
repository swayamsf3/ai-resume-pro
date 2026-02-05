 import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
 import { supabase } from "@/integrations/supabase/client";
 import { useAuth } from "./useAuth";
 import { toast } from "@/hooks/use-toast";
 
 export function useSavedJobs() {
   const { user } = useAuth();
   const queryClient = useQueryClient();
 
   const { data: savedJobIds = [], isLoading } = useQuery({
     queryKey: ["saved-jobs", user?.id],
     queryFn: async () => {
       if (!user) return [];
 
       const { data, error } = await supabase
         .from("saved_jobs")
         .select("job_id")
         .eq("user_id", user.id);
 
       if (error) throw error;
       return data.map(item => item.job_id);
     },
     enabled: !!user,
   });
 
   const toggleSaveJob = useMutation({
     mutationFn: async (jobId: string) => {
       if (!user) throw new Error("Not authenticated");
 
       const isSaved = savedJobIds.includes(jobId);
 
       if (isSaved) {
         const { error } = await supabase
           .from("saved_jobs")
           .delete()
           .eq("user_id", user.id)
           .eq("job_id", jobId);
 
         if (error) throw error;
         return { action: "unsaved", jobId };
       } else {
         const { error } = await supabase
           .from("saved_jobs")
           .insert({ user_id: user.id, job_id: jobId });
 
         if (error) throw error;
         return { action: "saved", jobId };
       }
     },
     onSuccess: (result) => {
       queryClient.invalidateQueries({ queryKey: ["saved-jobs"] });
       toast({
         title: result.action === "saved" ? "Job saved" : "Job removed",
         description: result.action === "saved" 
           ? "You can find this job in your saved jobs." 
           : "Job removed from saved jobs.",
       });
     },
     onError: (error) => {
       toast({
         title: "Error",
         description: error.message,
         variant: "destructive",
       });
     },
   });
 
   const isJobSaved = (jobId: string) => savedJobIds.includes(jobId);
 
   return {
     savedJobIds,
     isLoading,
     toggleSaveJob,
     isJobSaved,
   };
 }