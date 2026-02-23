import { useState, useEffect } from "react";
import Header from "@/components/layout/Header";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Search, Sparkles, Loader2, MapPin, Bookmark } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { useJobMatches } from "@/hooks/useJobMatches";
import { useSavedJobs } from "@/hooks/useSavedJobs";
import { useUserResume } from "@/hooks/useUserResume";
import { useAdminJobs } from "@/hooks/useAdminJobs";
import { JobCard } from "@/components/jobs/JobCard";
import { ResumeStatus } from "@/components/jobs/ResumeStatus";
import { ResumeUploader } from "@/components/jobs/ResumeUploader";
import { SkillsEditor } from "@/components/jobs/SkillsEditor";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
 
const JOBS_PER_PAGE = 20;

const Jobs = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [showUploader, setShowUploader] = useState(false);
  const [showSkillsEditor, setShowSkillsEditor] = useState(false);
  const [minMatchPercentage, setMinMatchPercentage] = useState(0);
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [showSavedOnly, setShowSavedOnly] = useState(
    searchParams.get("filter") === "saved"
  );
  const [visibleCount, setVisibleCount] = useState(JOBS_PER_PAGE);

  const { data: jobData, isLoading: jobsLoading } = useJobMatches();
  const { savedJobIds, isJobSaved, toggleSaveJob } = useSavedJobs();
  const { hasResume, syncFromBuilder } = useUserResume();
  const { deleteMutation } = useAdminJobs();
  const isAdmin = user?.email === "swayamyawalkar54@gmail.com";
 
   useEffect(() => {
     if (!authLoading && !user) {
       navigate("/auth?redirect=/jobs");
     }
   }, [user, authLoading, navigate]);
 
  const jobs = jobData?.jobs || [];

  // Extract unique cities from job locations
  const locationCities = Array.from(
    new Set(
      jobs.map((job) => {
        const parts = job.location.split(",").map((s) => s.trim());
        return parts[0];
      }).filter(Boolean)
    )
  ).sort();

  // Reset pagination when filters change
  useEffect(() => {
    setVisibleCount(JOBS_PER_PAGE);
  }, [searchQuery, selectedLocation, minMatchPercentage, showSavedOnly]);

  const filteredJobs = jobs.filter((job) => {
    // Saved filter
    if (showSavedOnly && !savedJobIds.includes(job.id)) {
      return false;
    }

    // Match percentage filter
    if (hasResume && job.match_percentage < minMatchPercentage) {
      return false;
    }

    // Location filter
    if (selectedLocation !== "all") {
      const city = job.location.split(",")[0]?.trim();
      if (city !== selectedLocation) return false;
    }
    
    // Text search filter
    const query = searchQuery.toLowerCase();
    return (
      job.title.toLowerCase().includes(query) ||
      job.company.toLowerCase().includes(query) ||
      job.skills.some((skill) => skill.toLowerCase().includes(query))
    );
  });

  const handleSyncFromBuilder = () => {
    const savedSkills = localStorage.getItem('builderSkills');
    if (savedSkills) {
      try {
        const builderSkills = JSON.parse(savedSkills);
        if (Array.isArray(builderSkills) && builderSkills.length > 0) {
          syncFromBuilder.mutate(builderSkills);
        } else {
          toast({
            title: "No skills found",
            description: "Add skills in the Resume Builder first.",
            variant: "destructive",
          });
        }
      } catch {
        toast({
          title: "Sync failed",
          description: "Could not read skills from Resume Builder.",
          variant: "destructive",
        });
      }
    } else {
      toast({
        title: "No skills found",
        description: "Build your resume first to sync skills.",
        variant: "destructive",
      });
    }
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
             <div className="flex gap-3">
                 <div className="relative flex-1">
                   <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                   <Input
                     placeholder="Search by job title, company, or skill..."
                     className="pl-12 h-14 text-base rounded-xl border-border"
                     value={searchQuery}
                     onChange={(e) => setSearchQuery(e.target.value)}
                   />
                 </div>
                 <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                   <SelectTrigger className="w-[180px] h-14 rounded-xl border-border">
                     <MapPin className="w-4 h-4 mr-2 text-muted-foreground" />
                     <SelectValue placeholder="All Locations" />
                   </SelectTrigger>
                   <SelectContent>
                     <SelectItem value="all">All Locations</SelectItem>
                     {locationCities.map((city) => (
                       <SelectItem key={city} value={city}>{city}</SelectItem>
                     ))}
                   </SelectContent>
                 </Select>
               </div>
              
               {/* Filter Buttons */}
               <div className="flex flex-wrap gap-2 mt-4 justify-center">
                 <Button
                   variant={showSavedOnly ? "default" : "outline"}
                   size="sm"
                   className="gap-2"
                   onClick={() => setShowSavedOnly(!showSavedOnly)}
                 >
                   <Bookmark className={`w-4 h-4 ${showSavedOnly ? "fill-current" : ""}`} />
                   Saved Jobs
                 </Button>
                 {hasResume && (
                   <>
                     {[
                       { label: "All Jobs", value: 0 },
                       { label: "50%+", value: 50 },
                       { label: "60%+", value: 60 },
                       { label: "70%+", value: 70 },
                     ].map((filter) => (
                       <Button
                         key={filter.value}
                         variant={minMatchPercentage === filter.value ? "default" : "outline"}
                         size="sm"
                         onClick={() => setMinMatchPercentage(filter.value)}
                       >
                         {filter.label}
                       </Button>
                     ))}
                   </>
                 )}
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
                  {jobData?.experience_level === "fresher" ? " · Fresher-friendly jobs prioritized" : ""}
                </p>
             )}
           </motion.div>
 
            {/* Job Cards */}
            {jobsLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="rounded-xl border border-border p-6 space-y-3">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2 flex-1">
                        <div className="h-5 w-2/3 bg-muted animate-pulse rounded" />
                        <div className="h-4 w-1/3 bg-muted animate-pulse rounded" />
                      </div>
                      <div className="h-8 w-16 bg-muted animate-pulse rounded-full" />
                    </div>
                    <div className="flex gap-2">
                      <div className="h-6 w-20 bg-muted animate-pulse rounded" />
                      <div className="h-6 w-24 bg-muted animate-pulse rounded" />
                      <div className="h-6 w-16 bg-muted animate-pulse rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredJobs.slice(0, visibleCount).map((job, index) => (
                  <JobCard
                    key={job.id}
                    job={job}
                    index={index}
                    isSaved={isJobSaved(job.id)}
                    onToggleSave={() => toggleSaveJob.mutate(job.id)}
                    hasUserSkills={hasResume}
                    onDelete={isAdmin ? () => deleteMutation.mutate(job.id) : undefined}
                    isDeleting={isAdmin && deleteMutation.isPending && deleteMutation.variables === job.id}
                  />
                ))}
                {visibleCount < filteredJobs.length && (
                  <div className="flex justify-center pt-4">
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={() => setVisibleCount((c) => c + JOBS_PER_PAGE)}
                    >
                      Load More ({filteredJobs.length - visibleCount} remaining)
                    </Button>
                  </div>
                )}
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
