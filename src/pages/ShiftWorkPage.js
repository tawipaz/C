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
  Shield,
  CloudSun,
  Target
} from 'lucide-react';
import { CONFIG } from '../config';

// --- ฟังก์ชันตรวจสอบวันหยุด ---
const isHoliday = (date, holidays = []) => {
  if (!date) return false;
  const dayOfWeek = date.getDay();
  if (dayOfWeek === 0 || dayOfWeek === 6) return true;
  const dateStr = date.toISOString().split('T')[0];
  return holidays.some(holiday => holiday.holiday_date === dateStr);
};

const isToday = (date) => {
  if (!date) return false;
  const today = new Date();
  return date.getDate() === today.getDate() &&
         date.getMonth() === today.getMonth() &&
         date.getFullYear() === today.getFullYear();
};

// --- ฟังก์ชันหา shift_type ตาม period และ holiday ---
const getShiftTypeByPeriod = (period, isHolidayDate, shiftTypes) => {
  if (!Array.isArray(shiftTypes)) return null;
  if (period === 'night') {
    return shiftTypes.find(type => type.id === 2 || type.id === 4);
  } else {
    return isHolidayDate 
      ? shiftTypes.find(type => type.id === 3)
      : shiftTypes.find(type => type.id === 1);
  }
};

// --- Redesigned Calendar Components ---

const ShiftCalendarView = memo(({
  currentDate,
  schedules,
  holidays,
  filters,
  setFilters,
  units,
  navigateMonth,
  goToToday,
  openAddModal,
  openEditModal
}) => {

  const days = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    const daysArray = [];
    
    // Add blank days for the start of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      daysArray.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      daysArray.push(new Date(year, month, day));
    }

    // Add blank days to complete the grid
    while (daysArray.length % 7 !== 0) {
      daysArray.push(null);
    }

    return daysArray;
  }, [currentDate]);

  const getSchedulesForDate = useCallback((date) => {
    if (!date) return [];
    const dateStr = date.toISOString().split('T')[0];
    return schedules.filter(schedule => schedule.duty_date === dateStr);
  }, [schedules]);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 h-full flex flex-col">
      <CalendarHeader 
        currentDate={currentDate}
        navigateMonth={navigateMonth}
        goToToday={goToToday}
        openAddModal={openAddModal}
      />
      <CalendarFilters 
        filters={filters}
        setFilters={setFilters}
        units={units}
      />
      <div className="flex-grow mt-4 flex flex-col">
        <div className="grid grid-cols-7 border-t border-l border-slate-200">
          {['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์'].map(day => (
            <div key={day} className="p-3 text-center text-xs font-semibold text-slate-500 border-b border-r border-slate-200 bg-slate-50">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 grid-rows-6 flex-grow border-l border-slate-200">
          {days.map((date, index) => (
            <CalendarDayCell
              key={date ? date.toISOString() : `empty-${index}`}
              date={date}
              holidays={holidays}
              schedules={getSchedulesForDate(date)}
              onAdd={() => openAddModal(date)}
              onEdit={openEditModal}
            />
          ))}
        </div>
      </div>
    </div>
  );
});

const CalendarHeader = memo(({ currentDate, navigateMonth, goToToday, openAddModal }) => (
  <div className="flex items-center justify-between mb-4">
    <div className="flex items-center space-x-2">
      <button onClick={() => navigateMonth(-1)} className="p-2 text-slate-500 hover:bg-slate-100 rounded-full">
        <ChevronLeft className="w-5 h-5" />
      </button>
      <h2 className="text-xl font-semibold text-slate-800 text-center w-48">
        {currentDate.toLocaleDateString('th-TH', { month: 'long', year: 'numeric' })}
      </h2>
      <button onClick={() => navigateMonth(1)} className="p-2 text-slate-500 hover:bg-slate-100 rounded-full">
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
    <div className="flex items-center space-x-2">
      <button onClick={goToToday} className="px-4 py-2 text-sm font-medium text-indigo-600 border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 rounded-lg">
        วันนี้
      </button>
      <button
        onClick={() => openAddModal()}
        className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700"
      >
        <Plus className="w-4 h-4 mr-2" />
        เพิ่มเวร
      </button>
    </div>
  </div>
));

const CalendarFilters = memo(({ filters, setFilters, units }) => (
  <div className="flex items-center space-x-4">
    <div className="relative flex-1">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
      <input
        type="text"
        placeholder="ค้นหาเจ้าหน้าที่..."
        value={filters.officer}
        onChange={(e) => setFilters(prev => ({ ...prev, officer: e.target.value }))}
        className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
      />
    </div>
    <div className="relative">
      <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
      <select
        value={filters.unit}
        onChange={(e) => setFilters(prev => ({ ...prev, unit: e.target.value }))}
        className="pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm appearance-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
      >
        <option value="">ทุกส่วนงาน</option>
        {Array.isArray(units) && units.map(unit => (
          <option key={unit.id} value={unit.id}>{unit.unit_name}</option>
        ))}
      </select>
    </div>
  </div>
));

