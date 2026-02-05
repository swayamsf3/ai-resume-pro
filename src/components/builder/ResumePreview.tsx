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
import NormalTemplate from "./templates/NormalTemplate";
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

      // Create a temporary container for full-height rendering
      const tempContainer = document.createElement('div');
      tempContainer.style.position = 'absolute';
      tempContainer.style.left = '-9999px';
      tempContainer.style.top = '0';
      tempContainer.style.width = '210mm';
      tempContainer.style.background = 'white';
      
      // Clone the resume content and remove height constraints
      const clone = element.cloneNode(true) as HTMLElement;
      clone.style.maxHeight = 'none';
      clone.style.overflow = 'visible';
      clone.style.height = 'auto';
      clone.style.aspectRatio = 'unset';
      
      tempContainer.appendChild(clone);
      document.body.appendChild(tempContainer);

      // Wait for fonts and images to load
      await new Promise(resolve => setTimeout(resolve, 100));

      // Render the cloned element to a canvas with higher scale for crisp text
      const canvas = await html2canvas(clone, {
        scale: 3, // Increased from 2 for sharper text
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
        width: clone.scrollWidth,
        height: clone.scrollHeight,
      });

      // Cleanup temporary container
      document.body.removeChild(tempContainer);

      // A4 dimensions in mm
      const pdfWidth = 210;
      const pdfHeight = 297;
      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * pdfWidth) / canvas.width;

      const pdf = new jsPDF("p", "mm", "a4");
      
      // Calculate how many pages we need
      const pageHeightInCanvasPixels = (canvas.width * pdfHeight) / pdfWidth;
      const totalPages = Math.ceil(canvas.height / pageHeightInCanvasPixels);

      for (let page = 0; page < totalPages; page++) {
        if (page > 0) {
          pdf.addPage();
        }

        // Calculate the portion of canvas for this page
        const sourceY = page * pageHeightInCanvasPixels;
        const sourceHeight = Math.min(
          pageHeightInCanvasPixels,
          canvas.height - sourceY
        );

        // Create a temporary canvas for this page slice
        const pageCanvas = document.createElement('canvas');
        pageCanvas.width = canvas.width;
        pageCanvas.height = sourceHeight;
        const ctx = pageCanvas.getContext('2d');
        
        if (ctx) {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
          ctx.drawImage(
            canvas,
            0, sourceY, canvas.width, sourceHeight,
            0, 0, canvas.width, sourceHeight
          );
        }

        // Calculate the height for this page in mm
        const pageHeightMm = (sourceHeight / canvas.width) * pdfWidth;

        pdf.addImage(
          pageCanvas.toDataURL('image/png'),
          'PNG',
          0,
          0,
          pdfWidth,
          pageHeightMm
        );
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
      case "normal":
        return <NormalTemplate {...templateProps} />;
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
