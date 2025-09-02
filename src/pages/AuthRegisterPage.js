// ================================
// File: src/pages/AuthRegisterPage.js
// ระบบ Login + Register with SQL Backend (CSS-in-JS)
// ================================
import React, { useEffect, useState, useRef } from "react";
import { User, Lock, UserPlus, AlertCircle, CheckCircle, Clock, ArrowLeft, Mail, Phone, Calendar, Briefcase, Building } from "lucide-react";
import { CONFIG } from '../config'; // หรือ './path/to/config.js'
import courtLogo from '../assets/logo.png'; // <--- เพิ่มบรรทัดนี้

const digits = (s) => String(s || "").replace(/[^0-9]/g, "");

// =================== STYLES ===================
const styles = {
  wrapper: {
    position: 'relative',
    height: '100vh',
    width: '100vw',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  },
  
  canvas: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    zIndex: 1,
    pointerEvents: 'none',
  },
  
  card: {
    position: 'relative',
    zIndex: 2,
    width: '100%',
    maxWidth: '480px',
    maxHeight: '90vh',
    overflowY: 'auto',
    padding: '32px 28px',
    borderRadius: '24px',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
    background: 'rgba(255,255,255,0.95)',
    border: '1px solid rgba(255,255,255,0.3)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
  },
  
  cardLoading: {
    '& .card-body': {
      opacity: 0,
      pointerEvents: 'none',
    }
  },
  
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '14px',
    background: 'rgba(15,23,42,0.4)',
    borderRadius: 'inherit',
    opacity: 0,
    pointerEvents: 'none',
    transition: 'opacity 0.2s ease',
    zIndex: 10,
  },
  
  overlayVisible: {
    opacity: 1,
    pointerEvents: 'auto',
  },
  
  loader: {
    position: 'relative',
    width: '72px',
    height: '72px',
  },
  
  ring: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: '50%',
    border: '4px solid rgba(255,255,255,0.35)',
    borderTopColor: '#ffffff',
    animation: 'spin 0.9s linear infinite',
    boxShadow: '0 0 18px rgba(255,255,255,0.6)',
  },
  
  loadingText: {
    color: '#f1f5f9',
    fontWeight: 700,
    textShadow: '0 2px 4px rgba(0,0,0,0.5)',
  },
  
  title: {
    fontSize: '1.5rem',
    fontWeight: 800,
    textAlign: 'center',
    margin: '8px 0 4px',
    color: '#1e293b',
  },
  
  titleMain: {
    fontSize: '2rem',
    marginBottom: '8px',
  },
  
  subtitle: {
    color: '#64748b',
    textAlign: 'center',
    margin: '0 0 24px',
    fontSize: '0.95rem',
  },
  
  formGroup: {
    marginBottom: '16px',
  },
  
  inputWrap: {
    position: 'relative',
    marginBottom: '14px',
  },
  
  input: {
    width: '100%',
    border: '2px solid #e2e8f0',
    background: '#ffffff',
    borderRadius: '12px',
    padding: '12px 16px',
    fontSize: '1rem',
    outline: 'none',
    transition: 'all 0.2s ease',
    boxSizing: 'border-box',
  },
  
  inputWithIcon: {
    paddingLeft: '44px',
  },
  
  inputFocus: {
    borderColor: '#667eea',
    boxShadow: '0 0 0 3px rgba(102,126,234,0.1)',
  },
  
  inputIcon: {
    position: 'absolute',
    left: '14px',
    top: '50%',
    transform: 'translateY(-50%)',
    width: '20px',
    height: '20px',
    color: '#94a3b8',
    pointerEvents: 'none',
  },
  
  errorBox: {
    background: '#fef2f2',
    color: '#dc2626',
    padding: '12px 14px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '16px',
    fontSize: '0.9rem',
  },
  
  button: {
    width: '100%',
    border: 'none',
    borderRadius: '12px',
    padding: '12px 20px',
    fontWeight: 700,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    marginBottom: '12px',
    fontSize: '0.95rem',
  },
  
  buttonBig: {
    padding: '14px 20px',
    fontSize: '1.05rem',
  },
  
  buttonPrimary: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: '#fff',
  },
  
  buttonSuccess: {
    background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
    color: '#fff',
  },
  
  buttonRegister: {
    background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
    color: '#fff',
  },
  
  buttonGray: {
    background: '#f1f5f9',
    color: '#475569',
  },
  
  buttonBack: {
    background: 'transparent',
    border: 'none',
    color: '#64748b',
    padding: '8px',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    width: 'auto',
  },
  
  divider: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    color: '#94a3b8',
    fontWeight: 600,
    margin: '20px 0',
    fontSize: '0.9rem',
  },
  
  dividerLine: {
    content: '""',
    height: '1px',
    background: '#e2e8f0',
    flex: 1,
  },
  
  regHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '20px',
  },
  
  stepsIndicator: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '24px',
    position: 'relative',
  },
  
  stepsLine: {
    position: 'absolute',
    top: '16px',
    left: '10%',
    right: '10%',
    height: '2px',
    background: '#e2e8f0',
    zIndex: 0,
  },
  
  step: {
    position: 'relative',
    zIndex: 1,
    textAlign: 'center',
    flex: 1,
  },
  
  stepNum: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    background: '#f1f5f9',
    color: '#94a3b8',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 4px',
    fontWeight: 700,
    fontSize: '0.9rem',
    border: '2px solid #e2e8f0',
  },
  
  stepNumActive: {
    background: '#667eea',
    color: '#fff',
    borderColor: '#667eea',
  },
  
  stepNumDone: {
    background: '#22c55e',
    color: '#fff',
    borderColor: '#22c55e',
  },
  
  stepLabel: {
    fontSize: '0.75rem',
    color: '#94a3b8',
  },
  
  stepLabelActive: {
    color: '#667eea',
    fontWeight: 600,
  },
  
  formStep: {
    animation: 'fadeIn 0.3s ease',
  },
  
  stepTitle: {
    fontSize: '1.1rem',
    fontWeight: 700,
    color: '#334155',
    marginBottom: '20px',
  },
  
  formRow: {
    display: 'flex',
    gap: '12px',
    marginBottom: '16px',
  },
  
  formField: {
    flex: 1,
  },
  
  formFieldFull: {
    flex: '1 1 100%',
  },
  
  label: {
    display: 'block',
    fontSize: '0.9rem',
    fontWeight: 600,
    color: '#475569',
    marginBottom: '6px',
  },
  
  formActions: {
    display: 'flex',
    gap: '12px',
    marginTop: '24px',
  },
  
  formInfo: {
    background: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    padding: '16px',
    margin: '20px 0',
  },
  
  successPane: {
    textAlign: 'center',
    padding: '20px 0',
  },
  
  successIcon: {
    color: '#22c55e',
    marginBottom: '20px',
    display: 'flex',
    justifyContent: 'center',
  },
  
  successMessage: {
    margin: '20px 0',
  },
  
  statusCard: {
    background: '#fef3c7',
    border: '1px solid #fde68a',
    color: '#92400e',
    borderRadius: '12px',
    padding: '12px 20px',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '10px',
    margin: '20px auto',
    fontWeight: 600,
  },
  
  noteText: {
    marginTop: '20px',
    fontSize: '0.85rem',
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 1.5,
  },
};

