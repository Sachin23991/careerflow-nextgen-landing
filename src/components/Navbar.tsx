import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import './navbar.css';
import { Link } from "react-router-dom";
const Navbar = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: "Features", href: "#features" },
    { name: "How It Works", href: "#how-it-works" },
    { name: "About", href: "#about" },
    { name: "Contact", href: "#contact" },
  ];

  return (
    <motion.nav
      className={`navbar w-full z-50 bg-background/80 backdrop-blur-lg border-b border-border transition-all duration-300 ${scrolled ? 'navbar--scrolled' : ''}`}
      initial={{ y: -20 }}
      animate={{ y: 0 }}
      style={{
        boxShadow: scrolled ? '0 4px 20px hsl(var(--primary) / 0.1)' : 'none'
      }}
    >
      {/* Use grid container: left (logo), center (links), right (CTAs + mobile button) */}
      <div className="container mx-auto px-4 navbar__container flex-wrap">
        {/* left */}
        <div className="navbar__left">
          <motion.div
            className="flex items-center navbar__logo"
            whileHover={{ scale: 1.03 }}
            transition={{ duration: 0.2 }}
          >
            <motion.img
              src="/logo.png"
              alt="CareerFlow logo"
              className="w-8 h-8 rounded-lg object-contain navbar__logo-icon"
              initial={{ rotate: 0 }}
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 12, ease: "linear" }} // slower rotation for battery
              whileHover={{ scale: 1.05 }}
            />
            <span className="text-lg font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent navbar__brand">
              CareerFlow
            </span>
          </motion.div>
        </div>

        {/* center (desktop only) */}
        <div className="navbar__center hidden md:flex items-center nav-links">
          {navLinks.map((link, index) => (
            <motion.a
              key={link.name}
              href={link.href}
              // Added dark:text-white so link becomes visible in dark mode
              className="text-foreground/80 hover:text-foreground transition-colors font-medium relative nav-link dark:text-white"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.03 }}
            >
              {link.name}
              <motion.div
                className="absolute bottom-0 left-0 w-full h-0.5 bg-primary"
                initial={{ scaleX: 0 }}
                whileHover={{ scaleX: 1 }}
                transition={{ duration: 0.18 }}
              />
            </motion.a>
          ))}
        </div>

        {/* right: CTAs + mobile menu button */}
        <div className="navbar__right flex items-center gap-4">
          <div className="hidden md:flex items-center space-x-4 cta-buttons">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
              <Button variant="ghost" onClick={() => navigate('/login')}>Sign In</Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
              <Button variant="hero" size="lg" onClick={() => navigate('/login')}>
                Get Started
              </Button>
            </motion.div>
          </div>

          <motion.button
            className="md:hidden p-2 rounded-lg hover:bg-accent transition-colors mobile-menu-button"
            onClick={() => setIsOpen(!isOpen)}
            whileTap={{ scale: 0.9 }}
            aria-expanded={isOpen}
            aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
          >
            <motion.div
              animate={{ rotate: isOpen ? 90 : 0 }}
              transition={{ duration: 0.2 }}
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </motion.div>
          </motion.button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="md:hidden pb-4 space-y-4 mobile-menu w-full px-4"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
          >
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                // Added dark:text-white for mobile menu links
                className="block text-foreground/80 hover:text-foreground transition-colors font-medium py-2 dark:text-white"
                onClick={() => setIsOpen(false)}
              >
                {link.name}
              </a>
            ))}
            <div className="flex flex-col space-y-2 pt-4">
              <Button variant="ghost" className="w-full" onClick={() => { setIsOpen(false); navigate('/login'); }}>Sign In</Button>
              <Button variant="hero" size="lg" className="w-full" onClick={() => { setIsOpen(false); navigate('/login'); }}>
                Get Started
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;