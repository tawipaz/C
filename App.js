import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import AppLayout from "./layouts/AppLayout";
import AuthRegisterPage from "./pages/AuthRegisterPage";
import DashboardPage from "./pages/DashboardPage";
import PersonnelPage from "./pages/PersonnelPage";
import ShiftWorkPage from "./pages/ShiftWorkPage";
import ChatPage from "./pages/ChatPage";
import AdminPage from "./pages/AdminPage";
import ProfilePage from "./pages/ProfilePage";
import SettingsPage from "./pages/SettingsPage";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check for logged in user in localStorage on initial load
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem("authUser");
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
    } catch (error) {
      console.error("Failed to parse user from localStorage", error);
      localStorage.removeItem("authUser");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleLoginSuccess = (loggedInUser) => {
    localStorage.setItem("authUser", JSON.stringify(loggedInUser));
    setUser(loggedInUser);
  };

  const handleLogout = () => {
    localStorage.removeItem("authUser");
    setUser(null);
    // The component re-renders, and the logic below redirects to the login page.
  };

  // Show a loading indicator while checking for user session
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-100">
        <p className="text-lg text-slate-600">กำลังโหลด...</p>
      </div>
    );
  }

  // If no user, show the login page
  if (!user) {
    return <AuthRegisterPage onLoginSuccess={handleLoginSuccess} />;
  }

  // If user is logged in, render the main app with routing
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout user={user} onLogout={handleLogout} />}>
          <Route path="/" element={<DashboardPage user={user} />} />
          <Route path="/personnel" element={<PersonnelPage user={user} />} />
          <Route path="/tasks" element={<ShiftWorkPage user={user} />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/profile" element={<ProfilePage user={user} />} />
          <Route path="/settings" element={<SettingsPage />} />
          {user.role === 'admin' && (
            <Route path="/admin" element={<AdminPage user={user} />} />
          )}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;