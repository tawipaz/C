import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Edit2, Trash2, Building, X } from 'lucide-react';
import { CONFIG } from '../config'; // ต้องมีไฟล์ config ที่เก็บ API URL
import { useAlert } from './common/AlertSystem';

const API_URL = `${CONFIG.API_BASE_URL}/units.php`; // สมมติว่า API endpoint คือ units.php

const UnitManagement = () => {
  const { success, error } = useAlert();
  const [units, setUnits] = useState([]);
  const [officers, setOfficers] = useState([]); // สำหรับ Dropdown เลือก Supervisor
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentUnit, setCurrentUnit] = useState(null); // State สำหรับเก็บข้อมูลที่จะแก้ไข

  // --- Fetch Data ---
  const fetchUnits = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}?action=get_all_units`);
      const data = await response.json();
      if (data.success) {
        setUnits(data.data);
      }
    } catch (error) {
      console.error("Error fetching units:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchOfficers = useCallback(async () => {
    // ดึงรายชื่อบุคลากรทั้งหมดมาเพื่อใช้ใน dropdown
    try {
      const response = await fetch(`${CONFIG.OFFICERS_API}?action=get_all_officers`);
      const data = await response.json();
      if (data.success) {
        setOfficers(data.data);
      }
    } catch (error) {
      console.error("Error fetching officers:", error);
    }
  }, []);

  useEffect(() => {
    fetchUnits();
    fetchOfficers();
  }, [fetchUnits, fetchOfficers]);

  // --- Modal Handling ---
  const handleOpenModal = (unit = null) => {
    setCurrentUnit(unit); // ถ้าเป็น null คือการสร้างใหม่, ถ้ามีข้อมูลคือการแก้ไข
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentUnit(null);
  };

  // --- CRUD Operations ---
  const handleSaveUnit = async (unitData) => {
    const action = unitData.id ? 'update_unit' : 'create_unit';
    const payload = {
      action,
      unit_id: unitData.id,
      unit_name: unitData.unit_name,
      supervisor_id: unitData.supervisor_id,
    };

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (result.success) {
        fetchUnits(); // Refresh list
        handleCloseModal();
        success('บันทึกข้อมูลหน่วยงานสำเร็จ');
      } else {
        error(`เกิดข้อผิดพลาด: ${result.message}`);
      }
    } catch (error) {
      console.error("Error saving unit:", error);
    }
  };

  const handleDeleteUnit = async (unitId) => {
    if (!window.confirm('คุณแน่ใจหรือไม่ว่าต้องการลบหน่วยงานนี้?')) return;

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete_unit', unit_id: unitId }),
      });
      const result = await response.json();
      if (result.success) {
        fetchUnits(); // Refresh list
        success('ลบหน่วยงานสำเร็จ');
      } else {
        error(`เกิดข้อผิดพลาด: ${result.message}`);
      }
    } catch (error) {
      console.error("Error deleting unit:", error);
    }
  };


  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-slate-800">จัดการหน่วยงาน</h2>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          เพิ่มหน่วยใหม่
        </button>
      </div>

      {loading ? <p>กำลังโหลด...</p> : (
        <div className="bg-white border border-slate-200 rounded-xl">
          <ul className="divide-y divide-slate-200">
            {units.map((unit) => (
              <li key={unit.id} className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-slate-900 flex items-center"><Building className="w-4 h-4 mr-2 text-slate-400"/> {unit.unit_name}</p>
                  <p className="text-sm text-slate-500 ml-6">หัวหน้าหน่วย: {unit.supervisor_name || 'ยังไม่ระบุ'}</p>
                </div>
                <div className="flex space-x-2">
                  <button onClick={() => handleOpenModal(unit)} className="p-2 text-slate-500 hover:text-indigo-600"><Edit2 className="w-5 h-5" /></button>
                  <button onClick={() => handleDeleteUnit(unit.id)} className="p-2 text-slate-500 hover:text-red-600"><Trash2 className="w-5 h-5" /></button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {isModalOpen && (
        <UnitModal
          unit={currentUnit}
          officers={officers}
          onClose={handleCloseModal}
          onSave={handleSaveUnit}
        />
      )}
    </div>
  );
};

// --- Sub-component: Modal for Add/Edit ---
const UnitModal = ({ unit, officers, onClose, onSave }) => {
  const [unitName, setUnitName] = useState(unit?.unit_name || '');
  const [supervisorId, setSupervisorId] = useState(unit?.supervisor_id || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      id: unit?.id,
      unit_name: unitName,
      supervisor_id: supervisorId,
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">{unit ? 'แก้ไขหน่วยงาน' : 'เพิ่มหน่วยงานใหม่'}</h3>
          <button onClick={onClose} className="p-1"><X className="w-5 h-5 text-slate-400"/></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">ชื่อหน่วยงาน</label>
            <input
              type="text"
              value={unitName}
              onChange={(e) => setUnitName(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">หัวหน้าหน่วย (ถ้ามี)</label>
            <select
              value={supervisorId}
              onChange={(e) => setSupervisorId(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md"
            >
              <option value="">-- ไม่ระบุ --</option>
              {officers.map(officer => (
                <option key={officer.id} value={officer.id}>
                  {officer.firstname} {officer.lastname}
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-end space-x-2">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg">ยกเลิก</button>
            <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg">บันทึก</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UnitManagement;