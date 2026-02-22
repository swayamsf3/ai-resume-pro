 import { Card, CardContent } from "@/components/ui/card";
 import { Badge } from "@/components/ui/badge";
 import { Button } from "@/components/ui/button";
 import { motion } from "framer-motion";
 import {
   MapPin,
   Briefcase,
   Clock,
   DollarSign,
   Building2,
   ExternalLink,
   Bookmark,
   Check,
 } from "lucide-react";
 import { MatchedJob } from "@/hooks/useJobMatches";
 import { formatDistanceToNow } from "date-fns";
 
 interface JobCardProps {
   job: MatchedJob;
   index: number;
   isSaved: boolean;
   onToggleSave: () => void;
   hasUserSkills: boolean;
 }
 
 export function JobCard({ job, index, isSaved, onToggleSave, hasUserSkills }: JobCardProps) {
   const getMatchColor = (percentage: number) => {
     if (percentage >= 90) return "bg-green-500/10 text-green-600 border-green-500/20";
     if (percentage >= 70) return "bg-yellow-500/10 text-yellow-600 border-yellow-500/20";
     return "bg-muted text-muted-foreground";
   };
 
   const postedAgo = formatDistanceToNow(new Date(job.posted_at), { addSuffix: true });
 
   return (
     <motion.div
       initial={{ opacity: 0, y: 20 }}
       animate={{ opacity: 1, y: 0 }}
       transition={{ delay: Math.min(0.1 + index * 0.05, 0.5) }}
     >
       <Card className="border-border hover:border-primary/30 hover:shadow-lg transition-all duration-300 group">
         <CardContent className="p-6">
           <div className="flex flex-col lg:flex-row lg:items-start gap-4">
             {/* Company Logo Placeholder */}
             <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shrink-0">
               <Building2 className="w-7 h-7 text-primary-foreground" />
             </div>
 
             {/* Job Details */}
             <div className="flex-1 min-w-0">
               <div className="flex items-start justify-between gap-4 mb-2">
                 <div>
                   <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                     {job.title}
                   </h3>
                   <p className="text-sm text-muted-foreground">{job.company}</p>
                 </div>
                 {hasUserSkills && (
                   <Badge className={`shrink-0 ${getMatchColor(job.match_percentage)}`}>
                     {job.match_percentage}% Match
                   </Badge>
                 )}
               </div>
 
               {/* Meta info */}
               <div className="flex flex-wrap gap-3 mb-3 text-sm text-muted-foreground">
                 <span className="flex items-center gap-1">
                   <MapPin className="w-4 h-4" />
                   {job.location}
                 </span>
                 <span className="flex items-center gap-1">
                   <Briefcase className="w-4 h-4" />
                   {job.type}
                 </span>
                 {job.salary && (
                   <span className="flex items-center gap-1">
                     <DollarSign className="w-4 h-4" />
                     {job.salary}
                   </span>
                 )}
                 <span className="flex items-center gap-1">
                   <Clock className="w-4 h-4" />
                   {postedAgo}
                 </span>
               </div>
 
               {/* Skills */}
               <div className="flex flex-wrap gap-2 mb-4">
                 {job.skills.map((skill) => {
                   const isMatching = job.matching_skills.includes(skill);
                   return (
                     <Badge
                       key={skill}
                       variant={isMatching && hasUserSkills ? "default" : "secondary"}
                       className={`text-xs ${
                         isMatching && hasUserSkills
                           ? "bg-primary text-primary-foreground"
                           : ""
                       }`}
                     >
                       {isMatching && hasUserSkills && (
                         <Check className="w-3 h-3 mr-1" />
                       )}
                       {skill}
                     </Badge>
                   );
                 })}
               </div>
 
               {/* Description */}
               {job.description && (
                 <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                   {job.description}
                 </p>
               )}
 
               {/* Actions */}
               <div className="flex items-center gap-3">
                 <Button
                   variant="default"
                   size="sm"
                   className="gap-2"
                   asChild
                 >
                   <a
                     href={job.apply_url}
                     target="_blank"
                     rel="noopener noreferrer"
                   >
                     Apply Now
                     <ExternalLink className="w-4 h-4" />
                   </a>
                 </Button>
                 <Button
                   variant="outline"
                   size="sm"
                   className="gap-2"
                   onClick={onToggleSave}
                 >
                   <Bookmark
                     className={`w-4 h-4 ${isSaved ? "fill-current" : ""}`}
                   />
                   {isSaved ? "Saved" : "Save"}
                 </Button>
               </div>
             </div>
           </div>
         </CardContent>
       </Card>
     </motion.div>
   );
 }