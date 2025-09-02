import React from 'react';

// A small helper component to avoid repetition and improve readability.
const ProfileDetailItem = ({ label, value }) => (
  <p>
    <strong className="font-medium text-slate-600">{label}:</strong>{' '}
    <span className="text-primary-700">{value || 'ไม่ระบุ'}</span>
  </p>
);

const ProfilePage = ({ user }) => {
  // It's good practice to handle cases where expected props might be missing.
  if (!user) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">โปรไฟล์</h2>
        <p className="text-slate-600">ไม่สามารถโหลดข้อมูลผู้ใช้ได้</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
      <div className="flex items-center mb-6">
        {/* A placeholder for a future user avatar */}
        <div className="w-16 h-16 bg-primary-100 rounded-full mr-4 flex-shrink-0"></div>
        <div>
          <h2 className="text-2xl font-bold text-slate-900">
            {`${user.prefix || ''} ${user.firstname || ''} ${user.lastname || ''}`.trim()}
          </h2>
          <p className="text-slate-500">{user.position || 'ไม่มีข้อมูลตำแหน่ง'}</p>
        </div>
      </div>
      
      <div className="mt-4 p-4 bg-primary-50 border border-primary-200 rounded-lg">
        <h3 className="font-semibold text-primary-800 mb-3 border-b border-primary-200 pb-2">ข้อมูลผู้ใช้ปัจจุบัน:</h3>
        <div className="text-sm space-y-2">
          <ProfileDetailItem label="สังกัด" value={user.affiliation} />
          <ProfileDetailItem label="แผนก" value={user.deph} />
          <ProfileDetailItem label="รุ่น" value={user.generation} />
          <ProfileDetailItem label="เบอร์โทร" value={user.phone} />
          <ProfileDetailItem label="อีเมล" value={user.email} />
          <ProfileDetailItem label="LINE ID" value={user.lineUserId} />
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;

