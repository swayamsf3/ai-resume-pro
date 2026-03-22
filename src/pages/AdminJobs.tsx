import { useEffect, useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useAdminJobs } from "@/hooks/useAdminJobs";
import { toast } from "@/hooks/use-toast";
import Header from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from "@/components/ui/table";
import { Loader2, Play, Database, Activity, Layers, Globe, Search, Trash2, Building2, CheckCircle, XCircle, Ban, ScanSearch, ChevronLeft, ChevronRight } from "lucide-react";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { motion } from "framer-motion";

const ADMIN_EMAIL = "swayamyawalkar54@gmail.com";

const AdminJobs = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { jobsQuery, ingestMutation, jsearchMutation, atsMutation, deactivateMutation, deleteMutation, bulkDeleteInactiveMutation, scanOldJobsMutation } = useAdminJobs();
  const [secret, setSecret] = useState("");
  const [seedMode, setSeedMode] = useState(false);
  const [jsearchSeedMode, setJsearchSeedMode] = useState(false);
  const [sourceFilter, setSourceFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedJobs, setSelectedJobs] = useState<Set<string>>(new Set());
  const [scanMaxDays, setScanMaxDays] = useState(30);
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 100;

  const toggleJob = useCallback((id: string) => {
    setSelectedJobs((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);


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
    const adzunaMuse = jobs.filter((j) => j.source === "adzuna" || j.source === "themuse").length;
    const jsearch = jobs.filter((j) => j.source === "jsearch").length;
    const ats = jobs.filter((j) => j.source.startsWith("greenhouse_") || j.source.startsWith("lever_")).length;
    const active = jobs.filter((j) => j.is_active).length;
    const inactive = jobs.length - active;
    return { total: jobs.length, manual, feed, adzunaMuse, jsearch, ats, active, inactive };
  }, [jobsQuery.data]);

  const filteredJobs = useMemo(() => {
    let jobs = jobsQuery.data ?? [];
    // Source filter
    if (sourceFilter === "real_api") jobs = jobs.filter((j) => j.source === "adzuna" || j.source === "themuse" || j.source === "jsearch");
    else if (sourceFilter === "ats") jobs = jobs.filter((j) => j.source.startsWith("greenhouse_") || j.source.startsWith("lever_"));
    else if (sourceFilter !== "all") jobs = jobs.filter((j) => j.source === sourceFilter);
    // Status filter
    if (statusFilter === "active") jobs = jobs.filter((j) => j.is_active);
    else if (statusFilter === "inactive") jobs = jobs.filter((j) => !j.is_active);
    // Deduplicate by id
    const seen = new Set<string>();
    return jobs.filter((j) => {
      if (seen.has(j.id)) return false;
      seen.add(j.id);
      return true;
    });
  }, [jobsQuery.data, sourceFilter, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredJobs.length / PAGE_SIZE));
  const paginatedJobs = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredJobs.slice(start, start + PAGE_SIZE);
  }, [filteredJobs, currentPage, PAGE_SIZE]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [sourceFilter, statusFilter]);

  const toggleAll = useCallback(() => {
    setSelectedJobs((prev) => {
      const activeFiltered = filteredJobs.filter((j) => j.is_active);
      if (prev.size === activeFiltered.length && activeFiltered.every((j) => prev.has(j.id))) {
        return new Set();
      }
      return new Set(activeFiltered.map((j) => j.id));
    });
  }, [filteredJobs]);


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

        {/* Stats + Remove Inactive */}
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            {[
              { label: "Total Jobs", value: stats.total, icon: Database },
              { label: "Active", value: stats.active, icon: CheckCircle },
              { label: "Inactive", value: stats.inactive, icon: XCircle },
              { label: "Adzuna + Muse", value: stats.adzunaMuse, icon: Globe },
              { label: "JSearch", value: stats.jsearch, icon: Search },
              { label: "ATS (GH+Lever)", value: stats.ats, icon: Building2 },
              { label: "Employer Feed", value: stats.feed, icon: Activity },
              { label: "Manual", value: stats.manual, icon: Layers },
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

          {stats.inactive > 0 && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  className="gap-2 w-fit"
                  disabled={bulkDeleteInactiveMutation.isPending}
                >
                  {bulkDeleteInactiveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  Remove All Inactive Jobs ({stats.inactive})
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete all {stats.inactive} inactive jobs?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently remove all inactive jobs from the database. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => bulkDeleteInactiveMutation.mutate()}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Delete All Inactive
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
        )}

        {/* Scan Old Jobs */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <ScanSearch className="w-5 h-5" />
              Scan & Deactivate Old Jobs
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <p className="text-sm text-muted-foreground">
              Deactivate all active jobs posted more than X days ago. Use Seed Mode ingestion to also re-check sources and deactivate jobs no longer found.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min={1}
                  max={365}
                  value={scanMaxDays}
                  onChange={(e) => setScanMaxDays(Number(e.target.value) || 30)}
                  className="w-20"
                />
                <span className="text-sm text-muted-foreground whitespace-nowrap">days old</span>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="secondary"
                    className="gap-2"
                    disabled={scanOldJobsMutation.isPending}
                  >
                    {scanOldJobsMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <ScanSearch className="w-4 h-4" />}
                    Scan Jobs
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Deactivate jobs older than {scanMaxDays} days?</AlertDialogTitle>
                    <AlertDialogDescription>
                      All active jobs posted more than {scanMaxDays} days ago will be marked as inactive. They can still be deleted later.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => scanOldJobsMutation.mutate(scanMaxDays)}>
                      Scan & Deactivate
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>
        </div>

        {/* Ingestion Trigger */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Trigger Ingestion</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <div className="flex flex-col sm:flex-row gap-3">
              <Input
                type="password"
                placeholder="INGEST_SECRET"
                value={secret}
                onChange={(e) => setSecret(e.target.value)}
                className="sm:max-w-xs"
              />
              <Button
                onClick={() => ingestMutation.mutate({ secret, seedMode })}
                disabled={!secret || ingestMutation.isPending}
                className="gap-2"
              >
                {ingestMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                {seedMode ? "Run Seed Ingestion" : "Run Daily Ingestion"}
              </Button>
            </div>
            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              <input
                type="checkbox"
                checked={seedMode}
                onChange={(e) => setSeedMode(e.target.checked)}
                className="rounded"
              />
              Seed Mode (bulk load 4,000+ jobs — can only run once per 7 days)
            </label>
          </CardContent>
        </Card>

        {/* JSearch Ingestion Trigger */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Search className="w-5 h-5" />
              JSearch Ingestion
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <div className="flex flex-col sm:flex-row gap-3">
              <Input
                type="password"
                placeholder="INGEST_SECRET"
                value={secret}
                onChange={(e) => setSecret(e.target.value)}
                className="sm:max-w-xs"
              />
              <Button
                onClick={() => jsearchMutation.mutate({ secret, seedMode: jsearchSeedMode })}
                disabled={!secret || jsearchMutation.isPending}
                variant="secondary"
                className="gap-2"
              >
                {jsearchMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                {jsearchSeedMode ? "Run JSearch Seed" : "Run JSearch Daily"}
              </Button>
            </div>
            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              <input
                type="checkbox"
                checked={jsearchSeedMode}
                onChange={(e) => setJsearchSeedMode(e.target.checked)}
                className="rounded"
              />
              Seed Mode (5 queries x 3 pages — up to 15 API requests, 3-day cooldown)
            </label>
            <p className="text-xs text-muted-foreground">
              Fetches jobs from JSearch (RapidAPI) independently. Free tier: 500 requests/month.
            </p>
          </CardContent>
        </Card>

        {/* ATS Ingestion Trigger */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              ATS Ingestion (Greenhouse + Lever)
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <div className="flex flex-col sm:flex-row gap-3">
              <Input
                type="password"
                placeholder="INGEST_SECRET"
                value={secret}
                onChange={(e) => setSecret(e.target.value)}
                className="sm:max-w-xs"
              />
              <Button
                onClick={() => atsMutation.mutate({ secret })}
                disabled={!secret || atsMutation.isPending}
                variant="secondary"
                className="gap-2"
              >
                {atsMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Building2 className="w-4 h-4" />}
                Run ATS Ingestion
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Fetches jobs from 20 companies via Greenhouse & Lever public APIs. Per-company deactivation. No API key needed. Sequential with 500ms delays.
            </p>
          </CardContent>
        </Card>

        {/* Jobs Table */}
        <Card>
          <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-3">
              <CardTitle className="text-lg">Jobs</CardTitle>
              {selectedJobs.size > 0 && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm" className="gap-2" disabled={deactivateMutation.isPending}>
                      {deactivateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Ban className="w-4 h-4" />}
                      Deactivate ({selectedJobs.size})
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Deactivate {selectedJobs.size} job(s)?</AlertDialogTitle>
                      <AlertDialogDescription>
                        These jobs will be marked as inactive and hidden from regular users. This can be reversed in the database.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => {
                          deactivateMutation.mutate(Array.from(selectedJobs));
                          setSelectedJobs(new Set());
                        }}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Deactivate
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sourceFilter} onValueChange={setSourceFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sources</SelectItem>
                  <SelectItem value="real_api">All APIs</SelectItem>
                  <SelectItem value="ats">ATS (GH + Lever)</SelectItem>
                  <SelectItem value="adzuna">Adzuna</SelectItem>
                  <SelectItem value="themuse">The Muse</SelectItem>
                  <SelectItem value="jsearch">JSearch</SelectItem>
                  <SelectItem value="employer_feed">Employer Feed</SelectItem>
                  <SelectItem value="manual">Manual</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {jobsQuery.isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <>
              <Table>
                <TableHeader>
                  <TableRow>
                     <TableHead className="w-10">
                       <Checkbox
                         checked={filteredJobs.filter((j) => j.is_active).length > 0 && filteredJobs.filter((j) => j.is_active).every((j) => selectedJobs.has(j.id))}
                         onCheckedChange={toggleAll}
                       />
                     </TableHead>
                     <TableHead>Title</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead className="hidden md:table-cell">Location</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead className="hidden lg:table-cell">External ID</TableHead>
                     <TableHead>Status</TableHead>
                     <TableHead className="hidden md:table-cell">Posted</TableHead>
                     <TableHead>Actions</TableHead>
                   </TableRow>
                 </TableHeader>
                 <TableBody>
                   {paginatedJobs.map((job) => (
                      <TableRow key={job.id}>
                        <TableCell>
                          <Checkbox
                            checked={selectedJobs.has(job.id)}
                            onCheckedChange={() => toggleJob(job.id)}
                            disabled={!job.is_active}
                          />
                        </TableCell>
                        <TableCell className="font-medium max-w-[200px] truncate">{job.title}</TableCell>
                       <TableCell>{job.company}</TableCell>
                       <TableCell className="hidden md:table-cell">{job.location}</TableCell>
                        <TableCell>
                          <Badge variant={
                            job.source === "adzuna" || job.source === "themuse" || job.source === "jsearch"
                              || job.source.startsWith("greenhouse_") || job.source.startsWith("lever_")
                              ? "default"
                              : job.source === "manual"
                              ? "secondary"
                              : "outline"
                          }>
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
                       <TableCell>
                         <AlertDialog>
                           <AlertDialogTrigger asChild>
                             <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                               {deleteMutation.isPending && deleteMutation.variables === job.id
                                 ? <Loader2 className="w-4 h-4 animate-spin" />
                                 : <Trash2 className="w-4 h-4" />}
                             </Button>
                           </AlertDialogTrigger>
                           <AlertDialogContent>
                             <AlertDialogHeader>
                               <AlertDialogTitle>Delete this job?</AlertDialogTitle>
                               <AlertDialogDescription>
                                 This will permanently remove &quot;{job.title}&quot; at {job.company}. This action cannot be undone.
                               </AlertDialogDescription>
                             </AlertDialogHeader>
                             <AlertDialogFooter>
                               <AlertDialogCancel>Cancel</AlertDialogCancel>
                               <AlertDialogAction
                                 onClick={() => deleteMutation.mutate(job.id)}
                                 className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                               >
                                 Delete
                               </AlertDialogAction>
                             </AlertDialogFooter>
                           </AlertDialogContent>
                         </AlertDialog>
                       </TableCell>
                     </TableRow>
                   ))}
                 </TableBody>
              </Table>
              <div className="flex items-center justify-between pt-4">
                <p className="text-sm text-muted-foreground">
                  {`Showing ${((currentPage - 1) * PAGE_SIZE) + 1}\u2013${Math.min(currentPage * PAGE_SIZE, filteredJobs.length)} of ${filteredJobs.length} jobs`}
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage <= 1}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage >= totalPages}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              </>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default AdminJobs;
