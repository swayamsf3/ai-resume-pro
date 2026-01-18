import { useState } from "react";
import Header from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { 
  Search, 
  MapPin, 
  Briefcase, 
  Clock, 
  DollarSign,
  Building2,
  Sparkles,
  ExternalLink,
  Bookmark
} from "lucide-react";

// Mock job data - will be replaced with AI recommendations
const mockJobs = [
  {
    id: "1",
    title: "Senior Frontend Developer",
    company: "TechCorp Inc.",
    location: "San Francisco, CA",
    type: "Full-time",
    salary: "$120k - $160k",
    posted: "2 days ago",
    skills: ["React", "TypeScript", "Node.js", "GraphQL"],
    match: 95,
    description: "We're looking for a Senior Frontend Developer to join our growing team...",
  },
  {
    id: "2",
    title: "Full Stack Engineer",
    company: "StartupXYZ",
    location: "Remote",
    type: "Full-time",
    salary: "$100k - $140k",
    posted: "1 week ago",
    skills: ["React", "Python", "AWS", "PostgreSQL"],
    match: 88,
    description: "Join our mission to revolutionize the industry with cutting-edge technology...",
  },
  {
    id: "3",
    title: "React Developer",
    company: "Digital Agency Pro",
    location: "New York, NY",
    type: "Contract",
    salary: "$80/hr",
    posted: "3 days ago",
    skills: ["React", "JavaScript", "CSS", "Tailwind"],
    match: 82,
    description: "Looking for a talented React developer to work on exciting client projects...",
  },
  {
    id: "4",
    title: "Software Engineer II",
    company: "Enterprise Solutions Ltd",
    location: "Austin, TX",
    type: "Full-time",
    salary: "$110k - $150k",
    posted: "5 days ago",
    skills: ["JavaScript", "Java", "Microservices", "Docker"],
    match: 78,
    description: "Build scalable enterprise solutions that power businesses worldwide...",
  },
  {
    id: "5",
    title: "Frontend Web Developer",
    company: "Creative Studio",
    location: "Remote",
    type: "Part-time",
    salary: "$50/hr",
    posted: "1 day ago",
    skills: ["HTML", "CSS", "JavaScript", "Vue.js"],
    match: 75,
    description: "Create beautiful, responsive websites for our diverse portfolio of clients...",
  },
];

const Jobs = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [savedJobs, setSavedJobs] = useState<string[]>([]);

  const toggleSaveJob = (jobId: string) => {
    setSavedJobs((prev) =>
      prev.includes(jobId) ? prev.filter((id) => id !== jobId) : [...prev, jobId]
    );
  };

  const filteredJobs = mockJobs.filter(
    (job) =>
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.skills.some((skill) => skill.toLowerCase().includes(searchQuery.toLowerCase()))
  );

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
            <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-2">
              Job Recommendations
            </h1>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Discover job opportunities tailored to your skills and experience
            </p>
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
            <p className="text-sm text-muted-foreground">
              Showing {filteredJobs.length} job{filteredJobs.length !== 1 ? "s" : ""} matching your profile
            </p>
          </motion.div>

          {/* Job Cards */}
          <div className="space-y-4">
            {filteredJobs.map((job, index) => (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.05 }}
              >
                <Card className="border-border hover:border-primary/30 hover:shadow-lg transition-all duration-300 group">
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                      {/* Company Logo Placeholder */}
                      <div className="w-14 h-14 rounded-xl bg-gradient-primary flex items-center justify-center shrink-0">
                        <Building2 className="w-7 h-7 text-primary-foreground" />
                      </div>

                      {/* Job Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <div>
                            <h3 className="text-lg font-display font-semibold text-foreground group-hover:text-primary transition-colors">
                              {job.title}
                            </h3>
                            <p className="text-sm text-muted-foreground">{job.company}</p>
                          </div>
                          <Badge
                            className="shrink-0 bg-primary/10 text-primary hover:bg-primary/20"
                          >
                            {job.match}% Match
                          </Badge>
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
                          <span className="flex items-center gap-1">
                            <DollarSign className="w-4 h-4" />
                            {job.salary}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {job.posted}
                          </span>
                        </div>

                        {/* Skills */}
                        <div className="flex flex-wrap gap-2 mb-4">
                          {job.skills.map((skill) => (
                            <Badge key={skill} variant="secondary" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                        </div>

                        {/* Description */}
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                          {job.description}
                        </p>

                        {/* Actions */}
                        <div className="flex items-center gap-3">
                          <Button variant="default" size="sm" className="gap-2">
                            Apply Now
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-2"
                            onClick={() => toggleSaveJob(job.id)}
                          >
                            <Bookmark
                              className={`w-4 h-4 ${
                                savedJobs.includes(job.id) ? "fill-current" : ""
                              }`}
                            />
                            {savedJobs.includes(job.id) ? "Saved" : "Save"}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {filteredJobs.length === 0 && (
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
    </div>
  );
};

export default Jobs;
