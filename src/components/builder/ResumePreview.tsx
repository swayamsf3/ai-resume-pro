import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Download, Loader2 } from "lucide-react";
import type { ResumeData } from "@/pages/Builder";
import type { TemplateId } from "./templates/types";
import { useRef, useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import ClassicTemplate from "./templates/ClassicTemplate";
import ModernTemplate from "./templates/ModernTemplate";

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
const CONTENT_PADDING = 20; // Padding inside each page
const USABLE_PAGE_HEIGHT = PAGE_HEIGHT_PX - (CONTENT_PADDING * 2); // 802px usable content height

const ResumePreview = ({ resumeData, templateId }: ResumePreviewProps) => {
  const { user } = useAuth();
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
      const pagesNeeded = Math.ceil(contentHeight / USABLE_PAGE_HEIGHT);
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
      tempContainer.style.position = 'fixed';
      tempContainer.style.left = '-9999px';
      tempContainer.style.top = '0';
      tempContainer.style.width = `${PAGE_WIDTH_PX}px`;
      tempContainer.style.background = 'white';
      tempContainer.style.zIndex = '-1';

      // Clone the resume content
      const clone = element.cloneNode(true) as HTMLElement;
      clone.style.position = 'relative';
      clone.style.left = '0';
      clone.style.maxHeight = 'none';
      clone.style.overflow = 'visible';
      clone.style.height = 'auto';
      clone.style.width = `${PAGE_WIDTH_PX}px`;
      clone.style.padding = `${CONTENT_PADDING}px`;
      clone.style.boxSizing = 'border-box';
      clone.style.color = '#111';
      clone.style.background = '#ffffff';

      tempContainer.appendChild(clone);
      document.body.appendChild(tempContainer);

      // Wait for fonts and layout to fully render
      await new Promise(resolve => setTimeout(resolve, 300));

      // Force explicit height so html2canvas captures everything
      const fullHeight = clone.scrollHeight;
      clone.style.height = `${fullHeight}px`;

      // Render to canvas with explicit dimensions
      const canvas = await html2canvas(clone, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
        width: PAGE_WIDTH_PX,
        height: fullHeight,
        windowWidth: PAGE_WIDTH_PX,
        windowHeight: fullHeight,
      });

      // Cleanup temporary container
      document.body.removeChild(tempContainer);

      // Convert full canvas to image
      const imgData = canvas.toDataURL('image/jpeg', 0.92);
      const pdfWidth = 210;
      const pdfHeight = 297;

      // Calculate total image height in mm (proportional to width)
      const imgHeightMm = (canvas.height * pdfWidth) / canvas.width;
      const pdfTotalPages = Math.ceil(imgHeightMm / pdfHeight);

      const pdf = new jsPDF({
        orientation: "p",
        unit: "mm",
        format: "a4",
        compress: true
      });

      for (let page = 0; page < pdfTotalPages; page++) {
        if (page > 0) pdf.addPage();
        // Place the full image with negative Y offset to show correct page slice
        pdf.addImage(imgData, 'JPEG', 0, -(page * pdfHeight), pdfWidth, imgHeightMm);
      }

      // Generate filename from user's name or default
      const fileName = personalInfo.fullName
        ? `${personalInfo.fullName.replace(/\s+/g, "_")}_Resume.pdf`
        : "Resume.pdf";

      pdf.save(fileName);

      // Upload to Supabase Storage in background
      if (user) {
        try {
          const blob = pdf.output("blob");
          // Fetch account name from profiles table
          const { data: profile } = await supabase
            .from("profiles")
            .select("full_name")
            .eq("user_id", user.id)
            .maybeSingle();

          const accountName = profile?.full_name
            ? profile.full_name.replace(/\s+/g, "_")
            : "Resume";

          const storageName = `${accountName}_Resume_${Date.now()}.pdf`;
          const storagePath = `${user.id}/${storageName}`;
          const { error: uploadError } = await supabase.storage
            .from("generated-resumes")
            .upload(storagePath, blob, { contentType: "application/pdf" });
          if (uploadError) throw uploadError;
          toast({
            title: "PDF Downloaded & Saved!",
            description: `Your resume (${pdfTotalPages} page${pdfTotalPages > 1 ? 's' : ''}) has been downloaded and saved to your account.`,
          });
        } catch (uploadErr) {
          console.error("Failed to upload PDF to storage:", uploadErr);
          toast({
            title: "PDF Downloaded!",
            description: `Downloaded locally but failed to save to your account.`,
          });
        }
      } else {
        toast({
          title: "PDF Downloaded!",
          description: `Your resume has been saved successfully (${pdfTotalPages} page${pdfTotalPages > 1 ? 's' : ''}).`,
        });
      }
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
        style={{ 
          position: 'fixed',
          left: '-9999px',
          top: 0,
          visibility: 'hidden' as const,
          width: `${PAGE_WIDTH_PX}px`, 
          padding: `${CONTENT_PADDING}px`,
          background: '#fff', 
          color: '#111',
          boxSizing: 'border-box' as const,
          display: 'block',
        }}
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
                      style={{
                        position: 'absolute',
                        top: `-${pageIndex * USABLE_PAGE_HEIGHT}px`,
                        left: 0,
                        right: 0,
                        padding: `${CONTENT_PADDING}px`,
                        color: '#111',
                        boxSizing: 'border-box',
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
