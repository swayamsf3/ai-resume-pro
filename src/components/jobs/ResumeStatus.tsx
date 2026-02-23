import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  FileText, 
  Upload, 
  RefreshCw, 
  Edit2, 
  CheckCircle2,
  AlertCircle,
  GraduationCap,
} from "lucide-react";
import { useUserResume } from "@/hooks/useUserResume";
import type { ExperienceLevel } from "@/lib/experienceDetector";
 
 interface ResumeStatusProps {
   onUploadClick: () => void;
   onEditSkillsClick: () => void;
   onSyncFromBuilder: () => void;
 }
 
 export function ResumeStatus({
   onUploadClick,
   onEditSkillsClick,
   onSyncFromBuilder,
 }: ResumeStatusProps) {
  const { hasResume, skills, userResume, isLoading, syncFromBuilder, experienceLevel, updateExperienceLevel } = useUserResume();

  const LEVEL_LABELS: Record<ExperienceLevel, string> = {
    fresher: "Fresher",
    junior: "Junior (0-2 yrs)",
    mid: "Mid (3-5 yrs)",
    senior: "Senior (5+ yrs)",
    unknown: "Not Set",
  };
 
   if (isLoading) {
     return (
       <Card className="mb-8">
         <CardContent className="p-6">
           <div className="animate-pulse flex items-center gap-4">
             <div className="w-12 h-12 bg-muted rounded-full" />
             <div className="flex-1">
               <div className="h-4 bg-muted rounded w-1/4 mb-2" />
               <div className="h-3 bg-muted rounded w-1/2" />
             </div>
           </div>
         </CardContent>
       </Card>
     );
   }
 
   return (
     <Card className="mb-8 border-border">
       <CardContent className="p-6">
         <div className="flex flex-col lg:flex-row lg:items-start gap-4">
           {/* Status Icon */}
           <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${
             hasResume ? "bg-green-500/10" : "bg-muted"
           }`}>
             {hasResume ? (
               <CheckCircle2 className="w-6 h-6 text-green-600" />
             ) : (
               <AlertCircle className="w-6 h-6 text-muted-foreground" />
             )}
           </div>
 
           {/* Content */}
           <div className="flex-1">
             <h3 className="text-lg font-semibold mb-1">
               {hasResume ? "Your Skills Profile" : "Add Your Skills"}
             </h3>
             <p className="text-sm text-muted-foreground mb-4">
               {hasResume
                 ? `${skills.length} skills detected from your ${userResume?.source === "builder" ? "Resume Builder" : "uploaded resume"}`
                 : "Upload a resume or sync from Resume Builder to get personalized job matches"}
             </p>
 
              {/* Experience Level Selector */}
              {hasResume && (
                <div className="flex items-center gap-2 mb-4">
                  <GraduationCap className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Experience:</span>
                  <Select
                    value={experienceLevel}
                    onValueChange={(val) => updateExperienceLevel.mutate(val as ExperienceLevel)}
                  >
                    <SelectTrigger className="w-[180px] h-8 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(Object.entries(LEVEL_LABELS) as [ExperienceLevel, string][])
                        .filter(([k]) => k !== "unknown")
                        .map(([value, label]) => (
                          <SelectItem key={value} value={value}>{label}</SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  {experienceLevel === "fresher" && (
                    <Badge variant="secondary" className="text-xs">Fresher-friendly jobs prioritized</Badge>
                  )}
                </div>
              )}

              {/* Skills Badges */}
              {hasResume && skills.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {skills.slice(0, 10).map((skill) => (
                    <Badge key={skill} variant="secondary" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                  {skills.length > 10 && (
                    <Badge variant="outline" className="text-xs">
                      +{skills.length - 10} more
                    </Badge>
                  )}
                </div>
              )}
 
             {/* Actions */}
             <div className="flex flex-wrap gap-2">
               <Button
                 variant={hasResume ? "outline" : "default"}
                 size="sm"
                 onClick={onUploadClick}
                 className="gap-2"
               >
                 <Upload className="w-4 h-4" />
                 {hasResume ? "Upload New Resume" : "Upload Resume"}
               </Button>
               <Button
                 variant="outline"
                 size="sm"
                 onClick={onSyncFromBuilder}
                 className="gap-2"
                 disabled={syncFromBuilder.isPending}
               >
                 <RefreshCw className={`w-4 h-4 ${syncFromBuilder.isPending ? "animate-spin" : ""}`} />
                 Sync from Builder
               </Button>
               {hasResume && (
                 <Button
                   variant="ghost"
                   size="sm"
                   onClick={onEditSkillsClick}
                   className="gap-2"
                 >
                   <Edit2 className="w-4 h-4" />
                   Edit Skills
                 </Button>
               )}
             </div>
           </div>
         </div>
       </CardContent>
     </Card>
   );
 }