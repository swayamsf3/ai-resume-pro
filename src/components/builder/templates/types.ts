export type TemplateId = "classic" | "modern" | "minimal" | "professional";

export interface Template {
  id: TemplateId;
  name: string;
  description: string;
  preview: string; // Color theme indicator
}

export const templates: Template[] = [
  {
    id: "classic",
    name: "Classic",
    description: "Traditional layout with a clean, timeless design",
    preview: "blue",
  },
  {
    id: "modern",
    name: "Modern",
    description: "Bold colors with a contemporary sidebar layout",
    preview: "purple",
  },
  {
    id: "minimal",
    name: "Minimal",
    description: "Clean and simple with focus on content",
    preview: "gray",
  },
  {
    id: "professional",
    name: "Professional",
    description: "Elegant design with accent colors",
    preview: "emerald",
  },
];
