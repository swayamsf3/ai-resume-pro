import type { ResumeData } from "@/pages/Builder";

interface TemplateProps {
  resumeData: ResumeData;
  formatDate: (dateString: string) => string;
}

const MinimalTemplate = ({ resumeData, formatDate }: TemplateProps) => {
  const { personalInfo, experience, education, skills, projects } = resumeData;

  const getBulletPoints = (description: string) => {
    if (!description) return [];
    return description.split(/[•\n]/).filter(s => s.trim().length > 0).slice(0, 5);
  };

  return (
    <div className="space-y-2 text-black">
      {/* Header */}
      <header className="pb-1 border-b border-gray-400">
        <div className="flex justify-between items-baseline">
          <h1 className="text-xl font-bold tracking-wide">
            {personalInfo.fullName || "Your Name"}
          </h1>
          <div className="text-[10px] text-gray-700">
            {[personalInfo.phone, personalInfo.email].filter(Boolean).join(" | ")}
          </div>
        </div>
        <div className="text-[10px] text-gray-700">
          {[personalInfo.location, personalInfo.linkedin, personalInfo.portfolio].filter(Boolean).join(" | ")}
        </div>
      </header>

      {/* Summary */}
      {personalInfo.summary && (
        <section>
          <p className="text-[11px] leading-snug text-center">
            {personalInfo.summary}
          </p>
        </section>
      )}

      {/* Experience */}
      {experience.length > 0 && (
        <section>
          <h2 className="text-[10px] font-bold uppercase tracking-[0.15em] text-center mb-1 border-b border-gray-300 pb-0.5">
            Experience
          </h2>
          <div className="space-y-1.5">
            {experience.map((exp) => (
              <div key={exp.id}>
                <div className="flex justify-between items-baseline">
                  <h3 className="font-bold text-xs">{exp.position}</h3>
                  <span className="text-[10px] text-gray-600 whitespace-nowrap">
                    {formatDate(exp.startDate)} — {exp.current ? "Present" : formatDate(exp.endDate)}
                  </span>
                </div>
                <p className="text-[10px] text-gray-700">{exp.company}</p>
                {exp.description && (
                  <ul className="text-[9px] mt-0.5 leading-snug list-none">
                    {getBulletPoints(exp.description).map((point, i) => (
                      <li key={i} className="flex gap-1">
                        <span>•</span>
                        <span>{point.trim()}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Education */}
      {education.length > 0 && (
        <section>
          <h2 className="text-[10px] font-bold uppercase tracking-[0.15em] text-center mb-1 border-b border-gray-300 pb-0.5">
            Education
          </h2>
          <div className="space-y-0.5">
            {education.map((edu) => (
              <p key={edu.id} className="text-[10px] text-center">
                <span className="font-bold">{edu.degree}{edu.field && ` — ${edu.field}`}</span>
                {" | "}{edu.institution}
                {" | "}{formatDate(edu.startDate)} — {formatDate(edu.endDate)}
                {edu.gpa && ` | GPA: ${edu.gpa}`}
              </p>
            ))}
          </div>
        </section>
      )}

      {/* Skills */}
      {skills.length > 0 && (
        <section>
          <h2 className="text-[10px] font-bold uppercase tracking-[0.15em] text-center mb-1 border-b border-gray-300 pb-0.5">
            Skills
          </h2>
          <p className="text-[10px] text-center leading-snug">
            {skills.join(" | ")}
          </p>
        </section>
      )}

      {/* Projects */}
      {projects.length > 0 && (
        <section>
          <h2 className="text-[10px] font-bold uppercase tracking-[0.15em] text-center mb-1 border-b border-gray-300 pb-0.5">
            Projects
          </h2>
          <div className="space-y-1 mt-1">
            {projects.map((proj) => (
              <div key={proj.id}>
                <h3 className="font-bold text-xs">
                  {proj.name}
                  {proj.link && (
                    <span className="font-normal text-[9px] text-gray-600 ml-1">
                      {proj.link}
                    </span>
                  )}
                  {proj.technologies && (
                    <span className="font-normal text-[9px] text-gray-600 ml-1">
                      — {proj.technologies}
                    </span>
                  )}
                </h3>
                {proj.description && (
                  <ul className="text-[9px] leading-snug list-none">
                    {getBulletPoints(proj.description).map((point, i) => (
                      <li key={i} className="flex gap-1">
                        <span>•</span>
                        <span>{point.trim()}</span>
                      </li>
                    ))}
                  </ul>
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
