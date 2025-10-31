import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

// 1. IMPORT YOUR AUTH COMPONENT
// **********************************
// CORRECTED: Import the new combined component
// **********************************
import AuthContainer from "./pages/AuthContainer.tsx"; 
// Removed import LoginPage and AuthPage as they are merged

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          
          {/* 2. ADD CUSTOM ROUTES HERE */}
          {/* Use AuthContainer and pass the desired initial view */}
          <Route path="/login" element={<AuthContainer initialView="login" />} />
          <Route path="/signup" element={<AuthContainer initialView="signup" />} /> 
          <Route path="/auth" element={<AuthContainer initialView="login" />} />
          
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;