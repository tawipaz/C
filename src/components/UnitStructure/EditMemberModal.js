import React, { useState, useEffect, useMemo } from 'react';
import { X, Save, User, Crown, Star } from 'lucide-react';
import { CONFIG } from '../../config';
import { useAlert } from '../common/AlertSystem';

// Modal สำหรับแก้ไขข้อมูลสมาชิกในโครงสร้าง
const EditMemberModal = ({ 
  member, 
  units, 
  officers, 
  unitStructures,
  onClose, 
  onSave 
}) => {
  const { success, error } = useAlert();
  const [formData, setFormData] = useState({
    position_number: '',
    unit_code: '',
    unit_name: '',
    role: 'member',
    seniority_order: 1
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (member) {
      setFormData({
        position_number: member.position_number || '',
        unit_code: member.unit_code || '',
        unit_name: member.unit_name || '',
        role: member.role || 'member',
        seniority_order: member.seniority_order || 1
      });
    }
  }, [member]);

  // Get available officers (ที่ยังไม่ได้อยู่ในโครงสร้าง หรือเป็นคนเดียวกับที่กำลังแก้ไข)
  const availableOfficers = useMemo(() => {
    const usedPositions = unitStructures
      .filter(s => s.id !== member?.id) // ยกเว้นตัวเองที่กำลังแก้ไข
      .map(s => s.position_number);
    
    return officers.filter(officer => 
      !usedPositions.includes(officer.position_number)
    );
  }, [officers, unitStructures, member]);

  // Get unit info for unit_name auto-fill
  const selectedUnitInfo = useMemo(() => {
    if (formData.unit_code === 'CMD') {
      return { unit_name: 'ผู้อำนวยการศูนย์รักษาความปลอดภัย' };
    }
    return units.find(u => u.unit_code === formData.unit_code);
  }, [formData.unit_code, units]);

  // Auto-fill unit_name when unit_code changes
  useEffect(() => {
    if (selectedUnitInfo) {
      setFormData(prev => ({
        ...prev,
        unit_name: selectedUnitInfo.unit_name
      }));
    }
  }, [selectedUnitInfo]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${CONFIG.UNIT_STRUCTURE_API}/${member.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        success('แก้ไขข้อมูลสำเร็จ');
        onSave();
        onClose();
      } else {
        console.error('API Error:', data);
        error(data.message || data.errors?.join(', ') || 'เกิดข้อผิดพลาดในการแก้ไขข้อมูล');
      }
    } catch (err) {
      console.error('Error updating member:', err);
      error('เกิดข้อผิดพลาดในการเชื่อมต่อ API');
    } finally {
      setLoading(false);
    }
  };

  if (!member) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center">
            {formData.role === 'director' ? <Crown className="w-5 h-5 mr-2 text-purple-600" /> :
             formData.role === 'supervisor' ? <Star className="w-5 h-5 mr-2 text-blue-600" /> :
             <User className="w-5 h-5 mr-2 text-green-600" />}
            แก้ไขข้อมูลสมาชิก
          </h3>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* เลือกเจ้าหน้าที่ */}
          <div>
            <label className="block text-sm font-medium mb-2">เจ้าหน้าที่</label>
            <select
              value={formData.position_number}
              onChange={(e) => setFormData(prev => ({ ...prev, position_number: e.target.value }))}
              className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
              required
            >
              <option value="">เลือกเจ้าหน้าที่</option>
              {availableOfficers.map(officer => (
                <option key={officer.position_number} value={officer.position_number}>
                  {officer.prefix} {officer.firstname} {officer.lastname} ({officer.position_number})
                </option>
              ))}
            </select>
          </div>

          {/* เลือกส่วนงาน */}
          <div>
            <label className="block text-sm font-medium mb-2">ส่วนงาน</label>
            <select
              value={formData.unit_code}
              onChange={(e) => setFormData(prev => ({ ...prev, unit_code: e.target.value }))}
              className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
              required
            >
              <option value="">เลือกส่วนงาน</option>
              <option value="CMD">ผู้อำนวยการศูนย์รักษาความปลอดภัย</option>
              {units.map(unit => (
                <option key={unit.unit_code} value={unit.unit_code}>
                  {unit.unit_name}
                </option>
              ))}
            </select>
          </div>

          {/* บทบาท */}
          <div>
            <label className="block text-sm font-medium mb-2">บทบาท</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
              className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
              required
            >
              <option value="member">เจ้าหน้าที่</option>
              <option value="supervisor">หัวหน้าส่วน</option>
              <option value="director">ผู้อำนวยการ</option>
            </select>
          </div>

          {/* ลำดับอาวุโส */}
          <div>
            <label className="block text-sm font-medium mb-2">ลำดับอาวุโส</label>
            <input
              type="number"
              min="1"
              value={formData.seniority_order}
              onChange={(e) => setFormData(prev => ({ ...prev, seniority_order: parseInt(e.target.value) }))}
              className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
              required
            />
            <p className="text-xs text-slate-500 mt-1">
              {formData.role === 'supervisor' ? 'หัวหน้าส่วนควรเป็น 1' : 'เลขที่มากกว่าจะมีอาวุโสน้อยกว่า'}
            </p>
          </div>

          {/* ปุ่มดำเนินการ */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200"
              disabled={loading}
            >
              ยกเลิก
            </button>
            <button
              type="submit"
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
                  บันทึก
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditMemberModal;
