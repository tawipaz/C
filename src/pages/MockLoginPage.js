import React, { useState } from "react";
import { User, Lock } from "lucide-react";
import courtLogo from '../assets/logo.png';

const Input = ({ icon: Icon, ...props }) => (
  <div className="relative w-full">
    {Icon && <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />}
    <input 
      {...props} 
      className={`w-full bg-white border-2 border-slate-200 rounded-xl px-4 py-3 transition-all duration-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${Icon ? 'pl-10' : ''}`}
    />
  </div>
);

export default function MockLoginPage({ onLoginSuccess }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const MOCK_USER = {
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
  };

  const handleLogin = () => {
    setError("");
    if (username === "mockuser" && password === "mockpass") {
      onLoginSuccess(MOCK_USER);
    } else {
      setError("ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง");
    }
  };

  const handleDirectMockLogin = () => {
    onLoginSuccess(MOCK_USER);
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg p-8">
        <img src={courtLogo} alt="Logo" className="w-48 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-center text-slate-800">Mock Login Page</h1>
        <p className="text-center text-slate-500 mb-8">สำหรับทดสอบการเข้าสู่ระบบ</p>
        
        {error && (
          <div className="bg-red-100 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4 flex items-center gap-2">
            <span>{error}</span>
          </div>
        )}

        <div className="space-y-4">
          <Input 
            icon={User} 
            type="text" 
            placeholder="Username (mockuser)"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <Input 
            icon={Lock} 
            type="password" 
            placeholder="Password (mockpass)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button onClick={handleLogin} className="w-full bg-indigo-600 text-white font-bold py-3 px-4 rounded-xl hover:bg-indigo-700 transition-colors duration-200 flex items-center justify-center gap-2">
            เข้าสู่ระบบ (Mock)
          </button>
        </div>

        <div className="text-center my-6 text-slate-500">หรือ</div>

        <button
          onClick={handleDirectMockLogin}
          className="w-full bg-green-600 text-white font-bold py-3 px-4 rounded-xl hover:bg-green-700 transition-colors duration-200 flex items-center justify-center gap-2"
        >
          เข้าสู่ระบบโดยตรง (Mock)
        </button>
      </div>
    </div>
  );
}
