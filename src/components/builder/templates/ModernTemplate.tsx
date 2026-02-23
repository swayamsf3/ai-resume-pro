import type { ResumeData } from "@/pages/Builder";

interface TemplateProps {
  resumeData: ResumeData;
  formatDate: (dateString: string) => string;
}

const ModernTemplate = ({ resumeData, formatDate }: TemplateProps) => {
  const { personalInfo, experience, education, skills, projects, certifications } = resumeData;

  const getBulletPoints = (description: string) => {
    if (!description) return [];
    return description.split(/[•\n]/).filter(s => s.trim().length > 0).slice(0, 5);
  };

  const SectionHeader = ({ title }: { title: string }) => (
    <div className="border-b border-black mb-1">
      <h2 className="text-[11px] font-bold uppercase tracking-widest">{title}</h2>
    </div>
  );

  return (
    <div className="space-y-1.5 text-black">
      {/* Header - Centered */}
      <header className="text-center pb-1">
        <h1 className="text-xl font-bold tracking-tight">
          {personalInfo.fullName || "Your Name"}
        </h1>
        <div className="text-[10px] text-gray-700 mt-0.5">
          {[personalInfo.phone, personalInfo.email, personalInfo.linkedin, personalInfo.portfolio, personalInfo.location]
            .filter(Boolean)
            .join(" | ")}
        </div>
      </header>

      {/* Summary */}
      {personalInfo.summary && (
        <section className="resume-section">
          <SectionHeader title="Summary" />
          <p className="text-[10px] leading-snug">{personalInfo.summary}</p>
        </section>
      )}

      {/* Education */}
      {education.length > 0 && (
        <section className="resume-section">
          <SectionHeader title="Education" />
          <div className="space-y-1">
            {education.map((edu) => (
              <div key={edu.id} className="resume-item">
                <div className="flex justify-between">
                  <span className="font-bold text-[11px]">{edu.institution}</span>
                  <span className="text-[10px] whitespace-nowrap ml-2">{personalInfo.location || ""}</span>
                </div>
                <div className="flex justify-between">
                  <span className="italic text-[10px]">
                    {edu.degree}{edu.field && ` in ${edu.field}`}{edu.gpa && ` | GPA: ${edu.gpa}`}
                  </span>
                  <span className="italic text-[10px] text-gray-600 whitespace-nowrap ml-2">
                    {formatDate(edu.startDate)} - {formatDate(edu.endDate)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Experience */}
      {experience.length > 0 && (
        <section className="resume-section-large">
          <SectionHeader title="Experience" />
          <div className="space-y-1.5">
            {experience.map((exp) => (
              <div key={exp.id} className="resume-item">
                <div className="flex justify-between">
                  <span className="font-bold text-[11px]">{exp.position}</span>
                  <span className="text-[10px] whitespace-nowrap ml-2">
                    {formatDate(exp.startDate)} - {exp.current ? "Present" : formatDate(exp.endDate)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="italic text-[10px]">{exp.company}</span>
                  <span className="italic text-[10px] text-gray-600 whitespace-nowrap ml-2">{personalInfo.location || ""}</span>
                </div>
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

      {/* Projects */}
      {projects.length > 0 && (
        <section className="resume-section-large">
          <SectionHeader title="Projects" />
          <div className="space-y-1">
            {projects.map((proj) => (
              <div key={proj.id} className="resume-item">
                <div className="flex justify-between">
                  <span className="text-[11px]">
                    <span className="font-bold">{proj.name}</span>
                    {proj.technologies && <span className="italic text-gray-600"> | {proj.technologies}</span>}
                  </span>
                  {proj.link && <span className="text-[9px] text-gray-600 whitespace-nowrap ml-2">{proj.link}</span>}
                </div>
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

      {/* Technical Skills */}
      {skills.length > 0 && (
        <section className="resume-section">
          <SectionHeader title="Technical Skills" />
          <p className="text-[10px] leading-snug">{skills.join(", ")}</p>
        </section>
      )}

      {/* Certifications */}
      {certifications && certifications.length > 0 && (
        <section className="resume-section">
          <SectionHeader title="Certifications" />
          <div className="space-y-0.5">
            {certifications.map((cert) => (
              <div key={cert.id} className="flex justify-between text-[10px]">
                <span>{cert.name}{cert.issuer ? ` — ${cert.issuer}` : ""}</span>
                {cert.date && <span className="text-gray-600 whitespace-nowrap ml-2">{formatDate(cert.date)}</span>}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default ModernTemplate;
