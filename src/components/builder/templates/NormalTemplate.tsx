import type { ResumeData } from "@/pages/Builder";

interface TemplateProps {
  resumeData: ResumeData;
  formatDate: (dateString: string) => string;
}

const NormalTemplate = ({ resumeData, formatDate }: TemplateProps) => {
  const { personalInfo, experience, education, skills, projects, certifications } = resumeData;

  const getBulletPoints = (description: string) => {
    if (!description) return [];
    return description.split(/[•\n]/).filter(s => s.trim().length > 0).slice(0, 5);
  };

  return (
    <div className="space-y-2 text-black text-[10px]">
      {/* Header - Name left, Contact right */}
      <header className="flex justify-between items-baseline border-b border-black pb-1">
        <h1 className="text-lg font-bold">
          {personalInfo.fullName || "Your Name"}
        </h1>
        <div className="text-[10px] text-gray-700">
          {[personalInfo.phone, personalInfo.email].filter(Boolean).join("; ")}
        </div>
      </header>

      {/* Summary */}
      {personalInfo.summary && (
        <section>
          <h2 className="font-bold uppercase text-[10px] border-b border-gray-400 pb-0.5 mb-1">
            Professional Summary
          </h2>
          <p className="text-[10px] leading-snug">
            {personalInfo.summary}
          </p>
        </section>
      )}

      {/* Education */}
      {education.length > 0 && (
        <section>
          <h2 className="font-bold uppercase text-[10px] border-b border-gray-400 pb-0.5 mb-1">
            Education
          </h2>
          <div className="space-y-0.5">
            {education.map((edu) => (
              <div key={edu.id} className="text-[10px]">
                <p className="font-semibold">
                  {edu.degree}{edu.field && ` – ${edu.field}`}
                  {edu.startDate && ` (${formatDate(edu.startDate)}–${formatDate(edu.endDate)})`}
                </p>
                <p className="text-gray-700">
                  {edu.institution}
                  {edu.gpa && ` | CGPA: ${edu.gpa}`}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Skills */}
      {skills.length > 0 && (
        <section>
          <h2 className="font-bold uppercase text-[10px] border-b border-gray-400 pb-0.5 mb-1">
            Skills
          </h2>
          <ul className="text-[10px] leading-snug list-none space-y-0.5">
            {skills.map((skill, i) => (
              <li key={i} className="flex gap-1">
                <span>•</span>
                <span>{skill}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Experience */}
      {experience.length > 0 && (
        <section>
          <h2 className="font-bold uppercase text-[10px] border-b border-gray-400 pb-0.5 mb-1">
            Experience
          </h2>
          <div className="space-y-1.5">
            {experience.map((exp) => (
              <div key={exp.id}>
                <div className="flex justify-between items-baseline">
                  <h3 className="font-semibold text-[10px]">{exp.position}</h3>
                  <span className="text-[9px] text-gray-600 whitespace-nowrap">
                    {formatDate(exp.startDate)} – {exp.current ? "Present" : formatDate(exp.endDate)}
                  </span>
                </div>
                <p className="text-[9px] text-gray-700">{exp.company}</p>
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
        <section>
          <h2 className="font-bold uppercase text-[10px] border-b border-gray-400 pb-0.5 mb-1">
            Projects
          </h2>
          <div className="space-y-1.5">
            {projects.map((proj) => (
              <div key={proj.id}>
                <h3 className="font-semibold text-[10px]">
                  {proj.name}
                  {proj.technologies && (
                    <span className="font-normal text-gray-600"> | {proj.technologies}</span>
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
                {proj.link && (
                  <p className="text-[9px] text-gray-600">Link: {proj.link}</p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Certifications */}
      {certifications && certifications.length > 0 && (
        <section>
          <h2 className="font-bold uppercase text-[10px] border-b border-gray-400 pb-0.5 mb-1">
            Certifications
          </h2>
          <ul className="text-[10px] leading-snug list-none space-y-0.5">
            {certifications.map((cert) => (
              <li key={cert.id} className="flex gap-1">
                <span>•</span>
                <span>
                  {cert.name}
                  {cert.issuer && ` – ${cert.issuer}`}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
};

export default NormalTemplate;
