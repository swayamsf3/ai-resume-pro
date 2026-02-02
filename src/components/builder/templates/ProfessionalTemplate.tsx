import { Mail, Phone, MapPin, Globe, Linkedin } from "lucide-react";
import type { ResumeData } from "@/pages/Builder";

interface TemplateProps {
  resumeData: ResumeData;
  formatDate: (dateString: string) => string;
}

const ProfessionalTemplate = ({ resumeData, formatDate }: TemplateProps) => {
  const { personalInfo, experience, education, skills, projects } = resumeData;

  return (
    <div className="space-y-5">
      {/* Header */}
      <header className="bg-gradient-to-r from-emerald-600 to-teal-600 -m-8 mb-0 p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">
          {personalInfo.fullName || "Your Name"}
        </h1>
        <div className="flex flex-wrap gap-4 text-xs text-emerald-100">
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

      <div className="pt-4 space-y-5">
        {/* Summary */}
        {personalInfo.summary && (
          <section className="bg-emerald-50 p-4 rounded-lg border-l-4 border-emerald-500">
            <p className="text-sm text-gray-700 leading-relaxed">
              {personalInfo.summary}
            </p>
          </section>
        )}

        <div className="grid grid-cols-3 gap-5">
          {/* Main Column */}
          <div className="col-span-2 space-y-5">
            {/* Experience */}
            {experience.length > 0 && (
              <section>
                <h2 className="text-sm font-bold text-emerald-700 mb-3 flex items-center gap-2">
                  <span className="w-8 h-0.5 bg-emerald-500"></span>
                  EXPERIENCE
                </h2>
                <div className="space-y-4">
                  {experience.map((exp) => (
                    <div key={exp.id}>
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-gray-900">{exp.position}</h3>
                          <p className="text-sm text-emerald-600">{exp.company}</p>
                        </div>
                        <span className="text-xs text-gray-500 bg-emerald-50 px-2 py-0.5 rounded">
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

            {/* Projects */}
            {projects.length > 0 && (
              <section>
                <h2 className="text-sm font-bold text-emerald-700 mb-3 flex items-center gap-2">
                  <span className="w-8 h-0.5 bg-emerald-500"></span>
                  PROJECTS
                </h2>
                <div className="space-y-3">
                  {projects.map((proj) => (
                    <div key={proj.id}>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900">{proj.name}</h3>
                        {proj.link && (
                          <span className="text-xs text-emerald-600">({proj.link})</span>
                        )}
                      </div>
                      {proj.technologies && (
                        <p className="text-xs text-emerald-600 mb-1">{proj.technologies}</p>
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

          {/* Side Column */}
          <div className="space-y-5">
            {/* Skills */}
            {skills.length > 0 && (
              <section>
                <h2 className="text-sm font-bold text-emerald-700 mb-3 flex items-center gap-2">
                  <span className="w-4 h-0.5 bg-emerald-500"></span>
                  SKILLS
                </h2>
                <div className="space-y-1.5">
                  {skills.map((skill) => (
                    <div key={skill} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                      <span className="text-xs text-gray-700">{skill}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Education */}
            {education.length > 0 && (
              <section>
                <h2 className="text-sm font-bold text-emerald-700 mb-3 flex items-center gap-2">
                  <span className="w-4 h-0.5 bg-emerald-500"></span>
                  EDUCATION
                </h2>
                <div className="space-y-3">
                  {education.map((edu) => (
                    <div key={edu.id}>
                      <h3 className="font-semibold text-xs text-gray-900">{edu.degree}</h3>
                      {edu.field && <p className="text-xs text-emerald-600">{edu.field}</p>}
                      <p className="text-xs text-gray-600">{edu.institution}</p>
                      <p className="text-xs text-gray-400">
                        {formatDate(edu.startDate)} - {formatDate(edu.endDate)}
                      </p>
                      {edu.gpa && <p className="text-xs text-gray-500">GPA: {edu.gpa}</p>}
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfessionalTemplate;
