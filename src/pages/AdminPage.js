import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  ShieldCheck, History, UserCheck, UserX, Search, Download, Check, X, RefreshCw,
  Shield, Users, Edit2, Trash2, Save, Crown, UserCog, Users2, KeyRound
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

// --- Component: User Approval Section ---
const UserApproval = ({ user }) => {
  const [pendingUsers, setPendingUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const fetchPendingUsers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`${CONFIG.OFFICERS_API}?action=get_pending_users`);
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
        <h2 className="text-xl font-semibold text-slate-800">จัดการบัญชีผู้ใช้ ({officers.length})</h2>
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
        <h2 className="text-xl font-semibold text-slate-800">จัดการสิทธิ์ผู้ใช้</h2>
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
      const response = await fetch(`${CONFIG.OFFICERS_API}?${params.toString()}`);
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
    if (logs.length === 0) return alert('ไม่มีข้อมูลสำหรับ Export');
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
    link.download = `activity_logs_${new Date().toLocaleDateString('th-TH').replace(/\\//g, '-')}.csv`;
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

// --- Main Component: AdminPage ---
export default function AdminPage({ user }) {
    const allTabs = [
      { key: 'approval', label: 'คำขออนุมัติ', icon: UserCheck, component: <UserApproval user={user} />, roles: ['super_admin', 'admin'] },
      { key: 'personnel', label: 'จัดการบัญชี', icon: Users2, component: <PersonnelManagement user={user} />, roles: ['super_admin', 'admin'] },
      { key: 'roles', label: 'จัดการสิทธิ์', icon: KeyRound, component: <RoleManagement user={user}/>, roles: ['super_admin', 'admin']},
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
