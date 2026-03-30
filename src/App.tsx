import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useStore } from "@/store/useStore";
import { NavBar } from "@/components/NavBar";
import AuthPage from "@/pages/AuthPage";
import Onboarding from "@/pages/Onboarding";
import Browse from "@/pages/Browse";
import ListItem from "@/pages/ListItem";
import Claims from "@/pages/Claims";
import Profile from "@/pages/Profile";
import HowToSwap from "@/pages/HowToSwap";
import { Loader2 } from "lucide-react";

const queryClient = new QueryClient();

function AppContent() {
  const { user: authUser, loading } = useAuth();
  const hasCompletedOnboarding = useStore((s) => s.user.hasCompletedOnboarding);
  const initializeFromAuth = useStore((s) => s.initializeFromAuth);

  // Sync auth user into store when auth state changes
  useEffect(() => {
    if (authUser) {
      initializeFromAuth(authUser.id, authUser.email ?? "", authUser.user_metadata?.first_name ?? "");
    }
  }, [authUser, initializeFromAuth]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-kidswap-purple" />
      </div>
    );
  }

  if (!authUser) {
    return <AuthPage />;
  }

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
          <Route path="/how-to-swap" element={<HowToSwap />} />
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
