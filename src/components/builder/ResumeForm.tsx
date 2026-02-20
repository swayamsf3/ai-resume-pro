import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  User, 
  Briefcase, 
  GraduationCap, 
  Code, 
  FolderGit2, 
  Plus, 
  Trash2, 
  Wand2,
  X,
  Palette,
  Award
} from "lucide-react";
import type { ResumeData } from "@/pages/Builder";
import type { TemplateId } from "./templates/types";
import { templates } from "./templates/types";
import { toast } from "@/hooks/use-toast";

const MONTHS = [
  { value: "01", label: "January" },
  { value: "02", label: "February" },
  { value: "03", label: "March" },
  { value: "04", label: "April" },
  { value: "05", label: "May" },
  { value: "06", label: "June" },
  { value: "07", label: "July" },
  { value: "08", label: "August" },
  { value: "09", label: "September" },
  { value: "10", label: "October" },
  { value: "11", label: "November" },
  { value: "12", label: "December" },
];

interface MonthYearPickerProps {
  value: string;
  onChange: (value: string) => void;
  max?: string;
  min?: string;
  disabled?: boolean;
}

const MonthYearPicker = ({ value, onChange, max, min, disabled }: MonthYearPickerProps) => {
  const now = new Date();
  const maxYear = max ? parseInt(max.split("-")[0]) : now.getFullYear();
  const maxMonth = max ? parseInt(max.split("-")[1]) : now.getMonth() + 1;
  const minYear = min ? parseInt(min.split("-")[0]) : 1970;
  const minMonth = min ? parseInt(min.split("-")[1]) : 1;

  const selectedYear = value ? value.split("-")[0] : "";
  const selectedMonth = value ? value.split("-")[1] : "";

  const years = Array.from({ length: maxYear - minYear + 1 }, (_, i) => (maxYear - i).toString());

  const getAvailableMonths = () => {
    const yr = parseInt(selectedYear);
    return MONTHS.filter((m) => {
      const mv = parseInt(m.value);
      if (yr === maxYear && mv > maxMonth) return false;
      if (yr === minYear && mv < minMonth) return false;
      return true;
    });
  };

  const handleYearChange = (yr: string) => {
    const mo = selectedMonth || "01";
    const yrNum = parseInt(yr);
    let moNum = parseInt(mo);
    if (yrNum === maxYear && moNum > maxMonth) moNum = maxMonth;
    if (yrNum === minYear && moNum < minMonth) moNum = minMonth;
    onChange(`${yr}-${String(moNum).padStart(2, "0")}`);
  };

  const handleMonthChange = (mo: string) => {
    const yr = selectedYear || maxYear.toString();
    onChange(`${yr}-${mo}`);
  };

  return (
    <div className="flex gap-2">
      <Select value={selectedMonth} onValueChange={handleMonthChange} disabled={disabled}>
        <SelectTrigger className="flex-1">
          <SelectValue placeholder="Month" />
        </SelectTrigger>
        <SelectContent>
          {getAvailableMonths().map((m) => (
            <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={selectedYear} onValueChange={handleYearChange} disabled={disabled}>
        <SelectTrigger className="w-[100px]">
          <SelectValue placeholder="Year" />
        </SelectTrigger>
        <SelectContent>
          {years.map((yr) => (
            <SelectItem key={yr} value={yr}>{yr}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

const SUPABASE_URL = "https://qswjxgjfynphxvobaitl.supabase.co";

interface ResumeFormProps {
  resumeData: ResumeData;
  setResumeData: React.Dispatch<React.SetStateAction<ResumeData>>;
  selectedTemplate: TemplateId;
  onChangeTemplate: () => void;
}

const ResumeForm = ({ resumeData, setResumeData, selectedTemplate, onChangeTemplate }: ResumeFormProps) => {
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const currentTemplate = templates.find(t => t.id === selectedTemplate);
  const [newSkill, setNewSkill] = useState("");
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [generatingProjectId, setGeneratingProjectId] = useState<string | null>(null);

  // Persist skills to localStorage for job matching sync
  useEffect(() => {
    if (resumeData.skills.length > 0) {
      localStorage.setItem('builderSkills', JSON.stringify(resumeData.skills));
    }
  }, [resumeData.skills]);

  const updatePersonalInfo = (field: keyof ResumeData["personalInfo"], value: string) => {
    setResumeData((prev) => ({
      ...prev,
      personalInfo: { ...prev.personalInfo, [field]: value },
    }));
  };

  const addExperience = () => {
    setResumeData((prev) => ({
      ...prev,
      experience: [
        ...prev.experience,
        {
          id: crypto.randomUUID(),
          company: "",
          position: "",
          startDate: "",
          endDate: "",
          current: false,
          description: "",
        },
      ],
    }));
  };

  const updateExperience = (id: string, field: string, value: string | boolean) => {
    setResumeData((prev) => ({
      ...prev,
      experience: prev.experience.map((exp) =>
        exp.id === id ? { ...exp, [field]: value } : exp
      ),
    }));
  };

  const removeExperience = (id: string) => {
    setResumeData((prev) => ({
      ...prev,
      experience: prev.experience.filter((exp) => exp.id !== id),
    }));
  };

  const addEducation = () => {
    setResumeData((prev) => ({
      ...prev,
      education: [
        ...prev.education,
        {
          id: crypto.randomUUID(),
          institution: "",
          degree: "",
          field: "",
          startDate: "",
          endDate: "",
          gpa: "",
        },
      ],
    }));
  };

  const updateEducation = (id: string, field: string, value: string) => {
    setResumeData((prev) => ({
      ...prev,
      education: prev.education.map((edu) =>
        edu.id === id ? { ...edu, [field]: value } : edu
      ),
    }));
  };

  const removeEducation = (id: string) => {
    setResumeData((prev) => ({
      ...prev,
      education: prev.education.filter((edu) => edu.id !== id),
    }));
  };

  const addSkill = () => {
    if (newSkill.trim() && !resumeData.skills.includes(newSkill.trim())) {
      setResumeData((prev) => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()],
      }));
      setNewSkill("");
    }
  };

  const removeSkill = (skill: string) => {
    setResumeData((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s !== skill),
    }));
  };

  const addProject = () => {
    setResumeData((prev) => ({
      ...prev,
      projects: [
        ...prev.projects,
        {
          id: crypto.randomUUID(),
          name: "",
          description: "",
          technologies: "",
          link: "",
        },
      ],
    }));
  };

  const updateProject = (id: string, field: string, value: string) => {
    setResumeData((prev) => ({
      ...prev,
      projects: prev.projects.map((proj) =>
        proj.id === id ? { ...proj, [field]: value } : proj
      ),
    }));
  };

  const removeProject = (id: string) => {
    setResumeData((prev) => ({
      ...prev,
      projects: prev.projects.filter((proj) => proj.id !== id),
    }));
  };

  const addCertification = () => {
    setResumeData((prev) => ({
      ...prev,
      certifications: [
        ...prev.certifications,
        {
          id: crypto.randomUUID(),
          name: "",
          issuer: "",
          date: "",
        },
      ],
    }));
  };

  const updateCertification = (id: string, field: string, value: string) => {
    setResumeData((prev) => ({
      ...prev,
      certifications: prev.certifications.map((cert) =>
        cert.id === id ? { ...cert, [field]: value } : cert
      ),
    }));
  };

  const removeCertification = (id: string) => {
    setResumeData((prev) => ({
      ...prev,
      certifications: prev.certifications.filter((cert) => cert.id !== id),
    }));
  };

  const generateAISummary = async () => {
    if (!resumeData.personalInfo.summary.trim()) {
      toast({
        title: "No Summary Found",
        description: "Please write a summary first before refining.",
        variant: "destructive",
      });
      return;
    }

    setIsGeneratingSummary(true);
    try {
      const response = await fetch(
        `${SUPABASE_URL}/functions/v1/generate-resume-content`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "summary",
            data: {
              summary: resumeData.personalInfo.summary
            }
          })
        }
      );

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || "Failed to refine summary");
      }

      updatePersonalInfo("summary", result.content);
      toast({
        title: "Summary Refined!",
        description: "Your professional summary has been improved.",
      });
    } catch (error) {
      console.error("Error generating summary:", error);
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  const generateProjectDescription = async (projectId: string) => {
    const project = resumeData.projects.find((p) => p.id === projectId);
    if (!project) return;

    setGeneratingProjectId(projectId);
    try {
      const response = await fetch(
        `${SUPABASE_URL}/functions/v1/generate-resume-content`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "project",
            data: {
              name: project.name,
              technologies: project.technologies
            }
          })
        }
      );

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || "Failed to generate description");
      }

      updateProject(projectId, "description", result.content);
      toast({
        title: "Description Generated!",
        description: "Your project description has been created.",
      });
    } catch (error) {
      console.error("Error generating project description:", error);
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setGeneratingProjectId(null);
    }
  };

  return (
    <Card className="border-border shadow-lg">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="font-display text-xl">Resume Details</CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={onChangeTemplate}
            className="gap-2"
          >
            <Palette className="w-4 h-4" />
            {currentTemplate?.name || "Change Template"}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="personal" className="w-full">
          <TabsList className="grid grid-cols-6 mb-6">
            <TabsTrigger value="personal" className="gap-1 text-xs sm:text-sm">
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">Personal</span>
            </TabsTrigger>
            <TabsTrigger value="experience" className="gap-1 text-xs sm:text-sm">
              <Briefcase className="w-4 h-4" />
              <span className="hidden sm:inline">Experience</span>
            </TabsTrigger>
            <TabsTrigger value="education" className="gap-1 text-xs sm:text-sm">
              <GraduationCap className="w-4 h-4" />
              <span className="hidden sm:inline">Education</span>
            </TabsTrigger>
            <TabsTrigger value="skills" className="gap-1 text-xs sm:text-sm">
              <Code className="w-4 h-4" />
              <span className="hidden sm:inline">Skills</span>
            </TabsTrigger>
            <TabsTrigger value="projects" className="gap-1 text-xs sm:text-sm">
              <FolderGit2 className="w-4 h-4" />
              <span className="hidden sm:inline">Projects</span>
            </TabsTrigger>
            <TabsTrigger value="certifications" className="gap-1 text-xs sm:text-sm">
              <Award className="w-4 h-4" />
              <span className="hidden sm:inline">Certs</span>
            </TabsTrigger>
          </TabsList>

          {/* Personal Info */}
          <TabsContent value="personal" className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  placeholder="John Doe"
                  value={resumeData.personalInfo.fullName}
                  onChange={(e) => updatePersonalInfo("fullName", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john@example.com"
                  value={resumeData.personalInfo.email}
                  onChange={(e) => updatePersonalInfo("email", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  placeholder="+1 (555) 123-4567"
                  value={resumeData.personalInfo.phone}
                  onChange={(e) => updatePersonalInfo("phone", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  placeholder="New York, NY"
                  value={resumeData.personalInfo.location}
                  onChange={(e) => updatePersonalInfo("location", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="linkedin">LinkedIn URL</Label>
                <Input
                  id="linkedin"
                  placeholder="linkedin.com/in/johndoe"
                  value={resumeData.personalInfo.linkedin}
                  onChange={(e) => updatePersonalInfo("linkedin", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="portfolio">Portfolio URL</Label>
                <Input
                  id="portfolio"
                  placeholder="johndoe.dev"
                  value={resumeData.personalInfo.portfolio}
                  onChange={(e) => updatePersonalInfo("portfolio", e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="summary">Professional Summary</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={generateAISummary}
                  disabled={isGeneratingSummary}
                  className="gap-1 text-primary"
                >
                  <Wand2 className="w-4 h-4" />
                  {isGeneratingSummary ? "Refining..." : "AI Refine"}
                </Button>
              </div>
              <Textarea
                id="summary"
                placeholder="A brief overview of your professional background and career goals..."
                rows={4}
                value={resumeData.personalInfo.summary}
                onChange={(e) => updatePersonalInfo("summary", e.target.value)}
              />
            </div>
          </TabsContent>

          {/* Experience */}
          <TabsContent value="experience" className="space-y-4">
            {resumeData.experience.map((exp, index) => (
              <Card key={exp.id} className="bg-muted/30 border-border">
                <CardContent className="pt-4">
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-sm font-medium text-muted-foreground">
                      Experience {index + 1}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeExperience(exp.id)}
                      className="h-8 w-8 text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Company</Label>
                      <Input
                        placeholder="Company Name"
                        value={exp.company}
                        onChange={(e) => updateExperience(exp.id, "company", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Position</Label>
                      <Input
                        placeholder="Job Title"
                        value={exp.position}
                        onChange={(e) => updateExperience(exp.id, "position", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Start Date</Label>
                      <MonthYearPicker
                        value={exp.startDate}
                        onChange={(val) => updateExperience(exp.id, "startDate", val)}
                        max={currentMonth}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>End Date</Label>
                      <MonthYearPicker
                        value={exp.endDate}
                        onChange={(val) => updateExperience(exp.id, "endDate", val)}
                        max={currentMonth}
                        min={exp.startDate}
                        disabled={exp.current}
                      />
                    </div>
                  </div>
                  <div className="space-y-2 mt-4">
                    <Label>Description</Label>
                    <Textarea
                      placeholder="Describe your responsibilities and achievements..."
                      value={exp.description}
                      onChange={(e) => updateExperience(exp.id, "description", e.target.value)}
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
            <Button onClick={addExperience} variant="outline" className="w-full gap-2">
              <Plus className="w-4 h-4" />
              Add Experience
            </Button>
          </TabsContent>

          {/* Education */}
          <TabsContent value="education" className="space-y-4">
            {resumeData.education.map((edu, index) => (
              <Card key={edu.id} className="bg-muted/30 border-border">
                <CardContent className="pt-4">
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-sm font-medium text-muted-foreground">
                      Education {index + 1}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeEducation(edu.id)}
                      className="h-8 w-8 text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Institution</Label>
                      <Input
                        placeholder="University Name"
                        value={edu.institution}
                        onChange={(e) => updateEducation(edu.id, "institution", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Degree</Label>
                      <Input
                        placeholder="Bachelor's, Master's, etc."
                        value={edu.degree}
                        onChange={(e) => updateEducation(edu.id, "degree", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Field of Study</Label>
                      <Input
                        placeholder="Computer Science"
                        value={edu.field}
                        onChange={(e) => updateEducation(edu.id, "field", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>GPA (Optional)</Label>
                      <Input
                        placeholder="3.8/4.0"
                        value={edu.gpa}
                        onChange={(e) => updateEducation(edu.id, "gpa", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Start Date</Label>
                      <MonthYearPicker
                        value={edu.startDate}
                        onChange={(val) => updateEducation(edu.id, "startDate", val)}
                        max={currentMonth}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>End Date</Label>
                      <MonthYearPicker
                        value={edu.endDate}
                        onChange={(val) => updateEducation(edu.id, "endDate", val)}
                        max={currentMonth}
                        min={edu.startDate}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            <Button onClick={addEducation} variant="outline" className="w-full gap-2">
              <Plus className="w-4 h-4" />
              Add Education
            </Button>
          </TabsContent>

          {/* Skills */}
          <TabsContent value="skills" className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Add a skill (e.g., JavaScript, React, Python)"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
              />
              <Button onClick={addSkill} variant="default">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {resumeData.skills.map((skill) => (
                <Badge
                  key={skill}
                  variant="secondary"
                  className="px-3 py-1.5 text-sm cursor-pointer hover:bg-destructive/10 group"
                  onClick={() => removeSkill(skill)}
                >
                  {skill}
                  <X className="w-3 h-3 ml-1 opacity-50 group-hover:opacity-100" />
                </Badge>
              ))}
            </div>
            {resumeData.skills.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                Add your technical and soft skills to showcase your expertise
              </p>
            )}
          </TabsContent>

          {/* Projects */}
          <TabsContent value="projects" className="space-y-4">
            {resumeData.projects.map((proj, index) => (
              <Card key={proj.id} className="bg-muted/30 border-border">
                <CardContent className="pt-4">
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-sm font-medium text-muted-foreground">
                      Project {index + 1}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeProject(proj.id)}
                      className="h-8 w-8 text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Project Name</Label>
                      <Input
                        placeholder="My Awesome Project"
                        value={proj.name}
                        onChange={(e) => updateProject(proj.id, "name", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Project Link (Optional)</Label>
                      <Input
                        placeholder="github.com/user/project"
                        value={proj.link}
                        onChange={(e) => updateProject(proj.id, "link", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                      <Label>Technologies Used</Label>
                      <Input
                        placeholder="React, Node.js, MongoDB"
                        value={proj.technologies}
                        onChange={(e) => updateProject(proj.id, "technologies", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                      <div className="flex items-center justify-between">
                        <Label>Description</Label>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => generateProjectDescription(proj.id)}
                          disabled={generatingProjectId === proj.id}
                          className="gap-1 text-primary"
                        >
                          <Wand2 className="w-4 h-4" />
                          {generatingProjectId === proj.id ? "Generating..." : "AI Generate"}
                        </Button>
                      </div>
                      <Textarea
                        placeholder="Describe what the project does and your contributions..."
                        value={proj.description}
                        onChange={(e) => updateProject(proj.id, "description", e.target.value)}
                        rows={3}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            <Button onClick={addProject} variant="outline" className="w-full gap-2">
              <Plus className="w-4 h-4" />
              Add Project
            </Button>
          </TabsContent>

          {/* Certifications */}
          <TabsContent value="certifications" className="space-y-4">
            {resumeData.certifications.map((cert, index) => (
              <Card key={cert.id} className="bg-muted/30 border-border">
                <CardContent className="pt-4">
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-sm font-medium text-muted-foreground">
                      Certification {index + 1}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeCertification(cert.id)}
                      className="h-8 w-8 text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Certification Name</Label>
                      <Input
                        placeholder="AWS Solutions Architect"
                        value={cert.name}
                        onChange={(e) => updateCertification(cert.id, "name", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Issuing Organization</Label>
                      <Input
                        placeholder="Amazon Web Services"
                        value={cert.issuer}
                        onChange={(e) => updateCertification(cert.id, "issuer", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Date Obtained</Label>
                      <MonthYearPicker
                        value={cert.date}
                        onChange={(val) => updateCertification(cert.id, "date", val)}
                        max={currentMonth}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            <Button onClick={addCertification} variant="outline" className="w-full gap-2">
              <Plus className="w-4 h-4" />
              Add Certification
            </Button>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ResumeForm;
