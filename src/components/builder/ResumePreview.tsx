import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Download, Loader2 } from "lucide-react";
import type { ResumeData } from "@/pages/Builder";
import type { TemplateId } from "./templates/types";
import { useRef, useState, useEffect, useCallback } from "react";
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

// A4 dimensions for preview (scaled for screen display)
const PAGE_WIDTH_PX = 595; // A4 width at 72 DPI
const PAGE_HEIGHT_PX = 842; // A4 height at 72 DPI (297/210 * 595)

const ResumePreview = ({ resumeData, templateId }: ResumePreviewProps) => {
  const resumeRef = useRef<HTMLDivElement>(null);
  const contentMeasureRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const { personalInfo, experience, education, skills, projects } = resumeData;

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
  };

  // Measure content height and calculate pages needed
  const measureContent = useCallback(() => {
    if (contentMeasureRef.current) {
      const contentHeight = contentMeasureRef.current.scrollHeight;
      const pagesNeeded = Math.ceil(contentHeight / PAGE_HEIGHT_PX);
      setTotalPages(Math.max(1, pagesNeeded));
    }
  }, []);

  useEffect(() => {
    measureContent();
    
    // Use ResizeObserver to detect content changes
    const observer = new ResizeObserver(() => {
      measureContent();
    });
    
    if (contentMeasureRef.current) {
      observer.observe(contentMeasureRef.current);
    }
    
    return () => observer.disconnect();
  }, [resumeData, measureContent]);

  const handleDownload = async () => {
    if (!contentMeasureRef.current || !hasContent) {
      toast({
        title: "Cannot generate PDF",
        description: "Please fill in your resume details first.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);

    try {
      const element = contentMeasureRef.current;

      // Create a temporary container for full-height rendering
      const tempContainer = document.createElement('div');
      tempContainer.style.position = 'absolute';
      tempContainer.style.left = '-9999px';
      tempContainer.style.top = '0';
      tempContainer.style.width = `${PAGE_WIDTH_PX}px`;
      tempContainer.style.background = 'white';
      
      // Clone the resume content
      const clone = element.cloneNode(true) as HTMLElement;
      clone.style.maxHeight = 'none';
      clone.style.overflow = 'visible';
      clone.style.height = 'auto';
      
      tempContainer.appendChild(clone);
      document.body.appendChild(tempContainer);

      // Wait for fonts and images to load
      await new Promise(resolve => setTimeout(resolve, 100));

      // Render to canvas with high scale for crisp text
      const canvas = await html2canvas(clone, {
        scale: 3,
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
      
      // Calculate how many pages we need
      const pageHeightInCanvasPixels = (canvas.width * pdfHeight) / pdfWidth;
      const pdfTotalPages = Math.ceil(canvas.height / pageHeightInCanvasPixels);

      const pdf = new jsPDF("p", "mm", "a4");

      for (let page = 0; page < pdfTotalPages; page++) {
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
        description: `Your resume has been saved successfully (${pdfTotalPages} page${pdfTotalPages > 1 ? 's' : ''}).`,
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
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-display font-semibold text-foreground">Preview</h2>
          {totalPages > 1 && (
            <span className="text-sm text-muted-foreground bg-muted px-2 py-1 rounded">
              {totalPages} pages
            </span>
          )}
        </div>
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

      {/* Hidden content for measuring full height */}
      <div 
        ref={contentMeasureRef}
        className="absolute left-[-9999px] p-5"
        style={{ width: `${PAGE_WIDTH_PX}px`, background: '#fff', color: '#111' }}
      >
        {hasContent && renderTemplate()}
      </div>

      {/* Visible stacked A4 pages */}
      <Card className="border-border shadow-lg overflow-hidden">
        <CardContent className="p-0">
          <ScrollArea className="h-[700px]">
            <div className="p-4 space-y-4" ref={resumeRef}>
              {!hasContent ? (
                <div 
                  className="mx-auto flex items-center justify-center shadow-md"
                  style={{ 
                    width: `${PAGE_WIDTH_PX}px`, 
                    height: `${PAGE_HEIGHT_PX}px`,
                    background: '#fff',
                    color: '#9ca3af'
                  }}
                >
                  <div className="text-center">
                    <p className="text-lg mb-2">Your resume preview will appear here</p>
                    <p className="text-sm">Start filling in your details on the left</p>
                  </div>
                </div>
              ) : (
                Array.from({ length: totalPages }).map((_, pageIndex) => (
                  <div
                    key={pageIndex}
                    className="shadow-md mx-auto relative"
                    style={{
                      width: `${PAGE_WIDTH_PX}px`,
                      height: `${PAGE_HEIGHT_PX}px`,
                      overflow: 'hidden',
                      background: '#fff',
                    }}
                  >
                    {/* Page number indicator */}
                    <div 
                      className="absolute top-2 right-2 text-xs px-2 py-0.5 rounded z-10"
                      style={{ background: '#f9fafb', color: '#9ca3af' }}
                    >
                      {pageIndex + 1} / {totalPages}
                    </div>
                    
                    {/* Content positioned to show correct slice */}
                    <div
                      className="p-5"
                      style={{
                        position: 'absolute',
                        top: `-${pageIndex * (PAGE_HEIGHT_PX - 40)}px`,
                        left: 0,
                        right: 0,
                        color: '#111',
                      }}
                    >
                      {renderTemplate()}
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResumePreview;
