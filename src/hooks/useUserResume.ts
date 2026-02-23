import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "@/hooks/use-toast";
import { extractTextFromPDF } from "@/lib/pdfTextExtractor";
import { extractTextWithOCR } from "@/lib/ocrExtractor";
import { extractSkillsFromText } from "@/lib/skillExtractor";
import { detectExperienceLevel, type ExperienceLevel } from "@/lib/experienceDetector";

const MAX_SKILLS = 100;
const MAX_SKILL_LENGTH = 50;

function validateAndSanitizeSkills(skills: string[]): string[] {
  return skills
    .map(s => s.toLowerCase().trim().substring(0, MAX_SKILL_LENGTH))
    .filter(s => s.length > 0)
    .filter((s, i, arr) => arr.indexOf(s) === i)
    .slice(0, MAX_SKILLS);
}

interface UserResume {
  id: string;
  user_id: string;
  resume_file_url: string | null;
  resume_file_name: string | null;
  skills: string[];
  source: string;
  experience_level: ExperienceLevel;
  raw_data: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export type UploadStatus = "idle" | "extracting" | "ocr" | "matching" | "uploading" | "saving";

export function useUserResume() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>("idle");

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

      // Step 1: Extract text from PDF
      setUploadStatus("extracting");
      let text = "";
      try {
        text = await extractTextFromPDF(file);
        console.log(`[Resume Upload] PDF extraction: ${text.length} chars. Preview: ${text.substring(0, 200)}`);
      } catch (e) {
        console.warn("[Resume Upload] PDF text extraction failed, will try OCR:", e);
      }

      // Step 2: OCR fallback if text is too short
      if (text.trim().length < 50) {
        console.log(`[Resume Upload] Text too short (${text.trim().length} chars), falling back to OCR`);
        setUploadStatus("ocr");
        try {
          text = await extractTextWithOCR(file);
          console.log(`[Resume Upload] OCR extraction: ${text.length} chars. Preview: ${text.substring(0, 200)}`);
        } catch (e) {
          console.warn("[Resume Upload] OCR extraction failed:", e);
        }
      }

      // Step 3: Extract skills & experience level
      setUploadStatus("matching");
      const skills = extractSkillsFromText(text);
      const experienceLevel = detectExperienceLevel(text);
      console.log(`[Resume Upload] Detected ${skills.length} skills, experience: ${experienceLevel}`);

      // Step 4: Upload file to storage for record-keeping
      setUploadStatus("uploading");
      const fileExt = file.name.split(".").pop();
      const filePath = `${user.id}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from("resumes")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("resumes")
        .getPublicUrl(filePath);

      // Step 5: Save to database
      setUploadStatus("saving");
      const { error: upsertError } = await supabase
        .from("user_resumes")
        .upsert({
          user_id: user.id,
          resume_file_url: publicUrl,
          resume_file_name: file.name,
          skills: validateAndSanitizeSkills(skills),
          source: "upload",
          experience_level: experienceLevel,
          raw_data: { extracted_text: text.substring(0, 5000) } as any,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: "user_id",
        });

      if (upsertError) throw upsertError;

      return { skills, text };
    },
    onSuccess: (data) => {
      setUploadStatus("idle");
      queryClient.invalidateQueries({ queryKey: ["user-resume"] });
      queryClient.invalidateQueries({ queryKey: ["job-matches"] });
      toast({
        title: "Resume uploaded",
        description: `Extracted ${data.skills.length} skills from your resume.`,
      });
    },
    onError: (error) => {
      setUploadStatus("idle");
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

  const updateExperienceLevel = useMutation({
    mutationFn: async (level: ExperienceLevel) => {
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("user_resumes")
        .upsert({
          user_id: user.id,
          experience_level: level,
          skills: userResume?.skills || [],
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
        title: "Experience level updated",
        description: "Your job recommendations will now be tailored accordingly.",
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

  return {
    userResume,
    isLoading,
    error,
    skills: userResume?.skills || [],
    experienceLevel: (userResume?.experience_level || "unknown") as ExperienceLevel,
    hasResume: !!userResume && (userResume.skills?.length || 0) > 0,
    uploadResume,
    uploadStatus,
    updateSkills,
    updateExperienceLevel,
    syncFromBuilder,
  };
}
