import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Download } from "lucide-react";
import type { ResumeData } from "@/pages/Builder";
import type { TemplateId } from "./templates/types";
import { useRef } from "react";
import ClassicTemplate from "./templates/ClassicTemplate";
import ModernTemplate from "./templates/ModernTemplate";
import MinimalTemplate from "./templates/MinimalTemplate";
import ProfessionalTemplate from "./templates/ProfessionalTemplate";

interface ResumePreviewProps {
  resumeData: ResumeData;
  templateId: TemplateId;
}

const ResumePreview = ({ resumeData, templateId }: ResumePreviewProps) => {
  const resumeRef = useRef<HTMLDivElement>(null);
  const { personalInfo, experience, education, skills, projects } = resumeData;

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
  };

  const handleDownload = () => {
    // For now, trigger print dialog which allows saving as PDF
    window.print();
  };

  const hasContent =
    personalInfo.fullName ||
    personalInfo.email ||
    experience.length > 0 ||
    education.length > 0 ||
    skills.length > 0 ||
    projects.length > 0;

  const renderTemplate = () => {
    const templateProps = { resumeData, formatDate };

    switch (templateId) {
      case "modern":
        return <ModernTemplate {...templateProps} />;
      case "minimal":
        return <MinimalTemplate {...templateProps} />;
      case "professional":
        return <ProfessionalTemplate {...templateProps} />;
      case "classic":
      default:
        return <ClassicTemplate {...templateProps} />;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-display font-semibold text-foreground">Preview</h2>
        <Button onClick={handleDownload} variant="default" size="sm" className="gap-2">
          <Download className="w-4 h-4" />
          Download PDF
        </Button>
      </div>

      <Card className="border-border shadow-lg overflow-hidden">
        <CardContent className="p-0">
          <div
            ref={resumeRef}
            className="bg-white text-gray-900 p-8 min-h-[800px] print:min-h-0 overflow-hidden"
            style={{ aspectRatio: "8.5/11" }}
          >
            {!hasContent ? (
              <div className="h-full flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <p className="text-lg mb-2">Your resume preview will appear here</p>
                  <p className="text-sm">Start filling in your details on the left</p>
                </div>
              </div>
            ) : (
              renderTemplate()
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResumePreview;
