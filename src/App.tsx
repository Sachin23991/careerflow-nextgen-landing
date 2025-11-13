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
                  {(user) => <CareerAssistant user={user} />}
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

const App = () => (
    <QueryClientProvider client={queryClient}>
        <TooltipProvider>
            <Toaster />
            <Sonner />
            <ResumeProvider>
              <BrowserRouter>
                  <AppContent /> 
              </BrowserRouter>
            </ResumeProvider>
        </TooltipProvider>
    </QueryClientProvider>
);

export default App;