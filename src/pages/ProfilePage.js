import React from 'react';

const ProfilePage = ({ user }) => (
  <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
    <h2 className="text-2xl font-bold text-slate-900 mb-4">โปรไฟล์</h2>
    <p className="text-slate-600">หน้าข้อมูลส่วนตัว</p>
    <div className="mt-4 p-4 bg-primary-50 border border-primary-200 rounded-lg">
      <h3 className="font-semibold text-primary-800 mb-2">ข้อมูลผู้ใช้ปัจจุบัน:</h3>
      <div className="text-sm text-primary-700 space-y-1">
        <p><strong>คำนำหน้า:</strong> {user?.prefix || 'ไม่ระบุ'}</p>
        <p><strong>ชื่อ:</strong> {user?.firstname || 'ไม่ระบุ'}</p>
        <p><strong>นามสกุล:</strong> {user?.lastname || 'ไม่ระบุ'}</p>
        <p><strong>ตำแหน่ง:</strong> {user?.position || 'ไม่ระบุ'}</p>
        <p><strong>สังกัด:</strong> {user?.affiliation || 'ไม่ระบุ'}</p>
        <p><strong>หน่วยงาน:</strong> {user?.department || 'ไม่ระบุ'}</p>
        <p><strong>รุ่น:</strong> {user?.generation || 'ไม่ระบุ'}</p>
        <p><strong>เบอร์โทร:</strong> {user?.phone || 'ไม่ระบุ'}</p>
        <p><strong>อีเมล:</strong> {user?.email || 'ไม่ระบุ'}</p>
        <p><strong>LINE ID:</strong> {user?.lineUserId || 'ไม่ระบุ'}</p>
      </div>
    </div>
  </div>
);

export default ProfilePage;
