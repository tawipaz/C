// src/pages/AuthRegisterPage.js
import React, { useState, useEffect } from "react";
import { User, Lock, UserPlus, AlertCircle, CheckCircle, ArrowLeft, Mail, Phone, Calendar, Briefcase, Building } from "lucide-react";
import { CONFIG } from '../config';
import courtLogo from '../assets/logo.png';

// A simple utility for digit-only input
const digits = (s) => String(s || "").replace(/[^0-9]/g, "");

// Reusable Input Component
const Input = ({ icon: Icon, ...props }) => (
  <div className="relative w-full">
    {Icon && <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />}
    <input 
      {...props} 
      className={`w-full bg-white border-2 border-slate-200 rounded-xl px-4 py-3 transition-all duration-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${Icon ? 'pl-10' : ''}`}
    />
  </div>
);

// Main Authentication Page Component
export default function AuthRegisterPage({ onLoginSuccess }) {
  const [view, setView] = useState("login"); // 'login' | 'register' | 'success'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Login State
  const [loginData, setLoginData] = useState({ username: "", password: "" });

  // Registration State
  const [regData, setRegData] = useState({
    prefix: "นาย",
    firstname: "",
    lastname: "",
    phone: "",
    email: "",
    dob: "",
    position: "",
    affiliation: "",
    department: "",
    generation: "",
    username: "",
    password: "",
    confirmPassword: ""
  });

  // Handle LINE Login
  const handleLineLogin = () => {
    const state = Math.random().toString(36).substring(7);
    localStorage.setItem('line_login_state', state);
    const lineLoginUrl = `https://access.line.me/oauth2/v2.1/authorize?response_type=code&client_id=${CONFIG.LINE_CLIENT_ID}&redirect_uri=${CONFIG.REDIRECT_URI}&state=${state}&scope=profile%20openid%20email`;
    window.location.href = lineLoginUrl;
  };

  // Handle Username/Password Login
  const submitLogin = async (e) => {
    e.preventDefault();
    if (!loginData.username || !loginData.password) {
      setError("กรุณากรอก Username และ Password");
      return;
    }
    setLoading(true);
    setError("");

    // --- MOCK LOGIN LOGIC START ---
    if (loginData.username === "mockuser1" && loginData.password === "mockpass1") {
      onLoginSuccess({
        id: "mock-user-1",
        prefix: "นาย",
        firstname: "จำลอง",
        lastname: "ทดสอบ",
        position: "เจ้าพนักงานตำรวจศาล",
        affiliation: "สังกัดจำลอง",
        deph: "แผนกจำลอง",
        generation: "รุ่นจำลอง",
        phone: "0812345678",
        email: "mock.user1@example.com",
        lineUserId: "mock-line-id-1",
        role: "user",
      });
      setLoading(false);
      return;
    }
    // --- MOCK LOGIN LOGIC END ---

    try {
      const response = await fetch(`${CONFIG.AUTH_API}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData)
      });
      const data = await response.json();
      if (data.success) {
        onLoginSuccess(data.user);
      } else {
        setError(data.message || "Login ไม่สำเร็จ");
      }
    } catch (err) {
      setError("เกิดข้อผิดพลาดในการเชื่อมต่อ");
    }
    setLoading(false);
  };

  // Handle Registration Submission
  const submitRegistration = async (e) => {
    e.preventDefault();
    if (regData.password !== regData.confirmPassword) {
      setError("รหัสผ่านไม่ตรงกัน");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`${CONFIG.AUTH_API}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(regData)
      });
      const data = await response.json();
      if (data.success) {
        setView("success");
      } else {
        setError(data.message || "สมัครสมาชิกไม่สำเร็จ");
      }
    } catch (err) {
      setError("เกิดข้อผิดพลาดในการสมัคร");
    }
    setLoading(false);
  };

  // Reset form state
  const resetForm = () => {
    setView("login");
    setError("");
  };

  // Render different views
  const renderLogin = () => (
    <div className="w-full animate-fade-in">
      <img src={courtLogo} alt="Logo" className="w-48 mx-auto mb-4" />
      <h1 className="text-2xl font-bold text-center text-slate-800">CourtMarshalConnect</h1>
      <p className="text-center text-slate-500 mb-8">เข้าสู่ระบบสำหรับเจ้าพนักงานตำรวจศาล</p>
      
      {error && (
        <div className="bg-red-100 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4 flex items-center gap-2">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={submitLogin} className="space-y-4">
        <Input 
          icon={User} 
          type="text" 
          placeholder="Username"
          value={loginData.username}
          onChange={(e) => setLoginData({...loginData, username: e.target.value})}
          disabled={loading}
        />
        <Input 
          icon={Lock} 
          type="password" 
          placeholder="Password"
          value={loginData.password}
          onChange={(e) => setLoginData({...loginData, password: e.target.value})}
          disabled={loading}
        />
        <button type="submit" disabled={loading} className="w-full bg-indigo-600 text-white font-bold py-3 px-4 rounded-xl hover:bg-indigo-700 transition-colors duration-200 flex items-center justify-center gap-2">
          {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
        </button>
      </form>

      <div className="text-center my-6 text-slate-500">หรือ</div>

      <button onClick={() => setView('register')} className="w-full bg-slate-100 text-slate-700 font-bold py-3 px-4 rounded-xl hover:bg-slate-200 transition-colors duration-200 flex items-center justify-center gap-2">
        <UserPlus size={20} />
        สมัครสมาชิกใหม่
      </button>

      <div className="text-center my-6 text-slate-500">หรือ</div>

      <button
        onClick={() => onLoginSuccess({
          id: "mock-user-1",
          prefix: "นาย",
          firstname: "จำลอง",
          lastname: "ทดสอบ",
          position: "เจ้าพนักงานตำรวจศาล",
          affiliation: "สังกัดจำลอง",
          deph: "แผนกจำลอง",
          generation: "รุ่นจำลอง",
          phone: "0812345678",
          email: "mock.user1@example.com",
          lineUserId: "mock-line-id-1",
          role: "user",
        })}
        className="w-full bg-green-600 text-white font-bold py-3 px-4 rounded-xl hover:bg-green-700 transition-colors duration-200 flex items-center justify-center gap-2"
      >
        Mock Login (รหัส 1)
      </button>
    </div>
  );

  const renderRegister = () => (
    <div className="w-full animate-fade-in">
      <button onClick={() => setView('login')} className="text-slate-500 hover:text-slate-700 mb-4 flex items-center gap-2">
        <ArrowLeft size={16} />
        กลับไปหน้า Login
      </button>
      <h1 className="text-2xl font-bold text-slate-800 mb-4">สมัครสมาชิกใหม่</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4 flex items-center gap-2">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={submitRegistration} className="space-y-4 max-h-[65vh] overflow-y-auto pr-2">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input icon={User} placeholder="ชื่อ" value={regData.firstname} onChange={(e) => setRegData({...regData, firstname: e.target.value})} required />
          <Input icon={User} placeholder="นามสกุล" value={regData.lastname} onChange={(e) => setRegData({...regData, lastname: e.target.value})} required />
          <Input icon={Phone} type="tel" placeholder="เบอร์โทรศัพท์" value={regData.phone} onChange={(e) => setRegData({...regData, phone: digits(e.target.value)})} maxLength={10} required />
          <Input icon={Mail} type="email" placeholder="อีเมล" value={regData.email} onChange={(e) => setRegData({...regData, email: e.target.value})} required />
          <Input icon={Calendar} type="text" placeholder="วันเกิด (YYYY-MM-DD)" onFocus={(e) => e.target.type='date'} onBlur={(e) => e.target.type='text'} value={regData.dob} onChange={(e) => setRegData({...regData, dob: e.target.value})} required />
          <Input icon={Briefcase} placeholder="ตำแหน่ง" value={regData.position} onChange={(e) => setRegData({...regData, position: e.target.value})} required />
          <Input icon={Building} placeholder="สังกัด" value={regData.affiliation} onChange={(e) => setRegData({...regData, affiliation: e.target.value})} required />
          <Input icon={Building} placeholder="แผนก/ฝ่าย" value={regData.department} onChange={(e) => setRegData({...regData, department: e.target.value})} required />
          <Input icon={User} placeholder="รุ่น" value={regData.generation} onChange={(e) => setRegData({...regData, generation: e.target.value})} />
          <Input icon={User} placeholder="Username" value={regData.username} onChange={(e) => setRegData({...regData, username: e.target.value.toLowerCase()})} required />
          <Input icon={Lock} type="password" placeholder="Password" value={regData.password} onChange={(e) => setRegData({...regData, password: e.target.value})} required />
          <Input icon={Lock} type="password" placeholder="ยืนยัน Password" value={regData.confirmPassword} onChange={(e) => setRegData({...regData, confirmPassword: e.target.value})} required />
        </div>
        <button type="submit" disabled={loading} className="w-full bg-indigo-600 text-white font-bold py-3 px-4 rounded-xl hover:bg-indigo-700 transition-colors duration-200 flex items-center justify-center gap-2">
          {loading ? 'กำลังสมัคร...' : 'สมัครสมาชิก'}
        </button>
      </form>
    </div>
  );

  const renderSuccess = () => (
    <div className="w-full text-center animate-fade-in">
      <CheckCircle size={64} className="mx-auto text-green-500 mb-4" />
      <h1 className="text-2xl font-bold text-slate-800">สมัครสมาชิกสำเร็จ!</h1>
      <p className="text-slate-600 mt-2 mb-6">ข้อมูลของคุณถูกส่งให้ผู้ดูแลระบบเพื่อตรวจสอบแล้ว กรุณารอการอนุมัติ</p>
      <button onClick={resetForm} className="w-full bg-indigo-600 text-white font-bold py-3 px-4 rounded-xl hover:bg-indigo-700 transition-colors duration-200">
        กลับไปหน้า Login
      </button>
    </div>
  );

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg p-8">
        {view === 'login' && renderLogin()}
        {view === 'register' && renderRegister()}
        {view === 'success' && renderSuccess()}
      </div>
       <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.4s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
