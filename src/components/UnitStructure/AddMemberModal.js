import React, { useState, useEffect, useMemo } from 'react';
import { X, Save, User, Crown, Star } from 'lucide-react';
import { CONFIG } from '../../config';
import { useAlert } from '../common/AlertSystem';

// Modal สำหรับเพิ่มบุคลากรพร้อมกำหนดบทบาทและลำดับอาวุโส
const AddMemberModal = ({ 
  selectedUnit, 
  units,
  officers, 
  unitStructures,
  onClose, 
  onSave 
}) => {
  const { success, error } = useAlert();
  const [formData, setFormData] = useState({
    position_number: '',
    role: 'member',
    seniority_order: 1
  });
  const [loading, setLoading] = useState(false);

  // Get available officers (ที่ยังไม่ได้อยู่ในโครงสร้าง)
  const availableOfficers = useMemo(() => {
    const usedPositions = unitStructures.map(s => s.position_number);
    return officers.filter(officer => 
      !usedPositions.includes(officer.position_number)
    );
  }, [officers, unitStructures]);

  // Get current unit members เพื่อกำหนด default seniority order
  const currentUnitMembers = useMemo(() => {
    return unitStructures.filter(s => 
      s.unit_code === selectedUnit.unit_code
    ).sort((a, b) => a.seniority_order - b.seniority_order);
  }, [unitStructures, selectedUnit]);

  // Reset form เมื่อเปิด modal
  useEffect(() => {
    const nextSeniorityOrder = currentUnitMembers.length + 1;
    setFormData({
      position_number: '',
      role: selectedUnit.isDirector ? 'director' : 'member',
      seniority_order: nextSeniorityOrder
    });
  }, [selectedUnit, currentUnitMembers]);

  // Check if role is available
  const canSelectRole = (role) => {
    if (role === 'director') {
      return !unitStructures.some(s => s.role === 'director');
    }
    if (role === 'supervisor') {
      return !currentUnitMembers.some(s => s.role === 'supervisor');
    }
    return true;
  };

  // Get suggested seniority orders
  const getSuggestedSeniorityOrders = () => {
    const usedOrders = currentUnitMembers.map(m => m.seniority_order);
    const suggestions = [];
    
    // แนะนำตำแหน่งที่ว่าง
    for (let i = 1; i <= currentUnitMembers.length + 3; i++) {
      if (!usedOrders.includes(i)) {
        suggestions.push(i);
      }
    }
    
    return suggestions.slice(0, 5); // แสดงไม่เกิน 5 ตัวเลือก
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${CONFIG.UNIT_STRUCTURE_API}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          position_number: formData.position_number,
          unit_code: selectedUnit.unit_code,
          unit_name: selectedUnit.unit_name,
          role: formData.role,
          seniority_order: formData.seniority_order
        })
      });

      const data = await response.json();

      if (data.success) {
        success('เพิ่มบุคลากรสำเร็จ');
        onSave();
        onClose();
      } else {
        console.error('API Error:', data);
        error(data.message || data.errors?.join(', ') || 'เกิดข้อผิดพลาดในการเพิ่มบุคลากร');
      }
    } catch (err) {
      console.error('Error adding member:', err);
      error('เกิดข้อผิดพลาดในการเชื่อมต่อ API');
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

  const getRoleDescription = (role) => {
    switch (role) {
      case 'director':
        return 'ผู้อำนวยการศูนย์รักษาความปลอดภัย (มีได้คนเดียว)';
      case 'supervisor':
        return 'หัวหน้าส่วนงาน (แต่ละส่วนมีได้คนเดียว)';
      default:
        return 'เจ้าหน้าที่ปฏิบัติงานทั่วไป';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center">
            <User className="w-5 h-5 mr-2 text-indigo-600" />
            เพิ่มบุคลากรใหม่
          </h3>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-4 p-3 bg-indigo-50 rounded-lg">
          <div className="text-sm font-medium text-indigo-800">
            เพิ่มเข้า: {selectedUnit.unit_name}
          </div>
          <div className="text-xs text-indigo-600 mt-1">
            บุคลากรปัจจุบัน: {currentUnitMembers.length} คน
          </div>
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

          {/* เลือกบทบาท */}
          <div>
            <label className="block text-sm font-medium mb-2">บทบาท</label>
            <div className="space-y-2">
              {['member', 'supervisor', 'director'].map(role => (
                <label
                  key={role}
                  className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                    formData.role === role
                      ? 'border-indigo-500 bg-indigo-50'
                      : canSelectRole(role)
                      ? 'border-slate-200 hover:border-slate-300'
                      : 'border-slate-100 bg-slate-50 cursor-not-allowed opacity-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="role"
                    value={role}
                    checked={formData.role === role}
                    onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                    disabled={!canSelectRole(role)}
                    className="sr-only"
                  />
                  <div className="flex items-center flex-1">
                    {getRoleIcon(role)}
                    <div className="ml-3">
                      <div className="font-medium">{getRoleText(role)}</div>
                      <div className="text-xs text-slate-500">{getRoleDescription(role)}</div>
                    </div>
                  </div>
                  {formData.role === role && (
                    <div className="w-4 h-4 bg-indigo-600 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                  )}
                </label>
              ))}
            </div>
          </div>

          {/* ลำดับอาวุโส */}
          <div>
            <label className="block text-sm font-medium mb-2">ลำดับอาวุโส</label>
            <div className="space-y-2">
              <input
                type="number"
                min="1"
                value={formData.seniority_order}
                onChange={(e) => setFormData(prev => ({ ...prev, seniority_order: parseInt(e.target.value) }))}
                className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
                required
              />
              
              {/* แสดงตัวเลือกลำดับที่แนะนำ */}
              <div className="flex flex-wrap gap-2">
                <span className="text-xs text-slate-500">แนะนำ:</span>
                {getSuggestedSeniorityOrders().map(order => (
                  <button
                    key={order}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, seniority_order: order }))}
                    className={`px-2 py-1 text-xs rounded border transition-colors ${
                      formData.seniority_order === order
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-slate-100 text-slate-600 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {order}
                  </button>
                ))}
              </div>
              
              <p className="text-xs text-slate-500">
                {formData.role === 'supervisor' ? 'หัวหน้าส่วนควรเป็น 1' : 'เลขที่มากกว่าจะมีอาวุโสน้อยกว่า'}
              </p>
            </div>
          </div>

          {/* แสดงการจัดเรียงปัจจุบัน */}
          {currentUnitMembers.length > 0 && (
            <div className="p-3 bg-slate-50 rounded-lg">
              <div className="text-sm font-medium text-slate-700 mb-2">
                ลำดับอาวุโสปัจจุบัน:
              </div>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {currentUnitMembers.map(member => (
                  <div key={member.id} className="flex items-center text-xs text-slate-600">
                    <span className="w-6 text-center">{member.seniority_order}.</span>
                    <div className="flex items-center mr-2">
                      {getRoleIcon(member.role)}
                    </div>
                    <span>{member.prefix} {member.firstname} {member.lastname}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

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
              disabled={loading || !formData.position_number}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  กำลังเพิ่ม...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  เพิ่มบุคลากร
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddMemberModal;
