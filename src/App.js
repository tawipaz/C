// App.js (ที่แก้ไขแล้ว)

import React, { useEffect, useState } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import AuthRegisterPage from "./pages/AuthRegisterPage";
import DashboardPage from "./pages/DashboardPage";
import PersonnelPage from "./pages/PersonnelPage";
import ShiftWorkPage from "./pages/ShiftWorkPage";
import AppLayout from "./layouts/AppLayout";
import ChatPage from "./pages/ChatPage";
import AdminPage from "./pages/AdminPage";
import OnDutyPage from './pages/OnDutyPage';
import MockLoginPage from "./pages/MockLoginPage"; // New import
import ProtectedRoute from "./routes/ProtectedRoute";


const ProfilePage = ({ user }) => (
  <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
    <h2 className="text-2xl font-bold text-slate-900 mb-4">โปรไฟล์</h2>
    <p className="text-slate-600">หน้าข้อมูลส่วนตัว</p>
    <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
      <h3 className="font-semibold text-blue-900 mb-2">ข้อมูลผู้ใช้ปัจจุบัน:</h3>
      <div className="text-sm text-blue-800 space-y-1">
        <p><strong>คำนำหน้า:</strong> {user?.prefix || 'ไม่ระบุ'}</p>
        <p><strong>ชื่อ:</strong> {user?.firstname || 'ไม่ระบุ'}</p>
        <p><strong>นามสกุล:</strong> {user?.lastname || 'ไม่ระบุ'}</p>
        <p><strong>ตำแหน่ง:</strong> {user?.position || 'ไม่ระบุ'}</p>
        <p><strong>สังกัด:</strong> {user?.affiliation || 'ไม่ระบุ'}</p>
        <p><strong>แผนก:</strong> {user?.deph || 'ไม่ระบุ'}</p>
        <p><strong>รุ่น:</strong> {user?.generation || 'ไม่ระบุ'}</p>
        <p><strong>เบอร์โทร:</strong> {user?.phone || 'ไม่ระบุ'}</p>
        <p><strong>อีเมล:</strong> {user?.email || 'ไม่ระบุ'}</p>
        <p><strong>LINE ID:</strong> {user?.lineUserId || 'ไม่ระบุ'}</p>
      </div>
    </div>
  </div>
);

const SettingsPage = () => (
  <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
    <h2 className="text-2xl font-bold text-slate-900 mb-4">ตั้งค่า</h2>
    <p className="text-slate-600">หน้าการตั้งค่าระบบ</p>
    <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
      <p className="text-yellow-800">🚧 หน้านี้อยู่ระหว่างการพัฒนา</p>
    </div>
  </div>
);

function App() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true); // New state for auth loading

  useEffect(() => {
    console.log("App.js: useEffect - checking localStorage for user...");
    const saved = localStorage.getItem("authUser");
    if (saved) {
      try {
        const parsedUser = JSON.parse(saved);
        setUser(parsedUser);
        console.log("App.js: useEffect - user found in localStorage:", parsedUser);
      } catch (error) {
        console.error("App.js: useEffect - Error parsing saved user:", error);
        localStorage.removeItem("authUser");
      }
    }
    setAuthLoading(false); // Set authLoading to false after check
    console.log("App.js: useEffect - authLoading set to false.");
  }, []);

  const handleLoginSuccess = (u) => {
    console.log("App.js: handleLoginSuccess - user received:", u);
    setUser(u);
    localStorage.setItem("authUser", JSON.stringify(u));
    console.log("App.js: handleLoginSuccess - navigating to /");
    navigate("/"); // Navigate to dashboard after successful login
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("authUser");
    navigate("/"); // Use navigate instead of setCurrentPath and window.history.pushState
  };

  const navigate = useNavigate();

  const handleOpenNotifications = () => {
    console.log("Open notifications");
    alert("การแจ้งเตือน - ฟีเจอร์นี้อยู่ระหว่างการพัฒนา");
  };

  

  console.log("App.js: Rendering - user:", user, "authLoading:", authLoading);
  return (
    <Routes>
      {/* Public route for OnDutyPage */}
      <Route path="/on-duty" element={<OnDutyPage />} />

      {/* Authentication route */}
      <Route path="/auth" element={<AuthRegisterPage onLoginSuccess={handleLoginSuccess} />} />

      {/* Mock Login route */}
      <Route path="/mock-login" element={<MockLoginPage onLoginSuccess={handleLoginSuccess} />} />

      {/* Protected routes - wrapped by AppLayout */}
      <Route element={<ProtectedRoute user={user} authLoading={authLoading}><AppLayout user={user} onLogout={handleLogout} onOpenNotifications={handleOpenNotifications} /></ProtectedRoute>}>
        <Route path="/" element={<DashboardPage user={user} />} />
        <Route path="/personnel" element={<PersonnelPage user={user} />} />
        <Route path="/tasks" element={<ShiftWorkPage user={user} />} />
        <Route path="/shifts" element={<ShiftWorkPage user={user} />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/profile" element={<ProfilePage user={user} />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/admin" element={<AdminPage user={user} />} />
      </Route>

      {/* Catch-all for unmatched routes */}
      <Route path="*" element={!user ? <AuthRegisterPage onLoginSuccess={handleLoginSuccess} /> : <DashboardPage user={user} />} />
    </Routes>
  );
}

export default App;