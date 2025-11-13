// src/components/chat/MainHeader.tsx (NEW FILE)

import { useState, useRef, SyntheticEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Settings, Sun, Moon } from 'lucide-react';
import styles from '../../pages/CareerAssistant.module.css';

interface MainHeaderProps {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  animationEnabled: boolean;
  setAnimationEnabled: (value: boolean | ((prev: boolean) => boolean)) => void;
  speedSetting: 'fast' | 'normal' | 'slow';
  setSpeedSetting: (value: 'fast' | 'normal' | 'slow') => void;
  onHomeClick: (id: string | null) => void;
}

export const MainHeader = ({
  theme,
  toggleTheme,
  animationEnabled,
  setAnimationEnabled,
  speedSetting,
  setSpeedSetting,
  onHomeClick,
}: MainHeaderProps) => {
  const navigate = useNavigate();
  
  // --- Logo logic ---
  const [logoSrc, setLogoSrc] = useState<string>("/logo.png");
  const logoFallbacks = ["/logo.png", "/logo.svg", "/logo.webp", "/logo"];
  const logoTryIndex = useRef(0);
  const handleLogoError = (e: SyntheticEvent<HTMLImageElement>) => {
    logoTryIndex.current += 1;
    if (logoTryIndex.current < logoFallbacks.length) {
      setLogoSrc(logoFallbacks[logoTryIndex.current]);
    } else {
      (e.target as HTMLImageElement).style.display = "none";
    }
  };

  return (
    <header className={`${styles.header} border-b bg-card/50 backdrop-blur-sm z-10`}>
      {/* Container is no longer needed, use w-full for full width */}
      <div className="flex w-full items-center justify-between px-6 py-4">
        
        {/* Left Side: Logo & Title */}
        <div className="flex items-center gap-3">
          <div className={`${styles.headerLogo} flex items-center justify-center`} style={{ background: "transparent" }}>
            <img 
              src={logoSrc} 
              alt="CareerFlow logo" 
              onError={handleLogoError} 
              className="h-10 w-10 object-contain" 
            />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-foreground">Sancara AI</h1>
            <p className="text-sm text-muted-foreground">AI-powered career guidance</p>
          </div>
        </div>

        {/* Right Side: Settings & Dashboard */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 border rounded-md px-3 py-1 bg-card/60">
            <Settings className="h-4 w-4 opacity-80" />
            <label className="text-xs text-muted-foreground mr-2">Animate replies</label>
            <Button
              variant={animationEnabled ? "default" : "outline"}
              size="sm"
              onClick={() => setAnimationEnabled((s) => !s)}
              aria-pressed={animationEnabled}
            >
              {animationEnabled ? "On" : "Off"}
            </Button>
          </div>

          <div className="flex items-center gap-2 border rounded-md px-3 py-1 bg-card/50">
            <label className="text-xs text-muted-foreground">Speed</label>
            <select
              value={speedSetting}
              onChange={(e) => setSpeedSetting(e.target.value as any)}
              className="speed-select text-sm bg-transparent outline-none"
            >
              <option value="fast">Fast</option>
              <option value="normal">Normal</option>
              <option value="slow">Slow</option>
            </select>
          </div>

          <Button variant="ghost" size="sm" onClick={toggleTheme} aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"} className="gap-2">
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
          
          <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")} className="gap-2">Dashboard</Button>
        </div>
      </div>
    </header>
  );
};

export default MainHeader;