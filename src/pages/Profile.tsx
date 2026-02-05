 import { useState, useEffect } from "react";
 import { useAuth } from "@/hooks/useAuth";
 import { supabase } from "@/integrations/supabase/client";
 import Header from "@/components/layout/Header";
 import Footer from "@/components/layout/Footer";
 import { Button } from "@/components/ui/button";
 import { Input } from "@/components/ui/input";
 import { Label } from "@/components/ui/label";
 import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
 import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
 import { toast } from "sonner";
import { User, Mail, Calendar, Loader2, Save, Pencil } from "lucide-react";
 
 const Profile = () => {
   const { user } = useAuth();
   const [fullName, setFullName] = useState("");
   const [loading, setLoading] = useState(true);
   const [saving, setSaving] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [updatingEmail, setUpdatingEmail] = useState(false);
 
   useEffect(() => {
     const fetchProfile = async () => {
       if (!user) return;
       
       try {
         const { data, error } = await supabase
           .from("profiles")
           .select("full_name")
           .eq("user_id", user.id)
           .maybeSingle();
 
         if (error) throw error;
         if (data?.full_name) {
           setFullName(data.full_name);
         }
       } catch (error) {
         console.error("Error fetching profile:", error);
         toast.error("Failed to load profile");
       } finally {
         setLoading(false);
       }
     };
 
     fetchProfile();
   }, [user]);
 
   const handleSave = async () => {
     if (!user) return;
     
     const trimmedName = fullName.trim();
     if (!trimmedName) {
       toast.error("Name cannot be empty");
       return;
     }
     
     if (trimmedName.length > 100) {
       toast.error("Name must be less than 100 characters");
       return;
     }
 
     setSaving(true);
     try {
       const { error } = await supabase
         .from("profiles")
         .update({ full_name: trimmedName })
         .eq("user_id", user.id);
 
       if (error) throw error;
       toast.success("Profile updated successfully");
     } catch (error) {
       console.error("Error updating profile:", error);
       toast.error("Failed to update profile");
     } finally {
       setSaving(false);
     }
   };
 
  const handleEmailChange = async () => {
    const trimmedEmail = newEmail.trim().toLowerCase();
    
    if (!trimmedEmail) {
      toast.error("Email cannot be empty");
      return;
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      toast.error("Please enter a valid email address");
      return;
    }
    
    if (trimmedEmail.length > 255) {
      toast.error("Email must be less than 255 characters");
      return;
    }
    
    if (trimmedEmail === user?.email) {
      toast.error("This is already your current email");
      return;
    }

    setUpdatingEmail(true);
    try {
      const { error } = await supabase.auth.updateUser({
        email: trimmedEmail,
      });

      if (error) throw error;
      
      toast.success(
        "Confirmation email sent! Please check both your old and new email addresses to confirm the change."
      );
      setEmailDialogOpen(false);
      setNewEmail("");
    } catch (error: any) {
      console.error("Error updating email:", error);
      toast.error(error.message || "Failed to update email");
    } finally {
      setUpdatingEmail(false);
    }
  };

   const getInitials = () => {
     if (fullName) {
       return fullName
         .split(" ")
         .map((n) => n[0])
         .join("")
         .toUpperCase()
         .slice(0, 2);
     }
     return user?.email?.[0]?.toUpperCase() || "U";
   };
 
   const formatDate = (dateString: string) => {
     return new Date(dateString).toLocaleDateString("en-US", {
       year: "numeric",
       month: "long",
       day: "numeric",
     });
   };
 
   if (loading) {
     return (
       <div className="min-h-screen flex flex-col bg-background">
         <Header />
         <main className="flex-1 flex items-center justify-center pt-16">
           <div className="flex flex-col items-center gap-4">
             <Loader2 className="w-8 h-8 animate-spin text-primary" />
             <p className="text-muted-foreground">Loading profile...</p>
           </div>
         </main>
         <Footer />
       </div>
     );
   }
 
   return (
     <div className="min-h-screen flex flex-col bg-background">
       <Header />
       <main className="flex-1 pt-24 pb-12">
         <div className="container mx-auto px-4 max-w-2xl">
           <div className="mb-8">
             <h1 className="text-3xl font-bold text-foreground">Profile Settings</h1>
             <p className="text-muted-foreground mt-2">
               Manage your account information
             </p>
           </div>
 
           <div className="space-y-6">
             {/* Profile Card */}
             <Card>
               <CardHeader>
                 <div className="flex items-center gap-4">
                   <Avatar className="w-16 h-16">
                     <AvatarFallback className="text-xl bg-primary text-primary-foreground">
                       {getInitials()}
                     </AvatarFallback>
                   </Avatar>
                   <div>
                     <CardTitle>{fullName || "No name set"}</CardTitle>
                     <CardDescription>{user?.email}</CardDescription>
                   </div>
                 </div>
               </CardHeader>
             </Card>
 
             {/* Edit Name Card */}
             <Card>
               <CardHeader>
                 <CardTitle className="flex items-center gap-2">
                   <User className="w-5 h-5" />
                   Personal Information
                 </CardTitle>
                 <CardDescription>
                   Update your personal details
                 </CardDescription>
               </CardHeader>
               <CardContent className="space-y-4">
                 <div className="space-y-2">
                   <Label htmlFor="fullName">Full Name</Label>
                   <Input
                     id="fullName"
                     value={fullName}
                     onChange={(e) => setFullName(e.target.value)}
                     placeholder="Enter your full name"
                     maxLength={100}
                   />
                 </div>
                 <Button onClick={handleSave} disabled={saving} className="gap-2">
                   {saving ? (
                     <Loader2 className="w-4 h-4 animate-spin" />
                   ) : (
                     <Save className="w-4 h-4" />
                   )}
                   Save Changes
                 </Button>
               </CardContent>
             </Card>
 
             {/* Account Details Card */}
             <Card>
               <CardHeader>
                 <CardTitle className="flex items-center gap-2">
                   <Mail className="w-5 h-5" />
                   Account Details
                 </CardTitle>
                 <CardDescription>
                   Your account information
                 </CardDescription>
               </CardHeader>
               <CardContent className="space-y-4">
                 <div className="flex items-center justify-between py-3 border-b border-border">
                   <div className="flex items-center gap-3">
                     <Mail className="w-4 h-4 text-muted-foreground" />
                     <span className="text-sm text-muted-foreground">Email</span>
                   </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{user?.email}</span>
                      <Dialog open={emailDialogOpen} onOpenChange={setEmailDialogOpen}>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Pencil className="w-3 h-3" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Change Email Address</DialogTitle>
                            <DialogDescription>
                              Enter your new email address. You'll receive confirmation emails at both
                              your old and new addresses that you must click to complete the change.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div className="space-y-2">
                              <Label htmlFor="currentEmail">Current Email</Label>
                              <Input
                                id="currentEmail"
                                value={user?.email || ""}
                                disabled
                                className="bg-muted"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="newEmail">New Email</Label>
                              <Input
                                id="newEmail"
                                type="email"
                                value={newEmail}
                                onChange={(e) => setNewEmail(e.target.value)}
                                placeholder="Enter your new email address"
                                maxLength={255}
                              />
                            </div>
                          </div>
                          <DialogFooter>
                            <Button
                              variant="outline"
                              onClick={() => {
                                setEmailDialogOpen(false);
                                setNewEmail("");
                              }}
                            >
                              Cancel
                            </Button>
                            <Button onClick={handleEmailChange} disabled={updatingEmail}>
                              {updatingEmail ? (
                                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                              ) : null}
                              Send Confirmation
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                 </div>
                 <div className="flex items-center justify-between py-3">
                   <div className="flex items-center gap-3">
                     <Calendar className="w-4 h-4 text-muted-foreground" />
                     <span className="text-sm text-muted-foreground">Member since</span>
                   </div>
                   <span className="text-sm font-medium">
                     {user?.created_at ? formatDate(user.created_at) : "N/A"}
                   </span>
                 </div>
               </CardContent>
             </Card>
           </div>
         </div>
       </main>
       <Footer />
     </div>
   );
 };
 
 export default Profile;