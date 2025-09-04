import React from 'react';
import { User, Plus } from 'lucide-react';
import { CONFIG } from '../../config';
import { useAlert } from '../common/AlertSystem';

// Component สำหรับแสดงเจ้าหน้าที่ที่สามารถเพิ่มได้
const AvailableOfficerCard = ({ 
  officer, 
  selectedUnit, 
  isMultipleMode, 
  isSelected, 
  onToggleSelect, 
  onAddSingle 
}) => {
  const { success, error } = useAlert();
  const handleAddSingle = async () => {
    const defaultRole = selectedUnit.isDirector ? 'director' : 'member';
    const defaultSeniorityOrder = 1;

    try {
      const response = await fetch(`${CONFIG.UNIT_STRUCTURE_API}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          position_number: officer.position_number,
          unit_code: selectedUnit.unit_code,
          unit_name: selectedUnit.unit_name,
          role: defaultRole,
          seniority_order: defaultSeniorityOrder
        })
      });

      const data = await response.json();
      
      if (data.success) {
        success('เพิ่มบุคลากรสำเร็จ');
        onAddSingle();
      } else {
        error(data.message || data.errors?.join(', ') || 'เกิดข้อผิดพลาดในการเพิ่มบุคลากร');
      }
    } catch (err) {
      error('เกิดข้อผิดพลาดในการเชื่อมต่อ API');
    }
  };

  return (
    <div 
      className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${
        isSelected 
          ? 'bg-indigo-50 border-indigo-300' 
          : 'bg-white border-slate-200 hover:bg-slate-50'
      }`}
      onClick={() => isMultipleMode ? onToggleSelect(officer.position_number) : handleAddSingle()}
    >
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center">
          <User className="w-4 h-4 text-slate-600" />
        </div>
        <div>
          <div className="font-medium text-slate-800">
            {officer.prefix} {officer.firstname} {officer.lastname}
          </div>
          <div className="text-sm text-slate-500">
            เลขตำแหน่ง: {officer.position_number}
          </div>
        </div>
      </div>
      
      {isMultipleMode ? (
        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
          isSelected 
            ? 'bg-indigo-600 border-indigo-600' 
            : 'border-slate-300'
        }`}>
          {isSelected && <div className="w-2 h-2 bg-white rounded-full" />}
        </div>
      ) : (
        <div className="flex items-center text-indigo-600">
          <Plus className="w-4 h-4" />
        </div>
      )}
    </div>
  );
};

export default AvailableOfficerCard;
