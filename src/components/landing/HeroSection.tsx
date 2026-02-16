import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, FileText, Briefcase } from "lucide-react";
import { Link } from "react-router-dom";
const HeroSection = () => {
  return <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-hero">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-accent/20 rounded-full blur-3xl animate-float" style={{
        animationDelay: "1.5s"
      }} />
        <div className="absolute top-1/2 right-1/3 w-48 h-48 bg-primary/10 rounded-full blur-2xl animate-float" style={{
        animationDelay: "0.75s"
      }} />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <motion.div initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.5
         }} className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8 bg-white/10">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-white/90">
              AI-Powered Resume Building
            </span>
          </motion.div>

          {/* Main Heading */}
          <motion.h1 initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.5,
          delay: 0.1
        }} className="text-4xl md:text-6xl lg:text-7xl font-display font-bold text-white mb-6 leading-tight">
            Build Your Dream Resume
            <br />
            <span className="text-gradient">Land Your Dream Job</span>
          </motion.h1>

          {/* Subheading */}
          <motion.p initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.5,
          delay: 0.2
        }} className="text-lg md:text-xl text-white/70 mb-10 max-w-2xl mx-auto">
            Create professional, ATS-optimized resumes in minutes with AI assistance. 
            Get personalized job recommendations matching your skills and experience.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.5,
          delay: 0.3
        }} className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/builder">
              <Button variant="hero" size="xl" className="gap-2 w-full sm:w-auto">
                <FileText className="w-5 h-5" />
                Build Your Resume
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <Link to="/jobs">
              <Button variant="heroOutline" size="xl" className="gap-2 w-full sm:w-auto">
                <Briefcase className="w-5 h-5" />
                Find Jobs
              </Button>
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.5,
          delay: 0.4
        }} className="mt-16 grid grid-cols-3 gap-8 max-w-xl mx-auto">
            {[{
            value: "1K+",
            label: "Resumes Created"
          }, {
            value: "95%",
            label: "Success Rate"
          }, {
            value: "500+",
            label: "Jobs Matched"
          }].map(stat => <div key={stat.label} className="text-center">
                <div className="text-2xl md:text-3xl font-display font-bold text-white">
                  {stat.value}
                </div>
                <div className="text-sm text-white/60 mt-1">
                  {stat.label}
                </div>
              </div>)}
          </motion.div>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>;
};
export default HeroSection;