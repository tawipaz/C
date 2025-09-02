import React, { useState, useMemo, useCallback, memo, useEffect } from "react";
import {
  Calendar as CalendarIcon,
  Plus,
  ChevronLeft,
  ChevronRight,
  Filter,
  Search,
  Edit,
  Trash2,
  Save,
  X,
  Clock,
  Users,
  Building,
  FileText,
  Settings,
  Sun, Moon,
  File,
  Shield
} from 'lucide-react';
import { CONFIG } from '../config';

// --- ฟังก์ชันตรวจสอบวันหยุด ---
const isHoliday = (date, holidays = []) => {
    if (!date) return false;
    
    const dayOfWeek = date.getDay();
    const dateStr = date.toISOString().split('T')[0];
    
    if (dayOfWeek === 0 || dayOfWeek === 6) return true;
    
    return holidays.some(holiday => holiday.holiday_date === dateStr);
};

// --- ฟังก์ชันหา shift_type ตาม period และ holiday ---
const getShiftTypeByPeriod = (period, isHolidayDate, shiftTypes) => {
    console.log('=== getShiftTypeByPeriod ===');
    console.log('Period:', period);
    console.log('Is Holiday:', isHolidayDate);
    console.log('ShiftTypes:', shiftTypes);
    
    if (!Array.isArray(shiftTypes)) {
        console.log('ShiftTypes is not array');
        return null;
    }
    
    if (period === 'night') {
        const result = shiftTypes.find(type => type.id === 2 || type.id === 4);
        console.log('Night shift result:', result);
        return result;
    } else {
        if (isHolidayDate) {
            const result = shiftTypes.find(type => type.id === 3);
            console.log('Holiday day shift result:', result);
            return result;
        } else {
            const result = shiftTypes.find(type => type.id === 1);
            console.log('Regular day shift result:', result);
            return result;
        }
    }
};
// --- ฟังก์ชันสำหรับไอคอนในปฏิทิน ---
const getShiftIcon = (startTime, endTime, shiftCategory) => {
    if (!startTime) return null;
    
    const startHour = parseInt(startTime.split(':')[0], 10);
    const endHour = parseInt(endTime?.split(':')[0], 10);
    
    if (endHour < startHour) {
        return <Moon className="w-3 h-3 text-indigo-600 inline-block mr-1" />;
    }
    
    if (startHour >= 6 && startHour < 18) {
        if (shiftCategory === 'Out-of-hours') {
            return <Sun className="w-3 h-3 text-orange-600 inline-block mr-1" />;
        }
        return <Sun className="w-3 h-3 text-yellow-600 inline-block mr-1" />;
    }
    
    return <Moon className="w-3 h-3 text-indigo-600 inline-block mr-1" />;
};

// --- ฟังก์ชันสำหรับสีพื้นหลัง cell ---
const getCellClassName = (date, holidays) => {
    const baseClass = "min-h-[120px] border border-gray-200 p-2";
    
    if (!date) return baseClass;
    
    if (isHoliday(date, holidays)) {
        return baseClass + " bg-red-50 border-red-200";
    }
    
    return baseClass;
};

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
  const getDaysInMonth = (date) => {
      const year = date.getFullYear();
      const month = date.getMonth();
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);
      const daysInMonth = lastDay.getDate();
      const startingDayOfWeek = firstDay.getDay();
      const days = [];
      for (let i = 0; i < startingDayOfWeek; i++) {
          days.push(null);
      }
      for (let day = 1; day <= daysInMonth; day++) {
          days.push(new Date(year, month, day));
      }
      return days;
  };

  const getSchedulesForDate = (date) => {
      if (!date) return [];
      const dateStr = date.toISOString().split('T')[0];
      return schedules.filter(schedule => schedule.duty_date === dateStr);
  };

  const formatDate = (date) => {
      return date.toLocaleDateString('th-TH', {
          year: 'numeric',
          month: 'long'
      });
  };

  return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1">
                      <button onClick={() => navigateMonth(-1)} className="p-2 hover:bg-gray-100 rounded-lg">
                          <ChevronLeft className="w-4 h-4" />
                      </button>
                      <h2 className="text-lg font-semibold text-gray-900 min-w-0 px-3">
                          {formatDate(currentDate)}
                      </h2>
                      <button onClick={() => navigateMonth(1)} className="p-2 hover:bg-gray-100 rounded-lg">
                          <ChevronRight className="w-4 h-4" />
                      </button>
                  </div>
                  <button onClick={goToToday} className="px-3 py-1 text-sm font-medium text-indigo-600 hover:bg-indigo-50 rounded-lg">
                      วันนี้
                  </button>
              </div>
          </div>

          <div className="flex items-center space-x-4 mb-4">
              <div className="flex items-center space-x-2">
                  <Filter className="w-4 h-4 text-gray-500" />
                  <select
                      value={filters.unit}
                      onChange={(e) => setFilters(prev => ({ ...prev, unit: e.target.value }))}
                      className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  >
                    <option value="">ทุกส่วนงาน</option>
                    {Array.isArray(units) && units.map(unit => (
                        <option key={unit.id} value={unit.id}>{unit.unit_name}</option>
                    ))}
                </select>
              </div>
              <div className="flex items-center space-x-2">
                  <Search className="w-4 h-4 text-gray-500" />
                  <input
                      type="text"
                      placeholder="ค้นหาเจ้าหน้าที่..."
                      value={filters.officer}
                      onChange={(e) => setFilters(prev => ({ ...prev, officer: e.target.value }))}
                      className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  />
              </div>
          </div>

          <div className="flex items-center space-x-4 mb-4 text-xs">
              <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-red-100 border border-red-200 rounded"></div>
                  <span className="text-gray-600">วันหยุด</span>
              </div>
              <div className="flex items-center space-x-1">
                  <Sun className="w-3 h-3 text-yellow-600" />
                  <span className="text-gray-600">เวรปกติ</span>
              </div>
              <div className="flex items-center space-x-1">
                  <Sun className="w-3 h-3 text-orange-600" />
                  <span className="text-gray-600">เวรวันหยุด</span>
              </div>
              <div className="flex items-center space-x-1">
                  <Moon className="w-3 h-3 text-indigo-600" />
                  <span className="text-gray-600">เวรกลางคืน</span>
              </div>
          </div>

          <div className="grid grid-cols-7 gap-1">
              {['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'].map((day, index) => (
                  <div key={index} className="p-3 text-center text-sm font-medium text-gray-600 border-b">
                      {day}
                  </div>
              ))}
              {getDaysInMonth(currentDate).map((date, index) => (
                  <div key={index} className={getCellClassName(date, holidays)}>
                      {date && (
                          <>
                              <div className="flex items-center justify-between mb-2">
                                  <span className="text-sm font-medium text-gray-900">{date.getDate()}</span>
                                  {isHoliday(date, holidays) && (
                                      <span className="text-xs text-red-600 font-medium">หยุด</span>
                                  )}
                              </div>
                              <div className="space-y-1">
                                  {getSchedulesForDate(date).map((schedule) => (
                                    <div
                                        key={schedule.id}
                                        onClick={() => openEditModal(schedule)}
                                        className={`text-xs p-1 rounded cursor-pointer hover:opacity-80 ${schedule.shift_category === 'In-hours' ? 'bg-blue-100 text-blue-800' : 'bg-indigo-100 text-indigo-800'}`}
                                    >
                                        <div className="font-medium truncate">
                                            {getShiftIcon(schedule.start_time, schedule.end_time, schedule.shift_category)}
                                            {schedule.shift_type_name}
                                        </div>
                                        <div className="truncate">{schedule.officer_names}</div>
                                        {schedule.unit_name && <div className="truncate text-xs opacity-75">{schedule.unit_name}</div>}
                                    </div>
                                ))}
                              </div>
                              <button 
                                  onClick={() => openAddModal(date)} 
                                  className="w-full mt-1 text-xs text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded px-1 py-0.5"
                              >
                                  + เพิ่มเวร
                              </button>
                          </>
                      )}
                  </div>
              ))}
          </div>
      </div>
  );
};

