import { motion } from "framer-motion";
import { 
  Wand2, 
  FileSearch, 
  Download, 
  Shield, 
  Zap, 
  Users 
} from "lucide-react";

const features = [
  {
    icon: Wand2,
    title: "AI-Powered Generation",
    description: "Let AI craft compelling bullet points and optimize your content for maximum impact.",
  },
  {
    icon: FileSearch,
    title: "ATS Optimization",
    description: "Ensure your resume passes Applicant Tracking Systems with smart keyword optimization.",
  },
  {
    icon: Download,
    title: "PDF Export",
    description: "Download your professional resume in perfectly formatted PDF with one click.",
  },
  {
    icon: Shield,
    title: "Secure Storage",
    description: "Your data is encrypted and securely stored. Access your resumes anytime, anywhere.",
  },
  {
    icon: Zap,
    title: "Smart Job Matching",
    description: "Get personalized job recommendations based on your skills and experience.",
  },
  {
    icon: Users,
    title: "Multiple Templates",
    description: "Choose from professionally designed templates tailored to your industry.",
  },
];

const FeaturesSection = () => {
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-primary font-semibold text-sm uppercase tracking-wider"
          >
            Features
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-4xl font-display font-bold text-foreground mt-2 mb-4"
          >
            Everything You Need to Succeed
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-muted-foreground"
          >
            Powerful tools designed to help you create the perfect resume and land your dream job.
          </motion.p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group p-6 rounded-2xl bg-card border border-border hover:border-primary/30 hover:shadow-lg transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center mb-4 group-hover:shadow-glow transition-shadow duration-300">
                <feature.icon className="w-6 h-6 text-primary-foreground" />
              </div>
              <h3 className="text-lg font-display font-semibold text-foreground mb-2">
                {feature.title}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
