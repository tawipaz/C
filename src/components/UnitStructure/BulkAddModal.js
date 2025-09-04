import React, { useState, useMemo } from 'react';
import { X, Save, User, ArrowUp, ArrowDown } from 'lucide-react';
import { CONFIG } from '../../config';
import { useAlert } from '../common/AlertSystem';

// Modal สำหรับเพิ่มบุคลากรหลายคนพร้อมกำหนดลำดับอาวุโส
const BulkAddModal = ({ 
  selectedOfficers,
  selectedUnit, 
  officers, 
  unitStructures,
  onClose, 
  onSave 
}) => {
  // สร้าง initial data สำหรับแต่ละคนที่เลือก
  const [membersData, setMembersData] = useState(() => {
    const currentUnitMembers = unitStructures.filter(s => 
      s.unit_code === selectedUnit.unit_code
    ).sort((a, b) => a.seniority_order - b.seniority_order);

    return selectedOfficers.map((positionNumber, index) => {
      const officer = officers.find(o => o.position_number === positionNumber);
      return {
        position_number: positionNumber,
        officer: officer,
        role: 'member',
        seniority_order: currentUnitMembers.length + index + 1
      };
    });
  });

  const [loading, setLoading] = useState(false);
  
  const { success, error, warning } = useAlert();

  // Get current unit members
  const currentUnitMembers = useMemo(() => {
    return unitStructures.filter(s => 
      s.unit_code === selectedUnit.unit_code
    ).sort((a, b) => a.seniority_order - b.seniority_order);
  }, [unitStructures, selectedUnit]);

  // ตรวจสอบลำดับอาวุโสที่ซ้ำกัน
  const getDuplicateOrders = () => {
    const allOrders = [
      ...currentUnitMembers.map(m => m.seniority_order),
      ...membersData.map(m => m.seniority_order)
    ];
    const duplicates = allOrders.filter((order, index) => 
      allOrders.indexOf(order) !== index
    );
    return [...new Set(duplicates)];
  };

  // อัพเดทลำดับอาวุโสของสมาชิกคนใดคนหนึ่ง
  const updateSeniorityOrder = (index, newOrder) => {
    setMembersData(prev => prev.map((member, i) => 
      i === index ? { ...member, seniority_order: parseInt(newOrder) } : member
    ));
  };

  // เลื่อนขึ้น/ลง
  const moveOrder = (index, direction) => {
    const currentOrder = membersData[index].seniority_order;
    const newOrder = direction === 'up' ? currentOrder - 1 : currentOrder + 1;
    
    if (newOrder >= 1) {
      updateSeniorityOrder(index, newOrder);
    }
  };

  // จัดเรียงลำดับอาวุโสให้ไม่ซ้ำกัน
  const autoArrangeOrders = () => {
    const usedOrders = currentUnitMembers.map(m => m.seniority_order);
    let nextOrder = 1;
    
    const newMembersData = membersData.map(member => {
      while (usedOrders.includes(nextOrder)) {
        nextOrder++;
      }
      const assignedOrder = nextOrder;
      usedOrders.push(nextOrder);
      nextOrder++;
      
      return { ...member, seniority_order: assignedOrder };
    });
    
    setMembersData(newMembersData);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const duplicates = getDuplicateOrders();
    if (duplicates.length > 0) {
      warning(`พบลำดับอาวุโสซ้ำกัน: ${duplicates.join(', ')}`, 'กรุณาแก้ไขก่อนดำเนินการ');
      return;
    }

    setLoading(true);

    try {
      const promises = membersData.map(async (member) => {
        const response = await fetch(`${CONFIG.UNIT_STRUCTURE_API}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            position_number: member.position_number,
            unit_code: selectedUnit.unit_code,
            unit_name: selectedUnit.unit_name,
            role: member.role,
            seniority_order: member.seniority_order
          })
        });
        return response.json();
      });

      const results = await Promise.all(promises);
      const failures = results.filter(r => !r.success);
      
      if (failures.length > 0) {
        warning(`เพิ่มสำเร็จ ${results.length - failures.length} คน, ล้มเหลว ${failures.length} คน`);
      } else {
        success(`เพิ่มบุคลากรสำเร็จ ${membersData.length} คน`);
      }
      
      onSave();
      onClose();
    } catch (err) {
      error('เกิดข้อผิดพลาดในการเพิ่มบุคลากร');
    } finally {
      setLoading(false);
    }
  };

  const duplicateOrders = getDuplicateOrders();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h3 className="text-xl font-bold text-slate-800">
            เพิ่มบุคลากรหลายคน ({membersData.length} คน)
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {duplicateOrders.length > 0 && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 font-medium">
                ⚠️ พบลำดับอาวุโสซ้ำกัน: {duplicateOrders.join(', ')}
              </p>
              <button
                onClick={autoArrangeOrders}
                className="mt-2 px-3 py-1 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700"
              >
                จัดเรียงอัตโนมัติ
              </button>
            </div>
          )}

          <div className="space-y-4">
            {membersData.map((member, index) => (
              <div 
                key={member.position_number}
                className={`p-4 border rounded-lg ${
                  duplicateOrders.includes(member.seniority_order) 
                    ? 'border-red-300 bg-red-50' 
                    : 'border-slate-200 bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-slate-600" />
                    </div>
                    <div>
                      <div className="font-medium text-slate-800">
                        {member.officer?.prefix} {member.officer?.firstname} {member.officer?.lastname}
                      </div>
                      <div className="text-sm text-slate-500">
                        เลขตำแหน่ง: {member.position_number}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                      <label className="text-sm font-medium text-slate-700">
                        ลำดับอาวุโส:
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={member.seniority_order}
                        onChange={(e) => updateSeniorityOrder(index, e.target.value)}
                        className="w-20 px-2 py-1 border border-slate-300 rounded text-center"
                      />
                    </div>
                    
                    <div className="flex space-x-1">
                      <button
                        onClick={() => moveOrder(index, 'up')}
                        className="p-1 hover:bg-slate-100 rounded"
                        disabled={member.seniority_order <= 1}
                      >
                        <ArrowUp className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => moveOrder(index, 'down')}
                        className="p-1 hover:bg-slate-100 rounded"
                      >
                        <ArrowDown className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-slate-200 bg-slate-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-slate-600 hover:text-slate-800 transition-colors"
          >
            ยกเลิก
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || duplicateOrders.length > 0}
            className="flex items-center px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            เพิ่มบุคลากร {membersData.length} คน
          </button>
        </div>
      </div>
    </div>
  );
};

export default BulkAddModal;
