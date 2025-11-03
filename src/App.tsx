import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import CareerAssistant from "./pages/CareerAssistant";
import NotFound from "./pages/NotFound";
import AuthContainer from "./pages/AuthContainer.tsx";
import DashboardApp from "./pages/Dashboard.tsx"; // added: connect dashboard page

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/career-assistant" element={<CareerAssistant />} />
          <Route path="/login" element={<AuthContainer initialView="login" />} />
          <Route path="/signup" element={<AuthContainer initialView="signup" />} /> 
          <Route path="/auth" element={<AuthContainer initialView="login" />} />
          
          {/* New dashboard route */}
          <Route path="/dashboard" element={<DashboardApp onNavigate={() => {}} />} />
          
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;