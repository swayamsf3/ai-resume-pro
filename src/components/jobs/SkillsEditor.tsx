 import { useState, useEffect } from "react";
 import {
   Dialog,
   DialogContent,
   DialogHeader,
   DialogTitle,
   DialogFooter,
 } from "@/components/ui/dialog";
 import { Button } from "@/components/ui/button";
 import { Input } from "@/components/ui/input";
 import { Badge } from "@/components/ui/badge";
 import { X, Plus } from "lucide-react";
 import { useUserResume } from "@/hooks/useUserResume";
 
 interface SkillsEditorProps {
   open: boolean;
   onOpenChange: (open: boolean) => void;
 }
 
 export function SkillsEditor({ open, onOpenChange }: SkillsEditorProps) {
   const { skills, updateSkills } = useUserResume();
   const [editedSkills, setEditedSkills] = useState<string[]>([]);
   const [newSkill, setNewSkill] = useState("");
 
   useEffect(() => {
     if (open) {
       setEditedSkills([...skills]);
     }
   }, [open, skills]);
 
   const handleAddSkill = () => {
     const trimmed = newSkill.trim().toLowerCase();
     if (trimmed && !editedSkills.includes(trimmed)) {
       setEditedSkills([...editedSkills, trimmed]);
       setNewSkill("");
     }
   };
 
   const handleRemoveSkill = (skillToRemove: string) => {
     setEditedSkills(editedSkills.filter((s) => s !== skillToRemove));
   };
 
   const handleKeyDown = (e: React.KeyboardEvent) => {
     if (e.key === "Enter") {
       e.preventDefault();
       handleAddSkill();
     }
   };
 
   const handleSave = async () => {
     await updateSkills.mutateAsync(editedSkills);
     onOpenChange(false);
   };
 
   return (
     <Dialog open={open} onOpenChange={onOpenChange}>
       <DialogContent className="sm:max-w-md">
         <DialogHeader>
           <DialogTitle>Edit Your Skills</DialogTitle>
         </DialogHeader>
 
         <div className="space-y-4">
           {/* Add new skill */}
           <div className="flex gap-2">
             <Input
               placeholder="Add a skill..."
               value={newSkill}
               onChange={(e) => setNewSkill(e.target.value)}
               onKeyDown={handleKeyDown}
             />
             <Button onClick={handleAddSkill} size="icon">
               <Plus className="h-4 w-4" />
             </Button>
           </div>
 
           {/* Skills list */}
           <div className="flex flex-wrap gap-2 max-h-60 overflow-y-auto p-1">
             {editedSkills.map((skill) => (
               <Badge
                 key={skill}
                 variant="secondary"
                 className="text-sm py-1 px-3 gap-1"
               >
                 {skill}
                 <button
                   onClick={() => handleRemoveSkill(skill)}
                   className="ml-1 hover:text-destructive"
                 >
                   <X className="h-3 w-3" />
                 </button>
               </Badge>
             ))}
             {editedSkills.length === 0 && (
               <p className="text-sm text-muted-foreground">
                 No skills added yet. Add skills to improve your job matches.
               </p>
             )}
           </div>
         </div>
 
         <DialogFooter>
           <Button variant="outline" onClick={() => onOpenChange(false)}>
             Cancel
           </Button>
           <Button
             onClick={handleSave}
             disabled={updateSkills.isPending}
           >
             {updateSkills.isPending ? "Saving..." : "Save Changes"}
           </Button>
         </DialogFooter>
       </DialogContent>
     </Dialog>
   );
 }