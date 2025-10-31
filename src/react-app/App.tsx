import { BrowserRouter as Router, Routes, Route } from "react-router";
import { AuthProvider } from "@getmocha/users-service/react";
import HomePage from "@/react-app/pages/Home";
import AuthCallbackPage from "@/react-app/pages/AuthCallback";
import RoutinesPage from "@/react-app/pages/Routines";
import GoalsPage from "@/react-app/pages/Goals";
import DiaryPage from "@/react-app/pages/Diary";
import SettingsPage from "@/react-app/pages/Settings";
import { ThemeProvider } from "@/react-app/contexts/ThemeContext";

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <Router>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/auth/callback" element={<AuthCallbackPage />} />
            <Route path="/routines" element={<RoutinesPage />} />
            <Route path="/goals" element={<GoalsPage />} />
            <Route path="/diary" element={<DiaryPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </Router>
      </ThemeProvider>
    </AuthProvider>
  );
}
