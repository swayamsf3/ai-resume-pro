import { Mail, Phone, MapPin, Globe, Linkedin } from "lucide-react";
import type { ResumeData } from "@/pages/Builder";

interface TemplateProps {
  resumeData: ResumeData;
  formatDate: (dateString: string) => string;
}

const ModernTemplate = ({ resumeData, formatDate }: TemplateProps) => {
  const { personalInfo, experience, education, skills, projects } = resumeData;

  return (
    <div className="space-y-5 text-black">
      {/* Header */}
      <header className="pb-3">
        <h1 className="text-2xl font-bold tracking-tight mb-1">
          {personalInfo.fullName || "Your Name"}
        </h1>
        <div className="flex flex-wrap gap-3 text-xs text-gray-700">
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
        <div className="border-b-2 border-black mt-3"></div>
      </header>

      {/* Summary */}
      {personalInfo.summary && (
        <section>
          <h2 className="text-xs font-bold uppercase tracking-widest mb-2">
            Summary
          </h2>
          <p className="text-sm leading-relaxed">
            {personalInfo.summary}
          </p>
        </section>
      )}

      {/* Experience */}
      {experience.length > 0 && (
        <section>
          <h2 className="text-xs font-bold uppercase tracking-widest mb-3">
            Professional Experience
          </h2>
          <div className="space-y-4">
            {experience.map((exp) => (
              <div key={exp.id}>
                <div className="flex justify-between items-baseline">
                  <h3 className="font-bold">{exp.position}</h3>
                  <span className="text-xs text-gray-600">
                    {formatDate(exp.startDate)} - {exp.current ? "Present" : formatDate(exp.endDate)}
                  </span>
                </div>
                <p className="text-sm text-gray-700 italic">{exp.company}</p>
                {exp.description && (
                  <p className="text-sm mt-1 leading-relaxed">
                    {exp.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Projects */}
      {projects.length > 0 && (
        <section>
          <h2 className="text-xs font-bold uppercase tracking-widest mb-3">
            Projects
          </h2>
          <div className="space-y-3">
            {projects.map((proj) => (
              <div key={proj.id}>
                <div className="flex items-baseline gap-2">
                  <h3 className="font-bold">{proj.name}</h3>
                  {proj.link && (
                    <span className="text-xs text-gray-600">({proj.link})</span>
                  )}
                </div>
                {proj.technologies && (
                  <p className="text-xs text-gray-600 italic mb-1">{proj.technologies}</p>
                )}
                {proj.description && (
                  <p className="text-sm leading-relaxed">
                    {proj.description}
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
          <h2 className="text-xs font-bold uppercase tracking-widest mb-3">
            Education
          </h2>
          <div className="space-y-2">
            {education.map((edu) => (
              <div key={edu.id} className="flex justify-between items-baseline">
                <div>
                  <h3 className="font-bold text-sm">
                    {edu.degree} {edu.field && `in ${edu.field}`}
                  </h3>
                  <p className="text-sm text-gray-700">{edu.institution}</p>
                  {edu.gpa && <p className="text-xs text-gray-600">GPA: {edu.gpa}</p>}
                </div>
                <span className="text-xs text-gray-600">
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
          <h2 className="text-xs font-bold uppercase tracking-widest mb-2">
            Technical Skills
          </h2>
          <p className="text-sm">
            {skills.join(", ")}
          </p>
        </section>
      )}
    </div>
  );
};

export default ModernTemplate;
