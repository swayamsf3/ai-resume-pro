export type TemplateId = "classic" | "modern" | "minimal" | "professional";

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
    id: "minimal",
    name: "Minimal",
    description: "Simple centered layout, perfect for ATS parsing",
  },
  {
    id: "professional",
    name: "Professional",
    description: "Structured two-column format, optimized for ATS",
  },
];
