import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useAdminJobs } from "@/hooks/useAdminJobs";
import { toast } from "@/hooks/use-toast";
import Header from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from "@/components/ui/table";
import { Loader2, Play, Database, Activity, Layers } from "lucide-react";
import { motion } from "framer-motion";

const ADMIN_EMAIL = "admin@swayam.com";

const AdminJobs = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { jobsQuery, ingestMutation } = useAdminJobs();
  const [secret, setSecret] = useState("");

  useEffect(() => {
    if (!authLoading && user?.email !== ADMIN_EMAIL) {
      toast({ title: "Access denied", description: "You are not authorized to view this page.", variant: "destructive" });
      navigate("/dashboard", { replace: true });
    }
  }, [authLoading, user, navigate]);

  const stats = useMemo(() => {
    const jobs = jobsQuery.data ?? [];
    const manual = jobs.filter((j) => j.source === "manual").length;
    const feed = jobs.filter((j) => j.source === "employer_feed").length;
    const active = jobs.filter((j) => j.is_active).length;
    const inactive = jobs.length - active;
    return { total: jobs.length, manual, feed, active, inactive };
  }, [jobsQuery.data]);

  if (authLoading || user?.email !== ADMIN_EMAIL) return null;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 pt-24 pb-12 space-y-8">
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-display font-bold text-foreground"
        >
          Admin — Job Ingestion
        </motion.h1>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total Jobs", value: stats.total, icon: Database },
            { label: "Manual", value: stats.manual, icon: Layers },
            { label: "Employer Feed", value: stats.feed, icon: Activity },
            { label: "Active / Inactive", value: `${stats.active} / ${stats.inactive}`, icon: Activity },
          ].map((s) => (
            <Card key={s.label}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{s.label}</CardTitle>
                <s.icon className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-foreground">{s.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Ingestion Trigger */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Trigger Ingestion</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row gap-3">
            <Input
              type="password"
              placeholder="INGEST_SECRET"
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              className="sm:max-w-xs"
            />
            <Button
              onClick={() => ingestMutation.mutate(secret)}
              disabled={!secret || ingestMutation.isPending}
              className="gap-2"
            >
              {ingestMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
              Run Ingestion
            </Button>
          </CardContent>
        </Card>

        {/* Jobs Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Jobs</CardTitle>
          </CardHeader>
          <CardContent>
            {jobsQuery.isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead className="hidden md:table-cell">Location</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead className="hidden lg:table-cell">External ID</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="hidden md:table-cell">Posted</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(jobsQuery.data ?? []).map((job) => (
                    <TableRow key={job.id}>
                      <TableCell className="font-medium">{job.title}</TableCell>
                      <TableCell>{job.company}</TableCell>
                      <TableCell className="hidden md:table-cell">{job.location}</TableCell>
                      <TableCell>
                        <Badge variant={job.source === "manual" ? "secondary" : "default"}>
                          {job.source}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-muted-foreground text-xs">
                        {job.external_id ?? "—"}
                      </TableCell>
                      <TableCell>
                        <Badge variant={job.is_active ? "default" : "destructive"}>
                          {job.is_active ? "active" : "inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-muted-foreground text-xs">
                        {new Date(job.posted_at).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default AdminJobs;
