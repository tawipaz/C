// src/layouts/AppLayout.js
import React, { useState, useEffect, useCallback } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import {
  Bell,
  Settings,
  UsersRound,
  CalendarCheck2,
  CircleUserRound,
  MessagesSquare,
  LayoutDashboard,
  LogOut,
  X,
  ChevronRight,
  ShieldCheck,
  ShieldAlert,
  ChevronLeft,
  Dot,
  SlidersHorizontal,
  PanelLeftClose,
  PanelLeftOpen,
  ClipboardList
} from "lucide-react";
import logo from '../assets/logo.png';

export default function AppLayout({
  user,
  appName = "CourtMarshalConnect",
  onLogout,
  onOpenNotifications
}) {
  const [showMobileSettings, setShowMobileSettings] = useState(false);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);
  const location = useLocation();
  const currentPath = location.pathname;

  const handleResize = useCallback(() => {
    const desktop = window.innerWidth >= 1024;
    setIsDesktop(desktop);
    if (desktop) {
      setShowMobileSettings(false);
      setIsSidebarExpanded(false);
    }
  }, []);

  useEffect(() => {
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [handleResize]);

  const navigationItems = [
    { to: "/", key: "home", label: "หน้าหลัก", icon: LayoutDashboard, description: "ภาพรวมข้อมูลทั้งหมด", badge: null },
    { to: "/personnel", key: "personnel", label: "บุคลากร", icon: UsersRound, description: "จัดการข้อมูลเจ้าหน้าที่", badge: null },
    {
      key: 'duty-management',
      to: '/duty-management',
      label: 'จัดการเวร',
      description: 'ตั้งค่าและดูข้อมูลการเข้าเวร',
      icon: ClipboardList,
    },
    { to: "/tasks", key: "tasks", label: "ตารางเวร", icon: CalendarCheck2, description: "จัดตารางและมอบหมายงาน", badge: null },
    { to: "/chat", key: "chat", label: "แชทหน่วย", icon: MessagesSquare, description: "สื่อสารภายในทีม", badge: null },
    { to: "/profile", key: "profile", label: "โปรไฟล์", icon: CircleUserRound, description: "ข้อมูลส่วนตัวของคุณ", badge: null },
  ];

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

  const isActive = useCallback((to) => {
    return to === "/" ? currentPath === "/" : currentPath.startsWith(to);
  }, [currentPath]);

  const closeMobileMenus = () => {
    setShowMobileSettings(false);
  };

  const currentPage = navigationItems.find(item => isActive(item.to)) || { label: 'CourtMarshalConnect' };

  if (isDesktop) {
    return (
      <>
        <Link
          to="/on-duty"
          className="fixed bottom-8 right-8 z-[60] group"
          aria-label="เข้าเวร / รายงานตัว"
        >
          <div className="flex items-center justify-center w-16 h-16 bg-green-500 text-white rounded-full shadow-lg hover:bg-green-600 transition-all duration-300 transform hover:scale-110">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <span className="absolute bottom-1/2 right-full mr-4 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            เข้าเวร / รายงานตัว
          </span>
        </Link>

      <div className="min-h-screen w-full bg-slate-50 flex">
          <aside className={`fixed left-0 top-0 h-screen bg-white border-r border-slate-200/80 shadow-xl transition-all duration-300 ease-in-out flex flex-col z-50 ${isSidebarExpanded ? 'w-80' : 'w-20'}`}>
            <div className="p-4 border-b border-slate-200/60">
              <div className={`flex items-center transition-all duration-300 ${isSidebarExpanded ? 'justify-start space-x-3' : 'justify-center'}`}>
                <img src={logo} alt="App Logo" className="h-10 w-10 object-contain drop-shadow-lg flex-shrink-0" />
                <div className={`transition-all duration-300 overflow-hidden whitespace-nowrap min-w-0 ${isSidebarExpanded ? 'opacity-100' : 'opacity-0'}`}>
                  <h2 className="text-lg font-bold text-slate-900" style={{ fontFamily: "'Orbitron', monospace" }}>
                    CMC
                  </h2>
                  <p className="text-xs text-slate-500">Court Marshal Connect</p>
                </div>
              </div>
            </div>

            <nav className="flex-1 p-4 space-y-2 mt-2">
              {navigationItems.map((item) => (
                <Link
                  key={item.key}
                  to={item.to}
                  className={`w-full group/item flex items-center px-4 py-3.5 rounded-xl transition-all duration-200 text-left relative no-underline ${
                    isSidebarExpanded ? 'justify-start space-x-4' : 'justify-center'
                  } ${
                    isActive(item.to)
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <div className={`absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1.5 bg-primary-600 rounded-r-full transition-transform duration-300 ease-in-out ${isActive(item.to) ? 'scale-y-100' : 'scale-y-0'}`} />
                  <div className="relative flex-shrink-0">
                    <item.icon className={`w-5 h-5 ${isActive(item.to) ? 'text-primary-600' : 'text-slate-500 group-hover/item:text-slate-700'}`} />
                    {item.badge && (
                      <span className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                        {item.badge}
                      </span>
                    )}
                  </div>

                  <div className={`transition-all duration-300 overflow-hidden whitespace-nowrap min-w-0 ${isSidebarExpanded ? 'flex-1 opacity-100' : 'w-0 opacity-0'}`}>
                    <div className="font-semibold text-sm">{item.label}</div>
                    <div className={`text-xs ${isActive(item.to) ? 'text-primary-500' : 'text-slate-500'}`}>
                      {item.description}
                    </div>
                  </div>

                  <ChevronRight className={`flex-shrink-0 transition-all duration-300 ${isSidebarExpanded ? 'w-4 h-4 opacity-100' : 'w-0 opacity-0'} ${
                    isActive(item.to) ? 'text-primary-400' : 'text-slate-400'
                  }`} />

                  <div className={`absolute left-full ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 invisible group-hover:visible transition-all duration-200 whitespace-nowrap z-50 ${isSidebarExpanded ? 'hidden' : 'group-hover:visible'}`}>
                    {item.label}
                    <div className="absolute top-1/2 -left-1 transform -translate-y-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
                  </div>
                </Link>
              ))}
            </nav>

            <div className="p-4 border-t border-slate-200/60 space-y-2 mt-auto">
              <div className={`w-full flex items-center px-4 py-3 transition-all duration-300 overflow-hidden ${isSidebarExpanded ? 'opacity-100' : 'opacity-0 h-0'}`}>
                <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center shadow-sm flex-shrink-0">
                  <CircleUserRound className="w-6 h-6 text-white" />
                </div>
                <div className="ml-3 min-w-0 flex-1">
                  <p className="text-sm font-semibold text-slate-900 truncate">
                    {`${user?.prefix || ''} ${user?.firstname || ''} ${user?.lastname || ''}`.trim() || 'ผู้ใช้งาน'}
                  </p>
                  <p className="text-xs text-slate-500 truncate">{user?.position || "เจ้าหน้าที่"}</p>
                </div>
              </div>

              <Link
                to="/settings"
                className={`w-full group/item flex items-center px-4 py-3 text-slate-700 hover:bg-slate-100 rounded-xl transition-all duration-200 relative no-underline ${isSidebarExpanded ? 'justify-start space-x-4' : 'justify-center'}`}
              >
                <SlidersHorizontal className="w-5 h-5 text-slate-500 flex-shrink-0" />
                <span className={`font-medium text-sm transition-all duration-300 overflow-hidden whitespace-nowrap ${isSidebarExpanded ? 'opacity-100' : 'w-0 opacity-0'}`}>
                  ตั้งค่า
                </span>
              </Link>

              <button
                onClick={onLogout}
                className={`w-full group/item flex items-center px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200 relative ${isSidebarExpanded ? 'justify-start space-x-4' : 'justify-center'}`}
              >
                <LogOut className="w-5 h-5 flex-shrink-0" />
                <span className={`font-medium text-sm transition-all duration-300 overflow-hidden whitespace-nowrap ${isSidebarExpanded ? 'opacity-100' : 'w-0 opacity-0'}`}>
                  ออกจากระบบ
                </span>
              </button>

              <div className="border-t border-slate-200/60 pt-4 mt-2">
                <button
                  onClick={() => setIsSidebarExpanded(prev => !prev)}
                  className="w-full flex items-center justify-center px-4 py-3 text-slate-500 hover:bg-slate-100 hover:text-slate-800 rounded-xl transition-colors duration-200"
                >
                  {isSidebarExpanded ? <PanelLeftClose className="w-5 h-5" /> : <PanelLeftOpen className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </aside>

          <main className={`flex-1 p-6 lg:p-8 overflow-y-auto min-h-screen transition-all duration-300 ease-in-out ${isSidebarExpanded ? 'ml-80' : 'ml-20'}`}>
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-3xl font-bold text-slate-800">{currentPage.label}</h1>
              <button
                onClick={onOpenNotifications}
                className="relative p-2.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all duration-200"
              >
                <Bell className="w-5 h-5" />
              </button>
            </div>
            <Outlet />
          </main>
      </div>
      </>
    );
  }

  // Mobile Layout
  return (
    <>
      <Link
        to="/on-duty"
        className="fixed bottom-24 right-4 z-30"
        aria-label="เข้าเวร / รายงานตัว"
      >
        <div className="flex items-center justify-center w-14 h-14 bg-green-500 text-white rounded-full shadow-lg active:bg-green-600 active:scale-95 transition-transform duration-200">
          <ShieldAlert className="w-7 h-7" />
        </div>
      </Link>

    <div className="min-h-screen w-full bg-slate-50">
      <header className="bg-white/90 backdrop-blur-md border-b border-slate-200/60 shadow-sm sticky top-0 z-50">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <img src={logo} alt="App Logo" className="h-8 w-8 object-contain drop-shadow-lg" />
                <h1 className="text-lg font-bold text-slate-900">
                  {currentPage.label}
                </h1>
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
                className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center"
              >
                <CircleUserRound className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>
        </div>
      </header>

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
              <div className="flex items-center space-x-4 p-4 bg-primary-50 border border-primary-200 rounded-xl">
                <div className="w-16 h-16 bg-primary-600 rounded-xl flex items-center justify-center">
                  <CircleUserRound className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">{`${user?.prefix || ''} ${user?.firstname || ''} ${user?.lastname || ''}`.trim() || "ผู้ใช้งาน"}</h3>
                  <p className="text-sm text-slate-600">{user?.position || "เจ้าหน้าที่"}</p>
                  <p className="text-sm text-slate-500">{user?.phone || "ไม่ระบุ"}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <main className="p-4 pb-24">
        <Outlet />
      </main>

      <nav className="fixed bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md border border-slate-200/60 rounded-2xl shadow-lg px-4 py-2 z-40">
        <div className="flex items-center justify-around">
          {navigationItems.slice(0, 5).map((item) => (
            <Link
              key={item.key}
              to={item.to}
              className={`flex flex-col items-center space-y-1 py-2 px-3 rounded-lg transition-all duration-200 relative transform active:scale-95 no-underline ${
                isActive(item.to) ? 'text-primary-600' : 'text-slate-500'
              }`}
            >
              <div className="relative">
                <item.icon className="w-6 h-6" />
                {item.badge && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full flex items-center justify-center">
                    <Dot className="w-3 h-3 text-white" />
                  </span>
                )}
              </div>
              <span className={`text-xs font-medium transition-all duration-200 ${isActive(item.to) ? 'text-primary-700' : 'text-slate-500'}`}>
                {item.label}
              </span>
              <div className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-1 w-1/2 bg-primary-600 rounded-full transition-transform duration-300 ease-out ${isActive(item.to) ? 'scale-x-100' : 'scale-x-0'}`} />
            </Link>
          ))}
        </div>
      </nav>
    </div>
    </>
  );
}
