import { Link } from "react-router-dom";
import { FileText, Github, Twitter, Linkedin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-card border-t border-border py-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center">
                <FileText className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-display text-xl font-bold text-foreground">Ai -Resume Builder

              </span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Build professional resumes with AI and find your dream job with personalized recommendations.
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="font-display font-semibold text-foreground mb-4">Product</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/builder" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Resume Builder
                </Link>
              </li>
              <li>
                <Link to="/jobs" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Job Recommendations
                </Link>
              </li>
              <li>
                <Link to="/templates" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Templates
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-display font-semibold text-foreground mb-4">
            </h4>
            <ul className="space-y-2">
              <li>
                <Link to="/about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-sm text-muted-foreground hover:text-foreground transition-colors">

                </Link>
              </li>
              <li>
                


              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="font-display font-semibold text-foreground mb-4">
            </h4>
            <div className="flex gap-3">
              <a href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-primary/10 transition-colors">

                <Github className="w-5 h-5" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-primary/10 transition-colors">

                <Twitter className="w-5 h-5" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-primary/10 transition-colors">

                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">

          </p>
          <p className="text-sm text-muted-foreground">
               • Department of IT, HVPM COET
          </p>
        </div>
      </div>
    </footer>);

};

export default Footer;