import Header from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useUserResume } from "@/hooks/useUserResume";
import { formatDistanceToNow } from "date-fns";
import { toast } from "@/hooks/use-toast";
import { 
  FileText, 
  Briefcase, 
  TrendingUp, 
  Plus,
  Download,
  Trash2,
  Clock,
  Loader2
} from "lucide-react";

const Dashboard = () => {
  const { user } = useAuth();
  const { userResume, skills, hasResume, isLoading: resumeLoading } = useUserResume();
  const queryClient = useQueryClient();

  const { data: savedJobsCount = 0, isLoading: savedLoading } = useQuery({
    queryKey: ["saved-jobs-count", user?.id],
    queryFn: async () => {
      if (!user) return 0;
      const { count, error } = await supabase
        .from("saved_jobs")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id);
      if (error) throw error;
      return count ?? 0;
    },
    enabled: !!user,
  });

  const { data: generatedResumes = [], isLoading: resumesLoading } = useQuery({
    queryKey: ["generated-resumes", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase.storage
        .from("generated-resumes")
        .list(user.id, { sortBy: { column: "created_at", order: "desc" } });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!user,
  });

  const handleDownloadResume = async (fileName: string) => {
    if (!user) return;
    const { data, error } = await supabase.storage
      .from("generated-resumes")
      .createSignedUrl(`${user.id}/${fileName}`, 60);
    if (error || !data?.signedUrl) {
      toast({ title: "Download failed", variant: "destructive" });
      return;
    }
    window.open(data.signedUrl, "_blank");
  };

  const handleDeleteResume = async (fileName: string) => {
    if (!user) return;
    const { error } = await supabase.storage
      .from("generated-resumes")
      .remove([`${user.id}/${fileName}`]);
    if (error) {
      toast({ title: "Delete failed", variant: "destructive" });
      return;
    }
    toast({ title: "Resume deleted" });
    queryClient.invalidateQueries({ queryKey: ["generated-resumes", user.id] });
  };

  const isLoading = resumeLoading || savedLoading;

  const stats = [
    { label: "Skills Detected", value: String(skills.length), icon: FileText, color: "text-primary" },
    { label: "Jobs Saved", value: String(savedJobsCount), icon: Briefcase, color: "text-accent" },
    { label: "Resume Source", value: hasResume ? (userResume?.source === "builder" ? "Builder" : "Upload") : "None", icon: TrendingUp, color: "text-green-500" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-20 pb-12">
        <div className="container mx-auto px-4">
          {/* Welcome Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-display font-bold text-foreground mb-2">
              Welcome back! 👋
            </h1>
            <p className="text-muted-foreground">
              Here's an overview of your resume building journey
            </p>
          </motion.div>

          {/* Stats Grid */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="border-border hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                        <p className="text-3xl font-display font-bold text-foreground">
                          {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : stat.value}
                        </p>
                      </div>
                      <div className={`w-12 h-12 rounded-xl bg-muted flex items-center justify-center ${stat.color}`}>
                        <stat.icon className="w-6 h-6" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Main Content Grid */}
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Resume Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="border-border">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="font-display text-xl">My Resume</CardTitle>
                  <Link to="/builder">
                    <Button variant="default" size="sm" className="gap-2">
                      <Plus className="w-4 h-4" />
                      {hasResume ? "Edit" : "Create"}
                    </Button>
                  </Link>
                </CardHeader>
                <CardContent>
                  {resumeLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : hasResume ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-lg bg-gradient-primary flex items-center justify-center">
                            <FileText className="w-5 h-5 text-primary-foreground" />
                          </div>
                          <div>
                            <p className="font-medium text-foreground">
                              {userResume?.resume_file_name || "Skills Profile"}
                            </p>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {userResume?.updated_at
                                  ? formatDistanceToNow(new Date(userResume.updated_at), { addSuffix: true })
                                  : "Recently"}
                              </span>
                              <span className="flex items-center gap-1">
                                <TrendingUp className="w-3 h-3" />
                                {skills.length} skills
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      {/* Top skills preview */}
                      {skills.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {skills.slice(0, 8).map((skill) => (
                            <span
                              key={skill}
                              className="px-2.5 py-1 rounded-md bg-primary/10 text-primary text-xs font-medium"
                            >
                              {skill}
                            </span>
                          ))}
                          {skills.length > 8 && (
                            <span className="px-2.5 py-1 rounded-md bg-muted text-muted-foreground text-xs">
                              +{skills.length - 8} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <FileText className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
                      <p className="text-muted-foreground mb-4">No resume yet. Create one to get started!</p>
                      <Link to="/builder">
                        <Button variant="default" size="sm" className="gap-2">
                          <Plus className="w-4 h-4" />
                          Create Resume
                        </Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="border-border">
                <CardHeader>
                  <CardTitle className="font-display text-xl">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Link to="/builder" className="block">
                    <div className="p-4 rounded-xl border border-border hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer group">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center group-hover:shadow-glow transition-shadow">
                          <FileText className="w-6 h-6 text-primary-foreground" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                            Build New Resume
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Create a professional resume with AI assistance
                          </p>
                        </div>
                      </div>
                    </div>
                  </Link>

                  <Link to="/jobs" className="block">
                    <div className="p-4 rounded-xl border border-border hover:border-accent/50 hover:bg-accent/5 transition-all cursor-pointer group">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-accent flex items-center justify-center group-hover:shadow-accent-glow transition-shadow">
                          <Briefcase className="w-6 h-6 text-accent-foreground" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground group-hover:text-accent transition-colors">
                            Find Jobs
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Get AI-powered job recommendations
                          </p>
                        </div>
                      </div>
                    </div>
                  </Link>

                  <Link to="/profile" className="block">
                    <div className="p-4 rounded-xl border border-border hover:border-green-500/50 hover:bg-green-500/5 transition-all cursor-pointer group">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                          <TrendingUp className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground group-hover:text-green-600 transition-colors">
                            Edit Profile
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Update your name, email, and account settings
                          </p>
                        </div>
                      </div>
                    </div>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Saved Generated Resumes */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-8"
          >
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="font-display text-xl">My Generated Resumes</CardTitle>
              </CardHeader>
              <CardContent>
                {resumesLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                  </div>
                ) : generatedResumes.length === 0 ? (
                  <p className="text-muted-foreground text-center py-6">
                    No generated resumes yet. Build a resume and download the PDF to save it here.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {generatedResumes.map((file) => (
                      <div
                        key={file.name}
                        className="flex items-center justify-between p-3 rounded-xl bg-muted/50"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                            <FileText className="w-4 h-4 text-primary" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">
                              {file.name.replace(/^\d+_/, "")}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {file.created_at
                                ? formatDistanceToNow(new Date(file.created_at), { addSuffix: true })
                                : ""}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleDownloadResume(file.name)}
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => handleDeleteResume(file.name)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
