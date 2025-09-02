// App.js (ที่แก้ไขแล้ว)

import React, { useEffect, useState } from "react";
import AuthRegisterPage from "./pages/AuthRegisterPage";
import DashboardPage from "./pages/DashboardPage";
import PersonnelPage from "./pages/PersonnelPage";
import ShiftWorkPage from "./pages/ShiftWorkPage";
import AppLayout from "./layouts/AppLayout";
import ChatPage from "./pages/ChatPage";
import AdminPage from "./pages/AdminPage";

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
  const [currentPath, setCurrentPath] = useState("/");

  useEffect(() => {
    const saved = localStorage.getItem("authUser");
    if (saved) {
      try {
        setUser(JSON.parse(saved));
      } catch (error) {
        console.error("Error parsing saved user:", error);
        localStorage.removeItem("authUser");
      }
    }

    const path = window.location.pathname;
    setCurrentPath(path);

    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);
    
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  const handleLoginSuccess = (u) => {
    setUser(u);
    localStorage.setItem("authUser", JSON.stringify(u));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("authUser");
    setCurrentPath("/");
    window.history.pushState({}, "", "/");
  };

  const handleNavigate = (path) => {
    setCurrentPath(path);
    window.history.pushState({}, "", path);
  };

  const handleOpenNotifications = () => {
    console.log("Open notifications");
    alert("การแจ้งเตือน - ฟีเจอร์นี้อยู่ระหว่างการพัฒนา");
  };

  if (!user) {
    return <AuthRegisterPage onLoginSuccess={handleLoginSuccess} />;
  }

  const getCurrentPageContent = () => {
    // --- ส่วนที่แก้ไข ---
    // 1. สร้าง list ของ role ที่สามารถเข้าหน้าแอดมินได้
    const allowedAdminRoles = ['super_admin', 'admin', 'supervisor', 'scheduler'];

    // 2. ตรวจสอบว่า role ของ user อยู่ใน list นี้หรือไม่
    if (user && allowedAdminRoles.includes(user.role) && currentPath === "/admin") {
      return <AdminPage user={user} />;
    }
    // --- จบส่วนที่แก้ไข ---

    switch (currentPath) {
      case "/":
        return <DashboardPage user={user} />;
      case "/personnel":
        return <PersonnelPage user={user} />;
      case "/shifts":
      case "/tasks":
        return <ShiftWorkPage user={user} />;
      case "/chat":
        return <ChatPage />;
      case "/profile":
        return <ProfilePage user={user} />;
      case "/settings":
        return <SettingsPage />;
      default:
        return <DashboardPage user={user} />;
    }
  };

  return (
    <AppLayout
      user={user}
      currentPath={currentPath}
      onNavigate={handleNavigate}
      onLogout={handleLogout}
      onOpenNotifications={handleOpenNotifications}
    >
      {getCurrentPageContent()}
    </AppLayout>
  );
}

export default App;