import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { FileText, Briefcase, User, Menu, X, LogOut, Settings, Shield } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
const ADMIN_EMAIL = "admin@swayam.com";

const Header = () => {
  const location = useLocation();
  const { user, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isAdmin = user?.email === ADMIN_EMAIL;
  const navLinks = [{
    path: "/",
    label: "Home",
    icon: null
  }, {
    path: "/builder",
    label: "Resume Builder",
    icon: FileText
  }, {
    path: "/jobs",
    label: "Job Recommendations",
    icon: Briefcase
  }];
  const isActive = (path: string) => location.pathname === path;
  return <header className="fixed top-0 left-0 right-0 z-50 glass">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center shadow-md">
              <FileText className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-display text-xl font-bold text-foreground">
              ​Ai- Resume Builder  
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map(link => <Link key={link.path} to={link.path}>
                <Button variant={isActive(link.path) ? "default" : "ghost"} size="sm" className="gap-2">
                  {link.icon && <link.icon className="w-4 h-4" />}
                  {link.label}
                </Button>
              </Link>)}
          </nav>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center gap-2">
            {user ? (
              <>
                <Link to="/dashboard">
                  <Button variant="ghost" size="sm" className="gap-2">
                    <User className="w-4 h-4" />
                    Dashboard
                  </Button>
                </Link>
                <Link to="/profile">
                  <Button variant="ghost" size="sm" className="gap-2">
                    <Settings className="w-4 h-4" />
                    Profile
                  </Button>
                </Link>
                {isAdmin && (
                  <Link to="/admin/jobs">
                    <Button variant="ghost" size="sm" className="gap-2">
                      <Shield className="w-4 h-4" />
                      Admin
                    </Button>
                  </Link>
                )}
                <Button variant="outline" size="sm" className="gap-2" onClick={signOut}>
                  <LogOut className="w-4 h-4" />
                  Logout
                </Button>
              </>
            ) : (
              <Link to="/auth">
                <Button variant="hero" size="sm">
                  Get Started
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 rounded-lg hover:bg-muted transition-colors">
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && <motion.div initial={{
        opacity: 0,
        height: 0
      }} animate={{
        opacity: 1,
        height: "auto"
      }} exit={{
        opacity: 0,
        height: 0
      }} className="md:hidden glass border-t border-border">
            <div className="container mx-auto px-4 py-4 flex flex-col gap-2">
              {navLinks.map(link => <Link key={link.path} to={link.path} onClick={() => setMobileMenuOpen(false)}>
                  <Button variant={isActive(link.path) ? "default" : "ghost"} className="w-full justify-start gap-2">
                    {link.icon && <link.icon className="w-4 h-4" />}
                    {link.label}
                  </Button>
                </Link>)}
              <div className="border-t border-border my-2" />
              {user ? (
                <>
                  <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start gap-2">
                      <User className="w-4 h-4" />
                      Dashboard
                    </Button>
                  </Link>
                  <Link to="/profile" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start gap-2">
                      <Settings className="w-4 h-4" />
                      Profile
                    </Button>
                  </Link>
                   {isAdmin && (
                     <Link to="/admin/jobs" onClick={() => setMobileMenuOpen(false)}>
                       <Button variant="ghost" className="w-full justify-start gap-2">
                         <Shield className="w-4 h-4" />
                         Admin
                       </Button>
                     </Link>
                   )}
                   <Button 
                     variant="outline" 
                     className="w-full justify-start gap-2" 
                     onClick={() => { signOut(); setMobileMenuOpen(false); }}
                   >
                     <LogOut className="w-4 h-4" />
                     Logout
                   </Button>
                </>
              ) : (
                <Link to="/auth" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="hero" className="w-full">
                    Get Started
                  </Button>
                </Link>
              )}
            </div>
          </motion.div>}
      </AnimatePresence>
    </header>;
};
export default Header;