import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import AdminPage from './pages/AdminPage';
import LoginPage from './pages/LoginPage';
import OnDutyPage from './pages/OnDutyPage';
import AuthRegisterPage from './pages/AuthRegisterPage';
import DashboardPage from './pages/DashboardPage';
import PersonnelPage from './pages/PersonnelPage';
import ShiftWorkPage from './pages/ShiftWorkPage';
import AppLayout from './layouts/AppLayout';
import ChatPage from './pages/ChatPage';
import ProtectedRoute from './routes/ProtectedRoute';
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';
import DutyManagementPage from "./pages/DutyManagementPage";
import { CONFIG } from './config';

function App() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkLoginStatus = async () => {
      const token = localStorage.getItem('user_token');
      if (token) {
        try {
          const response = await fetch(`${CONFIG.API_BASE_URL}/api/auth/verify`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const data = await response.json();
          if (data.success) {
            setUser(data.user);
          } else {
            localStorage.removeItem('user_token');
          }
        } catch (error) {
          console.error("Token verification failed:", error);
          localStorage.removeItem('user_token');
        }
      }
      setAuthLoading(false);
    };
    checkLoginStatus();
  }, []);

  const handleLogin = (loginData) => {
    localStorage.setItem('user_token', loginData.token);
    setUser(loginData.user);
    navigate("/");
  };

  const handleLogout = () => {
    localStorage.removeItem('user_token');
    setUser(null);
    navigate("/login");
  };

  const handleOpenNotifications = () => {
    alert("การแจ้งเตือน - ฟีเจอร์นี้อยู่ระหว่างการพัฒนา");
  };

  return (
    <div className="bg-slate-100 min-h-screen">
      <div className="container mx-auto p-4">
        {authLoading ? (
          <div className="flex items-center justify-center min-h-screen"><div>กำลังโหลด...</div></div>
        ) : (
          <Routes>
            <Route path="/on-duty" element={<OnDutyPage />} />
            <Route 
              path="/login" 
              element={!user ? <LoginPage onLogin={handleLogin} /> : <Navigate to="/" />} 
            />
            <Route 
              path="/register" 
              element={!user ? <AuthRegisterPage onLoginSuccess={handleLogin} /> : <Navigate to="/" />} 
            />
            
            <Route element={<ProtectedRoute user={user} />}>
              <Route element={<AppLayout user={user} onLogout={handleLogout} onOpenNotifications={handleOpenNotifications} />}>
                <Route path="/" element={<DashboardPage user={user} />} />
                <Route path="/personnel" element={<PersonnelPage user={user} />} />
                <Route path="/tasks" element={<ShiftWorkPage user={user} />} />
                <Route path="/shifts" element={<ShiftWorkPage user={user} />} />
                <Route path="/chat" element={<ChatPage />} />
                <Route path="/profile" element={<ProfilePage user={user} />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/duty-management" element={<DutyManagementPage />} />
                {user?.role === 'admin' && (
                  <Route path="/admin" element={<AdminPage user={user} />} />
                )}
              </Route>
            </Route>

            <Route path="*" element={<Navigate to={user ? "/" : "/login"} />} />
          </Routes>
        )}
      </div>
    </div>
  );
}

export default App;
