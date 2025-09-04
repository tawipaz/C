import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import AdminPage from './pages/AdminPage';
import LoginPage from './pages/LoginPage';
import OnDutyPage from './pages/OnDutyPage';
import DashboardPage from './pages/DashboardPage';
import PersonnelPage from './pages/PersonnelPage';
import ShiftWorkPage from './pages/ShiftWorkPage';
import AppLayout from './layouts/AppLayout';
import ChatPage from './pages/ChatPage';
import ProtectedRoute from './routes/ProtectedRoute';
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';
import DocumentManagementPage from "./pages/DocumentManagementPage";
import { CONFIG } from './config';
import { AlertProvider } from './components/common/AlertSystem';

function App() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkLoginStatus = async () => {
      const token = localStorage.getItem('user_token');
      const lastUser = localStorage.getItem('last_user');
      
      if (token) {
        try {
          const response = await fetch(`${CONFIG.AUTH_API}/verify`, {
            headers: { 
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (response.ok) {
            const data = await response.json();
            if (data.success && data.user) {
              setUser(data.user);
              // อัพเดทข้อมูลผู้ใช้ล่าสุด
              localStorage.setItem('last_user', JSON.stringify(data.user));
            } else {
              console.log("Token invalid, removing from storage");
              localStorage.removeItem('user_token');
              localStorage.removeItem('last_user');
              setUser(null);
            }
          } else {
            console.log("Token verification failed, status:", response.status);
            // Token หมดอายุหรือไม่ถูกต้อง
            localStorage.removeItem('user_token');
            localStorage.removeItem('last_user');
            setUser(null);
          }
        } catch (error) {
          console.error("Token verification error:", error);
          // กรณี network error, ใช้ข้อมูลผู้ใช้ที่เก็บไว้
          if (lastUser) {
            try {
              setUser(JSON.parse(lastUser));
              console.log("Network error, using cached user data");
            } catch (parseError) {
              console.error("Error parsing cached user data:", parseError);
              localStorage.removeItem('last_user');
              setUser(null);
            }
          }
        }
      } else if (lastUser) {
        // ไม่มี token แต่มีข้อมูลผู้ใช้ - ลบข้อมูลเก่า
        localStorage.removeItem('last_user');
      }
      setAuthLoading(false);
    };
    checkLoginStatus();
  }, []);

  const handleLogin = (loginData) => {
    localStorage.setItem('user_token', loginData.token);
    localStorage.setItem('last_user', JSON.stringify(loginData.user));
    setUser(loginData.user);
    navigate("/");
  };

  const handleLogout = () => {
    localStorage.removeItem('user_token');
    localStorage.removeItem('last_user');
    setUser(null);
    navigate("/login");
  };

  const handleOpenNotifications = () => {
    // ใช้ alert system แทน
    // alert("การแจ้งเตือน - ฟีเจอร์นี้อยู่ระหว่างการพัฒนา");
  };

  return (
    <AlertProvider>
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
              
              <Route element={<ProtectedRoute user={user} />}>
                <Route element={<AppLayout user={user} onLogout={handleLogout} onOpenNotifications={handleOpenNotifications} />}>
                  <Route path="/" element={<DashboardPage user={user} />} />
                  <Route path="/personnel" element={<PersonnelPage user={user} />} />
                  <Route path="/tasks" element={<ShiftWorkPage user={user} />} />
                  <Route path="/shifts" element={<ShiftWorkPage user={user} />} />
                  <Route path="/chat" element={<ChatPage />} />
                  <Route path="/profile" element={<ProfilePage user={user} />} />
                  <Route path="/settings" element={<SettingsPage />} />
                  <Route path="/document-management" element={<DocumentManagementPage />} />
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
    </AlertProvider>
  );
}

export default App;
