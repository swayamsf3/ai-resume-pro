import Header from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { 
  FileText, 
  Briefcase, 
  TrendingUp, 
  Plus,
  Eye,
  Download,
  Clock
} from "lucide-react";

const Dashboard = () => {
  // Mock data - will be replaced with real user data
  const stats = [
    { label: "Resumes Created", value: "3", icon: FileText, color: "text-primary" },
    { label: "Jobs Applied", value: "12", icon: Briefcase, color: "text-accent" },
    { label: "Profile Views", value: "48", icon: TrendingUp, color: "text-green-500" },
  ];

  const recentResumes = [
    { id: 1, name: "Software Engineer Resume", updatedAt: "2 hours ago", views: 24 },
    { id: 2, name: "Frontend Developer Resume", updatedAt: "1 day ago", views: 15 },
    { id: 3, name: "Full Stack Resume", updatedAt: "3 days ago", views: 32 },
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
                          {stat.value}
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
            {/* Recent Resumes */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="border-border">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="font-display text-xl">My Resumes</CardTitle>
                  <Link to="/builder">
                    <Button variant="default" size="sm" className="gap-2">
                      <Plus className="w-4 h-4" />
                      Create New
                    </Button>
                  </Link>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentResumes.map((resume) => (
                      <div
                        key={resume.id}
                        className="flex items-center justify-between p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors group"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-lg bg-gradient-primary flex items-center justify-center">
                            <FileText className="w-5 h-5 text-primary-foreground" />
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{resume.name}</p>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {resume.updatedAt}
                              </span>
                              <span className="flex items-center gap-1">
                                <Eye className="w-3 h-3" />
                                {resume.views} views
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Download className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
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

                  <div className="p-4 rounded-xl border border-border hover:border-green-500/50 hover:bg-green-500/5 transition-all cursor-pointer group">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                        <TrendingUp className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground group-hover:text-green-600 transition-colors">
                          Improve Profile
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Get tips to enhance your profile visibility
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
