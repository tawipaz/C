import React, { useState, useEffect } from 'react';
import { X, Save, ArrowUp, ArrowDown, User, Crown, Star } from 'lucide-react';
import { CONFIG } from '../../config';
import { useAlert } from '../common/AlertSystem';

// Modal สำหรับจัดเรียงลำดับอาวุโสในแต่ละส่วนงาน
const ReorderMembersModal = ({ 
  unitCode, 
  unitName, 
  members: initialMembers, 
  onClose, 
  onSave 
}) => {
  const { success, error } = useAlert();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialMembers) {
      // เรียงตามลำดับอาวุโสปัจจุบัน
      const sortedMembers = [...initialMembers].sort((a, b) => a.seniority_order - b.seniority_order);
      setMembers(sortedMembers);
    }
  }, [initialMembers]);

  const moveUp = (index) => {
    if (index === 0) return;
    
    const newMembers = [...members];
    [newMembers[index], newMembers[index - 1]] = [newMembers[index - 1], newMembers[index]];
    setMembers(newMembers);
  };

  const moveDown = (index) => {
    if (index === members.length - 1) return;
    
    const newMembers = [...members];
    [newMembers[index], newMembers[index + 1]] = [newMembers[index + 1], newMembers[index]];
    setMembers(newMembers);
  };

  const handleSave = async () => {
    setLoading(true);

    try {
      // อัปเดตลำดับอาวุโสของแต่ละคน
      const updates = members.map((member, index) => ({
        id: member.id,
        seniority_order: index + 1
      }));

      // ส่ง API เพื่ออัปเดตทีละคน
      for (const update of updates) {
        const response = await fetch(`${CONFIG.UNIT_STRUCTURE_API}/${update.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ seniority_order: update.seniority_order })
        });

        const data = await response.json();
        if (!data.success) {
          throw new Error(data.message || 'เกิดข้อผิดพลาดในการอัปเดต');
        }
      }

      success('จัดเรียงลำดับอาวุโสสำเร็จ');
      onSave();
      onClose();
    } catch (err) {
      console.error('Error reordering members:', err);
      error('เกิดข้อผิดพลาดในการจัดเรียงลำดับอาวุโส');
    } finally {
      setLoading(false);
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'director':
        return <Crown className="w-4 h-4 text-purple-600" />;
      case 'supervisor':
        return <Star className="w-4 h-4 text-blue-600" />;
      default:
        return <User className="w-4 h-4 text-green-600" />;
    }
  };

  const getRoleText = (role) => {
    switch (role) {
      case 'director':
        return 'ผู้อำนวยการ';
      case 'supervisor':
        return 'หัวหน้าส่วน';
      default:
        return 'เจ้าหน้าที่';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-2xl w-full p-6 max-h-[80vh] overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">
            จัดเรียงลำดับอาวุโส - {unitName}
          </h3>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="text-sm text-slate-600 mb-4">
          ลากหรือใช้ปุ่มลูกศรเพื่อจัดเรียงลำดับอาวุโส (บนสุด = อาวุโสมากที่สุด)
        </div>

        <div className="flex-1 overflow-y-auto mb-6">
          <div className="space-y-2">
            {members.map((member, index) => (
              <div
                key={member.id}
                className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border"
              >
                <div className="flex items-center flex-1">
                  <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-sm font-semibold text-indigo-700">
                      {index + 1}
                    </span>
                  </div>
                  
                  <div className="flex items-center mr-3">
                    {getRoleIcon(member.role)}
                  </div>

                  <div className="flex-1">
                    <div className="font-medium">
                      {member.prefix} {member.firstname} {member.lastname}
                    </div>
                    <div className="text-sm text-slate-500">
                      {getRoleText(member.role)} • {member.position_number}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => moveUp(index)}
                    disabled={index === 0}
                    className="p-1 text-slate-400 hover:text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => moveDown(index)}
                    disabled={index === members.length - 1}
                    className="p-1 text-slate-400 hover:text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200"
            disabled={loading}
          >
            ยกเลิก
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                กำลังบันทึก...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                บันทึกการเรียง
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReorderMembersModal;
