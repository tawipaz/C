import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  ShieldCheck, Clock, History, UserCheck, UserX, Search, Download, Check, X, RefreshCw,
  Shield, Users, Edit2, Trash2, Save, Crown, Plus, UserCog, Building
} from "lucide-react";
import { CONFIG } from '../config';


// --- พจนานุกรมสำหรับแปล Action เป็นภาษาไทย ---
const ACTION_TRANSLATIONS = {
  'login_success': '✅ เข้าสู่ระบบสำเร็จ',
  'login_fail': '❌ พยายามเข้าสู่ระบบ (ล้มเหลว)',
  'register_success': '📝 สมัครสมาชิกสำเร็จ',
  'register_fail': '⚠️ สมัครสมาชิก (ล้มเหลว)',
  'view_all_officers': '👥 ดูข้อมูลบุคลากรทั้งหมด',
  'search_by_phone': '📞 ค้นหาด้วยเบอร์โทร',
  'search_personnel': '🔍 ค้นหาบุคลากร',
  'export_personnel_csv': '📄 ส่งออกข้อมูลบุคลากร (CSV)',
  'view_personnel_detail': '👁️ ดูรายละเอียดบุคลากร',
  'link_line_success': '🔗 เชื่อมต่อ LINE สำเร็จ',
  'link_line_fail': '⚠️ เชื่อมต่อ LINE (ล้มเหลว)',
  'system_error': '🔥 เกิดข้อผิดพลาดในระบบ',
  'approve_user': '👍 อนุมัติผู้ใช้',
  'reject_user': '👎 ปฏิเสธผู้ใช้',
};

const UnitManagement = () => {
  const [units, setUnits] = useState([]);
  const [officers, setOfficers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentUnit, setCurrentUnit] = useState(null);
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [managingUnit, setManagingUnit] = useState(null);
  const API_URL = `${CONFIG.API_BASE_URL}/units.php`;

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
  }, [API_URL]);

  const fetchOfficers = useCallback(async () => {
    try {
      const response = await fetch(`${CONFIG.OFFICERS_API}?action=get_all_officers&role=supervisor`);
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

  const handleOpenModal = (unit = null) => {
    setCurrentUnit(unit);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentUnit(null);
  };

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
        fetchUnits();
        handleCloseModal();
      } else {
        alert(`Error: ${result.message}`);
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
        fetchUnits();
      } else {
        alert(`Error: ${result.message}`);
      }
    } catch (error) {
      console.error("Error deleting unit:", error);
    }
  };

  const handleOpenMemberModal = (unit) => {
    setManagingUnit(unit);
    setIsMemberModalOpen(true);
  };

  const handleCloseMemberModal = () => {
    setIsMemberModalOpen(false);
    setManagingUnit(null);
    fetchUnits();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-slate-600">เพิ่ม ลบ หรือแก้ไขรายชื่อหน่วยงานในระบบ</p>
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
            {units.length > 0 ? units.map((unit) => (
              <li key={unit.id} className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-slate-900 flex items-center"><Building className="w-4 h-4 mr-2 text-slate-400"/> {unit.unit_name}</p>
                  <p className="text-sm text-slate-500 ml-6">หัวหน้าหน่วย: {unit.supervisor_name || 'ยังไม่ระบุ'}</p>
                  <p className="text-sm text-slate-500 ml-6 mt-1">สมาชิก: {unit.members.length > 0 ? unit.members.map(m => m.name).join(', ') : 'ยังไม่มี'}</p>
                </div>
                <div className="flex space-x-1">
                  <button onClick={() => handleOpenMemberModal(unit)} className="p-2 text-slate-500 hover:text-blue-600" title="จัดการสมาชิก">
                    <Users className="w-5 h-5" />
                  </button>
                  <button onClick={() => handleOpenModal(unit)} className="p-2 text-slate-500 hover:text-indigo-600" title="แก้ไขหน่วยงาน"><Edit2 className="w-5 h-5" /></button>
                  <button onClick={() => handleDeleteUnit(unit.id)} className="p-2 text-slate-500 hover:text-red-600" title="ลบหน่วยงาน"><Trash2 className="w-5 h-5" /></button>
                </div>
              </li>
            )) : <p className="p-4 text-slate-500">ยังไม่มีหน่วยงานในระบบ</p>}
          </ul>
        </div>
      )}

      {isModalOpen && (
        <UnitModal
          onClose={() => setIsModalOpen(false)}
          unit={currentUnit}
          officers={officers}
          onSave={handleSaveUnit}
        />
      )}

      {isMemberModalOpen && (
        <ManageMembersModal
          unit={managingUnit}
          onClose={handleCloseMemberModal}
          onSave={async (updatedMembers) => {
            try {
              const memberIds = updatedMembers.map(member => member.id);
              await fetch(CONFIG.UNITS_API, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  action: 'update_unit_members',
                  unit_id: managingUnit.id,
                  member_ids: memberIds,
                }),
              });
              handleCloseMemberModal();
            } catch (error) {
              console.error('Error saving members:', error);
            }
          }}
        />
      )}
    </div>
  );
};

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

