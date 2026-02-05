import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Download, Loader2 } from "lucide-react";
import type { ResumeData } from "@/pages/Builder";
import type { TemplateId } from "./templates/types";
import { useRef, useState } from "react";
import ClassicTemplate from "./templates/ClassicTemplate";
import ModernTemplate from "./templates/ModernTemplate";
import MinimalTemplate from "./templates/MinimalTemplate";
import ProfessionalTemplate from "./templates/ProfessionalTemplate";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { toast } from "@/hooks/use-toast";

interface ResumePreviewProps {
  resumeData: ResumeData;
  templateId: TemplateId;
}

const ResumePreview = ({ resumeData, templateId }: ResumePreviewProps) => {
  const resumeRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const { personalInfo, experience, education, skills, projects } = resumeData;

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
  };

  const handleDownload = async () => {
    if (!resumeRef.current || !hasContent) {
      toast({
        title: "Cannot generate PDF",
        description: "Please fill in your resume details first.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);

    try {
      const element = resumeRef.current;

      // Render the resume element to a canvas
      const canvas = await html2canvas(element, {
        scale: 2, // Higher scale for better quality
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
      });

      // A4 dimensions in mm
      const imgWidth = 210;
      const pageHeight = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      const pdf = new jsPDF("p", "mm", "a4");
      const imgData = canvas.toDataURL("image/png");

      let position = 0;
      let heightLeft = imgHeight;

      // Add first page
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Add additional pages if content overflows
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      // Generate filename from user's name or default
      const fileName = personalInfo.fullName
        ? `${personalInfo.fullName.replace(/\s+/g, "_")}_Resume.pdf`
        : "Resume.pdf";

      pdf.save(fileName);

      toast({
        title: "PDF Downloaded!",
        description: "Your resume has been saved successfully.",
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast({
        title: "Error generating PDF",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
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
        <Button 
          onClick={handleDownload} 
          variant="default" 
          size="sm" 
          className="gap-2"
          disabled={isGenerating || !hasContent}
        >
          {isGenerating ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Download className="w-4 h-4" />
          )}
          {isGenerating ? "Generating..." : "Download PDF"}
        </Button>
      </div>

      <Card className="border-border shadow-lg overflow-hidden">
        <CardContent className="p-0">
          <div
            ref={resumeRef}
            className="bg-white text-gray-900 p-5 min-h-[700px] print:min-h-0 overflow-hidden"
            style={{ aspectRatio: "210/297", maxHeight: "900px" }}
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
