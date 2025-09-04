import React from 'react';
import { Crown, Star, User, Trash2, Edit } from 'lucide-react';
import { CONFIG } from '../../config';
import { useAlert } from '../common/AlertSystem';

// Component สำหรับแสดงบุคลากรปัจจุบัน
const CurrentMemberCard = ({ member, onRefresh, onEdit }) => {
  const { success, error } = useAlert();
  const handleDelete = async (structureId) => {
    if (!window.confirm('คุณต้องการลบข้อมูลนี้หรือไม่?')) return;

    try {
      const response = await fetch(`${CONFIG.UNIT_STRUCTURE_API}/${structureId}`, {
        method: 'DELETE'
      });

      const data = await response.json();
      if (data.success) {
        success('ลบข้อมูลสำเร็จ');
        onRefresh();
      } else {
        error(data.message || 'เกิดข้อผิดพลาดในการลบข้อมูล');
      }
    } catch (err) {
      console.error('Error deleting structure:', err);
      error('เกิดข้อผิดพลาดในการลบข้อมูล');
    }
  };

  return (
    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border">
      <div className="flex items-center space-x-3">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
          member.role === 'director' ? 'bg-purple-100 text-purple-600' :
          member.role === 'supervisor' ? 'bg-blue-100 text-blue-600' :
          'bg-green-100 text-green-600'
        }`}>
          {member.role === 'director' ? <Crown className="w-4 h-4" /> :
           member.role === 'supervisor' ? <Star className="w-4 h-4" /> :
           <User className="w-4 h-4" />}
        </div>
        <div>
          <div className="font-medium text-slate-800">
            {member.full_name || `${member.prefix || ''} ${member.firstname || ''} ${member.lastname || ''}`.trim()}
          </div>
          <div className="text-sm text-slate-500">
            {member.role === 'director' ? 'ผู้อำนวยการ' :
             member.role === 'supervisor' ? 'หัวหน้าส่วน' :
             'เจ้าหน้าที่'} 
            {member.role !== 'director' && ` (ลำดับที่ ${member.seniority_order})`}
          </div>
        </div>
      </div>
      <div className="flex items-center space-x-1">
        <button
          onClick={() => onEdit(member)}
          className="p-1 text-slate-400 hover:text-blue-600 rounded"
          title="แก้ไข"
        >
          <Edit className="w-4 h-4" />
        </button>
        <button
          onClick={() => handleDelete(member.id)}
          className="p-1 text-slate-400 hover:text-red-600 rounded"
          title="ลบ"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default CurrentMemberCard;