const UserApproval = ({ user }) => {
  const [pendingUsers, setPendingUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const fetchPendingUsers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`${CONFIG.OFFICERS_API}?action=get_pending_users`);
      const data = await response.json();
      if (data.success) {
        setPendingUsers(data.data);
      }
    } catch (error) {
      console.error("Error fetching pending users:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPendingUsers();
  }, [fetchPendingUsers]);

  const handleUserStatus = async (userId, newStatus) => {
    try {
      const response = await fetch(CONFIG.OFFICERS_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_user_status',
          user_id: userId,
          status: newStatus,
          admin_user_id: user.id
        }),
      });
      const data = await response.json();
      if (data.success) {
        fetchPendingUsers();
      } else {
        alert(`Error: ${data.message}`);
      }
    } catch (error) {
      console.error("Error updating user status:", error);
    }
  };

  if (loading) return <div>กำลังโหลดข้อมูล...</div>;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-slate-800">รายการรออนุมัติ ({pendingUsers.length})</h2>
      {pendingUsers.length === 0 ? (
        <p className="text-slate-500">ไม่มีผู้ใช้งานที่รอการอนุมัติ</p>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl">
          <ul className="divide-y divide-slate-200">
            {pendingUsers.map((pUser) => (
              <li key={pUser.id} className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-slate-900">{pUser.prefix} {pUser.firstname} {pUser.lastname}</p>
                  <p className="text-sm text-slate-500">{pUser.position} | {pUser.phone}</p>
                </div>
                <div className="flex space-x-2">
                  <button onClick={() => handleUserStatus(pUser.id, 'approved')} className="p-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200">
                    <Check className="w-5 h-5" />
                  </button>
                  <button onClick={() => handleUserStatus(pUser.id, 'rejected')} className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

// --- Component: Personnel Management Section ---
const PersonnelManagement = ({ user }) => {
  const [officers, setOfficers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingOfficer, setEditingOfficer] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    role: '',
    status: '',
    department: ''
  });

  const fetchOfficers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ action: 'get_all_officers', ...filters });
      const response = await fetch(`${CONFIG.OFFICERS_API}?${params.toString()}`);
      const data = await response.json();
      
      if (Array.isArray(data)) {
        setOfficers(data);
      } else if (data && data.success && Array.isArray(data.data)) {
        setOfficers(data.data);
      } else {
        console.error('Invalid data format:', data);
        setOfficers([]);
      }
    } catch (error) {
      console.error("Error fetching officers:", error);
      setOfficers([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchOfficers();
  }, [fetchOfficers]);

  const handleUpdateOfficer = async (officerId, updates) => {
    try {
      const response = await fetch(CONFIG.OFFICERS_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_officer',
          officer_id: officerId,
          updates: updates,
          admin_user_id: user.id
        }),
      });
      const data = await response.json();
      if (data.success) {
        fetchOfficers();
        setEditingOfficer(null);
        alert('อัปเดตข้อมูลสำเร็จ');
      } else {
        throw new Error(data.message || 'ไม่สามารถอัปเดตได้');
      }
    } catch (error) {
      console.error("Error updating officer:", error);
      alert(`เกิดข้อผิดพลาดในการอัปเดตข้อมูล: ${error.message}`);
    }
  };

  const handleDeleteOfficer = async (officer) => {
    if (!window.confirm(`คุณแน่ใจหรือไม่ที่จะลบ ${officer.firstname} ${officer.lastname}?`)) return;
    await handleUpdateOfficer(officer.id || officer.phone, { status: 'deleted' });
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin': return <Shield className="w-4 h-4 text-red-600" />;
      case 'supervisor': return <Crown className="w-4 h-4 text-yellow-600" />;
      default: return <Users className="w-4 h-4 text-blue-600" />;
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      active: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      inactive: 'bg-gray-100 text-gray-800',
      rejected: 'bg-red-100 text-red-800'
    };
    const labels = {
      active: 'ใช้งาน',
      pending: 'รอการอนุมัติ', 
      inactive: 'ไม่ใช้งาน',
      rejected: 'ปฏิเสธ'
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status] || styles.inactive}`}>
        {labels[status] || status || 'ไม่ระบุ'}
      </span>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-slate-800">จัดการบุคลากร ({officers.length})</h2>
        <button 
          onClick={fetchOfficers}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <RefreshCw className="w-4 h-4" />
          <span>รีเฟรช</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="ค้นหาชื่อ, เบอร์โทร..."
              value={filters.search}
              onChange={(e) => setFilters({...filters, search: e.target.value})}
              className="pl-10 w-full p-2 border border-slate-300 rounded-lg"
            />
          </div>
          <select
            value={filters.role}
            onChange={(e) => setFilters({...filters, role: e.target.value})}
            className="w-full p-2 border border-slate-300 rounded-lg"
          >
            <option value="">ทุกตำแหน่ง</option>
            <option value="admin">ผู้ดูแลระบบ</option>
            <option value="supervisor">หัวหน้าหน่วย</option>
            <option value="member">เจ้าหน้าที่</option>
          </select>
          <select
            value={filters.status}
            onChange={(e) => setFilters({...filters, status: e.target.value})}
            className="w-full p-2 border border-slate-300 rounded-lg"
          >
            <option value="">ทุกสถานะ</option>
            <option value="active">ใช้งาน</option>
            <option value="pending">รอการอนุมัติ</option>
            <option value="inactive">ไม่ใช้งาน</option>
          </select>
          <input
            type="text"
            placeholder="หน่วยงาน..."
            value={filters.department}
            onChange={(e) => setFilters({...filters, department: e.target.value})}
            className="w-full p-2 border border-slate-300 rounded-lg"
          />
        </div>
      </div>

      {/* Officers Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-slate-500">กำลังโหลดข้อมูล...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="p-4">ชื่อ-นามสกุล</th>
                  <th className="p-4">ตำแหน่ง/หน่วยงาน</th>
                  <th className="p-4">เบอร์โทร</th>
                  <th className="p-4">สิทธิ์</th>
                  <th className="p-4">สถานะ</th>
                  <th className="p-4">การจัดการ</th>
                </tr>
              </thead>
              <tbody>
                {officers.map((officer, index) => (
                  <tr key={officer.id || officer.phone || index} className="border-t border-slate-200 hover:bg-slate-50">
                    <td className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-slate-600">
                            {officer.firstname?.charAt(0) || 'N'}{officer.lastname?.charAt(0) || 'A'}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">
                            {officer.prefix} {officer.firstname} {officer.lastname}
                          </p>
                          <p className="text-xs text-slate-500">{officer.generation || 'ไม่ระบุ'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <p className="font-medium text-slate-800">{officer.position}</p>
                      <p className="text-xs text-slate-500">{officer.department || officer.affiliation}</p>
                    </td>
                    <td className="p-4 font-mono text-slate-600">{officer.phone}</td>
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        {getRoleIcon(officer.role)}
                        <span className="capitalize">{officer.role || 'member'}</span>
                      </div>
                    </td>
                    <td className="p-4">{getStatusBadge(officer.status || 'active')}</td>
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setEditingOfficer(officer)}
                          className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-lg"
                          title="แก้ไข"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteOfficer(officer)}
                          className="p-1.5 text-red-600 hover:bg-red-100 rounded-lg"
                          title="ลบ"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {officers.length === 0 && (
              <div className="p-8 text-center text-slate-500">
                ไม่พบข้อมูลเจ้าหน้าที่
              </div>
            )}
          </div>
        )}
      </div>

      {/* Edit Officer Modal */}
      {editingOfficer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">แก้ไขข้อมูลเจ้าหน้าที่</h3>
              <button
                onClick={() => setEditingOfficer(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <EditOfficerForm
              officer={editingOfficer}
              onSave={(updates) => handleUpdateOfficer(editingOfficer.id || editingOfficer.phone, updates)}
              onCancel={() => setEditingOfficer(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

// --- Component: Edit Officer Form ---
const EditOfficerForm = ({ officer, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    prefix: officer.prefix || '',
    firstname: officer.firstname || '',
    lastname: officer.lastname || '',
    position: officer.position || '',
    department: officer.department || officer.affiliation || '',
    role: officer.role || 'member',
    status: officer.status || 'active'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* input field ต่างๆ */}
      <div>
        <label className="block text-sm font-medium text-slate-700">ชื่อ</label>
        <input
          type="text"
          value={formData.firstname}
          onChange={(e) => setFormData({...formData, firstname: e.target.value})}
          className="w-full p-2 border border-slate-300 rounded-lg"
        />
      </div>

      <div className="flex justify-end space-x-2">
        <button type="button" onClick={onCancel} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg">ยกเลิก</button>
        <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg">บันทึก</button>
      </div>
    </form>
  );
}; // ✅ ปิดให้ครบ

// --- Component: Unit Form ---

const UnitForm = ({ unit, officers, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: unit?.name || '',
    code: unit?.code || '',
    description: unit?.description || '',
    supervisor_id: unit?.supervisor_id || ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">ชื่อหน่วยงาน</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({...formData, name: e.target.value})}
          className="w-full p-2 border border-slate-300 rounded-lg"
          placeholder="เช่น ส่วนเจ้าพนักงานตำรวจศาล 1"
          required
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">รหัสหน่วยงาน</label>
        <input
          type="text"
          value={formData.code}
          onChange={(e) => setFormData({...formData, code: e.target.value})}
          className="w-full p-2 border border-slate-300 rounded-lg"
          placeholder="เช่น COURT-01"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">คำอธิบาย</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({...formData, description: e.target.value})}
          className="w-full p-2 border border-slate-300 rounded-lg"
          rows="3"
          placeholder="รายละเอียดเพิ่มเติม..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">หัวหน้าหน่วยงาน</label>
        <select
          value={formData.supervisor_id}
          onChange={(e) => setFormData({...formData, supervisor_id: e.target.value})}
          className="w-full p-2 border border-slate-300 rounded-lg"
        >
          <option value="">-- เลือกหัวหน้าหน่วย --</option>
          {officers.filter(o => o.role === 'supervisor' || o.role === 'admin').map(officer => (
            <option key={officer.id || officer.phone} value={officer.id || officer.phone}>
              {officer.prefix} {officer.firstname} {officer.lastname} ({officer.position})
            </option>
          ))}
        </select>
        <p className="text-xs text-slate-500 mt-1">
          * แสดงเฉพาะเจ้าหน้าที่ที่มีสิทธิ์เป็นหัวหน้าหน่วยหรือผู้ดูแลระบบ
        </p>
      </div>
      
      <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-slate-600 hover:text-slate-800"
        >
          ยกเลิก
        </button>
        <button
          type="submit"
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Save className="w-4 h-4" />
          <span>บันทึก</span>
        </button>
      </div>
    </form>
  );
};

// --- Component: Activity Logs Section ---
const ActivityLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ search: "", startDate: "", endDate: "" });

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        action: 'get_logs',
        search: filters.search,
        start_date: filters.startDate,
        end_date: filters.endDate,
      });

      // --- ส่วนที่แก้ไข ---
      // 1. เรียก API จริงโดยใช้ CONFIG.OFFICERS_API
      const response = await fetch(`${CONFIG.OFFICERS_API}?${params.toString()}`);
      const result = await response.json();

      // 2. ตรวจสอบผลลัพธ์และอัปเดต state
      if (result.success) {
        setLogs(result.data);
      } else {
        // หาก API ส่ง error กลับมา, ให้แสดงใน console
        console.error("API Error:", result.message);
        setLogs([]); // ตั้งค่า logs เป็น array ว่าง
      }
    } catch (error) {
      console.error("Error fetching logs:", error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);
  
  const exportToCSV = useCallback(() => {
    if (logs.length === 0) return alert('ไม่มีข้อมูลสำหรับ Export');
    const headers = ['เวลา', 'ผู้ใช้งาน', 'กิจกรรม', 'รายละเอียด', 'IP Address'];
    const rows = logs.map(log => [
        log.timestamp,
        log.full_name || log.username || 'N/A',
        ACTION_TRANSLATIONS[log.action] || log.action,
        log.details || '',
        log.ip_address || ''
    ]);
    const csvContent = [headers, ...rows].map(row => row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `activity_logs_${new Date().toLocaleDateString('th-TH').replace(/\//g, '-')}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  }, [logs]);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-slate-800">ตรวจสอบกิจกรรม (Logs)</h2>
      {/* Filters */}
      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-1 md:grid-cols-4 gap-4">
        <input type="text" placeholder="ค้นหา Username, กิจกรรม..." value={filters.search} onChange={(e) => setFilters({...filters, search: e.target.value})} className="w-full p-2 border border-slate-300 rounded-lg" />
        <input type="date" value={filters.startDate} onChange={(e) => setFilters({...filters, startDate: e.target.value})} className="w-full p-2 border border-slate-300 rounded-lg" />
        <input type="date" value={filters.endDate} onChange={(e) => setFilters({...filters, endDate: e.target.value})} className="w-full p-2 border border-slate-300 rounded-lg" />
        <div className="flex space-x-2">
            <button onClick={fetchLogs} className="flex-1 flex items-center justify-center p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"><Search className="w-4 h-4 mr-2" /> ค้นหา</button>
            <button onClick={exportToCSV} className="flex items-center justify-center p-2 bg-green-600 text-white rounded-lg hover:bg-green-700"><Download className="w-4 h-4" /></button>
        </div>
      </div>
      
      {/* Log Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="p-3">เวลา</th>
                <th className="p-3">ผู้ใช้งาน</th>
                <th className="p-3">กิจกรรม</th>
                <th className="p-3">รายละเอียด</th>
                <th className="p-3">IP Address</th>
              </tr>
            </thead>
            <tbody>
            {loading ? (
                <tr><td colSpan="5" className="text-center p-4">กำลังโหลด...</td></tr>
            ) : logs.map(log => (
                <tr key={log.id} className="border-t border-slate-200">
                <td className="p-3 whitespace-nowrap">{new Date(log.timestamp).toLocaleString('th-TH')}</td>
                <td className="p-3 font-medium text-slate-800">{log.full_name || log.username || <span className="text-slate-400">N/A</span>}</td>
                <td className="p-3">{ACTION_TRANSLATIONS[log.action] || log.action}</td>
                <td className="p-3 text-slate-500 max-w-xs truncate" title={log.details}>{log.details}</td>
                <td className="p-3 text-slate-500">{log.ip_address}</td>
                </tr>
            ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// ===================================================================
// --- Component: Unit Management (เพิ่มส่วนนี้ทั้งหมด) ---

const ManageMembersModal = ({ unit, onClose, onSave }) => {
  const [members, setMembers] = useState(unit.members || []);
  const [available, setAvailable] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchAvailable = async () => {
      const response = await fetch(`${CONFIG.UNITS_API}?action=get_unassigned_officers`);
      const data = await response.json();
      if (data.success) setAvailable(data.data);
    };
    fetchAvailable();
  }, []);

  const handleAdd = (officer) => {
    setMembers([...members, officer]);
    setAvailable(available.filter((o) => o.id !== officer.id));
  };

  const handleRemove = (officer) => {
    setAvailable([...available, officer]);
    setMembers(members.filter((m) => m.id !== officer.id));
  };

  const handleSubmit = (e) => { // ไม่ต้อง async ที่นี่
    e.preventDefault();
    onSave(members); // ส่งแค่ array สมาชิกกลับไปให้ parent component จัดการ
  };

  const filteredAvailable = available.filter((o) =>
    o.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl h-[80vh] flex flex-col">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold">จัดการสมาชิก: {unit.unit_name}</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100">
            <X />
          </button>
        </div>
        <div className="flex-1 grid grid-cols-2 gap-4 p-4 overflow-hidden">
          <div className="flex flex-col border border-slate-200 rounded-lg">
            <h3 className="p-3 bg-slate-50 font-medium border-b">สมาชิกปัจจุบัน ({members.length})</h3>
            <ul className="p-2 overflow-y-auto">
              {members.map((m) => (
                <li key={m.id} className="flex justify-between items-center p-2 rounded hover:bg-slate-50">
                  <span>{m.name}</span>
                  <button onClick={() => handleRemove(m)} className="text-red-500 text-xs">
                    นำออก
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <div className="flex flex-col border border-slate-200 rounded-lg">
            <div className="p-3 bg-slate-50 border-b">
              <input
                type="text"
                placeholder="🔍 กรองรายชื่อ..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-2 py-1 border rounded"
              />
            </div>
            <ul className="p-2 overflow-y-auto">
              {filteredAvailable.map((o) => (
                <li key={o.id} className="flex justify-between items-center p-2 rounded hover:bg-slate-50">
                  <span>{o.name}</span>
                  <button onClick={() => handleAdd(o)} className="text-green-600 text-xs">
                    เพิ่ม
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="p-4 border-t flex justify-end">
          <button
            onClick={handleSubmit} // Use handleSubmit instead of onSave
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg"
          >
            บันทึกการเปลี่ยนแปลง
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Component: Role Management Section ---
const RoleManagement = ({ user }) => {
  const [officers, setOfficers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const availableRoles = ['member', 'scheduler', 'supervisor', 'admin'];

  const fetchOfficers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`${CONFIG.API_BASE_URL}/officers.php?action=get_all_officers`);
      const data = await response.json();
      if (data.success) {
        setOfficers(data.data
          .filter(o => o.role !== 'super_admin')
          .sort((a, b) => a.firstname.localeCompare(b.firstname, 'th'))
        );
      }
    } catch (error) {
      console.error("Error fetching officers:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchOfficers();
  }, [fetchOfficers]);

  const handleRoleChange = async (officerId, newRole) => {
    if (officerId === user.id) {
        alert("ไม่สามารถเปลี่ยน Role ของตนเองได้");
        fetchOfficers();
        return;
    }

    try {
      const response = await fetch(`${CONFIG.API_BASE_URL}/officers.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_officer',
          officer_id: officerId,
          updates: { role: newRole },
          admin_user_id: user.id
        }),
      });
      const data = await response.json();
      if (data.success) {
        setOfficers(prevOfficers =>
          prevOfficers.map(o => (o.id === officerId ? { ...o, role: newRole } : o))
        );
      } else {
        alert(`Error: ${data.message}`);
        fetchOfficers();
      }
    } catch (error) {
      console.error("Error updating role:", error);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-slate-800">จัดการ Role ผู้ใช้งาน</h2>
        <button onClick={() => { setRefreshing(true); fetchOfficers(); }} disabled={refreshing} className="p-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 disabled:opacity-50">
            <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="p-3">ชื่อ-นามสกุล</th>
                <th className="p-3">ตำแหน่ง</th>
                <th className="p-3">Role ปัจจุบัน</th>
                <th className="p-3 w-1/4">เปลี่ยน Role เป็น</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="4" className="text-center p-4">กำลังโหลด...</td></tr>
              ) : officers.map(officer => (
                <tr key={officer.id} className="border-t border-slate-200">
                  <td className="p-3 font-medium text-slate-800">{officer.prefix} {officer.firstname} {officer.lastname}</td>
                  <td className="p-3 text-slate-500">{officer.position || '-'}</td>
                  <td className="p-3">
                    <span className="font-mono bg-slate-100 text-slate-700 px-2 py-1 rounded-md text-xs">{officer.role || 'member'}</span>
                  </td>
                  <td className="p-3">
                    <select
                      value={officer.role || 'member'}
                      onChange={(e) => handleRoleChange(officer.id, e.target.value)}
                      disabled={officer.id === user.id}
                      className="w-full p-2 border border-slate-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-slate-100 disabled:cursor-not-allowed"
                    >
                      {availableRoles.map(role => (
                        <option key={role} value={role}>{role}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// --- Component: Supervisor List ---
const SupervisorList = ({ user }) => {
    const [supervisors, setSupervisors] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchSupervisors = useCallback(async () => {
        setLoading(true);
        try {
            const response = await fetch(`${CONFIG.API_BASE_URL}/officers.php?action=get_supervisors`);
            const result = await response.json();
            if (result.success) {
                setSupervisors(result.data);
            }
        } catch (error) {
            console.error("Failed to fetch supervisors:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSupervisors();
    }, [fetchSupervisors]);

    if (loading) return <div>กำลังโหลดรายชื่อหัวหน้าส่วน...</div>;

    return (
        <div className="space-y-4">
            <h2 className="text-xl font-semibold text-slate-800">รายชื่อหัวหน้าส่วน</h2>
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                <ul className="divide-y divide-slate-200">
                    {supervisors.map(sv => (
                        <li key={sv.id} className="p-4">
                            <p className="font-medium text-slate-900">{sv.prefix} {sv.firstname} {sv.lastname}</p>
                            <p className="text-sm text-slate-500">{sv.position}</p>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

const allTabs = [
  { key: 'approval', label: 'อนุมัติผู้ใช้', icon: UserCheck, roles: ['super_admin', 'admin'] },
  { key: 'units', label: 'จัดการส่วนงาน(สำหรับเวร)', icon: Building, roles: ['super_admin', 'admin', 'supervisor', 'scheduler'] },
  { key: 'roles', label: 'จัดการสถานะผู้ใช้', icon: UserCog, roles: ['super_admin', 'admin'] },
  { key: 'logs', label: 'ตรวจสอบ Logs', icon: History, roles: ['super_admin', 'admin', 'supervisor'] },
];

export default function AdminPage({ user }) {
    // 2. กรอง Tab ที่จะแสดงตาม role ของ user
    const visibleTabs = useMemo(() => {
        if (!user || !user.role) return [];
        // admin และ super_admin เห็นทุก Tab ที่มีใน allTabs
        if (user.role === 'super_admin' || user.role === 'admin') {
            return allTabs;
        }
        // สำหรับ role อื่นๆ ให้กรองเฉพาะ Tab ที่มี role ของ user นั้นๆ อยู่ใน property 'roles'
        return allTabs.filter(tab => tab.roles.includes(user.role));
    }, [user]);

    // 3. ตั้งค่า activeTab เริ่มต้นให้เป็น Tab แรกที่ user คนนั้นมองเห็น
    const [activeTab, setActiveTab] = useState(visibleTabs[0]?.key || '');

    const renderContent = () => {
      switch (activeTab) {
        case 'approval':
          return <UserApproval user={user} />;
        case 'units':
          return <UnitManagement />;
        case 'roles':
          return <RoleManagement user={user}/>;
        case 'logs':
          return <ActivityLogs />;
        default:
          return <div className="text-slate-500">คุณไม่มีสิทธิ์เข้าถึงส่วนนี้</div>;
      }
    };

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center">
              <ShieldCheck className="w-6 h-6 mr-3 text-indigo-600" />
              แผงควบคุมผู้ดูแลระบบ
            </h1>
            <p className="text-slate-600">จัดการส่วนต่างๆ ของระบบ</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-slate-200">
          <nav className="flex space-x-4 overflow-x-auto pb-px">
            {/* 4. เปลี่ยนไป map 'visibleTabs' แทน 'tabs' เดิม */}
            {visibleTabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center space-x-2 py-2 px-3 rounded-t-lg font-medium text-sm transition-colors whitespace-nowrap ${
                  activeTab === tab.key
                    ? 'bg-white border-t border-x border-slate-200 text-indigo-600'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 min-h-[400px]">
          {renderContent()}
        </div>
      </div>
    );
}