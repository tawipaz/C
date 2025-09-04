// src/config.js
const isDevelopment = window.location.hostname === 'localhost';

// API Base URL - เปลี่ยนเป็น Render API
const API_BASE_URL = "https://cmc-api-2sev.onrender.com";

export const CONFIG = {
  // LINE Configuration
  LINE_CLIENT_ID: process.env.REACT_APP_LINE_CLIENT_ID || "2007949740",

  // API Base URL
  API_BASE_URL: API_BASE_URL,
  
  OFFICERS_API: `${API_BASE_URL}/api/officers`,
  UNITS_API: `${API_BASE_URL}/api/units`,
  SCHEDULES_API: `${API_BASE_URL}/api/schedules`,
  LOGS_API: `${API_BASE_URL}/api/logs`,
  ADMIN_API: `${API_BASE_URL}/api/admin`,
  AUTH_API: `${API_BASE_URL}/api/auth`,
  UNIT_STRUCTURE_API: `${API_BASE_URL}/api/unit_structure`,
  
  // Redirect URI
  REDIRECT_URI: isDevelopment
    ? (process.env.REACT_APP_LINE_REDIRECT_URI_DEV || "http://localhost:3000")
    : (process.env.REACT_APP_LINE_REDIRECT_URI_PROD || "https://courtmarshal.rf.gd"),
};