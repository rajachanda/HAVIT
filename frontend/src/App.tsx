import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { XPProvider } from "@/contexts/XPContext";
import { Layout } from "@/components/Layout";
import Index from "./pages/Index";
import Homepage from "./pages/Homepage";
import Login from "./pages/Auth/Login";
import Signup from "./pages/Auth/Signup";
import ProfileSetup from "./pages/Onboarding/ProfileSetup";
import UniversalQuestions from "./pages/Onboarding/UniversalQuestions";
import ConditionalQuestions from "./pages/Onboarding/ConditionalQuestions";
import ConversationalOnboarding from "./pages/Onboarding/ConversationalOnboarding";
import CharacterSelect from "./pages/CharacterSelect";
import Habits from "./pages/Habits";
import ChallengesPage from "./pages/ChallengesPage";
import Leaderboard from "./pages/Leaderboard";
import Squad from "./pages/Squad";
import Community from "./pages/Community";
import CommunityPage from "./pages/CommunityPage";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import AddHabitForm from "./pages/AddHabitForm";
import EditProfile from "./pages/EditProfile";
import NewChallenge from "./pages/NewChallenge";
import CompleteProfile from "./pages/CompleteProfile";
import { ReactNode } from "react";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Protected Route Component
function ProtectedRoute({ children }: { children: ReactNode }) {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

// Public Route Component (redirect to dashboard if already logged in)
function PublicRoute({ children }: { children: ReactNode }) {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (currentUser) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <XPProvider>
        <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true,
          }}
        >
          <Routes>
            {/* Public Routes */}
            <Route
              path="/"
              element={<Homepage />}
            />
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              }
            />
            <Route
              path="/signup"
              element={
                <PublicRoute>
                  <Signup />
                </PublicRoute>
              }
            />

            {/* Onboarding Routes (protected) */}
            <Route
              path="/onboarding/profile"
              element={
                <ProtectedRoute>
                  <ProfileSetup />
                </ProtectedRoute>
              }
            />
            <Route
              path="/complete-profile"
              element={
                <ProtectedRoute>
                  <CompleteProfile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/onboarding/universal-questions"
              element={
                <ProtectedRoute>
                  <UniversalQuestions />
                </ProtectedRoute>
              }
            />
            <Route
              path="/onboarding/conditional-questions"
              element={
                <ProtectedRoute>
                  <ConditionalQuestions />
                </ProtectedRoute>
              }
            />
            <Route
              path="/onboarding"
              element={
                <ProtectedRoute>
                  <ConversationalOnboarding />
                </ProtectedRoute>
              }
            />
            <Route
              path="/character-select"
              element={
                <ProtectedRoute>
                  <CharacterSelect />
                </ProtectedRoute>
              }
            />

            {/* Main App Routes (protected) */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Index />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/habits"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Habits />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/habits/new"
              element={
                <ProtectedRoute>
                  <AddHabitForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/challenges"
              element={
                <ProtectedRoute>
                  <Layout>
                    <ChallengesPage />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/challenges/new"
              element={
                <ProtectedRoute>
                  <NewChallenge />
                </ProtectedRoute>
              }
            />
            <Route
              path="/leaderboard"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Leaderboard />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/squad"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Squad />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/community"
              element={
                <ProtectedRoute>
                  <Layout>
                    <CommunityPage />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Profile />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile/edit"
              element={
                <ProtectedRoute>
                  <EditProfile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Settings />
                  </Layout>
                </ProtectedRoute>
              }
            />

            {/* 404 Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
      </XPProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
