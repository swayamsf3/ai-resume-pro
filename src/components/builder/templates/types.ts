export type TemplateId = "classic" | "modern" | "professional" | "normal";

export interface Template {
  id: TemplateId;
  name: string;
  description: string;
}

export const templates: Template[] = [
  {
    id: "classic",
    name: "Classic",
    description: "Traditional ATS-friendly layout with clear sections",
  },
  {
    id: "modern",
    name: "Modern",
    description: "Clean design with bold headings, fully ATS compatible",
  },
  {
    id: "professional",
    name: "Professional",
    description: "Structured two-column format, optimized for ATS",
  },
  {
    id: "normal",
    name: "Normal",
    description: "Standard fresher-style resume with skills as bullet list",
  },
];
