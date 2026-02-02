import { motion } from "framer-motion";
import { Check, FileText, ShieldCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { templates, type TemplateId } from "./templates/types";

interface TemplateSelectorProps {
  onSelectTemplate: (templateId: TemplateId) => void;
}

const TemplateSelector = ({ onSelectTemplate }: TemplateSelectorProps) => {
  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <Badge variant="secondary" className="mb-4 gap-1">
            <ShieldCheck className="w-3 h-3" />
            All templates are ATS-friendly
          </Badge>
          <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-3">
            Choose Your Template
          </h1>
          <p className="text-muted-foreground max-w-md mx-auto">
            All templates use clean, simple formatting optimized for Applicant Tracking Systems.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {templates.map((template, index) => (
            <motion.div
              key={template.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card
                className="group cursor-pointer border-2 border-border hover:border-primary transition-all duration-300 overflow-hidden"
                onClick={() => onSelectTemplate(template.id)}
              >
                <CardContent className="p-0">
                  {/* Template Preview - Black & White */}
                  <div className="h-48 bg-gray-100 relative overflow-hidden">
                    <div className="absolute inset-4 bg-white rounded shadow-lg p-3 transform group-hover:scale-105 transition-transform duration-300">
                      {template.id === "modern" ? (
                        <div className="h-full space-y-2">
                          <div className="h-2.5 bg-gray-800 rounded w-2/3"></div>
                          <div className="h-1 bg-gray-300 rounded w-full"></div>
                          <div className="border-b-2 border-black mt-1 mb-2"></div>
                          <div className="h-1.5 bg-gray-200 rounded w-1/3"></div>
                          <div className="h-1 bg-gray-100 rounded w-full"></div>
                          <div className="h-1 bg-gray-100 rounded w-5/6"></div>
                        </div>
                      ) : template.id === "professional" ? (
                        <div className="h-full space-y-2">
                          <div className="h-2.5 bg-gray-800 rounded w-1/2"></div>
                          <div className="h-1 bg-gray-300 rounded w-2/3"></div>
                          <div className="border-b-2 border-black mt-1 mb-2"></div>
                          <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-1">
                              <div className="h-1 bg-gray-200 rounded"></div>
                              <div className="h-1 bg-gray-100 rounded"></div>
                            </div>
                            <div className="space-y-1">
                              <div className="h-1 bg-gray-200 rounded"></div>
                              <div className="h-1 bg-gray-100 rounded"></div>
                            </div>
                          </div>
                        </div>
                      ) : template.id === "minimal" ? (
                        <div className="h-full flex flex-col items-center pt-2 space-y-2">
                          <div className="h-2.5 bg-gray-800 rounded w-1/2"></div>
                          <div className="h-1 bg-gray-300 rounded w-2/3"></div>
                          <div className="w-full border-b border-gray-300 mt-1"></div>
                          <div className="h-1.5 bg-gray-200 rounded w-1/3"></div>
                          <div className="h-1 bg-gray-100 rounded w-4/5"></div>
                          <div className="h-1 bg-gray-100 rounded w-3/5"></div>
                        </div>
                      ) : (
                        <div className="h-full space-y-2">
                          <div className="h-2.5 bg-gray-800 rounded w-1/2"></div>
                          <div className="border-b-2 border-black pb-1">
                            <div className="h-1 bg-gray-300 rounded w-3/4"></div>
                          </div>
                          <div className="space-y-1.5">
                            <div className="h-1.5 bg-gray-200 rounded w-1/3"></div>
                            <div className="h-1 bg-gray-100 rounded w-full"></div>
                            <div className="h-1 bg-gray-100 rounded w-5/6"></div>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <Button variant="secondary" size="sm" className="gap-2">
                        <Check className="w-4 h-4" />
                        Select
                      </Button>
                    </div>
                  </div>

                  {/* Template Info */}
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <FileText className="w-4 h-4 text-primary" />
                      <h3 className="font-semibold text-foreground">{template.name}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {template.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TemplateSelector;
