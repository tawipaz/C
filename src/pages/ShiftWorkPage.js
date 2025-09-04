import React, { useState, useEffect, useMemo, memo } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar, 
  Filter, 
  Plus, 
  Shield, 
  Save, 
  Edit, 
  Trash2, 
  Search, 
  X, 
  Moon, 
  Sun, 
  Users, 
  Briefcase,
  Crown,
  Star,
  User
} from 'lucide-react';
import { CONFIG } from '../config';
import UnitStructureManagement from '../components/UnitStructure/UnitStructureManagement';

// Helper functions
const getDaysInMonth = (date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
const getFirstDayOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();
const isToday = (date, today) => date.toDateString() === today.toDateString();
const isSameDay = (date1, date2) => date1.toDateString() === date2.toDateString();
const isHoliday = (date, holidays) => holidays.some(holiday => isSameDay(new Date(holiday.date + 'T00:00:00'), date));
const getShiftTypeByPeriod = (period, isHolidayDate, shiftTypes) => shiftTypes.find(st => st.type_name === (period === 'day' ? (isHolidayDate ? 'วันหยุด (กลางวัน)' : 'ปกติ (กลางวัน)') : 'ปกติ (กลางคืน)'));

const getRoleIcon = (role) => {
  switch (role) {
    case 'director': return <Crown className="w-4 h-4 text-purple-600" />;
    case 'supervisor': return <Star className="w-4 h-4 text-blue-600" />;
    default: return <User className="w-4 h-4 text-green-600" />;
  }
};

const getRoleLabel = (role) => {
  switch (role) {
    case 'director': return 'ผู้อำนวยการ';
    case 'supervisor': return 'หัวหน้าส่วน';
    default: return 'เจ้าหน้าที่';
  }
};

const getRoleBadgeClass = (role) => {
  switch (role) {
    case 'director': return 'bg-purple-100 text-purple-700';
    case 'supervisor': return 'bg-blue-100 text-blue-700';
    default: return 'bg-green-100 text-green-700';
  }
};

const CalendarDayCell = memo(({ date, holidays, schedules, onAdd, onEdit }) => {
  const today = new Date();
  const isHolidayDate = isHoliday(date, holidays);
  const daySchedules = schedules.filter(schedule => isSameDay(new Date(schedule.duty_date + 'T00:00:00'), date));

  return (
    <div 
      className={`min-h-[120px] border border-slate-200 p-1 cursor-pointer hover:bg-slate-50 ${
        isToday(date, today) ? 'bg-indigo-50 border-indigo-300' : ''
      } ${isHolidayDate ? 'bg-red-50' : ''}`}
      onClick={() => onAdd(date)}
    >
      <div className="flex justify-between items-start mb-1">
        <span className={`text-sm font-medium ${
          isToday(date, today) ? 'text-indigo-600' : 
          isHolidayDate ? 'text-red-600' : 'text-slate-700'
        }`}>
          {date.getDate()}
        </span>
        {isHolidayDate && <span className="text-xs text-red-500">หยุด</span>}
      </div>
      
      <div className="space-y-1">
        {daySchedules.map(schedule => (
          <ScheduleItem key={schedule.id} schedule={schedule} onEdit={onEdit} />
        ))}
      </div>
    </div>
  );
});

const ScheduleItem = memo(({ schedule, onEdit }) => (
  <div 
    className="text-xs p-1 bg-indigo-100 text-indigo-800 rounded truncate cursor-pointer hover:bg-indigo-200"
    onClick={(e) => { e.stopPropagation(); onEdit(schedule); }}
    title={`${schedule.shift_type_name} - ${schedule.officer_names || 'ไม่ระบุเจ้าหน้าที่'} ${schedule.notes ? `(${schedule.notes})` : ''}`}
  >
    {schedule.shift_type_name} - {schedule.officer_names || 'ไม่ระบุ'}
  </div>
));

const ShiftCalendarView = ({ 
  currentDate, 
  schedules, 
  officers, 
  shiftTypes, 
  units, 
  holidays, 
  filters, 
  setFilters, 
  navigateMonth, 
  goToToday, 
  openAddModal, 
  openEditModal 
}) => {
  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  const today = new Date();
  
  const monthDays = useMemo(() => {
    const days = [];
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(currentDate.getFullYear(), currentDate.getMonth(), i));
    }
    return days;
  }, [currentDate, daysInMonth]);

  const emptyDays = Array.from({ length: firstDay }, (_, i) => i);

  return (
    <div className="space-y-4">
      {/* Calendar Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => navigateMonth(-1)}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-semibold text-slate-800 min-w-[200px] text-center">
              {currentDate.toLocaleDateString('th-TH', { year: 'numeric', month: 'long' })}
            </h2>
            <button 
              onClick={() => navigateMonth(1)}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
          <button 
            onClick={goToToday}
            className="px-3 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            วันนี้
          </button>
        </div>
        
        {/* Filters */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-slate-500" />
            <select 
              value={filters.unit}
              onChange={(e) => setFilters(prev => ({ ...prev, unit: e.target.value }))}
              className="text-sm border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="">ทุกส่วนงาน</option>
              {units.map(unit => (
                <option key={unit.id} value={unit.id}>{unit.unit_name}</option>
              ))}
            </select>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="ค้นหาเจ้าหน้าที่..."
              value={filters.officer}
              onChange={(e) => setFilters(prev => ({ ...prev, officer: e.target.value }))}
              className="pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        {/* Days of week header */}
        <div className="grid grid-cols-7 bg-slate-50 border-b border-slate-200">
          {['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์'].map(day => (
            <div key={day} className="p-3 text-center text-sm font-medium text-slate-600">
              {day}
            </div>
          ))}
        </div>
        
        {/* Calendar body */}
        <div className="grid grid-cols-7">
          {/* Empty cells for days before month starts */}
          {emptyDays.map(day => (
            <div key={`empty-${day}`} className="min-h-[120px] border border-slate-200 bg-slate-50"></div>
          ))}
          
          {/* Month days */}
          {monthDays.map(date => (
            <CalendarDayCell
              key={date.toISOString()}
              date={date}
              holidays={holidays}
              schedules={schedules}
              onAdd={openAddModal}
              onEdit={openEditModal}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

const ShiftWorkPage = () => {
  const [activeTab, setActiveTab] = useState('shifts');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [schedules, setSchedules] = useState([]);
  const [officers, setOfficers] = useState([]);
  const [shiftTypes, setShiftTypes] = useState([]);
  const [units, setUnits] = useState([]);
  const [holidays, setHolidays] = useState([]);
  const [formData, setFormData] = useState({ duty_date: '', shift_type_id: '', unit_id: '', officer_ids: [], notes: '' });
  const [filters, setFilters] = useState({ unit: '', officer: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedShiftPeriod, setSelectedShiftPeriod] = useState('day');
  const [selectedUnits, setSelectedUnits] = useState([]);
  const [selectedOfficers, setSelectedOfficers] = useState([]);
  const [showOfficerList, setShowOfficerList] = useState(false);
  const [officerSearchTerm, setOfficerSearchTerm] = useState('');

  useEffect(() => {
    const loadHolidaysByYear = async () => {
      try {
        const response = await fetch(`${CONFIG.SCHEDULES_API}?action=get_holidays&year=${currentDate.getFullYear()}`);
        const result = await response.json();
        if (result.success && Array.isArray(result.data)) {
          setHolidays(result.data);
        } else {
          console.warn('No holidays data available');
          setHolidays([]);
        }
      } catch (error) {
        console.error("ล้มเหลวในการดึงข้อมูลวันหยุด:", error);
        setHolidays([]);
      }
    };

    loadHolidaysByYear();
  }, [currentDate]);

  useEffect(() => {
    if (selectedUnits.length > 0 && Array.isArray(officers)) {
      const officersInSelectedUnits = officers
        .filter(officer => officer.unit_id && selectedUnits.includes(officer.unit_id))
        .map(officer => officer.id);

      setSelectedOfficers(officersInSelectedUnits);
    } else {
      setSelectedOfficers([]);
    }
  }, [selectedUnits, officers]);

  // --- ฟังก์ชันจัดการการเลือกส่วนงาน ---
  const handleUnitSelect = (unitId) => {
    setSelectedUnits(prev =>
      prev.includes(unitId)
        ? prev.filter(id => id !== unitId)
        : [...prev, unitId]
    );
  };

  // --- ฟังก์ชันจัดการการเลือกเจ้าหน้าที่ ---
  const handleOfficerAdd = (officerId) => {
    setSelectedOfficers(prev => [...prev, officerId]);
  };

  const handleOfficerRemove = (officerId) => {
    setSelectedOfficers(prev => prev.filter(id => id !== officerId));
  };

  // --- ฟังก์ชันกรองเจ้าหน้าที่ที่ยังไม่ได้เลือก ---
  const getAvailableOfficers = () => {
    if (!Array.isArray(officers)) return [];

    return officers.filter(officer =>
      officer.unit_id !== null &&
      (selectedUnits.length === 0 || selectedUnits.includes(officer.unit_id)) &&
      !selectedOfficers.includes(officer.id) &&
      (officerSearchTerm === '' ||
        `${officer.firstname} ${officer.lastname}`.toLowerCase().includes(officerSearchTerm.toLowerCase()))
    );
  };

  // --- ฟังก์ชันหาข้อมูลเจ้าหน้าที่ ---
  const getOfficerById = (officerId) => {
    return officers.find(o => o.id === officerId);
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    loadSchedules();
  }, [currentDate]);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadOfficers(),
        loadShiftTypes(),
        loadUnits(),
        loadHolidays(),
        loadSchedules()
      ]);
    } catch (error) {
      console.error('Error loading initial data:', error.message, error.stack);
    } finally {
      setLoading(false);
    }
  };

  const loadSchedules = async () => {
    try {
      const month = currentDate.getMonth() + 1;
      const year = currentDate.getFullYear();
      const response = await fetch(`${CONFIG.SCHEDULES_API}?action=get_all_schedules&month=${month}&year=${year}`);
      const data = await response.json();
      if (data.success) {
        setSchedules(data.data);
      } else {
        console.error('Failed to fetch schedules:', data.message);
      }
    } catch (error) {
      console.error('Error loading schedules:', error.message, error.stack);
    }
  };

  const loadOfficers = async () => {
    try {
      const response = await fetch(`${CONFIG.OFFICERS_API}?action=get_all_officers`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (data && data.success && Array.isArray(data.data)) {
        setOfficers(data.data);
      } else {
        console.error('Failed to load officers:', data);
        setOfficers([]);
      }
    } catch (error) {
      console.error('Error loading officers:', error);
      setOfficers([]);
    }
  };

  const loadShiftTypes = async () => {
    try {
      const response = await fetch(`${CONFIG.SCHEDULES_API}?action=get_all_shifttypes`);
      const data = await response.json();
      if (Array.isArray(data)) {
        setShiftTypes(data);
      } else {
        setShiftTypes([]);
      }
    } catch (error) {
      console.error('Error loading shift types:', error);
      setShiftTypes([]);
    }
  };

  const loadUnits = async () => {
      try {
          const response = await fetch(`${CONFIG.SCHEDULES_API}?action=get_all_units`);
    const data = await response.json();
          if (Array.isArray(data)) {
              setUnits(data);
          } else {
              setUnits([]);
          }
      } catch (error) {
          console.error('Error loading units:', error);
          setUnits([]);
      }
  };

  const loadHolidays = async () => {
      try {
          const response = await fetch(`${CONFIG.SCHEDULES_API}?action=get_holidays`);
    const data = await response.json();
          if (Array.isArray(data)) {
              setHolidays(data);
          } else {
              setHolidays([]);
          }
      } catch (error) {
          console.error('Error loading holidays:', error);
          setHolidays([]);
      }
  };

  const navigateMonth = (direction) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + direction);
      return newDate;
    });
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // --- แก้ไข openAddModal ---
  const openAddModal = (date = null) => {
    const dateObj = date || new Date();
    const isHolidayDate = isHoliday(dateObj, holidays);

    const suggestedType = getShiftTypeByPeriod('day', isHolidayDate, shiftTypes);
    setSelectedShiftPeriod('day');
    setSelectedUnits([]);
    setSelectedOfficers([]);
    setFormData({
      duty_date: date ? date.toISOString().split('T')[0] : '',
      shift_type_id: suggestedType?.id || '',
      unit_id: '',
      officer_ids: [],
      notes: ''
    });
    setShowAddModal(true);
  };

  const openEditModal = (schedule) => {
    setSelectedSchedule(schedule);
    setFormData({
      duty_date: schedule.duty_date,
      shift_type_id: schedule.shift_type_id,
      unit_id: schedule.unit_id || '',
      officer_ids: schedule.officer_ids || [],
      notes: schedule.notes || ''
    });
    setSelectedOfficers(schedule.officer_ids || []);
    setShowEditModal(true);
  };

  const closeModals = () => {
    setShowAddModal(false);
    setShowEditModal(false);
    setSelectedSchedule(null);
    setSelectedShiftPeriod('day');
    setSelectedUnits([]);
    setSelectedOfficers([]);
    setShowOfficerList(false);
    setOfficerSearchTerm('');
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // อัปเดต shift_type_id และ officer_ids ตาม UI ใหม่
      const dateObj = new Date(formData.duty_date + 'T00:00:00');
      const isHolidayDate = isHoliday(dateObj, holidays);
      const shiftType = getShiftTypeByPeriod(selectedShiftPeriod, isHolidayDate, shiftTypes);

      const payload = {
        action: selectedSchedule ? 'update_schedule' : 'create_schedule',
        ...formData,
        shift_type_id: shiftType?.id || formData.shift_type_id,
        officer_ids: selectedOfficers,
        ...(selectedSchedule && { schedule_id: selectedSchedule.id })
      };

      const response = await fetch(CONFIG.SCHEDULES_API, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const result = await response.json();
      if (!result.success) throw new Error(result.message);
      await loadSchedules();
      closeModals();
    } catch (error) {
      console.error('Error saving schedule:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedSchedule || !window.confirm('คุณแน่ใจหรือไม่ที่จะลบตารางเวรนี้?')) return;
    setSaving(true);
    try {
      const payload = { action: 'delete_schedule', schedule_id: selectedSchedule.id };
      const response = await fetch(CONFIG.SCHEDULES_API, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const result = await response.json();
      if (!result.success) throw new Error(result.message);
      await loadSchedules();
      closeModals();
    } catch (error) {
      console.error('Error deleting schedule:', error);
    } finally {
      setSaving(false);
    }
  };

  const filteredSchedules = useMemo(() => {
    return schedules.filter(schedule => {
      const unitMatch = !filters.unit || schedule.unit_id === parseInt(filters.unit);
      const officerMatch = !filters.officer ||
        (schedule.officer_names && schedule.officer_names.toLowerCase().includes(filters.officer.toLowerCase()));
      return unitMatch && officerMatch;
    });
  }, [schedules, filters]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="border-b border-slate-200">
        <nav className="flex space-x-4 px-4">
          <button
            onClick={() => setActiveTab('shifts')}
            className={`flex items-center space-x-2 py-3 px-3 rounded-t-lg font-medium text-sm whitespace-nowrap ${activeTab === 'shifts' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-slate-500 hover:text-slate-700'
              }`}
          >
            <Shield className="w-4 h-4" />
            <span>เวรรักษาการ</span>
          </button>
          <button
            onClick={() => setActiveTab('documents')}
                className={`flex items-center space-x-2 py-3 px-3 rounded-t-lg font-medium text-sm whitespace-nowrap ${
                    activeTab === 'documents' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-slate-500 hover:text-slate-700'
              }`}
          >
            <Briefcase className="w-4 h-4" />
            <span>จัดการโครงสร้าง</span>
          </button>
        </nav>
      </div>

      <div className="flex-grow p-4 bg-slate-50/50 overflow-y-auto">
        {activeTab === 'shifts' && (
          <ShiftCalendarView
            currentDate={currentDate}
            schedules={filteredSchedules}
            officers={officers}
            shiftTypes={shiftTypes}
            units={units}
            holidays={holidays}
            filters={filters}
            setFilters={setFilters}
            navigateMonth={navigateMonth}
            goToToday={goToToday}
            openAddModal={openAddModal}
            openEditModal={openEditModal}
          />
        )}
        {activeTab === 'documents' && <UnitStructureManagement />}
      </div>

      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-900">
                {showEditModal ? 'แก้ไขตารางเวร' : 'เพิ่มตารางเวรใหม่'}
              </h3>
              {formData.duty_date && (
                <p className="text-sm text-gray-600 mt-1">
                  วันที่ {new Date(formData.duty_date + 'T00:00:00').toLocaleDateString('th-TH')}
                  {isHoliday(new Date(formData.duty_date + 'T00:00:00'), holidays) &&
                    <span className="ml-2 px-2 py-0.5 bg-red-100 text-red-600 text-xs rounded-full">วันหยุด</span>
                  }
                </p>
              )}
            </div>

            <div className="p-6 space-y-6">
              {/* วันที่ */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">วันที่</label>
                <input
                  type="date"
                  value={formData.duty_date}
                  onChange={(e) => {
                    handleInputChange('duty_date', e.target.value);
                    // อัปเดต shift type อัตโนมัติเมื่อเปลี่ยนวันที่
                    const newDate = new Date(e.target.value + 'T00:00:00');
                    const isHol = isHoliday(newDate, holidays);
                    const suggestedType = getShiftTypeByPeriod(selectedShiftPeriod, isHol, shiftTypes);
                    setFormData(prev => ({ ...prev, shift_type_id: suggestedType?.id || '' }));
                  }}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>

              {/* เลือกช่วงเวร */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">ช่วงเวร</label>
                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedShiftPeriod('day');
                      const isHol = formData.duty_date ? isHoliday(new Date(formData.duty_date + 'T00:00:00'), holidays) : false;
                                            const suggestedType = getShiftTypeByPeriod('day', isHol, shiftTypes);
                                            setFormData(prev => ({ ...prev, shift_type_id: suggestedType?.id || '' }));
                    }}
                    className={`flex items-center px-4 py-2 rounded-lg border ${
                        selectedShiftPeriod === 'day' 
                        ? 'bg-yellow-50 border-yellow-300 text-yellow-700'
                        : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                  >
                    <Sun className="w-4 h-4 mr-2" />
                    กลางวัน
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedShiftPeriod('night');
                      const suggestedType = getShiftTypeByPeriod('night', false, shiftTypes);
                      setFormData(prev => ({ ...prev, shift_type_id: suggestedType?.id || '' }));
                    }}
                    className={`flex items-center px-4 py-2 rounded-lg border ${
                        selectedShiftPeriod === 'night' 
                        ? 'bg-indigo-50 border-indigo-300 text-indigo-700'
                        : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                  >
                    <Moon className="w-4 h-4 mr-2" />
                    กลางคืน
                  </button>
                </div>
              </div>

              {/* เลือกส่วนงาน (เช็คลิส) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">ส่วนงาน</label>
                <div className="border border-gray-300 rounded-lg p-4 max-h-40 overflow-y-auto">
                  <div className="grid grid-cols-2 gap-2">
                    {Array.isArray(units) && units.map(unit => (
                      <label key={unit.id} className="flex items-center py-1">
                        <input
                          type="checkbox"
                                    checked={selectedUnits.includes(unit.id)}
                                    onChange={() => handleUnitSelect(unit.id)}
                                    className="h-4 w-4 text-indigo-600"
                        />
                        <span className="ml-2 text-sm text-gray-900">{unit.unit_name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* เจ้าหน้าที่ที่เลือกแล้ว */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">เจ้าหน้าที่ที่เลือก</label>
                <div className="border border-gray-300 rounded-lg p-3 min-h-[100px]">
                  {selectedOfficers.length === 0 ? (
                    <p className="text-gray-500 text-sm">ยังไม่ได้เลือกเจ้าหน้าที่</p>
                  ) : (
                    <div className="space-y-2">
                      {selectedOfficers.map(officerId => {
                        const officer = getOfficerById(officerId);
                        return officer ? (
                          <div key={officerId} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-lg">
                            <span className="text-sm">{officer.prefix} {officer.firstname} {officer.lastname}</span>
                            <button
                              onClick={() => handleOfficerRemove(officerId)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : null;
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* เพิ่มเจ้าหน้าที่ */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium text-gray-700">จัดการเจ้าหน้าที่</label>
                  <button
                    type="button"
                    onClick={() => setShowOfficerList(!showOfficerList)}
                    className="text-sm text-indigo-600 hover:text-indigo-800"
                  >
                    {showOfficerList ? 'ซ่อน' : 'เพิ่มเจ้าหน้าที่'}
                  </button>
                </div>

                {showOfficerList && (
                  <div className="border border-gray-300 rounded-lg p-3">
                    {/* ช่องค้นหา */}
                    <div className="mb-3">
                      <div className="flex items-center space-x-2">
                        <Search className="w-4 h-4 text-gray-500" />
                        <input
                          type="text"
                          placeholder="ค้นหาชื่อเจ้าหน้าที่..."
                          value={officerSearchTerm}
                          onChange={(e) => setOfficerSearchTerm(e.target.value)}
                          className="flex-1 border border-gray-300 rounded px-2 py-1 text-sm"
                        />
                      </div>
                    </div>

                    {/* รายชื่อเจ้าหน้าที่ */}
                    <div className="max-h-40 overflow-y-auto">
                      {getAvailableOfficers().length === 0 ? (
                        <p className="text-gray-500 text-sm">
                          {selectedUnits.length === 0 ? 'กรุณาเลือกส่วนงานก่อน' :
                            officerSearchTerm ? 'ไม่พบเจ้าหน้าที่ที่ค้นหา' : 'ไม่มีเจ้าหน้าที่ที่สามารถเลือกได้'}
                                        </p>
                      ) : (
                        <div className="space-y-1">
                          {getAvailableOfficers().map(officer => (
                            <div key={officer.id} className="flex items-center justify-between py-2 hover:bg-gray-50 px-2 rounded">
                              <span className="text-sm">{officer.prefix} {officer.firstname} {officer.lastname}</span>
                              <button
                                onClick={() => {
                                  handleOfficerAdd(officer.id);
                                  setOfficerSearchTerm(''); // ล้างค่าค้นหาหลังเพิ่ม
                                }}
                                className="text-indigo-600 hover:text-indigo-800 p-1 rounded hover:bg-indigo-50"
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* หมายเหตุ */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">หมายเหตุ</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="รายละเอียดเพิ่มเติม..."
                />
              </div>
            </div>

            <div className="p-6 border-t bg-gray-50 flex justify-between">
              <div>
                {showEditModal && (
                  <button
                    onClick={handleDelete}
                    disabled={saving}
                    className="inline-flex items-center px-4 py-2 border border-red-300 text-sm font-medium rounded-lg text-red-700 bg-red-50 hover:bg-red-100"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />ลบเวร
                  </button>
                )}
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={closeModals}
                  disabled={saving}
                  className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50"
                >
                  ยกเลิก
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving || selectedOfficers.length === 0}
                  className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      กำลังบันทึก...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />บันทึก
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShiftWorkPage;
