 import { useState, useEffect } from "react";
 import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
 import { supabase } from "@/integrations/supabase/client";
 import { useAuth } from "./useAuth";
 import { toast } from "@/hooks/use-toast";
 
 const MAX_SKILLS = 100;
 const MAX_SKILL_LENGTH = 50;
 
 function validateAndSanitizeSkills(skills: string[]): string[] {
   return skills
     .map(s => s.toLowerCase().trim().substring(0, MAX_SKILL_LENGTH))
     .filter(s => s.length > 0)
     .filter((s, i, arr) => arr.indexOf(s) === i) // deduplicate
     .slice(0, MAX_SKILLS);
 }
 
 interface UserResume {
   id: string;
   user_id: string;
   resume_file_url: string | null;
   resume_file_name: string | null;
   skills: string[];
   source: string;
   raw_data: Record<string, unknown> | null;
   created_at: string;
   updated_at: string;
 }
 
 export function useUserResume() {
   const { user } = useAuth();
   const queryClient = useQueryClient();
 
   const { data: userResume, isLoading, error } = useQuery({
     queryKey: ["user-resume", user?.id],
     queryFn: async () => {
       if (!user) return null;
       
       const { data, error } = await supabase
         .from("user_resumes")
         .select("*")
         .eq("user_id", user.id)
         .maybeSingle();
 
       if (error) throw error;
       return data as UserResume | null;
     },
     enabled: !!user,
   });
 
   const uploadResume = useMutation({
     mutationFn: async (file: File) => {
       if (!user) throw new Error("Not authenticated");
 
       // Upload file to storage
       const fileExt = file.name.split(".").pop();
       const filePath = `${user.id}/${Date.now()}.${fileExt}`;
       
       const { error: uploadError } = await supabase.storage
         .from("resumes")
         .upload(filePath, file);
 
       if (uploadError) throw uploadError;
 
       // Get public URL
       const { data: { publicUrl } } = supabase.storage
         .from("resumes")
         .getPublicUrl(filePath);
 
       // Call parse-resume edge function
       const { data: { session } } = await supabase.auth.getSession();
       
       const response = await fetch(
         `https://qswjxgjfynphxvobaitl.supabase.co/functions/v1/parse-resume`,
         {
           method: "POST",
           headers: {
             "Content-Type": "application/json",
             "Authorization": `Bearer ${session?.access_token}`,
           },
           body: JSON.stringify({
             file_url: publicUrl,
             file_name: file.name,
           }),
         }
       );
 
       if (!response.ok) {
         const errorData = await response.json();
         throw new Error(errorData.error || "Failed to parse resume");
       }
 
       return response.json();
     },
     onSuccess: () => {
       queryClient.invalidateQueries({ queryKey: ["user-resume"] });
       queryClient.invalidateQueries({ queryKey: ["job-matches"] });
       toast({
         title: "Resume uploaded",
         description: "Your skills have been extracted successfully.",
       });
     },
     onError: (error) => {
       toast({
         title: "Upload failed",
         description: error.message,
         variant: "destructive",
       });
     },
   });
 
   const updateSkills = useMutation({
     mutationFn: async (skills: string[]) => {
       if (!user) throw new Error("Not authenticated");
 
       const sanitizedSkills = validateAndSanitizeSkills(skills);
 
       const { error } = await supabase
         .from("user_resumes")
         .upsert({
           user_id: user.id,
           skills: sanitizedSkills,
           source: userResume?.source || "manual",
           updated_at: new Date().toISOString(),
         }, {
           onConflict: "user_id",
         });
 
       if (error) throw error;
     },
     onSuccess: () => {
       queryClient.invalidateQueries({ queryKey: ["user-resume"] });
       queryClient.invalidateQueries({ queryKey: ["job-matches"] });
       toast({
         title: "Skills updated",
         description: "Your skills have been saved.",
       });
     },
     onError: (error) => {
       toast({
         title: "Update failed",
         description: error.message,
         variant: "destructive",
       });
     },
   });
 
   const syncFromBuilder = useMutation({
     mutationFn: async (builderSkills: string[]) => {
       if (!user) throw new Error("Not authenticated");
 
       const sanitizedSkills = validateAndSanitizeSkills(builderSkills);
 
       const { error } = await supabase
         .from("user_resumes")
         .upsert({
           user_id: user.id,
           skills: sanitizedSkills,
           source: "builder",
           updated_at: new Date().toISOString(),
         }, {
           onConflict: "user_id",
         });
 
       if (error) throw error;
     },
     onSuccess: () => {
       queryClient.invalidateQueries({ queryKey: ["user-resume"] });
       queryClient.invalidateQueries({ queryKey: ["job-matches"] });
       toast({
         title: "Skills synced",
         description: "Your skills from the Resume Builder have been saved.",
       });
     },
     onError: (error) => {
       toast({
         title: "Sync failed",
         description: error.message,
         variant: "destructive",
       });
     },
   });
 
   return {
     userResume,
     isLoading,
     error,
     skills: userResume?.skills || [],
     hasResume: !!userResume && (userResume.skills?.length || 0) > 0,
     uploadResume,
     updateSkills,
     syncFromBuilder,
   };
 }