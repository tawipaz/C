// src/layouts/AppLayout.js
import React, { useState, useEffect, useCallback } from "react";
import { Link, useLocation, Outlet } from "react-router-dom";
import {
  LayoutDashboard, UsersRound, CalendarCheck2, MessagesSquare, CircleUserRound,
  ShieldCheck, ClipboardList, Bell, X, ShieldAlert, Dot, Settings, Menu, ChevronLeft, ChevronRight, Building
} from "lucide-react";
import logo from "../assets/logo.png";

export default function AppLayout({
  user,
  appName = "CourtMarshalConnect",
  onLogout,
  onOpenNotifications
}) {
  const [showMobileSettings, setShowMobileSettings] = useState(false);
  const [screenSize, setScreenSize] = useState('mobile');
  const [isHovered, setIsHovered] = useState(false);
  const location = useLocation();
  const currentPath = location.pathname;

  // ปรับปรุงการตรวจจับขนาดหน้าจอ
  const handleResize = useCallback(() => {
    const width = window.innerWidth;
    if (width >= 1024) { // เปลี่ยนจาก 1280 เป็น 1024
      setScreenSize('desktop');
    } else if (width >= 768) {
      setScreenSize('tablet');
    } else {
      setScreenSize('mobile');
    }
    
    // Auto-close mobile settings on resize
    if (width >= 768) {
      setShowMobileSettings(false);
    }
  }, []);

  useEffect(() => {
    handleResize(); // Set initial state
    window.addEventListener('resize', handleResize);
    
    // Force responsive check on mount
    const checkResponsive = () => {
      const width = window.innerWidth;
      if (width < 1024) {
        // Switch to mobile/tablet layout for screens smaller than 1024px
        if (width >= 768) {
          setScreenSize('tablet');
        } else {
          setScreenSize('mobile');
        }
      }
    };
    
    checkResponsive();
    
    return () => window.removeEventListener('resize', handleResize);
  }, [handleResize]);

  const navigationItems = [
    { to: "/", key: "home", label: "หน้าหลัก", icon: LayoutDashboard, description: "ภาพรวมระบบ", badge: null },
    { to: "/personnel", key: "personnel", label: "บุคลากร", icon: UsersRound, description: "จัดการเจ้าหน้าที่", badge: null },
    { to: "/unit-structure", key: "unit-structure", label: "โครงสร้างส่วนงาน", icon: Building, description: "จัดการโครงสร้างองค์กร", badge: null },
    { to: "/document-management", key: "document-management", label: "จัดการเอกสาร", icon: ClipboardList, description: "จัดทำเอกสาร", badge: null },
    { to: "/tasks", key: "tasks", label: "ตารางเวร", icon: CalendarCheck2, description: "จัดตารางงาน", badge: null },
    { to: "/chat", key: "chat", label: "แชท", icon: MessagesSquare, description: "สื่อสารทีม", badge: null },
    { to: "/profile", key: "profile", label: "โปรไฟล์", icon: CircleUserRound, description: "ข้อมูลส่วนตัว", badge: null },
  ];

  if (user && user.role === 'admin') {
    // Admin menu will be added in a separate section
  }

  const isActive = useCallback((to) => {
    return to === "/" ? currentPath === "/" : currentPath.startsWith(to);
  }, [currentPath]);

  const closeMobileMenus = () => {
    setShowMobileSettings(false);
  };

  const currentPage = navigationItems.find(item => isActive(item.to)) || { label: 'CourtMarshalConnect' };

  // Desktop Layout
  if (screenSize === 'desktop') {
    const sidebarWidth = isHovered ? '280px' : '100px'; // เพิ่มความกว้างขั้นต่ำ
    
    return (
      <div 
        className="flex bg-gradient-to-br from-slate-50 to-slate-100 overflow-hidden" 
        style={{ 
          width: '100vw', 
          height: '100vh',
          position: 'fixed',
          top: 0,
          left: 0,
          margin: 0,
          padding: 0
        }}
      >
        {/* Modern Desktop Sidebar with Hover */}
        <aside 
          className="bg-white shadow-xl border-r border-slate-200/50 flex-shrink-0 overflow-hidden transition-all duration-300 ease-in-out relative hover:shadow-2xl"
          style={{ width: sidebarWidth, height: '100vh' }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Sidebar Header */}
          <div className="relative bg-gradient-to-r from-blue-600 to-blue-700 text-white">
            <div className="p-6 transition-all duration-300">
              <div className="flex items-center justify-center">
                <div className="relative">
                  <img 
                    src={logo || "/logo.png"} 
                    alt="Logo" 
                    className="w-16 h-16 rounded-lg shadow-md object-contain"
                    onError={(e) => {
                      console.error('Logo failed to load:', e);
                      // Fallback to placeholder
                      e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiByeD0iMTIiIGZpbGw9IiMzNzMzZGMiLz4KPHR5gHFIG4iIGhlaWdodD0iIj4tZmVyOTKU2l6ZT0iMjQiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5DPC90ZXh0Pgo8L3N2Zz4=';
                    }}
                  />
                </div>
              </div>
              <div className={`mt-3 text-center transition-all duration-300 ${!isHovered ? 'opacity-0 h-0 overflow-hidden' : 'opacity-100'}`}>
                <h1 className="text-lg font-bold">{appName}</h1>
                <p className="text-sm text-blue-200 opacity-90">ระบบบริหารจัดการ</p>
              </div>
            </div>
          </div>

          {/* User Profile Section - แสดงเฉพาะเมื่อ hover */}
          {isHovered && (
            <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-slate-200 transition-all duration-300">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-md">
                  <CircleUserRound className="w-6 h-6 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-semibold text-slate-800 truncate">
                    {`${user?.prefix || ''} ${user?.firstname || ''} ${user?.lastname || ''}`.trim()}
                  </h3>
                  <p className="text-xs text-slate-500 truncate">{user?.position || "เจ้าหน้าที่"}</p>
                  {user?.role === 'admin' && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 mt-1">
                      <ShieldCheck className="w-3 h-3 mr-1" />
                      Admin
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Collapsed User Avatar - แสดงเฉพาะเมื่อไม่ hover */}
          {!isHovered && (
            <div className="p-4 border-b border-slate-200 flex justify-center transition-all duration-300">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-md">
                <CircleUserRound className="w-6 h-6 text-white" />
              </div>
            </div>
          )}

          {/* Navigation Menu */}
          <nav className="py-4 space-y-1 flex-1 overflow-y-auto">
            {navigationItems.map((item, index) => (
              <div
                key={item.key}
                className={`group transition-all duration-200 relative ${
                  !isHovered ? 'flex justify-center py-3' : ''
                }`}
              >
                <Link
                  to={item.to}
                  className={`flex items-center rounded-xl transition-all duration-200 relative ${
                    isActive(item.to)
                      ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800'
                  } ${!isHovered ? 'p-3' : 'px-4 py-3 mx-2 space-x-3'}`}
                  title={!isHovered ? item.label : ''}
                >
                  <div className="relative flex-shrink-0">
                    <item.icon className="w-6 h-6" />
                    {item.badge && (
                      <div className="absolute -top-2 -right-2 w-3 h-3 bg-red-500 rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                    )}
                  </div>
                  <div className={`flex-1 min-w-0 transition-all duration-300 ${!isHovered ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'}`}>
                    <div className="font-medium text-sm">{item.label}</div>
                    {!isActive(item.to) && (
                      <div className="text-xs opacity-60 truncate">{item.description}</div>
                    )}
                  </div>
                </Link>
              </div>
            ))}
            
            {/* Admin Section */}
            {user?.role === 'admin' && (
              <div className="pt-4 mt-4 border-t border-slate-200">
                <div className={`text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 transition-all duration-300 ${
                  !isHovered ? 'text-center opacity-0' : 'px-6 opacity-100'
                }`}>
                  {!isHovered ? '•••' : 'ผู้ดูแลระบบ'}
                </div>
                <div className={`group transition-all duration-200 relative ${
                  !isHovered ? 'flex justify-center py-3' : ''
                }`}>
                  <Link
                    to="/admin"
                    className={`flex items-center rounded-xl transition-all duration-200 relative ${
                      isActive('/admin')
                        ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg'
                        : 'text-slate-600 hover:bg-red-50 hover:text-red-600'
                    } ${!isHovered ? 'p-3' : 'px-4 py-3 mx-2 space-x-3'}`}
                    title={!isHovered ? 'แผงควบคุม' : ''}
                  >
                    <div className="relative flex-shrink-0">
                      <ShieldCheck className="w-6 h-6" />
                    </div>
                    <div className={`flex-1 min-w-0 transition-all duration-300 ${!isHovered ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'}`}>
                      <div className="font-medium text-sm">แผงควบคุม</div>
                      <div className="text-xs opacity-60">จัดการระบบ</div>
                    </div>
                  </Link>
                </div>
              </div>
            )}
          </nav>

          {/* Sidebar Footer */}
          <div className="border-t border-slate-200">
            <div className="py-2">
              <div className={`transition-all duration-200 ${
                !isHovered ? 'flex justify-center py-3' : ''
              }`}>
                <Link
                  to="/settings"
                  className={`flex items-center text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors ${
                    !isHovered ? 'p-3' : 'px-4 py-2 mx-2 space-x-2'
                  }`}
                  title={!isHovered ? "ตั้งค่า" : ''}
                >
                  <Settings className="w-6 h-6" />
                  <span className={`text-sm transition-all duration-300 ${!isHovered ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'}`}>ตั้งค่า</span>
                </Link>
              </div>
            </div>
            {isHovered && (
              <div className="px-4 pb-4 transition-all duration-300">
                <button
                  onClick={onLogout}
                  className="w-full flex items-center justify-center px-3 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                >
                  ออกจากระบบ
                </button>
              </div>
            )}
          </div>
        </aside>

        {/* Desktop Main Content - เอา header ออก */}
        <div 
          className="flex flex-col bg-slate-50"
          style={{ 
            width: `calc(100vw - ${sidebarWidth})`, 
            height: '100vh',
            overflow: 'hidden'
          }}
        >
          <main 
            className="overflow-auto bg-gradient-to-br from-slate-50 to-slate-100"
            style={{ 
              height: '100vh',
              width: '100%'
            }}
          >
            <div className="p-6">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    );
  }

  // Tablet Layout
  if (screenSize === 'tablet') {
    return (
      <div className="flex min-h-screen w-full bg-gradient-to-br from-slate-50 to-slate-100">
        {/* Enhanced Tablet Sidebar */}
        <aside className="w-20 bg-white border-r border-slate-200/50 shadow-xl flex-shrink-0">
          <div className="p-4 border-b border-slate-200">
            <div className="w-12 h-12">
              <img 
                src={logo || "/logo.png"} 
                alt="Logo" 
                className="w-12 h-12 rounded-xl shadow-md object-cover"
                onError={(e) => {
                  console.error('Logo failed to load:', e);
                  e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQ4IiBoZWlnaHQ9IjQ4IiByeD0iMTIiIGZpbGw9IiMzNzMzZGMiLz4KPHRleHQgeD0iMjQiIHk9IjI4IiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5DPC90ZXh0Pgo8L3N2Zz4=';
                }}
              />
            </div>
          </div>
          <nav className="p-2 space-y-2">
            {navigationItems.map((item) => (
              <Link
                key={item.key}
                to={item.to}
                className={`flex flex-col items-center space-y-1 px-2 py-3 rounded-xl transition-all duration-200 group ${
                  isActive(item.to)
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg transform scale-105'
                    : 'text-slate-600 hover:bg-slate-100 hover:transform hover:scale-105'
                }`}
                title={item.label}
              >
                <div className="relative">
                  <item.icon className="w-6 h-6 transition-transform group-hover:scale-110" />
                  {item.badge && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
                  )}
                </div>
                <span className="text-xs font-medium truncate w-full text-center">
                  {item.label}
                </span>
              </Link>
            ))}
          </nav>
        </aside>

        {/* Tablet Main Content */}
        <div className="flex-1 flex flex-col min-h-screen">
          <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200/50 px-4 py-3 flex-shrink-0 shadow-sm">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-slate-800">{currentPage.label}</h2>
              <div className="flex items-center space-x-3">
                <button
                  onClick={onOpenNotifications}
                  className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <Bell className="w-5 h-5" />
                  <div className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                </button>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-slate-600 hidden sm:block">
                    {`${user?.prefix || ''} ${user?.firstname || ''} ${user?.lastname || ''}`.trim()}
                  </span>
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center">
                    <CircleUserRound className="w-5 h-5 text-white" />
                  </div>
                </div>
              </div>
            </div>
          </header>
          <main className="flex-1 p-4 overflow-auto w-full bg-gradient-to-br from-slate-50 to-slate-100">
            <Outlet />
          </main>
        </div>

        {/* Enhanced Floating On-Duty Button for Tablet */}
        <Link
          to="/on-duty"
          className="fixed bottom-6 right-6 z-30 group"
          aria-label="เข้าเวร / รายงานตัว"
        >
          <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-blue-700 text-yellow-400 rounded-2xl shadow-2xl hover:shadow-3xl hover:from-blue-700 hover:to-blue-800 transform group-hover:scale-110 transition-all duration-300">
            <ShieldAlert className="w-7 h-7" />
          </div>
        </Link>
      </div>
    );
  }

  // Mobile Layout
  return (
    <>
      {/* Floating On-Duty Button */}
      <Link
        to="/on-duty"
        className="fixed bottom-20 right-3 z-30"
        aria-label="เข้าเวร / รายงานตัว"
      >
        <div className="flex items-center justify-center w-12 h-12 bg-blue-700 text-yellow-400 rounded-xl shadow-lg active:bg-blue-800 active:scale-95 transition-transform duration-200">
          <ShieldAlert className="w-5 h-5" />
        </div>
      </Link>

      <div className="absolute inset-0 w-full min-h-screen bg-transparent z-0">
        {/* Mobile Topbar - สร้างใหม่ในไฟล์เดียวกัน */}
        <div className="fixed top-0 left-0 right-0 z-50">
          <header className="w-full bg-white/90 backdrop-blur-md border-b border-blue-100 shadow-xl px-4 py-3 flex items-center justify-between rounded-b-2xl">
            <div className="flex items-center space-x-3">
              {logo ? (
                <img 
                  src={logo} 
                  alt="App Logo" 
                  className="h-8 w-8 object-contain drop-shadow-lg rounded-lg" 
                />
              ) : (
                <div className="w-8 h-8 bg-blue-700 rounded-lg flex items-center justify-center">
                  <div className="w-5 h-5 bg-yellow-400 rounded-sm"></div>
                </div>
              )}
              <div className="flex flex-col">
                <span className="text-lg font-bold text-blue-900 leading-tight">{appName}</span>
                <span className="text-xs text-blue-600 leading-tight">{currentPage.label}</span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={onOpenNotifications}
                className="relative p-1.5 text-blue-700 hover:text-blue-900 hover:bg-blue-100 rounded-lg transition-colors"
                aria-label="แจ้งเตือน"
              >
                <Bell className="w-5 h-5" />
                <div className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              </button>
              <button
                onClick={() => setShowMobileSettings(true)}
                className="p-1.5 text-blue-700 hover:text-blue-900 hover:bg-blue-100 rounded-lg transition-colors"
                aria-label="ตั้งค่า"
              >
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </header>
        </div>

        {/* Mobile Settings Panel */}
        {showMobileSettings && (
          <div className="fixed inset-0 bg-black/50 z-50" onClick={closeMobileMenus}>
            <div className="fixed inset-y-0 right-0 w-72 bg-white shadow-2xl rounded-l-xl" onClick={(e) => e.stopPropagation()}>
              <div className="p-3 border-b border-blue-100">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-semibold text-blue-900">โปรไฟล์</h2>
                  <button
                    onClick={closeMobileMenus}
                    className="p-1.5 text-blue-400 hover:text-blue-700 hover:bg-blue-100 rounded-lg"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="p-3">
                <div className="flex items-center space-x-3 p-3 bg-blue-50 border border-blue-100 rounded-xl shadow-sm">
                  <div className="w-12 h-12 bg-blue-700 rounded-xl flex items-center justify-center flex-shrink-0">
                    <CircleUserRound className="w-6 h-6 text-yellow-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-semibold text-blue-900 truncate">
                      {`${user?.prefix || ''} ${user?.firstname || ''} ${user?.lastname || ''}`.trim() || "ผู้ใช้งาน"}
                    </h3>
                    <p className="text-xs text-blue-700 truncate">{user?.position || "เจ้าหน้าที่"}</p>
                    <p className="text-xs text-blue-400 truncate">{user?.phone || "ไม่ระบุ"}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Mobile Main Content */}
        <main className="w-full min-h-screen overflow-auto p-0 m-0" style={{ paddingTop: '3.5rem', paddingBottom: '5rem' }}>
          <div className="px-3 py-2">
            <Outlet />
          </div>
        </main>

        {/* Mobile Bottom Navigation */}
        <nav className="fixed bottom-2 left-2 right-2 bg-white/95 backdrop-blur-md border border-blue-100 rounded-xl shadow-lg px-2 py-1.5 z-40">
          <div className="flex items-center justify-around">
            {navigationItems.slice(0, 5).map((item) => (
              <Link
                key={item.key}
                to={item.to}
                className={`flex flex-col items-center py-1.5 px-2 rounded-lg transition-all duration-200 relative transform active:scale-95 no-underline min-w-0 ${
                  isActive(item.to) ? 'text-blue-700 font-semibold' : 'text-blue-400'
                }`}
              >
                <div className="relative">
                  <item.icon className="w-5 h-5" />
                  {item.badge && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-400 rounded-full">
                      <Dot className="w-2 h-2 text-blue-900" />
                    </span>
                  )}
                </div>
                <span className={`text-xs font-medium transition-all duration-200 truncate max-w-full ${
                  isActive(item.to) ? 'text-blue-900' : 'text-blue-400'
                }`}> 
                  {item.label}
                </span>
                <div className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 w-1/2 bg-yellow-400 rounded-full transition-transform duration-300 ease-out ${
                  isActive(item.to) ? 'scale-x-100' : 'scale-x-0'
                }`} />
              </Link>
            ))}
          </div>
        </nav>
      </div>
    </>
  );
}
