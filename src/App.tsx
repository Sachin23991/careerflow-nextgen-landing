import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom"; // Import useNavigate
import Index from "./pages/Index";
import CareerAssistant from "./pages/CareerAssistant";
import NotFound from "./pages/NotFound";
import AuthContainer from "./pages/AuthContainer.tsx";
import DashboardApp from "./pages/Dashboard.tsx";
import ResumeBuilder from "./pages/ResumeBuilder";
import ResumeBuilderHome from "./pages/resumebuilderhome";
import { ResumeProvider } from "@/lib/resume-context";

const queryClient = new QueryClient();

// 1. Create a wrapper component to access the router context
const AppContent = () => {
    // 2. Use the hook inside the component
    const navigate = useNavigate();

    // This function maps the dashboard's internal tab change (e.g., 'chatbot')
    // to an external React Router navigation (e.g., '/career-assistant').
    const handleDashboardNavigation = (tab: string) => {
        if (tab === 'chatbot') {
            navigate('/career-assistant');
        } 
        else if (tab === 'resume-builder') {
            navigate('/resume-builder');
        }
        // Add more navigation logic here for other dashboard tabs if needed
    };

    return (
        <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/career-assistant" element={<CareerAssistant />} />
            <Route path="/resume-builder" element={<ResumeBuilderHome />} />
            <Route path="/resume-builder/builder" element={<ResumeBuilder />} />
            <Route path="/login" element={<AuthContainer initialView="login" />} />
            <Route path="/signup" element={<AuthContainer initialView="signup" />} />
            <Route path="/auth" element={<AuthContainer initialView="login" />} />
            
            {/* Pass the real navigation function to the DashboardApp component */}
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
            {/* Provide resume context to the entire app so pages like ResumeBuilder can use useResume() */}
            <ResumeProvider>
              <BrowserRouter>
                  {/* 3. Render the component that uses useNavigate */}
                  <AppContent /> 
              </BrowserRouter>
            </ResumeProvider>
        </TooltipProvider>
    </QueryClientProvider>
);

export default App;