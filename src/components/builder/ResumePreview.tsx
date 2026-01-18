import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Download, Mail, Phone, MapPin, Globe, Linkedin } from "lucide-react";
import type { ResumeData } from "@/pages/Builder";
import { useRef } from "react";

interface ResumePreviewProps {
  resumeData: ResumeData;
}

const ResumePreview = ({ resumeData }: ResumePreviewProps) => {
  const resumeRef = useRef<HTMLDivElement>(null);
  const { personalInfo, experience, education, skills, projects } = resumeData;

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
  };

  const handleDownload = () => {
    // For now, trigger print dialog which allows saving as PDF
    window.print();
  };

  const hasContent =
    personalInfo.fullName ||
    personalInfo.email ||
    experience.length > 0 ||
    education.length > 0 ||
    skills.length > 0 ||
    projects.length > 0;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-display font-semibold text-foreground">Preview</h2>
        <Button onClick={handleDownload} variant="default" size="sm" className="gap-2">
          <Download className="w-4 h-4" />
          Download PDF
        </Button>
      </div>

      <Card className="border-border shadow-lg overflow-hidden">
        <CardContent className="p-0">
          <div
            ref={resumeRef}
            className="bg-white text-gray-900 p-8 min-h-[800px] print:min-h-0"
            style={{ aspectRatio: "8.5/11" }}
          >
            {!hasContent ? (
              <div className="h-full flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <p className="text-lg mb-2">Your resume preview will appear here</p>
                  <p className="text-sm">Start filling in your details on the left</p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Header / Personal Info */}
                <header className="border-b-2 border-primary pb-4">
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    {personalInfo.fullName || "Your Name"}
                  </h1>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                    {personalInfo.email && (
                      <span className="flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        {personalInfo.email}
                      </span>
                    )}
                    {personalInfo.phone && (
                      <span className="flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        {personalInfo.phone}
                      </span>
                    )}
                    {personalInfo.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {personalInfo.location}
                      </span>
                    )}
                    {personalInfo.linkedin && (
                      <span className="flex items-center gap-1">
                        <Linkedin className="w-3 h-3" />
                        {personalInfo.linkedin}
                      </span>
                    )}
                    {personalInfo.portfolio && (
                      <span className="flex items-center gap-1">
                        <Globe className="w-3 h-3" />
                        {personalInfo.portfolio}
                      </span>
                    )}
                  </div>
                </header>

                {/* Summary */}
                {personalInfo.summary && (
                  <section>
                    <h2 className="text-sm font-bold uppercase tracking-wider text-primary mb-2">
                      Professional Summary
                    </h2>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {personalInfo.summary}
                    </p>
                  </section>
                )}

                {/* Experience */}
                {experience.length > 0 && (
                  <section>
                    <h2 className="text-sm font-bold uppercase tracking-wider text-primary mb-3">
                      Experience
                    </h2>
                    <div className="space-y-4">
                      {experience.map((exp) => (
                        <div key={exp.id}>
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-semibold text-gray-900">{exp.position}</h3>
                              <p className="text-sm text-gray-600">{exp.company}</p>
                            </div>
                            <span className="text-xs text-gray-500">
                              {formatDate(exp.startDate)} - {exp.current ? "Present" : formatDate(exp.endDate)}
                            </span>
                          </div>
                          {exp.description && (
                            <p className="text-sm text-gray-700 mt-1 leading-relaxed">
                              {exp.description}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* Education */}
                {education.length > 0 && (
                  <section>
                    <h2 className="text-sm font-bold uppercase tracking-wider text-primary mb-3">
                      Education
                    </h2>
                    <div className="space-y-3">
                      {education.map((edu) => (
                        <div key={edu.id} className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold text-gray-900">
                              {edu.degree} {edu.field && `in ${edu.field}`}
                            </h3>
                            <p className="text-sm text-gray-600">{edu.institution}</p>
                            {edu.gpa && <p className="text-xs text-gray-500">GPA: {edu.gpa}</p>}
                          </div>
                          <span className="text-xs text-gray-500">
                            {formatDate(edu.startDate)} - {formatDate(edu.endDate)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* Skills */}
                {skills.length > 0 && (
                  <section>
                    <h2 className="text-sm font-bold uppercase tracking-wider text-primary mb-2">
                      Skills
                    </h2>
                    <div className="flex flex-wrap gap-2">
                      {skills.map((skill) => (
                        <span
                          key={skill}
                          className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </section>
                )}

                {/* Projects */}
                {projects.length > 0 && (
                  <section>
                    <h2 className="text-sm font-bold uppercase tracking-wider text-primary mb-3">
                      Projects
                    </h2>
                    <div className="space-y-3">
                      {projects.map((proj) => (
                        <div key={proj.id}>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-gray-900">{proj.name}</h3>
                            {proj.link && (
                              <span className="text-xs text-primary">({proj.link})</span>
                            )}
                          </div>
                          {proj.technologies && (
                            <p className="text-xs text-gray-500 mb-1">{proj.technologies}</p>
                          )}
                          {proj.description && (
                            <p className="text-sm text-gray-700 leading-relaxed">
                              {proj.description}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </section>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResumePreview;
