import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = ({ user, authLoading, redirectPath = '/mock-login' }) => {
  // ขณะกำลังตรวจสอบข้อมูลผู้ใช้ ให้แสดงหน้าจอรอโหลด
  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-100">
        <p className="text-lg text-slate-600">ตรวจสอบสิทธิ์การใช้งาน...</p>
      </div>
    );
  }

  // ถ้าตรวจสอบเสร็จแล้วแต่ไม่พบข้อมูลผู้ใช้ ให้ส่งกลับไปหน้าล็อกอิน
  if (!user) {
    return <Navigate to={redirectPath} replace />;
  }

  // ถ้ามีข้อมูลผู้ใช้ (ล็อกอินแล้ว) ให้แสดงผล Component ลูก (ในที่นี้คือ AppLayout)
  return <Outlet />;
};

export default ProtectedRoute;