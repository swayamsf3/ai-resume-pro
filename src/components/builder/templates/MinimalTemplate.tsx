import { Mail, Phone, MapPin, Globe, Linkedin } from "lucide-react";
import type { ResumeData } from "@/pages/Builder";

interface TemplateProps {
  resumeData: ResumeData;
  formatDate: (dateString: string) => string;
}

const MinimalTemplate = ({ resumeData, formatDate }: TemplateProps) => {
  const { personalInfo, experience, education, skills, projects } = resumeData;

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="text-center pb-4 border-b border-gray-200">
        <h1 className="text-2xl font-light tracking-wide text-gray-800 mb-3">
          {personalInfo.fullName || "Your Name"}
        </h1>
        <div className="flex flex-wrap justify-center gap-4 text-xs text-gray-500">
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
          <p className="text-sm text-gray-600 leading-relaxed text-center italic">
            {personalInfo.summary}
          </p>
        </section>
      )}

      {/* Experience */}
      {experience.length > 0 && (
        <section>
          <h2 className="text-xs font-medium uppercase tracking-[0.2em] text-gray-400 mb-4 text-center">
            Experience
          </h2>
          <div className="space-y-5">
            {experience.map((exp) => (
              <div key={exp.id} className="text-center">
                <h3 className="font-medium text-gray-800">{exp.position}</h3>
                <p className="text-sm text-gray-500">{exp.company}</p>
                <p className="text-xs text-gray-400 mb-2">
                  {formatDate(exp.startDate)} — {exp.current ? "Present" : formatDate(exp.endDate)}
                </p>
                {exp.description && (
                  <p className="text-sm text-gray-600 leading-relaxed max-w-md mx-auto">
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
          <h2 className="text-xs font-medium uppercase tracking-[0.2em] text-gray-400 mb-4 text-center">
            Education
          </h2>
          <div className="space-y-3">
            {education.map((edu) => (
              <div key={edu.id} className="text-center">
                <h3 className="font-medium text-gray-800">
                  {edu.degree} {edu.field && `· ${edu.field}`}
                </h3>
                <p className="text-sm text-gray-500">{edu.institution}</p>
                <p className="text-xs text-gray-400">
                  {formatDate(edu.startDate)} — {formatDate(edu.endDate)}
                  {edu.gpa && ` · GPA: ${edu.gpa}`}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Skills */}
      {skills.length > 0 && (
        <section>
          <h2 className="text-xs font-medium uppercase tracking-[0.2em] text-gray-400 mb-3 text-center">
            Skills
          </h2>
          <p className="text-sm text-gray-600 text-center">
            {skills.join(" · ")}
          </p>
        </section>
      )}

      {/* Projects */}
      {projects.length > 0 && (
        <section>
          <h2 className="text-xs font-medium uppercase tracking-[0.2em] text-gray-400 mb-4 text-center">
            Projects
          </h2>
          <div className="space-y-4">
            {projects.map((proj) => (
              <div key={proj.id} className="text-center">
                <h3 className="font-medium text-gray-800">
                  {proj.name}
                  {proj.link && (
                    <span className="text-xs text-gray-400 font-normal ml-2">
                      {proj.link}
                    </span>
                  )}
                </h3>
                {proj.technologies && (
                  <p className="text-xs text-gray-400 mb-1">{proj.technologies}</p>
                )}
                {proj.description && (
                  <p className="text-sm text-gray-600 leading-relaxed max-w-md mx-auto">
                    {proj.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default MinimalTemplate;
