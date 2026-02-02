import { Mail, Phone, MapPin, Globe, Linkedin } from "lucide-react";
import type { ResumeData } from "@/pages/Builder";

interface TemplateProps {
  resumeData: ResumeData;
  formatDate: (dateString: string) => string;
}

const ModernTemplate = ({ resumeData, formatDate }: TemplateProps) => {
  const { personalInfo, experience, education, skills, projects } = resumeData;

  return (
    <div className="flex min-h-full">
      {/* Sidebar */}
      <div className="w-1/3 bg-gradient-to-b from-purple-700 to-purple-900 text-white p-5">
        {/* Name */}
        <div className="mb-6">
          <h1 className="text-xl font-bold leading-tight">
            {personalInfo.fullName || "Your Name"}
          </h1>
        </div>

        {/* Contact */}
        <div className="space-y-2 text-xs mb-6">
          {personalInfo.email && (
            <div className="flex items-center gap-2">
              <Mail className="w-3 h-3 text-purple-300" />
              <span className="break-all">{personalInfo.email}</span>
            </div>
          )}
          {personalInfo.phone && (
            <div className="flex items-center gap-2">
              <Phone className="w-3 h-3 text-purple-300" />
              <span>{personalInfo.phone}</span>
            </div>
          )}
          {personalInfo.location && (
            <div className="flex items-center gap-2">
              <MapPin className="w-3 h-3 text-purple-300" />
              <span>{personalInfo.location}</span>
            </div>
          )}
          {personalInfo.linkedin && (
            <div className="flex items-center gap-2">
              <Linkedin className="w-3 h-3 text-purple-300" />
              <span className="break-all">{personalInfo.linkedin}</span>
            </div>
          )}
          {personalInfo.portfolio && (
            <div className="flex items-center gap-2">
              <Globe className="w-3 h-3 text-purple-300" />
              <span className="break-all">{personalInfo.portfolio}</span>
            </div>
          )}
        </div>

        {/* Skills */}
        {skills.length > 0 && (
          <div className="mb-6">
            <h2 className="text-sm font-bold uppercase tracking-wider text-purple-200 mb-3 border-b border-purple-500 pb-1">
              Skills
            </h2>
            <div className="flex flex-wrap gap-1.5">
              {skills.map((skill) => (
                <span
                  key={skill}
                  className="px-2 py-0.5 bg-purple-600 text-white text-xs rounded-full"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Education */}
        {education.length > 0 && (
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-purple-200 mb-3 border-b border-purple-500 pb-1">
              Education
            </h2>
            <div className="space-y-3">
              {education.map((edu) => (
                <div key={edu.id}>
                  <h3 className="font-semibold text-sm">{edu.degree}</h3>
                  {edu.field && <p className="text-xs text-purple-200">{edu.field}</p>}
                  <p className="text-xs text-purple-300">{edu.institution}</p>
                  <p className="text-xs text-purple-400">
                    {formatDate(edu.startDate)} - {formatDate(edu.endDate)}
                  </p>
                  {edu.gpa && <p className="text-xs text-purple-300">GPA: {edu.gpa}</p>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="w-2/3 p-5 space-y-5">
        {/* Summary */}
        {personalInfo.summary && (
          <section>
            <h2 className="text-sm font-bold uppercase tracking-wider text-purple-700 mb-2 border-b-2 border-purple-200 pb-1">
              About Me
            </h2>
            <p className="text-sm text-gray-700 leading-relaxed">
              {personalInfo.summary}
            </p>
          </section>
        )}

        {/* Experience */}
        {experience.length > 0 && (
          <section>
            <h2 className="text-sm font-bold uppercase tracking-wider text-purple-700 mb-3 border-b-2 border-purple-200 pb-1">
              Experience
            </h2>
            <div className="space-y-4">
              {experience.map((exp) => (
                <div key={exp.id} className="relative pl-4 border-l-2 border-purple-200">
                  <div className="absolute -left-1.5 top-0 w-3 h-3 bg-purple-600 rounded-full"></div>
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-gray-900">{exp.position}</h3>
                      <p className="text-sm text-purple-600 font-medium">{exp.company}</p>
                    </div>
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
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
            <h2 className="text-sm font-bold uppercase tracking-wider text-purple-700 mb-3 border-b-2 border-purple-200 pb-1">
              Projects
            </h2>
            <div className="space-y-3">
              {projects.map((proj) => (
                <div key={proj.id} className="bg-purple-50 p-3 rounded-lg">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900">{proj.name}</h3>
                    {proj.link && (
                      <span className="text-xs text-purple-600">({proj.link})</span>
                    )}
                  </div>
                  {proj.technologies && (
                    <p className="text-xs text-purple-600 mb-1">{proj.technologies}</p>
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
    </div>
  );
};

export default ModernTemplate;
