import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

const CTASection = () => {
  return (
    <section className="py-24 bg-gradient-hero relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-72 h-72 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto text-center"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-6">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-white/90">
              Start for Free
            </span>
          </div>

          <h2 className="text-3xl md:text-5xl font-display font-bold text-white mb-6">
            Ready to Build Your
            <br />
            <span className="text-gradient">Perfect Resume?</span>
          </h2>

          <p className="text-lg text-white/70 mb-10 max-w-xl mx-auto">
            Join thousands of job seekers who have already transformed their careers 
            with our AI-powered resume builder.
          </p>

          <Link to="/builder">
            <Button variant="hero" size="xl" className="gap-2">
              Get Started Free
              <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>

          <p className="text-sm text-white/50 mt-6">
            No credit card required • Free forever for basic features
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default CTASection;
