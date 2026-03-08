import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useStore } from "@/store/useStore";
import { NavBar } from "@/components/NavBar";
import Onboarding from "@/pages/Onboarding";
import Browse from "@/pages/Browse";
import ListItem from "@/pages/ListItem";
import Claims from "@/pages/Claims";
import Profile from "@/pages/Profile";

const queryClient = new QueryClient();

function AppContent() {
  const hasCompletedOnboarding = useStore((s) => s.user.hasCompletedOnboarding);

  if (!hasCompletedOnboarding) {
    return <Onboarding />;
  }

  return (
    <>
      <NavBar />
      <main className="pt-2 pb-16">
        <Routes>
          <Route path="/" element={<Browse />} />
          <Route path="/list" element={<ListItem />} />
          <Route path="/claims" element={<Claims />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </main>
    </>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner position="top-center" richColors />
      <BrowserRouter basename="/eduquest-finder">
        <AppContent />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