// Add keyframes
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  body.no-scroll-auth {
    height: 100%;
    overflow: hidden;
    overscroll-behavior: none;
  }
`;
document.head.appendChild(styleSheet);

// =================== COMPONENT ===================
export default function AuthRegisterPage({ onLoginSuccess }) {
  const [view, setView] = useState("login"); // 'login' | 'register' | 'success'
  const [loading, setLoading] = useState(false);
  
  // LOGIN
  const [loginData, setLoginData] = useState({ username: "", password: "" });
  const [loginError, setLoginError] = useState("");

  // REGISTER
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
    appointment_method: "สอบแข่งขัน",
    username: "",
    password: "",
    confirmPassword: ""
  });
  
  const [regError, setRegError] = useState("");
  const [currentStep, setCurrentStep] = useState(1);

  // Scope styles
  useEffect(() => {
    document.body.classList.add("no-scroll-auth");
    return () => document.body.classList.remove("no-scroll-auth");
  }, []);

  // Canvas particles
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let rafId;

    const dpr = Math.max(1, window.devicePixelRatio || 1);
    function resize() {
      const { innerWidth: w, innerHeight: h } = window;
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    let particles = [];
    function makeParticles() {
      const { innerWidth: w, innerHeight: h } = window;
      const n = Math.min(140, Math.floor((w * h) / 14000));
      particles = Array.from({ length: n }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: 1.0 + Math.random() * 2.2,
        a: 0.4 + Math.random() * 0.6,
        vx: (Math.random() - 0.5) * 0.6,
        vy: (Math.random() - 0.5) * 0.6,
        hue: Math.floor(200 + Math.random() * 120),
      }));
    }

    function draw() {
      const { innerWidth: w, innerHeight: h } = window;
      ctx.clearRect(0, 0, w, h);

      const g = ctx.createRadialGradient(
        w * 0.5, h * 0.5, Math.min(w, h) * 0.1,
        w * 0.5, h * 0.5, Math.max(w, h) * 0.8
      );
      g.addColorStop(0, "rgba(255,255,255,0.07)");
      g.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);

      for (const p of particles) {
        p.x += p.vx; p.y += p.vy;
        if (p.x < -5) p.x = w + 5; else if (p.x > w + 5) p.x = -5;
        if (p.y < -5) p.y = h + 5; else if (p.y > h + 5) p.y = -5;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, 90%, 65%, ${p.a})`;
        ctx.shadowColor = `hsla(${p.hue}, 100%, 70%, ${Math.min(0.8, p.a + 0.2)})`;
        ctx.shadowBlur = 18;
        ctx.fill();
      }
      rafId = requestAnimationFrame(draw);
    }

    function handleResize() { resize(); makeParticles(); }
    resize(); makeParticles(); draw();
    window.addEventListener("resize", handleResize);
    return () => { cancelAnimationFrame(rafId); window.removeEventListener("resize", handleResize); };
  }, []);

  // =================== API CALLS ===================
  const API_URL = process.env.REACT_APP_API_URL || 'https://courtmarshal.rf.gd/api';

  const handleLogin = async () => {
    if (!loginData.username || !loginData.password) {
      setLoginError("กรุณากรอก Username และ Password");
      return;
    }

    setLoading(true);
    setLoginError("");
    
    try {
      const response = await fetch(CONFIG.OFFICERS_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData)
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        if (data.user.status === 'pending') {
          setLoginError("บัญชีของคุณอยู่ระหว่างรอการอนุมัติจากผู้ดูแลระบบ");
          return;
        }
        
        if (data.user.status === 'rejected') {
          setLoginError("บัญชีของคุณไม่ได้รับการอนุมัติ กรุณาติดต่อผู้ดูแลระบบ");
          return;
        }
        
        // Save token if provided
        if (data.token) {
          localStorage.setItem('authToken', data.token);
        }
        
        onLoginSuccess && onLoginSuccess(data.user);
      } else {
        setLoginError(data.message || "Username หรือ Password ไม่ถูกต้อง");
      }
    } catch (error) {
      setLoginError("เกิดข้อผิดพลาดในการเชื่อมต่อ");
    } finally {
      setLoading(false);
    }
  };

  const validateStep = (step) => {
    setRegError("");
    
    if (step === 1) {
      if (!regData.firstname || !regData.lastname) {
        setRegError("กรุณากรอกชื่อ-นามสกุล");
        return false;
      }
      if (!regData.phone || regData.phone.length !== 10) {
        setRegError("กรุณากรอกเบอร์โทรศัพท์ให้ครบ 10 หลัก");
        return false;
      }
      if (!regData.email || !regData.email.includes('@')) {
        setRegError("กรุณากรอกอีเมลให้ถูกต้อง");
        return false;
      }
      if (!regData.dob) {
        setRegError("กรุณาเลือกวันเดือนปีเกิด");
        return false;
      }
    }
    
    if (step === 2) {
      if (!regData.position) {
        setRegError("กรุณากรอกตำแหน่ง");
        return false;
      }
      if (!regData.affiliation) {
        setRegError("กรุณากรอกสังกัด");
        return false;
      }
      if (!regData.department) {
        setRegError("กรุณากรอกแผนก/ฝ่าย");
        return false;
      }
    }
    
    if (step === 3) {
      if (!regData.username || regData.username.length < 4) {
        setRegError("Username ต้องมีอย่างน้อย 4 ตัวอักษร");
        return false;
      }
      if (!regData.password || regData.password.length < 6) {
        setRegError("Password ต้องมีอย่างน้อย 6 ตัวอักษร");
        return false;
      }
      if (regData.password !== regData.confirmPassword) {
        setRegError("Password ไม่ตรงกัน");
        return false;
      }
    }
    
    return true;
  };

  const submitRegistration = async () => {
    if (!validateStep(3)) return;

    setLoading(true);
    setRegError("");
    
    try {
      const submitData = { ...regData };
      delete submitData.confirmPassword;
      
    const response = await fetch(CONFIG.OFFICERS_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...submitData,
        action: 'register'  // เพิ่ม action
      })
    });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        setView("success");
      } else {
        setRegError(data.message || "ไม่สามารถสมัครสมาชิกได้");
      }
    } catch (error) {
      setRegError("เกิดข้อผิดพลาดในการส่งข้อมูล");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setView("login");
    setCurrentStep(1);
    setRegError("");
    setLoginError("");
    setRegData({
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
      appointment_method: "สอบแข่งขัน",
      username: "",
      password: "",
      confirmPassword: ""
    });
  };

  return (
    <div style={styles.wrapper}>
      <canvas ref={canvasRef} style={styles.canvas} />
      
      <div style={{...styles.card, ...(loading && {opacity: 0.7})}}>
        {/* Overlay Loader */}
        <div style={{...styles.overlay, ...(loading && styles.overlayVisible)}}>
          <div style={styles.loader}>
            <div style={styles.ring} />
          </div>
          <div style={styles.loadingText}>กำลังดำเนินการ...</div>
        </div>

        <div className="card-body">
          {/* Login View */}
          {view === "login" && (
            <div>
              {/* === ส่วนที่เพิ่มเข้ามา === */}
              <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <img 
                  src={courtLogo} 
                  alt="Court Marshal Logo" 
                  style={{ width: '240px', margin: '0 auto' }} 
                />
              </div>
              {/* ======================= */}

              <p style={styles.subtitle}></p>
              {loginError && (
                <div style={styles.errorBox}>
                  <AlertCircle size={20} /> {loginError}
                </div>
              )}

              <div style={styles.formGroup}>
                <div style={styles.inputWrap}>
                  <User style={styles.inputIcon} />
                  <input
                    type="text"
                    value={loginData.username}
                    onChange={(e) => setLoginData({...loginData, username: e.target.value})}
                    placeholder="Username"
                    style={{...styles.input, ...styles.inputWithIcon}}
                    disabled={loading}
                    onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                  />
                </div>

                <div style={styles.inputWrap}>
                  <Lock style={styles.inputIcon} />
                  <input
                    type="password"
                    value={loginData.password}
                    onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                    placeholder="Password"
                    style={{...styles.input, ...styles.inputWithIcon}}
                    disabled={loading}
                    onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                  />
                </div>
              </div>

              <button 
                style={{...styles.button, ...styles.buttonBig, ...styles.buttonPrimary}}
                onClick={handleLogin} 
                disabled={loading}
              >
                {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
              </button>

              <div style={styles.divider}>
                <span style={styles.dividerLine} />
                <span>ข้าราชการใหม่?</span>
                <span style={styles.dividerLine} />
              </div>

              <button
                style={{...styles.button, ...styles.buttonBig, ...styles.buttonRegister}}
                onClick={() => { if (!loading) { setView("register"); setCurrentStep(1); setLoginError(""); } }}
                disabled={loading}
              >
                <UserPlus size={20} /> สมัครสมาชิกใหม่
              </button>
              
              <p style={styles.noteText}>
                * สำหรับข้าราชการที่พึ่งบรรจุ กรุณาสมัครสมาชิกใหม่<br/>
                * ข้าราชการเดิมใช้ Username/Password ที่ได้รับจากระบบ
              </p>
            </div>
          )}

          {/* Register View */}
          {view === "register" && (
            <div>
              <div style={styles.regHeader}>
                <button style={styles.buttonBack} onClick={resetForm} disabled={loading}>
                  <ArrowLeft size={16} /> กลับ
                </button>
                <h2 style={{...styles.title, flex: 1}}>สมัครสมาชิกใหม่</h2>
              </div>

              {/* Progress Steps */}
              <div style={styles.stepsIndicator}>
                <div style={styles.stepsLine} />
                {[
                  { num: 1, label: "ข้อมูลส่วนตัว" },
                  { num: 2, label: "ข้อมูลการทำงาน" },
                  { num: 3, label: "ตั้งรหัสผ่าน" }
                ].map((step) => (
                  <div key={step.num} style={styles.step}>
                    <div style={{
                      ...styles.stepNum,
                      ...(currentStep >= step.num && styles.stepNumActive),
                      ...(currentStep > step.num && styles.stepNumDone)
                    }}>
                      {step.num}
                    </div>
                    <div style={{
                      ...styles.stepLabel,
                      ...(currentStep >= step.num && styles.stepLabelActive)
                    }}>
                      {step.label}
                    </div>
                  </div>
                ))}
              </div>

              {regError && (
                <div style={styles.errorBox}>
                  <AlertCircle size={20} /> {regError}
                </div>
              )}

              {/* Step 1: Personal Info */}
              {currentStep === 1 && (
                <div style={styles.formStep}>
                  <h3 style={styles.stepTitle}>ข้อมูลส่วนตัว</h3>
                  
                  <div style={styles.formRow}>
                    <div style={styles.formField}>
                      <label style={styles.label}>คำนำหน้า</label>
                      <select 
                        value={regData.prefix} 
                        onChange={(e) => setRegData({...regData, prefix: e.target.value})}
                        style={styles.input}
                        disabled={loading}
                      >
                        <option value="นาย">นาย</option>
                        <option value="นาง">นาง</option>
                        <option value="นางสาว">นางสาว</option>
                        <option value="ร.ต.">ร.ต.</option>
                        <option value="ร.ต.ต.">ร.ต.ต.</option>
                        <option value="ร.ต.อ.">ร.ต.อ.</option>
                        <option value="พ.ต.">พ.ต.</option>
                        <option value="พ.ต.ต.">พ.ต.ต.</option>
                        <option value="พ.ต.ท.">พ.ต.ท.</option>
                        <option value="พ.ต.อ.">พ.ต.อ.</option>
                      </select>
                    </div>
                  </div>

                  <div style={styles.formRow}>
                    <div style={styles.formField}>
                      <label style={styles.label}>ชื่อ *</label>
                      <input
                        type="text"
                        value={regData.firstname}
                        onChange={(e) => setRegData({...regData, firstname: e.target.value})}
                        placeholder="ชื่อ"
                        style={styles.input}
                        disabled={loading}
                      />
                    </div>
                    <div style={styles.formField}>
                      <label style={styles.label}>นามสกุล *</label>
                      <input
                        type="text"
                        value={regData.lastname}
                        onChange={(e) => setRegData({...regData, lastname: e.target.value})}
                        placeholder="นามสกุล"
                        style={styles.input}
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <div style={styles.formRow}>
                    <div style={styles.formField}>
                      <label style={styles.label}>เบอร์โทรศัพท์ *</label>
                      <input
                        type="tel"
                        value={regData.phone}
                        onChange={(e) => setRegData({...regData, phone: digits(e.target.value)})}
                        placeholder="08xxxxxxxx"
                        maxLength={10}
                        style={styles.input}
                        disabled={loading}
                      />
                    </div>
                    <div style={styles.formField}>
                      <label style={styles.label}>อีเมล *</label>
                      <input
                        type="email"
                        value={regData.email}
                        onChange={(e) => setRegData({...regData, email: e.target.value})}
                        placeholder="email@example.com"
                        style={styles.input}
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <div style={styles.formRow}>
                    <div style={styles.formField}>
                      <label style={styles.label}>วันเดือนปีเกิด *</label>
                      <input
                        type="date"
                        value={regData.dob}
                        onChange={(e) => setRegData({...regData, dob: e.target.value})}
                        style={styles.input}
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <div style={styles.formActions}>
                    <button 
                      style={{...styles.button, ...styles.buttonPrimary}}
                      onClick={() => validateStep(1) && setCurrentStep(2)}
                      disabled={loading}
                    >
                      ถัดไป
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2: Work Info */}
              {currentStep === 2 && (
                <div style={styles.formStep}>
                  <h3 style={styles.stepTitle}>ข้อมูลการทำงาน</h3>
                  
                  <div style={styles.formRow}>
                    <div style={{...styles.formField, ...styles.formFieldFull}}>
                      <label style={styles.label}>ตำแหน่ง *</label>
                      <input
                        type="text"
                        value={regData.position}
                        onChange={(e) => setRegData({...regData, position: e.target.value})}
                        placeholder="ตำแหน่งงาน"
                        style={styles.input}
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <div style={styles.formRow}>
                    <div style={{...styles.formField, ...styles.formFieldFull}}>
                      <label style={styles.label}>สังกัด *</label>
                      <input
                        type="text"
                        value={regData.affiliation}
                        onChange={(e) => setRegData({...regData, affiliation: e.target.value})}
                        placeholder="หน่วยงานที่สังกัด"
                        style={styles.input}
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <div style={styles.formRow}>
                    <div style={styles.formField}>
                      <label style={styles.label}>แผนก/ฝ่าย *</label>
                      <input
                        type="text"
                        value={regData.department}
                        onChange={(e) => setRegData({...regData, department: e.target.value})}
                        placeholder="แผนก/ฝ่าย"
                        style={styles.input}
                        disabled={loading}
                      />
                    </div>
                    <div style={styles.formField}>
                      <label style={styles.label}>รุ่น</label>
                      <input
                        type="text"
                        value={regData.generation}
                        onChange={(e) => setRegData({...regData, generation: e.target.value})}
                        placeholder="รุ่นที่"
                        style={styles.input}
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <div style={styles.formRow}>
                    <div style={{...styles.formField, ...styles.formFieldFull}}>
                      <label style={styles.label}>วิธีการบรรจุ</label>
                      <select 
                        value={regData.appointment_method} 
                        onChange={(e) => setRegData({...regData, appointment_method: e.target.value})}
                        style={styles.input}
                        disabled={loading}
                      >
                        <option value="สอบแข่งขัน">สอบแข่งขัน</option>
                        <option value="รับโอนจากหน่วยงานอื่น">รับโอนจากหน่วยงานอื่น</option>
                        <option value="บรรจุใหม่">บรรจุใหม่</option>
                        <option value="อื่นๆ">อื่นๆ</option>
                      </select>
                    </div>
                  </div>

                  <div style={styles.formActions}>
                    <button 
                      style={{...styles.button, ...styles.buttonGray}}
                      onClick={() => setCurrentStep(1)}
                      disabled={loading}
                    >
                      ย้อนกลับ
                    </button>
                    <button 
                      style={{...styles.button, ...styles.buttonPrimary}}
                      onClick={() => validateStep(2) && setCurrentStep(3)}
                      disabled={loading}
                    >
                      ถัดไป
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Set Password */}
              {currentStep === 3 && (
                <div style={styles.formStep}>
                  <h3 style={styles.stepTitle}>ตั้ง Username และ Password</h3>
                  
                  <div style={styles.formRow}>
                    <div style={{...styles.formField, ...styles.formFieldFull}}>
                      <label style={styles.label}>Username * (อย่างน้อย 4 ตัวอักษร)</label>
                      <input
                        type="text"
                        value={regData.username}
                        onChange={(e) => setRegData({...regData, username: e.target.value.toLowerCase()})}
                        placeholder="username"
                        style={styles.input}
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <div style={styles.formRow}>
                    <div style={{...styles.formField, ...styles.formFieldFull}}>
                      <label style={styles.label}>Password * (อย่างน้อย 6 ตัวอักษร)</label>
                      <input
                        type="password"
                        value={regData.password}
                        onChange={(e) => setRegData({...regData, password: e.target.value})}
                        placeholder="password"
                        style={styles.input}
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <div style={styles.formRow}>
                    <div style={{...styles.formField, ...styles.formFieldFull}}>
                      <label style={styles.label}>ยืนยัน Password *</label>
                      <input
                        type="password"
                        value={regData.confirmPassword}
                        onChange={(e) => setRegData({...regData, confirmPassword: e.target.value})}
                        placeholder="ยืนยัน password"
                        style={styles.input}
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <div style={styles.formInfo}>
                    <p style={{margin: '0 0 8px', fontWeight: 600, color: '#334155'}}>
                      หลังจากสมัครสมาชิก:
                    </p>
                    <ul style={{margin: 0, paddingLeft: '20px'}}>
                      <li style={{color: '#64748b', fontSize: '0.9rem', marginBottom: '4px'}}>
                        ข้อมูลของคุณจะถูกส่งให้ผู้ดูแลระบบตรวจสอบ
                      </li>
                      <li style={{color: '#64748b', fontSize: '0.9rem', marginBottom: '4px'}}>
                        คุณจะได้รับการแจ้งเตือนเมื่อได้รับการอนุมัติ
                      </li>
                      <li style={{color: '#64748b', fontSize: '0.9rem', marginBottom: '4px'}}>
                        หลังได้รับการอนุมัติจึงจะสามารถเข้าใช้งานระบบได้
                      </li>
                    </ul>
                  </div>

                  <div style={styles.formActions}>
                    <button 
                      style={{...styles.button, ...styles.buttonGray}}
                      onClick={() => setCurrentStep(2)}
                      disabled={loading}
                    >
                      ย้อนกลับ
                    </button>
                    <button 
                      style={{...styles.button, ...styles.buttonSuccess}}
                      onClick={submitRegistration}
                      disabled={loading}
                    >
                      {loading ? "กำลังส่งข้อมูล..." : "ส่งข้อมูลสมัครสมาชิก"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Success View */}
          {view === "success" && (
            <div style={styles.successPane}>
              <div style={styles.successIcon}>
                <CheckCircle size={64} />
              </div>
              <h2 style={styles.title}>สมัครสมาชิกสำเร็จ!</h2>
              <div style={styles.successMessage}>
                <p style={{margin: '8px 0', color: '#1e293b', fontWeight: 700}}>
                  ข้อมูลของคุณถูกส่งเรียบร้อยแล้ว
                </p>
                <p style={{margin: '8px 0', color: '#475569'}}>
                  กรุณารอการอนุมัติจากผู้ดูแลระบบ
                </p>
                <p style={{margin: '8px 0', color: '#94a3b8', fontSize: '0.9rem'}}>
                  ปกติใช้เวลา 1-2 วันทำการ
                </p>
              </div>
              
              <div style={styles.statusCard}>
                <Clock size={20} />
                <span>สถานะ: รอการอนุมัติ</span>
              </div>

              <button 
                style={{...styles.button, ...styles.buttonBig, ...styles.buttonPrimary}}
                onClick={resetForm}
              >
                กลับหน้าเข้าสู่ระบบ
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}