import type { ResumeData } from "@/pages/Builder";

interface TemplateProps {
  resumeData: ResumeData;
  formatDate: (dateString: string) => string;
}

const ProfessionalTemplate = ({ resumeData, formatDate }: TemplateProps) => {
  const { personalInfo, experience, education, skills, projects } = resumeData;

  return (
    <div className="space-y-5 text-black">
      {/* Header */}
      <header className="border-b-2 border-black pb-3">
        <h1 className="text-2xl font-bold mb-1">
          {personalInfo.fullName || "Your Name"}
        </h1>
        <div className="text-xs text-gray-700 space-y-0.5">
          <div className="flex flex-wrap gap-3">
            {personalInfo.email && <span>{personalInfo.email}</span>}
            {personalInfo.phone && <span>{personalInfo.phone}</span>}
            {personalInfo.location && <span>{personalInfo.location}</span>}
          </div>
          <div className="flex flex-wrap gap-3">
            {personalInfo.linkedin && <span>{personalInfo.linkedin}</span>}
            {personalInfo.portfolio && <span>{personalInfo.portfolio}</span>}
          </div>
        </div>
      </header>

      {/* Summary */}
      {personalInfo.summary && (
        <section>
          <h2 className="text-sm font-bold uppercase mb-2">
            Professional Summary
          </h2>
          <p className="text-sm leading-relaxed">
            {personalInfo.summary}
          </p>
        </section>
      )}

      {/* Experience */}
      {experience.length > 0 && (
        <section>
          <h2 className="text-sm font-bold uppercase mb-3">
            Work Experience
          </h2>
          <div className="space-y-4">
            {experience.map((exp) => (
              <div key={exp.id}>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold">{exp.position}</h3>
                    <p className="text-sm">{exp.company}</p>
                  </div>
                  <span className="text-xs text-gray-600 whitespace-nowrap">
                    {formatDate(exp.startDate)} - {exp.current ? "Present" : formatDate(exp.endDate)}
                  </span>
                </div>
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
          <h2 className="text-sm font-bold uppercase mb-3">
            Projects
          </h2>
          <div className="space-y-3">
            {projects.map((proj) => (
              <div key={proj.id}>
                <h3 className="font-bold">
                  {proj.name}
                  {proj.link && (
                    <span className="font-normal text-xs text-gray-600 ml-2">
                      — {proj.link}
                    </span>
                  )}
                </h3>
                {proj.technologies && (
                  <p className="text-xs text-gray-600">Tech: {proj.technologies}</p>
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

      {/* Two Column Section */}
      <div className="grid grid-cols-2 gap-6">
        {/* Education */}
        {education.length > 0 && (
          <section>
            <h2 className="text-sm font-bold uppercase mb-3">
              Education
            </h2>
            <div className="space-y-2">
              {education.map((edu) => (
                <div key={edu.id}>
                  <h3 className="font-bold text-sm">{edu.degree}</h3>
                  {edu.field && <p className="text-xs">{edu.field}</p>}
                  <p className="text-xs text-gray-700">{edu.institution}</p>
                  <p className="text-xs text-gray-600">
                    {formatDate(edu.startDate)} - {formatDate(edu.endDate)}
                    {edu.gpa && ` | GPA: ${edu.gpa}`}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Skills */}
        {skills.length > 0 && (
          <section>
            <h2 className="text-sm font-bold uppercase mb-3">
              Skills
            </h2>
            <ul className="text-sm space-y-0.5">
              {skills.map((skill) => (
                <li key={skill} className="flex items-center gap-2">
                  <span className="w-1 h-1 bg-black rounded-full"></span>
                  {skill}
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
};

export default ProfessionalTemplate;
