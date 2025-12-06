"use client";

import {
  Users,
  Briefcase,
  FileText,
  Bot,
  Target,
  Calendar,
  Trophy,
  Sparkles,
  LucideIcon,
} from "lucide-react";

import { motion } from "framer-motion";
import AnimatedSection from "@/components/AnimatedSection";
import FeatureCard from "@/components/FeatureCard";

interface FeatureItem {
  icon: LucideIcon;
  title: string;
  description: string;
  background: string;
}

const features: FeatureItem[] = [
  {
    icon: Users,
    title: "Mentor & Mentee Hub",
    description:
      "Connect with industry experts and guide the next generation. Build meaningful relationships that accelerate career growth.",
    background: "/bg/mentor.svg",
  },
  {
    icon: Briefcase,
    title: "Job & Scholarship Discovery",
    description:
      "Access curated opportunities matching your profile. Find jobs, internships, and funding that align with your goals.",
    background: "/bg/job.svg",
  },
  {
    icon: FileText,
    title: "Resume Analyzer & Builder",
    description:
      "Get instant ATS compatibility feedback. Build professional resumes that stand out to recruiters.",
    background: "/bg/resume.svg",
  },
  {
    icon: Bot,
    title: "AI Career Bot",
    description:
      "24/7 personalized career guidance powered by AI. Get instant answers to your career questions anytime.",
    background: "/bg/ai.svg",
  },
  {
    icon: Target,
    title: "Skill Assessment",
    description:
      "Discover your strengths and areas for growth. Track your progress with interactive skill evaluations.",
    background: "/bg/assessment.svg",
  },
  {
    icon: Calendar,
    title: "Community & Events",
    description:
      "Join workshops, webinars, and networking events. Learn from experts and connect with peers.",
    background: "/bg/community.svg",
  },
  {
    icon: Trophy,
    title: "Success Tracking",
    description:
      "Visualize your achievements and milestones. Celebrate progress on your career journey.",
    background: "/bg/success.svg",
  },
  {
    icon: Sparkles,
    title: "Learning Resources",
    description:
      "Access courses, guides, and tools. Continuously develop skills for your dream career.",
    background: "/bg/learning.svg",
  },
];

export default function Features() {
  return (
    <section
      id="features"
      className="py-24 px-4 bg-gradient-to-b from-background to-muted/30"
    >
      <div className="container mx-auto">
        {/* Section Header */}
        <AnimatedSection className="text-center mb-16 space-y-4">
          <span className="px-4 py-2 rounded-full bg-primary/10 text-primary border border-primary/20 text-sm font-semibold inline-block">
            ✨ Everything You Need
          </span>

          <h2 className="text-4xl md:text-5xl font-bold">
            Comprehensive Career
            <span className="block bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              Development Platform
            </span>
          </h2>

          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            All the tools and resources you need to accelerate your career growth
            in one powerful platform.
          </p>
        </AnimatedSection>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <AnimatedSection key={index} delay={index * 0.1}>
              <motion.div
                whileHover={{ y: -8, scale: 1.02 }}
                transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
              >
                <FeatureCard {...feature} />
              </motion.div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}
