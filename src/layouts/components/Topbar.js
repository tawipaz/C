import React from "react";

export default function Topbar({ appName, currentPage, logo, isMobile, children }) {
  return (
    <header className={`w-full sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-blue-100 shadow-xl px-4 py-3 flex items-center justify-between ${isMobile ? "rounded-b-2xl" : "rounded-none"}`}>
      <div className="flex items-center space-x-3">
        {isMobile ? (
          <>
            <img src={logo} alt="App Logo" className="h-8 w-8 object-contain drop-shadow-lg" />
            <span className="text-lg font-bold text-blue-900">{appName}</span>
          </>
        ) : (
          <>
            <img src={logo} alt="App Logo" className="h-10 w-10 object-contain drop-shadow-lg" />
            <span className="text-2xl font-bold text-blue-900">{currentPage}</span>
          </>
        )}
      </div>
      <div className="flex items-center space-x-2">
        {children}
      </div>
    </header>
  );
}