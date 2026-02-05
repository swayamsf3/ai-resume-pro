 import { useQuery } from "@tanstack/react-query";
 import { supabase } from "@/integrations/supabase/client";
 import { useAuth } from "./useAuth";
 
 export interface MatchedJob {
   id: string;
   title: string;
   company: string;
   location: string;
   type: string;
   salary: string | null;
   description: string | null;
   skills: string[];
   apply_url: string;
   posted_at: string;
   is_active: boolean;
   created_at: string;
   match_percentage: number;
   matching_skills: string[];
   missing_skills: string[];
 }
 
 interface MatchJobsResponse {
   jobs: MatchedJob[];
   user_skills: string[];
   has_resume: boolean;
 }
 
 export function useJobMatches() {
   const { user } = useAuth();
 
   return useQuery({
     queryKey: ["job-matches", user?.id],
     queryFn: async (): Promise<MatchJobsResponse> => {
       const { data: { session } } = await supabase.auth.getSession();
       
       if (!session) {
         throw new Error("Not authenticated");
       }
 
       const response = await fetch(
         `https://qswjxgjfynphxvobaitl.supabase.co/functions/v1/match-jobs`,
         {
           method: "POST",
           headers: {
             "Content-Type": "application/json",
             "Authorization": `Bearer ${session.access_token}`,
           },
         }
       );
 
       if (!response.ok) {
         const errorData = await response.json();
         throw new Error(errorData.error || "Failed to fetch job matches");
       }
 
       return response.json();
     },
     enabled: !!user,
     staleTime: 1000 * 60 * 5, // 5 minutes
   });
 }