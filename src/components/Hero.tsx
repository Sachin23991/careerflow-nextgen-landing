import { Button } from "@/components/ui/button";
import { ArrowRight, Play } from "lucide-react";
import { motion } from "framer-motion";
import { Suspense, lazy } from "react";
import { useNavigate } from "react-router-dom";
import heroImage from "@/assets/hero-career-flow.png";
import heroRight from "@/assets/hero-right.png";

const Hero3DScene = lazy(() => import("@/components/Hero3DScene"));

const Hero = () => {
  const navigate = useNavigate();
  const handleStartJourney = () => navigate("/login");

  return (
    <section className={`relative flex items-start justify-center overflow-hidden bg-gradient-hero pt-6`}>
      {/* 3D Scene Background */}
      <Suspense fallback={
        <div className="absolute inset-0 flex items-center justify-center z-0">
          <div style={{ padding: 12, background: "rgba(255,255,255,0.02)", borderRadius: 8 }}>
            Loading scene...
          </div>
        </div>
      }>
        <Hero3DScene />
      </Suspense>
      
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden opacity-20">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="container mx-auto px-4 py-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left Content */}
          <motion.div 
            className="space-y-8"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <div className="inline-block">
              <span className="px-4 py-2 rounded-full bg-secondary/10 text-secondary border border-secondary/20 text-sm font-semibold">
                 Your Career Journey Starts Here
              </span>
            </div>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight">
              Unlock Your
              <span className="block bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                Career Potential
              </span>
            </h1>

            <p className="text-xl text-muted-foreground max-w-xl">
              Your all-in-one platform for career guidance, mentorship, job discovery, and skill development. 
              Connect with mentors, build your resume, and chart your path to success with AI-powered insights.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
                <Button
                  variant="hero"
                  size="lg"
                  className="group w-full sm:w-auto"
                  onClick={handleStartJourney}
                >
                  Start Your Journey
                  <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
                <Button variant="outline" size="lg" className="group w-full sm:w-auto">
                  <Play className="mr-2 w-5 h-5" />
                  Watch Demo
                </Button>
              </motion.div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 sm:pt-8">
              {[
                { value: "10", label: "Active Users", color: "text-primary" },
                { value: "5", label: "Mentors", color: "text-secondary" },
                { value: "95%", label: "Success Rate", color: "text-accent" }
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.8 + index * 0.1 }}
                  whileHover={{ y: -5, transition: { duration: 0.2 } }}
                >
                  <div className={`text-3xl font-bold ${stat.color}`}>{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right Illustration */}
          <motion.div 
            className="relative flex justify-center items-center"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
             {/* Overlay animation */}
             <motion.div 
               className="hero-image-overlay rounded-2xl"
               animate={{ scale: [1, 1.03, 1] }}
               transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
             />

            <img
              src={heroRight}
              alt="Career Guidance Illustration"
              loading="lazy"
              className="
                w-full 
                max-w-xs sm:max-w-sm md:max-w-md lg:max-w-[520px]
                object-contain 
                select-none 
                pointer-events-none
                drop-shadow-[0_24px_48px_rgba(0,0,0,0.25)]
              "
            />
           </motion.div>
         </div>
       </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-foreground/20 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-foreground/40 rounded-full mt-2 animate-pulse"></div>
        </div>
      </div>
    </section>
  );
};

export default Hero;