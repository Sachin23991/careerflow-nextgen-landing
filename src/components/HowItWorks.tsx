import { CheckCircle, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import AnimatedSection from "@/components/AnimatedSection";

const steps = [
  {
    number: "01",
    title: "Create Your Profile",
    description: "Sign up and tell us about your career goals, skills, and interests. Our AI will help personalize your experience.",
    color: "primary",
  },
  {
    number: "02",
    title: "Discover & Connect",
    description: "Find mentors, jobs, and opportunities tailored to you. Connect with the right people and resources.",
    color: "secondary",
  },
  {
    number: "03",
    title: "Learn & Grow",
    description: "Take assessments, build your resume, and access learning resources. Track your progress in real-time.",
    color: "accent",
  },
  {
    number: "04",
    title: "Achieve Success",
    description: "Land your dream job, secure funding, or become a mentor yourself. Celebrate your milestones along the way.",
    color: "primary",
  },
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-24 px-4 bg-gradient-to-b from-muted/30 to-background relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 right-10 w-96 h-96 bg-secondary/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-accent/30 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto relative z-10">
        {/* Section Header */}
        <AnimatedSection className="text-center mb-16 space-y-4">
          <span className="px-4 py-2 rounded-full bg-secondary/10 text-secondary border border-secondary/20 text-sm font-semibold inline-block">
            🎯 Simple Process
          </span>
          <h2 className="text-4xl md:text-5xl font-bold">
            How
            <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent"> CareerFlow </span>
            Works
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Four simple steps to transform your career journey
          </p>
        </AnimatedSection>

        {/* Steps */}
        <div className="max-w-4xl mx-auto space-y-8">
          {steps.map((step, index) => (
            <AnimatedSection key={index} delay={index * 0.15}>
              <motion.div
                whileHover={{ x: 10 }}
                transition={{ duration: 0.3 }}
              >
                <div className="group relative">
                  <motion.div 
                    className="flex items-start gap-6 p-8 rounded-2xl bg-card/50 backdrop-blur-sm border border-border/50 hover:border-border hover:shadow-glow-primary transition-all duration-300"
                    whileHover={{ scale: 1.02 }}
                  >
                    {/* Step Number */}
                    <motion.div 
                      className={`flex-shrink-0 w-16 h-16 rounded-xl bg-gradient-to-br from-${step.color} to-accent flex items-center justify-center text-2xl font-bold text-white shadow-lg`}
                      whileHover={{ rotate: 360, scale: 1.1 }}
                      transition={{ duration: 0.6 }}
                    >
                      {step.number}
                    </motion.div>

                    {/* Content */}
                    <div className="flex-1 space-y-2">
                      <h3 className="text-2xl font-bold group-hover:text-primary transition-colors">
                        {step.title}
                      </h3>
                      <p className="text-muted-foreground leading-relaxed">
                        {step.description}
                      </p>
                    </div>

                    {/* Check Icon */}
                    <motion.div
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      transition={{ delay: 0.5, duration: 0.3 }}
                    >
                      <CheckCircle className={`flex-shrink-0 w-6 h-6 text-${step.color} opacity-50 group-hover:opacity-100 transition-opacity`} />
                    </motion.div>
                  </motion.div>

                  {/* Connector Arrow */}
                  {index < steps.length - 1 && (
                    <motion.div 
                      className="flex justify-center my-4"
                      animate={{ y: [0, 10, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <ArrowRight className="w-8 h-8 text-muted-foreground/30" />
                    </motion.div>
                  )}
                </div>
              </motion.div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
