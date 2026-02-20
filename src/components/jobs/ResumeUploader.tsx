import { useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, FileText, Loader2, X } from "lucide-react";
import { useUserResume, UploadStatus } from "@/hooks/useUserResume";
import { Progress } from "@/components/ui/progress";

interface ResumeUploaderProps {
  onClose: () => void;
}

const STATUS_LABELS: Record<UploadStatus, string> = {
  idle: "",
  extracting: "Extracting text from PDF...",
  ocr: "Running OCR on scanned document...",
  matching: "Detecting skills...",
  uploading: "Uploading file...",
  saving: "Saving results...",
};

const STATUS_PROGRESS: Record<UploadStatus, number> = {
  idle: 0,
  extracting: 20,
  ocr: 40,
  matching: 60,
  uploading: 80,
  saving: 95,
};

export function ResumeUploader({ onClose }: ResumeUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { uploadResume, uploadStatus } = useUserResume();

  const isProcessing = uploadResume.isPending;

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file && isValidFile(file)) {
      setSelectedFile(file);
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && isValidFile(file)) {
      setSelectedFile(file);
    }
  };

  const isValidFile = (file: File) => {
    const validTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/msword",
    ];
    const maxSize = 10 * 1024 * 1024;
    
    if (!validTypes.includes(file.type)) {
      alert("Please upload a PDF or DOCX file");
      return false;
    }
    if (file.size > maxSize) {
      alert("File size must be less than 10MB");
      return false;
    }
    return true;
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    
    try {
      await uploadResume.mutateAsync(selectedFile);
      onClose();
    } catch {
      // Error handled by mutation
    }
  };

  return (
    <Card className="border-dashed border-2">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-lg font-semibold">Upload Resume</h3>
          <Button variant="ghost" size="icon" onClick={onClose} disabled={isProcessing}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`
            border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer
            ${isDragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}
            ${isProcessing ? "pointer-events-none opacity-60" : ""}
          `}
          onClick={() => !isProcessing && document.getElementById("resume-input")?.click()}
        >
          <input
            id="resume-input"
            type="file"
            accept=".pdf,.docx,.doc"
            className="hidden"
            onChange={handleFileSelect}
          />
          
          {selectedFile ? (
            <div className="flex flex-col items-center gap-2">
              <FileText className="w-12 h-12 text-primary" />
              <p className="font-medium">{selectedFile.name}</p>
              <p className="text-sm text-muted-foreground">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <Upload className="w-12 h-12 text-muted-foreground" />
              <p className="font-medium">Drop your resume here or click to browse</p>
              <p className="text-sm text-muted-foreground">
                Supports PDF and DOCX (max 10MB)
              </p>
            </div>
          )}
        </div>

        {isProcessing && uploadStatus !== "idle" && (
          <div className="mt-4 space-y-2">
            <Progress value={STATUS_PROGRESS[uploadStatus]} className="h-2" />
            <p className="text-sm text-muted-foreground text-center">
              {STATUS_LABELS[uploadStatus]}
            </p>
          </div>
        )}

        {selectedFile && !isProcessing && (
          <div className="flex gap-2 mt-4">
            <Button
              onClick={handleUpload}
              className="flex-1"
            >
              Upload & Extract Skills
            </Button>
            <Button
              variant="outline"
              onClick={() => setSelectedFile(null)}
            >
              Clear
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
