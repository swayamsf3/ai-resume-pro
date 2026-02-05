 import { useState, useEffect } from "react";
 import Header from "@/components/layout/Header";
 import { Input } from "@/components/ui/input";
 import { motion } from "framer-motion";
 import { Search, Sparkles, Loader2 } from "lucide-react";
 import { useAuth } from "@/hooks/useAuth";
 import { useJobMatches } from "@/hooks/useJobMatches";
 import { useSavedJobs } from "@/hooks/useSavedJobs";
 import { useUserResume } from "@/hooks/useUserResume";
 import { JobCard } from "@/components/jobs/JobCard";
 import { ResumeStatus } from "@/components/jobs/ResumeStatus";
 import { ResumeUploader } from "@/components/jobs/ResumeUploader";
 import { SkillsEditor } from "@/components/jobs/SkillsEditor";
 import { useNavigate } from "react-router-dom";
 
 const Jobs = () => {
   const { user, loading: authLoading } = useAuth();
   const navigate = useNavigate();
   const [searchQuery, setSearchQuery] = useState("");
   const [showUploader, setShowUploader] = useState(false);
   const [showSkillsEditor, setShowSkillsEditor] = useState(false);
 
   const { data: jobData, isLoading: jobsLoading } = useJobMatches();
   const { isJobSaved, toggleSaveJob } = useSavedJobs();
   const { hasResume, syncFromBuilder } = useUserResume();
 
   useEffect(() => {
     if (!authLoading && !user) {
       navigate("/auth?redirect=/jobs");
     }
   }, [user, authLoading, navigate]);
 
   const jobs = jobData?.jobs || [];
   const filteredJobs = jobs.filter((job) => {
     const query = searchQuery.toLowerCase();
     return (
       job.title.toLowerCase().includes(query) ||
       job.company.toLowerCase().includes(query) ||
       job.skills.some((skill) => skill.toLowerCase().includes(query))
     );
   });
 
   const handleSyncFromBuilder = () => {
     const builderSkills = ["react", "typescript", "javascript", "css", "html"];
     syncFromBuilder.mutate(builderSkills);
   };
 
   if (authLoading) {
     return (
       <div className="min-h-screen bg-background flex items-center justify-center">
         <Loader2 className="w-8 h-8 animate-spin text-primary" />
       </div>
     );
   }
 
   return (
     <div className="min-h-screen bg-background">
       <Header />
       <main className="pt-20 pb-12">
         <div className="container mx-auto px-4">
           {/* Header */}
           <motion.div
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             className="mb-8 text-center"
           >
             <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 mb-4">
               <Sparkles className="w-4 h-4 text-primary" />
               <span className="text-sm font-medium text-primary">AI-Powered Recommendations</span>
             </div>
             <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
               Job Recommendations
             </h1>
             <p className="text-muted-foreground max-w-xl mx-auto">
               Discover job opportunities tailored to your skills and experience
             </p>
           </motion.div>
 
           {/* Resume Status Section */}
           <motion.div
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.05 }}
           >
             {showUploader ? (
               <div className="mb-8">
                 <ResumeUploader onClose={() => setShowUploader(false)} />
               </div>
             ) : (
               <ResumeStatus
                 onUploadClick={() => setShowUploader(true)}
                 onEditSkillsClick={() => setShowSkillsEditor(true)}
                 onSyncFromBuilder={handleSyncFromBuilder}
               />
             )}
           </motion.div>
 
           {/* Search */}
           <motion.div
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.1 }}
             className="max-w-2xl mx-auto mb-8"
           >
             <div className="relative">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
               <Input
                 placeholder="Search by job title, company, or skill..."
                 className="pl-12 h-14 text-base rounded-xl border-border"
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
               />
             </div>
           </motion.div>
 
           {/* Results count */}
           <motion.div
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             transition={{ delay: 0.2 }}
             className="mb-6"
           >
             {jobsLoading ? (
               <p className="text-sm text-muted-foreground">Loading jobs...</p>
             ) : (
               <p className="text-sm text-muted-foreground">
                 Showing {filteredJobs.length} job{filteredJobs.length !== 1 ? "s" : ""}
                 {hasResume ? " matching your profile" : ""}
               </p>
             )}
           </motion.div>
 
           {/* Job Cards */}
           {jobsLoading ? (
             <div className="flex justify-center py-12">
               <Loader2 className="w-8 h-8 animate-spin text-primary" />
             </div>
           ) : (
             <div className="space-y-4">
               {filteredJobs.map((job, index) => (
                 <JobCard
                   key={job.id}
                   job={job}
                   index={index}
                   isSaved={isJobSaved(job.id)}
                   onToggleSave={() => toggleSaveJob.mutate(job.id)}
                   hasUserSkills={hasResume}
                 />
               ))}
             </div>
           )}
 
           {!jobsLoading && filteredJobs.length === 0 && (
             <motion.div
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               className="text-center py-12"
             >
               <p className="text-muted-foreground">No jobs found matching your search criteria</p>
             </motion.div>
           )}
         </div>
       </main>
 
       {/* Skills Editor Dialog */}
       <SkillsEditor
         open={showSkillsEditor}
         onOpenChange={setShowSkillsEditor}
       />
     </div>
   );
 };
 
 export default Jobs;