const DocumentManagementView = () => {
  return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center min-h-[400px] flex flex-col justify-center items-center">
          <FileText className="w-16 h-16 text-slate-300 mb-4" />
          <h2 className="text-xl font-semibold text-slate-800">จัดการเอกสาร</h2>
          <p className="text-slate-500 mt-2">🚧 ส่วนนี้ยังอยู่ระหว่างการพัฒนา 🚧</p>
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
    const fetchHolidays = async () => {
      try {
        // !!! สำคัญ: URL '/api/holidays' นี้เป็นตัวอย่าง ให้เปลี่ยนเป็น URL จริงของคุณ
        const response = await fetch('/api/holidays?year=' + currentDate.getFullYear());
        const data = await response.json();
        setHolidays(data); // เก็บข้อมูลวันหยุดที่ได้มาใน state
      } catch (error) {
        console.error("ล้มเหลวในการดึงข้อมูลวันหยุด:", error);
      }
    };

    fetchHolidays();
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
      console.error('Error loading initial data:', error);
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
          console.error('Error loading schedules:', error);
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
    
    console.log('Date:', dateObj);
    console.log('Is holiday:', isHolidayDate);
    console.log('Holidays data:', holidays);
    console.log('ShiftTypes data:', shiftTypes);
    
    const suggestedType = getShiftTypeByPeriod('day', isHolidayDate, shiftTypes);
    console.log('Suggested type:', suggestedType);
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
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">งานและเวร</h1>
          <p className="text-sm text-gray-600 mt-1">จัดการตารางเวรและเอกสารที่เกี่ยวข้อง</p>
        </div>
        <div className="flex items-center space-x-3">
          {activeTab === 'shifts' && (
            <button
                onClick={() => openAddModal()}
                className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700"
            >
                <Plus className="w-4 h-4 mr-2" />
                เพิ่มเวร
            </button>
          )}
        </div>
      </div>

      <div className="border-b border-slate-200">
        <nav className="flex space-x-4">
            <button
                onClick={() => setActiveTab('shifts')}
                className={`flex items-center space-x-2 py-2 px-3 rounded-t-lg font-medium text-sm whitespace-nowrap ${
                    activeTab === 'shifts' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-slate-500 hover:text-slate-700'
                }`}
            >
                <Shield className="w-4 h-4" />
                <span>เวรรักษาการ</span>
            </button>
            <button
                onClick={() => setActiveTab('documents')}
                className={`flex items-center space-x-2 py-2 px-3 rounded-t-lg font-medium text-sm whitespace-nowrap ${
                    activeTab === 'documents' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-slate-500 hover:text-slate-700'
                }`}
            >
                <File className="w-4 h-4" />
                <span>จัดการเอกสาร</span>
            </button>
        </nav>
      </div>
      
      <div>
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
        {activeTab === 'documents' && <DocumentManagementView />}
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