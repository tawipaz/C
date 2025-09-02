import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import AuthRegisterPage from "./pages/AuthRegisterPage";
import DashboardPage from "./pages/DashboardPage";
import PersonnelPage from "./pages/PersonnelPage";
import ShiftWorkPage from "./pages/ShiftWorkPage";
import AppLayout from "./layouts/AppLayout";
import ChatPage from "./pages/ChatPage";
import AdminPage from "./pages/AdminPage";
import OnDutyPage from "./pages/OnDutyPage";
import MockLoginPage from "./pages/MockLoginPage";
import ProtectedRoute from "./routes/ProtectedRoute";
import ProfilePage from "./pages/ProfilePage";
import SettingsPage from "./pages/SettingsPage";
import DutyManagementPage from "./pages/DutyManagementPage"; // เพิ่ม import นี้

function App() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem("authUser");
    if (saved) {
      try {
        const parsedUser = JSON.parse(saved);
        setUser(parsedUser);
      } catch (error) {
        console.error("App.js: Error parsing saved user:", error);
        localStorage.removeItem("authUser");
      }
    }
    setAuthLoading(false);
  }, []);

  const handleLoginSuccess = (u) => {
    setUser(u);
    localStorage.setItem("authUser", JSON.stringify(u));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("authUser");
  };

  const handleOpenNotifications = () => {
    alert("การแจ้งเตือน - ฟีเจอร์นี้อยู่ระหว่างการพัฒนา");
  };

  return (
    <Routes>
      {/* Public Routes: ทุกคนสามารถเข้าถึงได้ */}
      <Route path="/on-duty" element={<OnDutyPage />} />

      {/* Authentication Routes: สำหรับผู้ที่ยังไม่ล็อกอิน */}
      <Route path="/auth" element={!user ? <AuthRegisterPage onLoginSuccess={handleLoginSuccess} /> : <Navigate to="/" />} />
      <Route path="/mock-login" element={!user ? <MockLoginPage onLoginSuccess={handleLoginSuccess} /> : <Navigate to="/" />} />

      {/* Protected routes - wrapped by AppLayout */}
      {/* เส้นทางที่ต้องล็อกอินก่อน: ทั้งหมดจะถูกคุมโดย "ยาม" (ProtectedRoute) */}
      <Route element={<ProtectedRoute user={user} authLoading={authLoading} />}>
        {/* เมื่อผ่าน "ยาม" มาได้ จะแสดง AppLayout เสมอ */}
        <Route element={<AppLayout user={user} onLogout={handleLogout} onOpenNotifications={handleOpenNotifications} />}>
          {/* เนื้อหาข้างใน AppLayout จะเปลี่ยนไปตาม URL */}
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

      {/* ถ้าไม่เข้าเงื่อนไขไหนเลย และยังไม่ได้ล็อกอิน ให้ไปหน้าล็อกอิน */}
      <Route path="*" element={<Navigate to="/mock-login" />} />
    </Routes>
  );
}

export default App;
