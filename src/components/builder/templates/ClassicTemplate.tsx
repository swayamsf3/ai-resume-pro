import type { ResumeData } from "@/pages/Builder";

interface TemplateProps {
  resumeData: ResumeData;
  formatDate: (dateString: string) => string;
}

const ClassicTemplate = ({ resumeData, formatDate }: TemplateProps) => {
  const { personalInfo, experience, education, skills, projects, certifications } = resumeData;

  // Helper to split description into bullet points
  const getBulletPoints = (description: string) => {
    if (!description) return [];
    return description.split(/[•\n]/).filter(s => s.trim().length > 0).slice(0, 5);
  };

  return (
    <div className="space-y-2 text-black">
      {/* Header / Personal Info */}
      <header className="border-b-2 border-black pb-1">
        <div className="flex justify-between items-baseline">
          <h1 className="text-xl font-bold">
            {personalInfo.fullName || "Your Name"}
          </h1>
          <div className="text-[10px] text-gray-700">
            {[personalInfo.phone, personalInfo.email].filter(Boolean).join(" | ")}
          </div>
        </div>
        <div className="flex flex-wrap gap-2 text-[10px] text-gray-700">
          {personalInfo.location && <span>{personalInfo.location}</span>}
          {personalInfo.linkedin && <span>| {personalInfo.linkedin}</span>}
          {personalInfo.portfolio && <span>| {personalInfo.portfolio}</span>}
        </div>
      </header>

      {/* Summary */}
      {personalInfo.summary && (
        <section className="resume-section">
          <h2 className="text-[10px] font-bold uppercase tracking-wider mb-1 border-b border-gray-300 pb-0.5">
            Professional Summary
          </h2>
          <p className="text-[11px] leading-snug">
            {personalInfo.summary}
          </p>
        </section>
      )}

      {/* Experience */}
      {experience.length > 0 && (
        <section className="resume-section-large">
          <h2 className="text-[10px] font-bold uppercase tracking-wider mb-1 border-b border-gray-300 pb-0.5">
            Experience
          </h2>
          <div className="space-y-1.5">
            {experience.map((exp) => (
              <div key={exp.id} className="resume-item">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-xs">{exp.position}</h3>
                    <p className="text-[10px] text-gray-700">{exp.company}</p>
                  </div>
                  <span className="text-[10px] text-gray-600 whitespace-nowrap">
                    {formatDate(exp.startDate)} - {exp.current ? "Present" : formatDate(exp.endDate)}
                  </span>
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

      {/* Education */}
      {education.length > 0 && (
        <section className="resume-section">
          <h2 className="text-[10px] font-bold uppercase tracking-wider mb-1 border-b border-gray-300 pb-0.5">
            Education
          </h2>
          <div className="space-y-0.5">
            {education.map((edu) => (
              <div key={edu.id} className="resume-item text-[10px] flex justify-between">
                <span>
                  <span className="font-semibold">{edu.degree}{edu.field && ` in ${edu.field}`}</span>
                  {" | "}{edu.institution}
                  {edu.gpa && ` | GPA: ${edu.gpa}`}
                </span>
                <span className="text-gray-600 whitespace-nowrap ml-2">
                  {formatDate(edu.startDate)} - {formatDate(edu.endDate)}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Skills */}
      {skills.length > 0 && (
        <section className="resume-section">
          <h2 className="text-[10px] font-bold uppercase tracking-wider mb-1 border-b border-gray-300 pb-0.5">
            Skills
          </h2>
          <p className="text-[10px] leading-snug">
            {skills.join(" • ")}
          </p>
        </section>
      )}

      {/* Certifications */}
      {certifications && certifications.length > 0 && (
        <section className="resume-section">
          <h2 className="text-[10px] font-bold uppercase tracking-wider mb-1 border-b border-gray-300 pb-0.5">
            Certifications
          </h2>
          <div className="space-y-0.5">
            {certifications.map((cert) => (
              <div key={cert.id} className="flex justify-between text-[10px]">
                <span>{cert.name}{cert.issuer ? ` (${cert.issuer})` : ""}</span>
                {cert.date && <span className="text-gray-600 whitespace-nowrap ml-2">{formatDate(cert.date)}</span>}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Projects */}
      {projects.length > 0 && (
        <section className="resume-section-large">
          <h2 className="text-[10px] font-bold uppercase tracking-wider mb-1 border-b border-gray-300 pb-0.5">
            Projects
          </h2>
          <div className="space-y-1 mt-1">
            {projects.map((proj) => (
              <div key={proj.id} className="resume-item">
                <div className="flex items-baseline gap-1 flex-wrap">
                  <h3 className="font-semibold text-xs">{proj.name}</h3>
                  {proj.link && (
                    <span className="text-[9px] text-gray-600">| {proj.link}</span>
                  )}
                  {proj.technologies && (
                    <span className="text-[9px] text-gray-600">| {proj.technologies}</span>
                  )}
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
    </div>
  );
};

export default ClassicTemplate;
