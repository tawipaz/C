// src/config.js
const isDevelopment = window.location.hostname === 'localhost';

// API Base URL - เปลี่ยนเป็น Render API
const API_BASE_URL = "https://cmc-api-2sev.onrender.com";

export const CONFIG = {
  // LINE Configuration
  LINE_CLIENT_ID: process.env.REACT_APP_LINE_CLIENT_ID || "2007949740",

  // API Base URL
  API_BASE_URL: API_BASE_URL,
  
  // REST API Endpoints (โครงสร้างใหม่)
  AUTH_API: `${API_BASE_URL}/api/auth`,
  OFFICERS_API: `${API_BASE_URL}/api/officers`,  // ไม่ใช่ officers.php แล้ว
  UNITS_API: `${API_BASE_URL}/api/units`,        // ไม่ใช่ units.php แล้ว  
  SCHEDULES_API: `${API_BASE_URL}/api/schedules`, // ไม่ใช่ schedules.php แล้ว
  ADMIN_API: `${API_BASE_URL}/api/admin`,

  // Redirect URI
  REDIRECT_URI: isDevelopment
    ? (process.env.REACT_APP_LINE_REDIRECT_URI_DEV || "http://localhost:3000")
    : (process.env.REACT_APP_LINE_REDIRECT_URI_PROD || "https://courtmarshal.rf.gd"),
};