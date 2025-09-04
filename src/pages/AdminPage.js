import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  ShieldCheck, History, UserCheck, UserX, Search, Download, Check, X, RefreshCw,
  Shield, Users, Edit2, Trash2, Save, Crown, UserCog, Users2, KeyRound
} from "lucide-react";
import { CONFIG } from '../config';
import { useAlert } from '../components/common/AlertSystem';

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

// --- Component: User Approval Section ---
const UserApproval = ({ user }) => {
  const { error } = useAlert();
  const [pendingUsers, setPendingUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const fetchPendingUsers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`${CONFIG.OFFICERS_API}/pending`);
      const data = await response.json();
      if (data.success) {
        // ป้องกันการแสดงผลผิดพลาดโดยการกรองข้อมูลที่ status เป็น pending เท่านั้น
        setPendingUsers(Array.isArray(data.data) ? data.data.filter(u => u.status === 'pending') : []);
      } else {
        setPendingUsers([]);
      }
    } catch (error) {
      console.error("Error fetching pending users:", error);
      setPendingUsers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPendingUsers();
  }, [fetchPendingUsers]);

  const handleUserStatus = async (userId, newStatus) => {
    try {
      const response = await fetch(`${CONFIG.OFFICERS_API}/${userId}/status`, {
        method: 'PATCH', // หรือ 'PUT' ขึ้นอยู่กับการออกแบบ API
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          admin_user_id: user.id
        }),
      });

      const data = await response.json();
      if (data.success) {
        fetchPendingUsers();
      } else {
        error(`Error: ${data.message}`);
      }
    } catch (error) {
      console.error("Error updating user status:", error);
    }
  };

  if (loading) return <div>กำลังโหลดข้อมูล...</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-slate-800">คำขอรอดำเนินการ ({pendingUsers.length})</h2>
        <button onClick={fetchPendingUsers} className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg" title="รีเฟรช">
            <RefreshCw className="w-5 h-5" />
        </button>
      </div>
      {pendingUsers.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-xl">
          <p className="text-slate-500">ไม่มีคำขอที่รอการอนุมัติในขณะนี้</p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl">
          <ul className="divide-y divide-slate-200">
            {pendingUsers.map((pUser) => (
              <li key={pUser.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                <div>
                  <p className="font-medium text-slate-900">{pUser.prefix} {pUser.firstname} {pUser.lastname}</p>
                  <p className="text-sm text-slate-500">{pUser.position} | {pUser.phone}</p>
                </div>
                <div className="flex space-x-2">
                  <button onClick={() => handleUserStatus(pUser.id, 'approved')} className="p-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200" title="อนุมัติ">
                    <Check className="w-5 h-5" />
                  </button>
                  <button onClick={() => handleUserStatus(pUser.id, 'rejected')} className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200" title="ปฏิเสธ">
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
  const { success, error } = useAlert();
  const [allOfficers, setAllOfficers] = useState([]); // Holds all users from API
  const [officers, setOfficers] = useState([]); // Holds filtered users for display
  const [loading, setLoading] = useState(true);
  const [editingOfficer, setEditingOfficer] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    role: '',
    status: '',
    department: ''
  });

  const fetchAllOfficers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(CONFIG.OFFICERS_API);
      const data = await response.json();
      
      let officersData = [];
      if (Array.isArray(data)) {
        officersData = data;
      } else if (data && data.success && Array.isArray(data.data)) {
        officersData = data.data;
      } else {
        console.error('Invalid data format:', data);
      }
      setAllOfficers(officersData);
    } catch (error) {
      console.error("Error fetching officers:", error);
      setAllOfficers([]); // เคลียร์ข้อมูลทั้งหมดเมื่อเกิดข้อผิดพลาด
      setOfficers([]); // เคลียร์ข้อมูลที่แสดงผลเมื่อเกิดข้อผิดพลาด
    } finally {
      setLoading(false);
    }
  }, []); // แก้ไข: ลบ [filters] ออก เพื่อให้ฟังก์ชันนี้ถูกสร้างขึ้นครั้งเดียวและไม่ re-fetch ข้อมูลเมื่อ filter เปลี่ยน

  useEffect(() => {
    fetchAllOfficers();
  }, [fetchAllOfficers]);

  // Apply filters whenever the master list or filter values change
  useEffect(() => {
    let filtered = allOfficers;

    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(officer =>
        `${officer.prefix || ''} ${officer.firstname || ''} ${officer.lastname || ''}`.toLowerCase().includes(searchTerm) ||
        (officer.phone && officer.phone.includes(searchTerm))
      );
    }

    if (filters.role) {
      filtered = filtered.filter(officer => officer.role === filters.role);
    }

    if (filters.status) {
      filtered = filtered.filter(officer => officer.status === filters.status);
    }

    if (filters.department) {
      const departmentTerm = filters.department.toLowerCase();
      filtered = filtered.filter(officer => 
        (officer.department && officer.department.toLowerCase().includes(departmentTerm)) ||
        (officer.affiliation && officer.affiliation.toLowerCase().includes(departmentTerm))
      );
    }

    setOfficers(filtered);
  }, [filters, allOfficers]);
  const handleUpdateOfficer = async (officerId, updates) => {
    try {
      const response = await fetch(`${CONFIG.OFFICERS_API}/${officerId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          updates: updates,
          admin_user_id: user.id
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Server responded with ${response.status}: ${errorText.substring(0, 500)}`);
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const responseText = await response.text();
        console.error("Received non-JSON response:", responseText);
        throw new Error(`Expected JSON response, but received ${contentType}. See console for details.`);
      }

      const data = await response.json();
      if (data.success) {
        fetchAllOfficers();
        setEditingOfficer(null);
        success('อัปเดตข้อมูลสำเร็จ');
      } else {
        throw new Error(data.message || 'ไม่สามารถอัปเดตได้');
      }
    } catch (err) {
      console.error("Error updating officer:", err);
      error(`เกิดข้อผิดพลาดในการอัปเดตข้อมูล: ${err.message}`);
    }
  };

  const handleDeleteOfficer = async (officer) => {
    if (!window.confirm(`คุณแน่ใจหรือไม่ที่จะลบ ${officer.firstname} ${officer.lastname}?`)) return;
    try {
      const response = await fetch(`${CONFIG.OFFICERS_API}/${officer.id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ admin_user_id: user.id }),
      });
      const data = await response.json();
      if (data.success) {
        fetchAllOfficers();
        success('ลบข้อมูลสำเร็จ');
      } else {
        throw new Error(data.message || 'ไม่สามารถลบข้อมูลได้');
      }
    } catch (err) {
      console.error("Error deleting officer:", err);
      error(`เกิดข้อผิดพลาดในการลบข้อมูล: ${err.message}`);
    }
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
          onClick={fetchAllOfficers}
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
            placeholder="สังกัด/หน่วยงาน..."
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

    const availableRoles = ['member', 'scheduler', 'supervisor', 'admin'];
    const availableStatuses = ['active', 'pending', 'inactive', 'rejected', 'deleted'];

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-1">
          <label className="block text-sm font-medium text-slate-700">คำนำหน้า</label>
          <input name="prefix" type="text" value={formData.prefix} onChange={handleChange} className="mt-1 w-full p-2 border border-slate-300 rounded-lg" />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-slate-700">ชื่อ</label>
          <input name="firstname" type="text" value={formData.firstname} onChange={handleChange} className="mt-1 w-full p-2 border border-slate-300 rounded-lg" required />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700">นามสกุล</label>
        <input name="lastname" type="text" value={formData.lastname} onChange={handleChange} className="mt-1 w-full p-2 border border-slate-300 rounded-lg" required />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700">ตำแหน่ง</label>
        <input name="position" type="text" value={formData.position} onChange={handleChange} className="mt-1 w-full p-2 border border-slate-300 rounded-lg" />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700">สังกัด/หน่วยงาน</label>
        <input name="department" type="text" value={formData.department} onChange={handleChange} className="mt-1 w-full p-2 border border-slate-300 rounded-lg" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700">สิทธิ์ (Role)</label>
          <select name="role" value={formData.role} onChange={handleChange} className="mt-1 w-full p-2 border border-slate-300 rounded-lg">
            {availableRoles.map(role => (
              <option key={role} value={role}>{role}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">สถานะ</label>
          <select name="status" value={formData.status} onChange={handleChange} className="mt-1 w-full p-2 border border-slate-300 rounded-lg">
            {availableStatuses.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex justify-end space-x-2 pt-4 border-t border-slate-200">
        <button type="button" onClick={onCancel} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200">ยกเลิก</button>
        <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center space-x-2">
          <Save className="w-4 h-4" />
          <span>บันทึก</span>
        </button>
      </div>
    </form>
  );
};

// --- Component: Activity Logs Section ---
const ActivityLogs = () => {
  const { warning } = useAlert();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ search: "", startDate: "", endDate: "" });

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        search: filters.search,
        startDate: filters.startDate,
        endDate: filters.endDate,
      });
      const response = await fetch(`${CONFIG.LOGS_API}?${params.toString()}`);
      const result = await response.json();

      if (result.success) {
        setLogs(result.data);
      } else {
        console.error("API Error:", result.message);
        setLogs([]);
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
    if (logs.length === 0) return warning('ไม่มีข้อมูลสำหรับ Export');
    const headers = ['เวลา', 'ผู้ใช้งาน', 'กิจกรรม', 'รายละเอียด', 'IP Address'];
    const rows = logs.map(log => [
        log.timestamp,
        log.full_name || log.username || 'N/A',
        ACTION_TRANSLATIONS[log.action] || log.action,
        log.details || '',
        log.ip_address || ''
    ]);
    const csvContent = [headers, ...rows].map(row => row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(',')).join('\\n');
    const blob = new Blob(['\\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `activity_logs_${new Date().toLocaleDateString('th-TH').replace(/\//g, '-')}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  }, [logs]);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-slate-800">บันทึกกิจกรรมระบบ</h2>
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

// --- Component: Database Manager (Admin) ---
const DatabaseManager = ({ user }) => {
  const { warning, error } = useAlert();
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedTable, setSelectedTable] = useState(null);
  const [newTableName, setNewTableName] = useState('');
  const [newColumnName, setNewColumnName] = useState('');
  const [newColumnType, setNewColumnType] = useState('text');

  const apiBase = CONFIG.API_BASE_URL || '';

  const fetchTables = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${apiBase}/admin/db/tables`);
      const data = await res.json();
      if (data && Array.isArray(data.tables)) setTables(data.tables);
      else setTables([]);
    } catch (err) {
      console.error('Error fetching tables', err);
      setTables([]);
    } finally {
      setLoading(false);
    }
  }, [apiBase]);

  useEffect(() => { fetchTables(); }, [fetchTables]);

  const handleCreateTable = async () => {
    if (!newTableName.trim()) return warning('กรุณาระบุชื่อฐานข้อมูล (table name)');
    try {
      const res = await fetch(`${apiBase}/admin/db/tables`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ table: newTableName })
      });
      const d = await res.json();
      if (d.success) { setNewTableName(''); fetchTables(); }
      else error(d.message || 'ไม่สามารถสร้างตารางได้');
    } catch (err) { console.error(err); error('เกิดข้อผิดพลาด'); }
  };

  const handleDropTable = async (table) => {
    if (!window.confirm(`ลบตาราง ${table} ?`)) return;
    try {
      const res = await fetch(`${apiBase}/admin/db/tables/${encodeURIComponent(table)}`, { method: 'DELETE' });
      const d = await res.json();
      if (d.success) fetchTables(); else error(d.message || 'ลบไม่สำเร็จ');
    } catch (err) { console.error(err); error('เกิดข้อผิดพลาด'); }
  };

  const handleAddColumn = async (table) => {
    if (!newColumnName.trim()) return warning('กรุณาระบุชื่อคอลัมน์');
    try {
      const res = await fetch(`${apiBase}/admin/db/tables/${encodeURIComponent(table)}/columns`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ column: newColumnName, type: newColumnType })
      });
      const d = await res.json();
      if (d.success) { setNewColumnName(''); setNewColumnType('text'); fetchTables(); }
      else error(d.message || 'ไม่สามารถเพิ่มคอลัมน์ได้');
    } catch (err) { console.error(err); error('เกิดข้อผิดพลาด'); }
  };

  const handleDropColumn = async (table, column) => {
    if (!window.confirm(`ลบคอลัมน์ ${column} จาก ${table} ?`)) return;
    try {
      const res = await fetch(`${apiBase}/admin/db/tables/${encodeURIComponent(table)}/columns/${encodeURIComponent(column)}`, { method: 'DELETE' });
      const d = await res.json();
      if (d.success) fetchTables(); else error(d.message || 'ลบคอลัมน์ไม่สำเร็จ');
    } catch (err) { console.error(err); error('เกิดข้อผิดพลาด'); }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">จัดการฐานข้อมูล</h2>
        <div className="flex items-center gap-2">
          <button onClick={fetchTables} className="px-3 py-2 bg-slate-100 rounded">รีเฟรช</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 space-y-3">
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm text-slate-600">ตารางทั้งหมด</div>
              <div className="text-sm text-slate-500">{tables.length} รายการ</div>
            </div>
            {loading ? (
              <div className="p-6 text-center">กำลังโหลด...</div>
            ) : (
              <div className="space-y-2">
                {tables.map(t => (
                  <div key={t.name} className="p-3 bg-slate-50 rounded flex items-center justify-between">
                    <div>
                      <div className="font-medium">{t.name}</div>
                      <div className="text-xs text-slate-500">{(t.columns||[]).length} คอลัมน์</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => setSelectedTable(t.name)} className="px-2 py-1 bg-white border rounded">ดูคอลัมน์</button>
                      <button onClick={() => handleDropTable(t.name)} className="px-2 py-1 bg-red-100 text-red-700 rounded">ลบ</button>
                    </div>
                  </div>
                ))}
                {tables.length === 0 && <div className="p-4 text-slate-500">ไม่มีตาราง</div>}
              </div>
            )}
          </div>

          {selectedTable && (
            <div className="bg-white border border-slate-200 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="font-medium">คอลัมน์: {selectedTable}</div>
                <button onClick={() => setSelectedTable(null)} className="text-slate-500">ปิด</button>
              </div>
              <div className="space-y-2">
                {(tables.find(x => x.name === selectedTable)?.columns || []).map(c => (
                  <div key={c.name} className="flex items-center justify-between p-2 bg-slate-50 rounded">
                    <div><strong>{c.name}</strong> <span className="text-xs text-slate-500">{c.type}</span></div>
                    <button onClick={() => handleDropColumn(selectedTable, c.name)} className="text-red-600 text-sm">ลบ</button>
                  </div>
                ))}
                {(tables.find(x => x.name === selectedTable)?.columns || []).length === 0 && <div className="text-slate-500">ไม่มีคอลัมน์</div>}
                <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-2">
                  <input placeholder="ชื่อคอลัมน์" value={newColumnName} onChange={e => setNewColumnName(e.target.value)} className="p-2 border rounded" />
                  <select value={newColumnType} onChange={e => setNewColumnType(e.target.value)} className="p-2 border rounded">
                    <option value="text">text</option>
                    <option value="integer">integer</option>
                    <option value="boolean">boolean</option>
                    <option value="timestamp">timestamp</option>
                  </select>
                  <button onClick={() => handleAddColumn(selectedTable)} className="px-3 py-2 bg-indigo-600 text-white rounded">เพิ่มคอลัมน์</button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-3">
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <div className="text-sm text-slate-600 mb-2">สร้างตารางใหม่</div>
            <input placeholder="ชื่อตาราง (table_name)" value={newTableName} onChange={e => setNewTableName(e.target.value)} className="w-full p-2 border rounded mb-2" />
            <div className="flex gap-2">
              <button onClick={handleCreateTable} className="px-3 py-2 bg-indigo-600 text-white rounded">สร้าง</button>
              <button onClick={() => setNewTableName('')} className="px-3 py-2 bg-slate-100 rounded">ยกเลิก</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Main Component: AdminPage ---
export default function AdminPage({ user }) {
  const { success, error, warning } = useAlert();
    const allTabs = [
      { key: 'approval', label: 'คำขออนุมัติ', icon: UserCheck, component: <UserApproval user={user} />, roles: ['super_admin', 'admin'] },
      { key: 'personnel', label: 'จัดการบุคลากร', icon: Users2, component: <PersonnelManagement user={user} />, roles: ['super_admin', 'admin'] },
      { key: 'logs', label: 'บันทึกกิจกรรม', icon: History, component: <ActivityLogs />, roles: ['super_admin', 'admin', 'supervisor'] },
    ];

    const visibleTabs = useMemo(() => {
        if (!user || !user.role) return [];
        if (user.role === 'super_admin' || user.role === 'admin') {
            return allTabs;
        }
        return allTabs.filter(tab => tab.roles.includes(user.role));
    }, [user]);

    const [activeTab, setActiveTab] = useState(visibleTabs[0]?.key || '');

    const activeComponent = useMemo(() => {
      const currentTab = visibleTabs.find(tab => tab.key === activeTab);
      return currentTab ? currentTab.component : <div className="text-slate-500">คุณไม่มีสิทธิ์เข้าถึงส่วนนี้</div>;
    }, [activeTab, visibleTabs]);

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center">
              <ShieldCheck className="w-6 h-6 mr-3 text-indigo-600" />
              แผงควบคุมความปลอดภัย
            </h1>
            <p className="text-slate-600">จัดการการเข้าถึงและตรวจสอบกิจกรรมในระบบ</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-slate-200">
          <nav className="flex space-x-1 overflow-x-auto pb-px">
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
        <div className="bg-slate-100 p-6 rounded-b-xl rounded-tr-xl border border-slate-200 min-h-[400px]">
          {activeComponent}
        </div>
      </div>
    );
}
