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

const queryClient = new QueryClient();

// 1. Create a wrapper component to access the router context
const AppContent = () => {
    // 2. Use the hook inside the component
    const navigate = useNavigate();

    // This function maps the dashboard's internal tab change (e.g., 'chatbot')
    // to an external React Router navigation (e.g., '/career-assistant').
    const handleDashboardNavigation = (tab: string) => {
        // Dashboard.tsx sends 'chatbot' when Career Assistant is clicked.
        if (tab === 'chatbot') {
            navigate('/career-assistant'); // Navigate to the dedicated chat route.
        } 
        // Add more navigation logic here for other dashboard tabs if needed
        // else if (tab === 'resume-builder') { navigate('/resume-builder'); }
    };

    return (
        <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/career-assistant" element={<CareerAssistant />} />
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
            <BrowserRouter>
                {/* 3. Render the component that uses useNavigate */}
                <AppContent /> 
            </BrowserRouter>
        </TooltipProvider>
    </QueryClientProvider>
);

export default App;