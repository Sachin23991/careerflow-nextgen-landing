import { Button } from "@/components/ui/button";
import { ArrowRight, Play, Sun, Moon } from "lucide-react";
import { motion } from "framer-motion";
import { Suspense, lazy, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import heroImage from "@/assets/hero-career-flow.png";

const Hero3DScene = lazy(() => import("@/components/Hero3DScene"));

const Hero = () => {
  const navigate = useNavigate();
  const handleStartJourney = () => navigate("/login");

  // Added: theme state persisted to localStorage and applied to document.documentElement
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    if (typeof window === "undefined") return "light";
    return (localStorage.getItem("landing-theme") as "light" | "dark") || "light";
  });

  useEffect(() => {
    if (typeof document === "undefined") return;
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
      document.documentElement.setAttribute("data-landing-theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      document.documentElement.setAttribute("data-landing-theme", "light");
    }
    localStorage.setItem("landing-theme", theme);

    // Added: make top navbar links readable in dark mode
    const navLinkTexts = ["Features", "How It Works", "About", "Contact"];
    const selector = "nav a, header a, .nav-link, .navbar a";
    const els = Array.from(document.querySelectorAll<HTMLElement>(selector));
    els.forEach((el) => {
      const text = (el.textContent || "").trim();
      if (navLinkTexts.includes(text)) {
        if (theme === "dark") {
          el.classList.add("text-white");
        } else {
          el.classList.remove("text-white");
        }
      }
    });
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === "light" ? "dark" : "light"));

  return (
    <section className={`relative flex items-start justify-center overflow-hidden bg-gradient-hero pt-6`}>
      {/* 3D Scene Background */}
      <Suspense fallback={null}>
        <Hero3DScene />
      </Suspense>
      
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden opacity-20">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="container mx-auto px-4 py-12 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
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
            <div className="grid grid-cols-3 gap-8 pt-8 border-t border-border">
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

          {/* Right Image */}
          <motion.div 
            className="relative"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
          >
            {/* Overlay: use a dark translucent background in dark mode to avoid bright flashing */}
            <motion.div 
              className="hero-image-overlay rounded-2xl"
              style={{
                background: theme === "dark" ? "rgba(6,8,11,0.56)" : undefined,
                boxShadow: theme === "dark" ? "0 20px 40px rgba(0,0,0,0.6)" : undefined,
                transition: "background 240ms ease, box-shadow 240ms ease"
              }}
              animate={{ scale: [1, 1.03, 1] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            />

            {/* Image: apply a subtle filter in dark mode with a smooth transition to prevent a flash */}
            <motion.img 
              src={heroImage} 
              alt="Career Growth Journey" 
              className="relative rounded-2xl shadow-2xl w-full h-auto"
              style={{
                filter: theme === "dark" ? "brightness(0.62) contrast(0.95) saturate(0.9)" : "none",
                transition: "filter 220ms linear, transform 220ms linear"
              }}
              whileHover={{ scale: 1.02, rotateY: 5 }}
              transition={{ duration: 0.3 }}
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

      {/* Theme Toggle - fixed right-bottom for landing page */}
      <button
        aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
        onClick={toggleTheme}
        className="fixed right-6 bottom-6 z-50 p-3 rounded-full bg-white/90 dark:bg-foreground/10 shadow-lg border border-border/20 backdrop-blur-sm flex items-center justify-center"
      >
        {theme === "dark" ? (
          <Sun className="w-5 h-5 text-yellow-400" />
        ) : (
          <Moon className="w-5 h-5 text-gray-700" />
        )}
      </button>
    </section>
  );
};

export default Hero;
