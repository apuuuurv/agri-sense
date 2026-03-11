// App.tsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import ProfileWizard from './pages/ProfileWizard';
import Dashboard from './pages/Dashboard';
import CommunityHub from './pages/CommunityHub';
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { Navbar } from "@/components/Navbar";

function App() {
  return (
    // Wrap the entire app in the ThemeProvider
    <ThemeProvider defaultTheme="dark" storageKey="agrisense-theme">
      <Router>
        {/* Sonner Toaster must be inside the Router provider */}
        <Toaster position="top-center" richColors closeButton />
        <Navbar />

        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/community" element={<CommunityHub />} />

          {/* Farmer Workflow Routes */}
          <Route path="/profile-setup" element={<ProfileWizard />} />
          <Route path="/dashboard" element={<Dashboard />} />

          {/* Catch-all: Redirect to Landing */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;