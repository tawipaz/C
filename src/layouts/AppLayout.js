// src/layouts/AppLayout.js
import React, { useState, useEffect, useCallback } from "react";
import Topbar from "./components/Topbar";
import OnlineStatus from "./components/OnlineStatus";
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
        {/* Floating On-Duty Button */}
        <Link
          to="/on-duty"
          className="fixed bottom-8 right-8 z-[60] group"
          aria-label="เข้าเวร / รายงานตัว"
        >
          <div className="flex items-center justify-center w-16 h-16 bg-blue-700 text-yellow-400 rounded-xl shadow-2xl hover:bg-blue-800 transition-all duration-300 transform hover:scale-110">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <span className="absolute bottom-1/2 right-full mr-4 px-3 py-2 bg-blue-900 text-yellow-200 text-sm rounded-xl shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            เข้าเวร / รายงานตัว
          </span>
        </Link>

  <div className="min-h-screen w-full bg-transparent">
          {/* Sidebar (absolute, does not push content) */}
          <aside className={`fixed left-0 top-0 h-screen bg-white border-r border-blue-100 shadow-2xl transition-all duration-300 flex flex-col z-50 ${isSidebarExpanded ? 'w-80' : 'w-20'} rounded-r-2xl`}>
            <div className="p-4 border-b border-blue-100">
              <div className={`flex items-center transition-all duration-300 ${isSidebarExpanded ? 'justify-start space-x-3' : 'justify-center'}`}> 
                <img src={logo} alt="App Logo" className="h-10 w-10 object-contain drop-shadow-lg flex-shrink-0" />
                <div className={`transition-all duration-300 overflow-hidden whitespace-nowrap min-w-0 ${isSidebarExpanded ? 'opacity-100' : 'opacity-0'}`}> 
                  <h2 className="text-lg font-bold text-blue-900" style={{ fontFamily: "'Orbitron', monospace" }}>
                    CMC
                  </h2>
                  <p className="text-xs text-blue-600">Court Marshal Connect</p>
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
                      ? 'bg-blue-50 text-blue-900 font-bold shadow-md'
                      : 'text-blue-700 hover:bg-blue-100 hover:text-blue-900'
                  }`}
                >
                  <div className={`absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1.5 bg-yellow-400 rounded-r-full transition-transform duration-300 ease-in-out ${isActive(item.to) ? 'scale-y-100' : 'scale-y-0'}`} />
                  <div className="relative flex-shrink-0">
                    <item.icon className={`w-5 h-5 ${isActive(item.to) ? 'text-blue-700' : 'text-blue-400 group-hover/item:text-blue-700'}`} />
                    {item.badge && (
                      <span className="absolute -top-2 -right-2 w-4 h-4 bg-yellow-400 text-blue-900 text-xs rounded-full flex items-center justify-center font-bold">
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <div className={`transition-all duration-300 overflow-hidden whitespace-nowrap min-w-0 ${isSidebarExpanded ? 'flex-1 opacity-100' : 'w-0 opacity-0'}`}> 
                    <div className="font-semibold text-sm">{item.label}</div>
                    <div className={`text-xs ${isActive(item.to) ? 'text-blue-600' : 'text-blue-400'}`}> 
                      {item.description}
                    </div>
                  </div>
                  <ChevronRight className={`flex-shrink-0 transition-all duration-300 ${isSidebarExpanded ? 'w-4 h-4 opacity-100' : 'w-0 opacity-0'} ${
                    isActive(item.to) ? 'text-yellow-400' : 'text-blue-400'
                  }`} />
                  <div className={`absolute left-full ml-2 px-3 py-2 bg-blue-900 text-yellow-200 text-sm rounded-xl shadow-lg opacity-0 invisible group-hover:visible transition-all duration-200 whitespace-nowrap z-50 ${isSidebarExpanded ? 'hidden' : 'group-hover:visible'}`}> 
                    {item.label}
                    <div className="absolute top-1/2 -left-1 transform -translate-y-1/2 w-2 h-2 bg-blue-900 rotate-45"></div>
                  </div>
                </Link>
              ))}
            </nav>
            <div className="p-4 border-t border-blue-100 space-y-2 mt-auto">
              <div className={`w-full flex items-center px-4 py-3 transition-all duration-300 overflow-hidden ${isSidebarExpanded ? 'opacity-100' : 'opacity-0 h-0'}`}> 
                <div className="w-10 h-10 bg-blue-700 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                  <CircleUserRound className="w-6 h-6 text-yellow-400" />
                </div>
                <div className="ml-3 min-w-0 flex-1">
                  <p className="text-sm font-semibold text-blue-900 truncate">
                    {`${user?.prefix || ''} ${user?.firstname || ''} ${user?.lastname || ''}`.trim() || 'ผู้ใช้งาน'}
                  </p>
                  <p className="text-xs text-blue-600 truncate">{user?.position || "เจ้าหน้าที่"}</p>
                </div>
              </div>
              <Link
                to="/settings"
                className={`w-full group/item flex items-center px-4 py-3 text-blue-700 hover:bg-blue-100 rounded-xl transition-all duration-200 relative no-underline ${isSidebarExpanded ? 'justify-start space-x-4' : 'justify-center'}`}
              >
                <SlidersHorizontal className="w-5 h-5 text-blue-400 flex-shrink-0" />
                <span className={`font-medium text-sm transition-all duration-300 overflow-hidden whitespace-nowrap ${isSidebarExpanded ? 'opacity-100' : 'w-0 opacity-0'}`}> 
                  ตั้งค่า
                </span>
              </Link>
              <button
                onClick={onLogout}
                className={`w-full group/item flex items-center px-4 py-3 text-yellow-400 hover:bg-yellow-50 rounded-xl transition-all duration-200 relative ${isSidebarExpanded ? 'justify-start space-x-4' : 'justify-center'}`}
              >
                <LogOut className="w-5 h-5 flex-shrink-0" />
                <span className={`font-medium text-sm transition-all duration-300 overflow-hidden whitespace-nowrap ${isSidebarExpanded ? 'opacity-100' : 'w-0 opacity-0'}`}> 
                  ออกจากระบบ
                </span>
              </button>
              <div className="border-t border-blue-100 pt-4 mt-2">
                <button
                  onClick={() => setIsSidebarExpanded(prev => !prev)}
                  className="w-full flex items-center justify-center px-4 py-3 text-blue-400 hover:bg-blue-100 hover:text-blue-800 rounded-xl transition-colors duration-200"
                >
                  {isSidebarExpanded ? <PanelLeftClose className="w-5 h-5" /> : <PanelLeftOpen className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </aside>
          {/* Main content fills screen, no Topbar for desktop */}
          <main
            className={`flex-1 p-0 overflow-y-auto min-h-screen transition-all duration-300 ease-in-out`}
            style={{
              marginLeft: isSidebarExpanded ? '20rem' : '5rem',
              marginTop: 0,
              transition: 'margin-left 0.3s'
            }}
          >
            <Outlet />
          </main>
        </div>
      </>
    );
  }

  // Mobile Layout
  return (
    <>
      {/* Floating On-Duty Button */}
      <Link
        to="/on-duty"
        className="fixed bottom-24 right-4 z-30"
        aria-label="เข้าเวร / รายงานตัว"
      >
        <div className="flex items-center justify-center w-14 h-14 bg-blue-700 text-yellow-400 rounded-2xl shadow-2xl active:bg-blue-800 active:scale-95 transition-transform duration-200">
          <ShieldAlert className="w-7 h-7" />
        </div>
      </Link>

  <div className="absolute inset-0 w-full min-h-screen bg-transparent z-0">
        {/* Topbar (Mobile, fixed at top, seamless, always visible) */}
        <div className="fixed top-0 left-0 right-0 z-50">
          <Topbar appName={appName} currentPage={currentPage.label} logo={logo} isMobile={true}>
            <button
              onClick={onOpenNotifications}
              className="relative p-2 text-blue-700 hover:text-blue-900 hover:bg-blue-100 rounded-xl transition-colors"
              aria-label="แจ้งเตือน"
            >
              <Bell className="w-6 h-6" />
            </button>
          </Topbar>
        </div>

        {showMobileSettings && (
          <div className="fixed inset-0 bg-black/50 z-50" onClick={closeMobileMenus}>
            <div className="fixed inset-y-0 right-0 w-80 bg-white shadow-2xl rounded-l-2xl" onClick={(e) => e.stopPropagation()}>
              <div className="p-4 border-b border-blue-100">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-blue-900">โปรไฟล์</h2>
                  <button
                    onClick={closeMobileMenus}
                    className="p-2 text-blue-400 hover:text-blue-700 hover:bg-blue-100 rounded-xl"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-center space-x-4 p-4 bg-blue-50 border border-blue-100 rounded-2xl shadow">
                  <div className="w-16 h-16 bg-blue-700 rounded-2xl flex items-center justify-center">
                    <CircleUserRound className="w-8 h-8 text-yellow-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-blue-900">{`${user?.prefix || ''} ${user?.firstname || ''} ${user?.lastname || ''}`.trim() || "ผู้ใช้งาน"}</h3>
                    <p className="text-sm text-blue-700">{user?.position || "เจ้าหน้าที่"}</p>
                    <p className="text-sm text-blue-400">{user?.phone || "ไม่ระบุ"}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add top padding to main so content never overlaps Topbar */}
        <main className="w-full min-h-screen overflow-auto p-0 m-0" style={{ paddingTop: '4.5rem' }}>
          <Outlet />
        </main>

        <nav className="fixed bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md border border-blue-100 rounded-2xl shadow-2xl px-4 py-2 z-40">
          <div className="flex items-center justify-around">
            {navigationItems.slice(0, 5).map((item) => (
              <Link
                key={item.key}
                to={item.to}
                className={`flex flex-col items-center space-y-1 py-2 px-3 rounded-xl transition-all duration-200 relative transform active:scale-95 no-underline ${
                  isActive(item.to) ? 'text-blue-700 font-bold' : 'text-blue-400'
                }`}
              >
                <div className="relative">
                  <item.icon className="w-6 h-6" />
                  {item.badge && (
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full flex items-center justify-center">
                      <Dot className="w-3 h-3 text-blue-900" />
                    </span>
                  )}
                </div>
                <span className={`text-xs font-medium transition-all duration-200 ${isActive(item.to) ? 'text-blue-900' : 'text-blue-400'}`}> 
                  {item.label}
                </span>
                <div className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-1 w-1/2 bg-yellow-400 rounded-full transition-transform duration-300 ease-out ${isActive(item.to) ? 'scale-x-100' : 'scale-x-0'}`} />
              </Link>
            ))}
          </div>
        </nav>
      </div>
    </>
  );
}
