// src/layouts/AppLayout.js
import React, { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import {
  Bell,
  Settings,
  Users,
  ClipboardList,
  UserCircle2,
  MessageSquareText,
  Home,
  LogOut,
  X,
  ChevronRight,
  Shield,
  ShieldCheck,
  Menu,
  Search,
  ChevronLeft,
  Dot
} from "lucide-react";
import logo from '../assets/logo.png';

export default function AppLayout({
  user,
  appName = "CourtMarshalConnect",
  onOpenSettings,
  onOpenNotifications,
  onLogout,
  children
}) {
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [showMobileSettings, setShowMobileSettings] = useState(false);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);

  // Handle screen resize
  useEffect(() => {
    const handleResize = () => {
      const desktop = window.innerWidth >= 1024;
      setIsDesktop(desktop);
      if (desktop) {
        setShowMobileSidebar(false);
        setShowMobileSettings(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Navigation items configuration
  const navigationItems = [
    { 
      to: "/", 
      key: "home", 
      label: "หน้าหลัก", 
      icon: Home, 
      description: "ภาพรวมและสถิติ",
      badge: null
    },
    { 
      to: "/personnel", 
      key: "personnel", 
      label: "บุคลากร", 
      icon: Users, 
      description: "จัดการข้อมูลเจ้าหน้าที่",
      badge: null
    },
    { 
      to: "/tasks", 
      key: "tasks", 
      label: "งานและเวร", 
      icon: ClipboardList, 
      description: "จัดตารางและมอบหมายงาน",
      badge: null
    },
    { 
      to: "/chat", 
      key: "chat", 
      label: "แชทหน่วย", 
      icon: MessageSquareText, 
      description: "สื่อสารภายในทีม",
      badge: null
    },
    { 
      to: "/profile", 
      key: "profile", 
      label: "โปรไฟล์", 
      icon: UserCircle2, 
      description: "ข้อมูลส่วนตัว",
      badge: null
    },
  ];

  // Add admin menu if user is admin
  if (user && user.role === 'admin') {
    navigationItems.splice(4, 0, {
      to: "/admin",
      key: "admin",
      label: "แผงควบคุม",
      icon: ShieldCheck,
      description: "จัดการระบบสำหรับ Admin",
      badge: null
    });
  }

  const isActive = (to) => {
    const currentPath = window.location.pathname;
    return to === "/" ? currentPath === "/" : currentPath.startsWith(to);
  };

  const handleNavigation = (to) => {
    window.location.href = to;
    setShowMobileSidebar(false);
  };

  const closeMobileMenus = () => {
    setShowMobileSidebar(false);
    setShowMobileSettings(false);
  };

  // Desktop Layout
  if (isDesktop) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">
        {/* Desktop Header */}
        <header className="w-full bg-white/90 backdrop-blur-md border-b border-slate-200/60 shadow-sm sticky top-0 z-40">
          <div className="ml-20 px-6 py-4">
            <div className="flex items-center justify-end w-full">
              {/* Header Actions - Right aligned */}
              <div className="flex items-center space-x-3 flex-shrink-0">
                <button 
                  onClick={onOpenNotifications}
                  className="relative p-2.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all duration-200"
                >
                  <Bell className="w-5 h-5" />
                </button>

                {/* User Profile - Show full name */}
                <div className="flex items-center space-x-3 bg-white/80 rounded-xl px-3 py-2 border border-slate-200/60 min-w-0">
                  <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shadow-sm flex-shrink-0">
                    <UserCircle2 className="w-5 h-5 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-slate-900 truncate">
                      {(() => {
                        const prefix = user?.prefix || '';
                        const firstname = user?.firstname || '';
                        const lastname = user?.lastname || '';
                        const fullName = `${prefix} ${firstname} ${lastname}`.trim();
                        return fullName || 'ผู้ใช้งาน';
                      })()}
                    </p>
                    <p className="text-xs text-slate-500 truncate">{user?.position || "เจ้าหน้าที่"}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="flex">
          {/* Desktop Sidebar - Fixed and Hover */}
          <aside className="fixed left-0 top-0 h-screen group bg-white/90 backdrop-blur-md border-r border-slate-200/60 shadow-lg transition-all duration-300 ease-in-out w-20 hover:w-80 flex flex-col z-50">
            
            {/* Logo Section */}
            <div className="p-4 border-b border-slate-200/60">
              <div className="flex items-center justify-center group-hover:justify-start group-hover:space-x-3">
                <img src={logo} alt="App Logo" className="h-10 w-10 object-contain drop-shadow-lg flex-shrink-0" />
                <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 overflow-hidden whitespace-nowrap min-w-0">
                  <h2 className="text-lg font-bold text-slate-900" style={{ fontFamily: "'Orbitron', monospace" }}>
                    CMC
                  </h2>
                  <p className="text-xs text-slate-500">Court Marshal Connect</p>
                </div>
              </div>
            </div>
            
            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-2 mt-2">
              {navigationItems.map((item) => (
                <button
                  key={item.key}
                  onClick={() => handleNavigation(item.to)}
                  className={`w-full group/item flex items-center justify-center group-hover:justify-start group-hover:space-x-4 px-4 py-3.5 rounded-xl transition-all duration-200 text-left relative ${
                    isActive(item.to) 
                      ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg' 
                      : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <div className="relative flex-shrink-0">
                    <item.icon className={`w-5 h-5 ${isActive(item.to) ? 'text-white' : 'text-slate-500 group-hover/item:text-slate-700'}`} />
                    {item.badge && (
                      <span className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                        {item.badge}
                      </span>
                    )}
                  </div>
                  
                  <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 overflow-hidden whitespace-nowrap min-w-0 flex-1">
                    <div className="font-semibold text-sm">{item.label}</div>
                    <div className={`text-xs ${isActive(item.to) ? 'text-indigo-100' : 'text-slate-500'}`}>
                      {item.description}
                    </div>
                  </div>
                  
                  <ChevronRight className={`w-4 h-4 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-all duration-300 ${
                    isActive(item.to) ? 'text-white' : 'text-slate-400'
                  }`} />

                  {/* Tooltip for collapsed state */}
                  <div className="absolute left-full ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 invisible group-hover:invisible group/item-hover:opacity-100 group/item-hover:visible group-hover:opacity-0 transition-all duration-200 whitespace-nowrap z-50">
                    {item.label}
                    <div className="absolute top-1/2 -left-1 transform -translate-y-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
                  </div>
                </button>
              ))}
            </nav>

            {/* Bottom Actions */}
            <div className="p-4 border-t border-slate-200/60 space-y-2">
              <button 
                onClick={onOpenSettings}
                className="w-full group/item flex items-center justify-center group-hover:justify-start group-hover:space-x-4 px-4 py-3 text-slate-700 hover:bg-slate-50 rounded-xl transition-all duration-200 relative"
              >
                <Settings className="w-5 h-5 text-slate-500 flex-shrink-0" />
                <span className="font-medium text-sm opacity-0 group-hover:opacity-100 transition-all duration-300 overflow-hidden whitespace-nowrap">
                  ตั้งค่า
                </span>
                <div className="absolute left-full ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 invisible group-hover:invisible group/item-hover:opacity-100 group/item-hover:visible group-hover:opacity-0 transition-all duration-200 whitespace-nowrap z-50">
                  ตั้งค่า
                  <div className="absolute top-1/2 -left-1 transform -translate-y-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
                </div>
              </button>
              
              <button 
                onClick={onLogout}
                className="w-full group/item flex items-center justify-center group-hover:justify-start group-hover:space-x-4 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200 relative"
              >
                <LogOut className="w-5 h-5 flex-shrink-0" />
                <span className="font-medium text-sm opacity-0 group-hover:opacity-100 transition-all duration-300 overflow-hidden whitespace-nowrap">
                  ออกจากระบบ
                </span>
                <div className="absolute left-full ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 invisible group-hover:invisible group/item-hover:opacity-100 group/item-hover:visible group-hover:opacity-0 transition-all duration-200 whitespace-nowrap z-50">
                  ออกจากระบบ
                  <div className="absolute top-1/2 -left-1 transform -translate-y-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
                </div>
              </button>
            </div>
          </aside>

          {/* Main Content - with proper margin and padding */}
          <main className="flex-1 ml-20 p-6 overflow-y-auto min-h-screen">
            {children || <Outlet />}
          </main>
        </div>
      </div>
    );
  }

  // Mobile Layout
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">
      {/* Mobile Header */}
      <header className="bg-white/90 backdrop-blur-md border-b border-slate-200/60 shadow-sm sticky top-0 z-50">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowMobileSidebar(true)}
                className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <Menu className="w-5 h-5" />
              </button>
              <div className="flex items-center space-x-2">
                <img src={logo} alt="App Logo" className="h-8 w-8 object-contain drop-shadow-lg" />
                <div>
                  <h1 className="text-lg font-bold text-slate-900" style={{ fontFamily: "'Orbitron', monospace" }}>
                    CMC
                  </h1>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button 
                onClick={onOpenNotifications}
                className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <Bell className="w-5 h-5" />
              </button>
              
              <button
                onClick={() => setShowMobileSettings(true)}
                className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center"
              >
                <UserCircle2 className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Sidebar Overlay */}
      {showMobileSidebar && (
        <div className="fixed inset-0 bg-black/50 z-50" onClick={closeMobileMenus}>
          <div className="fixed inset-y-0 left-0 w-80 bg-white shadow-xl" onClick={(e) => e.stopPropagation()}>
            {/* Sidebar Header */}
            <div className="p-4 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <img src={logo} alt="App Logo" className="h-10 w-10 object-contain drop-shadow-lg" />
                  <div>
                    <h2 className="text-lg font-bold text-slate-900" style={{ fontFamily: "'Orbitron', monospace" }}>
                      {appName}
                    </h2>
                    <p className="text-sm text-slate-500">เมนูหลัก</p>
                  </div>
                </div>
                <button
                  onClick={closeMobileMenus}
                  className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Mobile Navigation */}
            <nav className="flex-1 p-4 space-y-2">
              {navigationItems.map((item) => (
                <button
                  key={item.key}
                  onClick={() => handleNavigation(item.to)}
                  className={`w-full flex items-center justify-between px-4 py-4 rounded-xl transition-all duration-200 text-left ${
                    isActive(item.to) 
                      ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg' 
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <item.icon className={`w-6 h-6 ${isActive(item.to) ? 'text-white' : 'text-slate-500'}`} />
                      {item.badge && (
                        <span className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                          {item.badge}
                        </span>
                      )}
                    </div>
                    <div>
                      <div className="font-semibold">{item.label}</div>
                      <div className={`text-sm ${isActive(item.to) ? 'text-indigo-100' : 'text-slate-500'}`}>
                        {item.description}
                      </div>
                    </div>
                  </div>
                  <ChevronRight className={`w-4 h-4 ${isActive(item.to) ? 'text-white' : 'text-slate-400'}`} />
                </button>
              ))}
            </nav>

            {/* Mobile Bottom Actions */}
            <div className="p-4 border-t border-slate-200 space-y-2">
              <button 
                onClick={onOpenSettings}
                className="w-full flex items-center space-x-4 px-4 py-4 text-slate-700 hover:bg-slate-50 rounded-xl transition-colors"
              >
                <Settings className="w-6 h-6 text-slate-500" />
                <span className="font-semibold">ตั้งค่า</span>
              </button>
              <button 
                onClick={onLogout}
                className="w-full flex items-center space-x-4 px-4 py-4 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
              >
                <LogOut className="w-6 h-6" />
                <span className="font-semibold">ออกจากระบบ</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Settings Overlay */}
      {showMobileSettings && (
        <div className="fixed inset-0 bg-black/50 z-50" onClick={closeMobileMenus}>
          <div className="fixed inset-y-0 right-0 w-80 bg-white shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-900">โปรไฟล์</h2>
                <button
                  onClick={closeMobileMenus}
                  className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-4">
              {/* User Info */}
              <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <UserCircle2 className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">{user?.fullname || "ผู้ใช้งาน"}</h3>
                  <p className="text-sm text-slate-600">{user?.position || "เจ้าหน้าที่"}</p>
                  <p className="text-sm text-slate-500">{user?.phone || "ไม่ระบุ"}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Main Content */}
      <main className="p-4 pb-20">
        {children || <Outlet />}
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200 px-4 py-2 z-40">
        <div className="flex items-center justify-around">
          {navigationItems.slice(0, 5).map((item) => (
            <button
              key={item.key}
              onClick={() => handleNavigation(item.to)}
              className={`flex flex-col items-center space-y-1 p-2 rounded-xl transition-all duration-200 relative ${
                isActive(item.to) ? 'text-indigo-600' : 'text-slate-500'
              }`}
            >
              <div className="relative">
                <item.icon className={`w-5 h-5 ${isActive(item.to) ? 'text-indigo-600' : 'text-slate-500'}`} />
                {item.badge && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full flex items-center justify-center">
                    <Dot className="w-3 h-3 text-white" />
                  </span>
                )}
              </div>
              <span className={`text-xs font-medium ${isActive(item.to) ? 'text-indigo-600' : 'text-slate-500'}`}>
                {item.label}
              </span>
              {isActive(item.to) && (
                <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-indigo-600 rounded-full"></div>
              )}
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}