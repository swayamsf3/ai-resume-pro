import type { ResumeData } from "@/pages/Builder";

interface TemplateProps {
  resumeData: ResumeData;
  formatDate: (dateString: string) => string;
}

const MinimalTemplate = ({ resumeData, formatDate }: TemplateProps) => {
  const { personalInfo, experience, education, skills, projects } = resumeData;

  return (
    <div className="space-y-5 text-black">
      {/* Header */}
      <header className="text-center pb-3 border-b border-gray-400">
        <h1 className="text-2xl font-bold tracking-wide mb-2">
          {personalInfo.fullName || "Your Name"}
        </h1>
        <div className="flex flex-wrap justify-center gap-2 text-xs text-gray-700">
          {personalInfo.email && <span>{personalInfo.email}</span>}
          {personalInfo.email && personalInfo.phone && <span>|</span>}
          {personalInfo.phone && <span>{personalInfo.phone}</span>}
          {personalInfo.phone && personalInfo.location && <span>|</span>}
          {personalInfo.location && <span>{personalInfo.location}</span>}
        </div>
        <div className="flex flex-wrap justify-center gap-2 text-xs text-gray-700 mt-1">
          {personalInfo.linkedin && <span>{personalInfo.linkedin}</span>}
          {personalInfo.linkedin && personalInfo.portfolio && <span>|</span>}
          {personalInfo.portfolio && <span>{personalInfo.portfolio}</span>}
        </div>
      </header>

      {/* Summary */}
      {personalInfo.summary && (
        <section>
          <p className="text-sm leading-relaxed text-center">
            {personalInfo.summary}
          </p>
        </section>
      )}

      {/* Experience */}
      {experience.length > 0 && (
        <section>
          <h2 className="text-xs font-bold uppercase tracking-[0.15em] text-center mb-3 border-b border-gray-300 pb-1">
            Experience
          </h2>
          <div className="space-y-4">
            {experience.map((exp) => (
              <div key={exp.id}>
                <div className="flex justify-between items-baseline">
                  <h3 className="font-bold text-sm">{exp.position}</h3>
                  <span className="text-xs text-gray-600">
                    {formatDate(exp.startDate)} — {exp.current ? "Present" : formatDate(exp.endDate)}
                  </span>
                </div>
                <p className="text-sm text-gray-700">{exp.company}</p>
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

      {/* Education */}
      {education.length > 0 && (
        <section>
          <h2 className="text-xs font-bold uppercase tracking-[0.15em] text-center mb-3 border-b border-gray-300 pb-1">
            Education
          </h2>
          <div className="space-y-2">
            {education.map((edu) => (
              <div key={edu.id} className="flex justify-between items-baseline">
                <div>
                  <h3 className="font-bold text-sm">
                    {edu.degree} {edu.field && `— ${edu.field}`}
                  </h3>
                  <p className="text-sm text-gray-700">
                    {edu.institution}
                    {edu.gpa && ` | GPA: ${edu.gpa}`}
                  </p>
                </div>
                <span className="text-xs text-gray-600">
                  {formatDate(edu.startDate)} — {formatDate(edu.endDate)}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Skills */}
      {skills.length > 0 && (
        <section>
          <h2 className="text-xs font-bold uppercase tracking-[0.15em] text-center mb-2 border-b border-gray-300 pb-1">
            Skills
          </h2>
          <p className="text-sm text-center">
            {skills.join(" | ")}
          </p>
        </section>
      )}

      {/* Projects */}
      {projects.length > 0 && (
        <section>
          <h2 className="text-xs font-bold uppercase tracking-[0.15em] text-center mb-3 border-b border-gray-300 pb-1">
            Projects
          </h2>
          <div className="space-y-3">
            {projects.map((proj) => (
              <div key={proj.id}>
                <h3 className="font-bold text-sm">
                  {proj.name}
                  {proj.link && (
                    <span className="font-normal text-xs text-gray-600 ml-2">
                      {proj.link}
                    </span>
                  )}
                </h3>
                {proj.technologies && (
                  <p className="text-xs text-gray-600">{proj.technologies}</p>
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
    </div>
  );
};

export default MinimalTemplate;
