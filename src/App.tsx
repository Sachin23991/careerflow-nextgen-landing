// src/App.tsx (Updated)
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import Index from "./pages/Index";
import CareerAssistant from "./pages/CareerAssistant";
import NotFound from "./pages/NotFound";
import AuthContainer from "./pages/AuthContainer.tsx";
import DashboardApp from "./pages/Dashboard.tsx";
import ResumeBuilder from "./pages/ResumeBuilder";
import ResumeBuilderHome from "./pages/resumebuilderhome";
import { ResumeProvider } from "@/lib/resume-context";
import { AuthWrapper } from "./components/AuthWrapper"; // Import the wrapper
import React from "react";

// Minimal ErrorBoundary to avoid blank screens on render errors
class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean; error?: any }> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: undefined };
  }
  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }
  componentDidCatch(error: any, info: any) {
    // eslint-disable-next-line no-console
    console.error("ErrorBoundary caught:", error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 24, fontFamily: "system-ui, -apple-system, 'Segoe UI', Roboto", color: "#fff", background: "#111", minHeight: "100vh" }}>
          <h2 style={{ marginTop: 0 }}>Something went wrong</h2>
          <pre style={{ whiteSpace: "pre-wrap", color: "#ffdede", background: "rgba(255,255,255,0.03)", padding: 12, borderRadius: 6 }}>
            {String(this.state.error)}
          </pre>
          <p style={{ opacity: 0.9 }}>Check browser console for stack trace.</p>
        </div>
      );
    }
    return this.props.children;
  }
}

const queryClient = new QueryClient();

const AppContent = () => {
    const navigate = useNavigate();

    const handleDashboardNavigation = (tab: string) => {
        if (tab === 'chatbot') {
            navigate('/career-assistant');
        } 
        else if (tab === 'resume-builder') {
            navigate('/resume-builder');
        }
    };

    return (
        <Routes>
            <Route path="/" element={<Index />} />
            
            {/* --- MODIFIED ROUTE --- */}
            <Route 
              path="/career-assistant" 
              element={
                <AuthWrapper>
                  {() => <CareerAssistant />}
                </AuthWrapper>
              } 
            />
            {/* ------------------------ */}

            <Route path="/resume-builder" element={<ResumeBuilderHome />} />
            <Route path="/resume-builder/builder" element={<ResumeBuilder />} />
            <Route path="/login" element={<AuthContainer initialView="login" />} />
            <Route path="/signup" element={<AuthContainer initialView="signup" />} />
            <Route path="/auth" element={<AuthContainer initialView="login" />} />
            
            <Route 
                path="/dashboard" 
                element={<DashboardApp onNavigate={handleDashboardNavigation} />} 
            />
            
            <Route path="*" element={<NotFound />} />
        </Routes>
    );
};

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
        <TooltipProvider>
            <Toaster />
            <Sonner />
            <ResumeProvider>
              <BrowserRouter>
                  <ErrorBoundary>
                    <AppContent /> 
                  </ErrorBoundary>
              </BrowserRouter>
            </ResumeProvider>
        </TooltipProvider>
    </QueryClientProvider>
  );
}