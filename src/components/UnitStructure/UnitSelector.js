import React, { useMemo } from 'react';
import { Building, Crown, ChevronRight } from 'lucide-react';

// Component สำหรับเลือกส่วนงาน (เหมือนเลือกตัวละครในเกม)
const UnitSelector = ({ units, unitStructures, onSelectUnit, loading }) => {
  // สร้างข้อมูลส่วนงานพร้อมสถิติ
  const unitStats = useMemo(() => {
    const stats = {};
    
    // เพิ่มส่วนงานผู้อำนวยการ
    const directorCount = unitStructures.filter(s => s.role === 'director').length;
    stats['CMD'] = {
      unit_code: 'CMD',
      unit_name: 'ผู้อำนวยการศูนย์รักษาความปลอดภัย',
      total: directorCount,
      director: directorCount,
      supervisor: 0,
      member: 0,
      isDirector: true
    };

    // สำหรับส่วนงานอื่นๆ
    units.forEach(unit => {
      const members = unitStructures.filter(s => s.unit_code === unit.unit_code);
      stats[unit.unit_code] = {
        ...unit,
        total: members.length,
        director: 0,
        supervisor: members.filter(s => s.role === 'supervisor').length,
        member: members.filter(s => s.role === 'member').length,
        isDirector: false
      };
    });

    return stats;
  }, [units, unitStructures]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-slate-500">กำลังโหลดข้อมูล...</div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-slate-50 rounded-2xl">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-slate-800 mb-2">เลือกส่วนงานที่ต้องการจัดการ</h2>
        <p className="text-slate-500">คลิกที่การ์ดส่วนงานเพื่อเข้าสู่การจัดการบุคลากร</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Object.values(unitStats).map((unit) => (
          <div
            key={unit.unit_code}
            onClick={() => onSelectUnit(unit)}
            className={`relative bg-white rounded-xl border-2 p-6 cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg group ${
              unit.isDirector 
                ? 'border-purple-200 hover:border-purple-400 bg-gradient-to-br from-purple-50 to-purple-100' 
                : 'border-indigo-200 hover:border-indigo-400 bg-gradient-to-br from-indigo-50 to-blue-100'
            }`}
          >
            {/* Icon */}
            <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
              unit.isDirector ? 'bg-purple-500' : 'bg-indigo-500'
            }`}>
              {unit.isDirector ? (
                <Crown className="w-8 h-8 text-white" />
              ) : (
                <Building className="w-8 h-8 text-white" />
              )}
            </div>

            {/* Unit Name */}
            <h3 className="text-lg font-bold text-slate-800 text-center mb-2 line-clamp-2">
              {unit.unit_name}
            </h3>

            {/* Unit Code */}
            <div className={`text-center mb-4 px-3 py-1 rounded-full text-sm font-medium ${
              unit.isDirector 
                ? 'bg-purple-200 text-purple-700' 
                : 'bg-indigo-200 text-indigo-700'
            }`}>
              {unit.unit_code}
            </div>

            {/* Statistics */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">บุคลากรทั้งหมด</span>
                <span className="font-bold text-slate-800">{unit.total} คน</span>
              </div>
              
              {unit.isDirector ? (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-purple-600">ผู้อำนวยการ</span>
                  <span className="font-bold text-purple-700">{unit.director} คน</span>
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-blue-600">หัวหน้าส่วน</span>
                    <span className="font-bold text-blue-700">{unit.supervisor} คน</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-green-600">เจ้าหน้าที่</span>
                    <span className="font-bold text-green-700">{unit.member} คน</span>
                  </div>
                </>
              )}
            </div>

            {/* Hover Effects */}
            <div className="absolute inset-0 bg-black/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
            
            {/* Arrow Icon */}
            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                unit.isDirector ? 'bg-purple-500' : 'bg-indigo-500'
              }`}>
                <ChevronRight className="w-4 h-4 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UnitSelector;
