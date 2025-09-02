// src/config.js
const isDevelopment = window.location.hostname === 'localhost';

// --- START: กำหนด API URL ใหม่ ---
const API_BASE_URL = "https://cmc-api-2sev.onrender.com"; // <-- เปลี่ยนเป็น URL ใหม่

export const CONFIG = {
  // LINE Configuration
  LINE_CLIENT_ID: process.env.REACT_APP_LINE_CLIENT_ID || "2007949740",

  // API URLs (ใช้ URL เดียวสำหรับทุก endpoint)
  API_BASE_URL: API_BASE_URL,
  OFFICERS_API: `${API_BASE_URL}/officers.php`,
  UNITS_API: `${API_BASE_URL}/units.php`,
  SCHEDULES_API: `${API_BASE_URL}/schedules.php`,

  // Redirect URI
  REDIRECT_URI: isDevelopment
    ? (process.env.REACT_APP_LINE_REDIRECT_URI_DEV || "http://localhost:3000")
    : (process.env.REACT_APP_LINE_REDIRECT_URI_PROD || "https://courtmarshal.rf.gd"),
};