const CalendarDayCell = memo(({ date, holidays, schedules, onAdd, onEdit }) => {
  if (!date) return <div className="border-b border-r border-slate-200 bg-slate-50/50"></div>;

  const today = isToday(date);
  const holiday = isHoliday(date, holidays);

  return (
    <div className="relative p-2 border-b border-r border-slate-200 flex flex-col group">
      <div className="flex items-center space-x-2 mb-2">
        <span className={`w-7 h-7 flex items-center justify-center rounded-full text-sm font-semibold ${today ? 'bg-indigo-600 text-white' : holiday ? 'text-red-600' : 'text-slate-700'}`}>
          {date.getDate()}
        </span>
        {holiday && !today && <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>}
      </div>
      <div className="flex-1 space-y-1 overflow-y-auto">
        {schedules.map(schedule => <ScheduleItem key={schedule.id} schedule={schedule} onEdit={onEdit} />)}
      </div>
      <button onClick={onAdd} className="absolute bottom-1 right-1 w-6 h-6 flex items-center justify-center bg-slate-100 text-slate-400 rounded-full opacity-0 group-hover:opacity-100 hover:bg-indigo-100 hover:text-indigo-600 transition-opacity">
        <Plus className="w-4 h-4" />
      </button>
    </div>
  );
});

const ScheduleItem = memo(({ schedule, onEdit }) => {
  const shiftColors = {
    1: 'border-yellow-500', // เวรปกติ
    3: 'border-orange-500', // เวรวันหยุด
    2: 'border-indigo-500', // เวรกลางคืน
    4: 'border-indigo-500', // เวรกลางคืน
    default: 'border-slate-400'
  };
  const borderColor = shiftColors[schedule.shift_type_id] || shiftColors.default;

  return (
    <div 
      onClick={() => onEdit(schedule)}
      className={`p-1.5 rounded-md bg-slate-50 hover:bg-slate-100 cursor-pointer border-l-4 ${borderColor}`}
    >
      <p className="text-xs font-semibold text-slate-800 truncate">{schedule.shift_type_name}</p>
      <p className="text-xs text-slate-600 truncate">{schedule.officer_names}</p>
    </div>
  );
});

const DocumentManagementView = () => {
  const documents = [
    {
      title: "เวรในเวลาราชการ",
      description: "จัดทำเอกสารสำหรับเวรปกติ",
      icon: Sun,
      color: "bg-yellow-500",
      action: () => alert('Creating In-hours Document...')
    },
    {
      title: "เวรนอกเวลา (กลางวัน)",
      description: "สำหรับเวรวันหยุดและนักขัตฤกษ์",
      icon: CloudSun,
      color: "bg-orange-500",
      action: () => alert('Creating Off-hours (Day) Document...')
    },
    {
      title: "เวรนอกเวลา (กลางคืน)",
      description: "สำหรับเวรช่วงเวลากลางคืน",
      icon: Moon,
      color: "bg-indigo-600",
      action: () => alert('Creating Off-hours (Night) Document...')
    },
    {
      title: "ขออนุญาตพกพาอาวุธ",
      description: "จัดทำเอกสารขออนุญาตพกพาอาวุธปืน",
      icon: Target,
      color: "bg-red-600",
      action: () => alert('Creating Firearm Permit Document...')
    },
    {
      title: "รายงานประจำสัปดาห์",
      description: "สรุปผลการปฏิบัติงานรายสัปดาห์",
      icon: FileText,
      color: "bg-green-600",
      action: () => alert('Creating Weekly Report...')
    }
  ];

  return (
    <div className="p-6 bg-slate-50 rounded-2xl">
      <div className="text-center mb-12">
        <h2 className="text-2xl font-bold text-slate-800">เลือกประเภทเอกสาร</h2>
        <p className="text-slate-500 mt-2">เลือกเอกสารที่ต้องการจัดทำจากรายการด้านล่าง</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-8">
        {documents.map((doc, index) => (
          <button 
            key={index} 
            onClick={doc.action}
            className="group relative flex flex-col items-center justify-center text-center p-6 bg-white rounded-2xl shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 ease-in-out border-b-4 border-transparent hover:border-indigo-500"
          >
            <div className={`absolute -top-8 flex items-center justify-center w-20 h-20 rounded-full ${doc.color} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
              <doc.icon className="w-10 h-10 text-white" />
            </div>
            <div className="mt-12">
              <h3 className="text-lg font-semibold text-slate-900 mb-2">{doc.title}</h3>
              <p className="text-sm text-slate-500">{doc.description}</p>
            </div>
          </button>
        ))}
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
        if (!result.success) throw new Error(result.message);
        setHolidays(result.data);
      } catch (error) {
        console.error("ล้มเหลวในการดึงข้อมูลวันหยุด:", error);
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
            <File className="w-4 h-4" />
            <span>จัดการเอกสาร</span>
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
