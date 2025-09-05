import React, { useState, useEffect, useMemo } from 'react';
import { Calendar, Shield, List, Grid } from 'lucide-react';
import { CONFIG } from '../../config';
import UnitStructureManagement from '../UnitStructure/UnitStructureManagement';
import ShiftCalendarView from './ShiftCalendarView';
import ShiftListView from './ShiftListView';
import DutyScheduleModal from './DutyScheduleModal';
import AlertSystem from './AlertSystem';

// ฟังก์ชันตรวจสอบวันหยุด
const isHoliday = (date, holidays = []) => {
  const dayOfWeek = date.getDay();
  if (dayOfWeek === 0 || dayOfWeek === 6) return true;
  const isSameDay = (date1, date2) => date1.toDateString() === date2.toDateString();
  return holidays.some(holiday => isSameDay(new Date(holiday.date + 'T00:00:00'), date));
};

const ShiftWorkPage = () => {
  // State for tabs
  const [activeTab, setActiveTab] = useState('shifts');
  
  // State for view mode
  const [viewMode, setViewMode] = useState('calendar'); // 'calendar' or 'list'
  
  // State for calendar
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // State for modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  
  // State for data
  const [schedules, setSchedules] = useState([]);
  const [officers, setOfficers] = useState([]);
  const [units, setUnits] = useState([]);
  const [holidays, setHolidays] = useState([]);
  
  // State for form
  const [formData, setFormData] = useState({
    duty_date: '',
    position_number: '',
    shift_type: 'day',
    day_type: 'normal'
  });
  
  // State for filters
  const [filters, setFilters] = useState({ unit: '', officer: '' });
  
  // State for loading and saving
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // State for shift selection
  const [selectedShiftPeriod, setSelectedShiftPeriod] = useState('day');
  const [selectedUnits, setSelectedUnits] = useState([]);
  const [selectedHeadUnit, setSelectedHeadUnit] = useState('');
  const [availableOfficers, setAvailableOfficers] = useState([]);
  const [manualAddedOfficers, setManualAddedOfficers] = useState([]);
  const [removedPositions, setRemovedPositions] = useState([]);
  const [manualSearch, setManualSearch] = useState('');
  
  // State for alerts
  const [alert, setAlert] = useState({ show: false, message: '', type: 'info' });

  // ฟังก์ชันแสดง Alert
  const showAlert = (message, type = 'info') => {
    setAlert({ show: true, message, type });
    setTimeout(() => setAlert({ show: false, message: '', type: 'info' }), 5000);
  };

  // Auto-select officers from selected units
  useEffect(() => {
    if (selectedUnits.length > 0 && Array.isArray(officers)) {
      console.log('Selected units:', selectedUnits);
      console.log('Officers sample:', officers.slice(0, 3));
      
      const available = officers.filter(officer => {
        const hasUnitCode = officer.unit_code && selectedUnits.includes(officer.unit_code);
        if (hasUnitCode) {
          console.log('Matched officer:', officer.firstname, officer.lastname, 'Unit:', officer.unit_code);
        }
        return hasUnitCode;
      });
      
      console.log('Available officers after filter:', available.length);
      setAvailableOfficers(available);
    } else {
      setAvailableOfficers([]);
    }
  }, [selectedUnits, officers]);

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
        loadUnits(),
        loadHolidays(),
        loadSchedules()
      ]);
    } catch (error) {
      console.error('Error loading initial data:', error);
      showAlert('เกิดข้อผิดพลาดในการโหลดข้อมูล', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadSchedules = async () => {
    try {
      // ใช้ local date เพื่อป้องกัน timezone offset
      const startDateObj = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const endDateObj = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      
      const startDate = `${startDateObj.getFullYear()}-${String(startDateObj.getMonth() + 1).padStart(2, '0')}-${String(startDateObj.getDate()).padStart(2, '0')}`;
      const endDate = `${endDateObj.getFullYear()}-${String(endDateObj.getMonth() + 1).padStart(2, '0')}-${String(endDateObj.getDate()).padStart(2, '0')}`;
      
      const response = await fetch(`${CONFIG.DUTY_SCHEDULE_API}?start_date=${startDate}&end_date=${endDate}`);
      const data = await response.json();

      if (data.success && Array.isArray(data.data)) {
        // แน่ใจว่าโหลด officers เสร็จแล้ว
        let currentOfficers = officers;
        if (!Array.isArray(currentOfficers) || currentOfficers.length === 0) {
          await loadOfficers();
          // ใช้ fresh data หลังจาก loadOfficers เสร็จ
          const freshOfficersResponse = await fetch(`${CONFIG.UNIT_STRUCTURE_API}`);
          const freshOfficersData = await freshOfficersResponse.json();
          currentOfficers = freshOfficersData.success ? freshOfficersData.data : [];
        }

        console.log('Current officers for mapping:', currentOfficers.length, 'officers loaded');

        const officerMap = new Map((currentOfficers || []).map(o => [String(o.position_number), o]));

        const enriched = data.data.map(s => {
          const posKey = s.position_number || s.officer_id || s.position_number?.toString();
          const officer = officerMap.get(String(posKey));
          const officerName = officer ? `${officer.prefix ? officer.prefix + ' ' : ''}${officer.firstname || ''} ${officer.lastname || ''}`.trim() : (s.officer_name || null);
          
          return {
            ...s,
            officer_name: officerName,
            officer_unit_code: officer ? officer.unit_code : (s.officer_unit_code || null),
            officer_unit_name: officer ? officer.unit_name : (s.officer_unit_name || null),
            position_number: s.position_number || s.officer_id || null
          };
        });

        setSchedules(enriched);
      } else {
        console.error('Failed to fetch schedules:', data && data.message);
        showAlert('ไม่สามารถโหลดข้อมูลตารางเวรได้', 'error');
      }
    } catch (error) {
      console.error('Error loading schedules:', error);
      showAlert('เกิดข้อผิดพลาดในการโหลดตารางเวร', 'error');
    }
  };

  const loadOfficers = async () => {
    try {
      const response = await fetch(`${CONFIG.UNIT_STRUCTURE_API}`);
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

  const loadUnits = async () => {
    try {
      const response = await fetch(`${CONFIG.UNIT_STRUCTURE_API}/duty-units`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (data && data.success && Array.isArray(data.data)) {
        setUnits(data.data);
      } else {
        console.error('Failed to load units:', data);
        setUnits([]);
      }
    } catch (error) {
      console.error('Error loading units:', error);
      setUnits([]);
    }
  };

  const loadHolidays = async () => {
    try {
      // For now, we'll use a simple weekend check
      // You can implement a real holiday API later
      setHolidays([]);
    } catch (error) {
      console.error('Error loading holidays:', error);
      setHolidays([]);
    }
  };

  const navigateMonth = (direction) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() + direction);
      return newDate;
    });
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const openAddModal = (date = null) => {
    if (date) {
      // ใช้ local date แทน ISO string เพื่อป้องกัน timezone offset
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;
      
      setFormData({
        duty_date: dateStr,
        position_number: '',
        shift_type: 'day',
        day_type: isHoliday(date, holidays) ? 'holiday' : 'normal'
      });
    }
    setSelectedSchedule(null);
    setSelectedShiftPeriod('day');
    setSelectedUnits([]);
    setSelectedHeadUnit('');
    setAvailableOfficers([]);
    setManualAddedOfficers([]);
    setRemovedPositions([]);
    setShowAddModal(true);
  };

  const openEditModal = (schedule) => {
    setSelectedSchedule(schedule);
    setFormData({
      duty_date: schedule.duty_date,
      position_number: schedule.position_number,
      shift_type: schedule.shift_type,
      day_type: schedule.day_type
    });
    setSelectedShiftPeriod(schedule.shift_type || 'day');
    setShowEditModal(true);
  };

  const closeModals = () => {
    setShowAddModal(false);
    setShowEditModal(false);
    setSelectedSchedule(null);
    setSelectedShiftPeriod('day');
    setSelectedUnits([]);
    setSelectedHeadUnit('');
    setAvailableOfficers([]);
    setManualAddedOfficers([]);
    setRemovedPositions([]);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const combined = [];
      const mapPos = new Map();
      (availableOfficers || []).forEach(o => mapPos.set(String(o.position_number), o));
      (manualAddedOfficers || []).forEach(o => mapPos.set(String(o.position_number), o));
      for (const [pos, off] of mapPos.entries()) {
        if (!removedPositions.includes(pos)) combined.push(off);
      }

      if (!formData.duty_date || combined.length === 0) {
        showAlert('กรุณาระบุวันที่และเลือกเจ้าหน้าที่อย่างน้อย 1 คน', 'error');
        return;
      }

      if (!selectedHeadUnit) {
        showAlert('กรุณาเลือกหน่วยงานหลักที่เป็นหัวหน้าเวร', 'error');
        return;
      }

      const promises = combined.map(async (officer) => {
        const pos = officer.position_number || officer.officer_id || officer.id;
        const posNumber = Number(pos);
        const payload = {
          duty_date: formData.duty_date,
          position_number: Number.isInteger(posNumber) ? posNumber : pos,
          unit_code: officer.unit_code || selectedHeadUnit,
          shift_type: selectedShiftPeriod,
          day_type: isHoliday(new Date(formData.duty_date + 'T00:00:00'), holidays) ? 'holiday' : 'normal'
        };

        console.log('Payload being sent:', payload);

        const url = selectedSchedule ? `${CONFIG.DUTY_SCHEDULE_API}/${selectedSchedule.duty_id}` : CONFIG.DUTY_SCHEDULE_API;
        const method = selectedSchedule ? 'PUT' : 'POST';

        const response = await fetch(url, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        const result = await response.json();
        if (!result.success) {
          throw new Error(result.message || 'เกิดข้อผิดพลาดในการบันทึก');
        }
        return result;
      });

      await Promise.all(promises);
      showAlert('บันทึกตารางเวรสำเร็จ', 'success');
      await loadSchedules();
      closeModals();
    } catch (error) {
      console.error('Error saving schedule:', error);
      showAlert(error.message || 'เกิดข้อผิดพลาดในการบันทึก', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedSchedule || !window.confirm('คุณแน่ใจหรือไม่ที่จะลบตารางเวรนี้?')) return;
    setSaving(true);
    try {
      const response = await fetch(`${CONFIG.DUTY_SCHEDULE_API}/${selectedSchedule.duty_id}`, {
        method: 'DELETE'
      });
      
      const result = await response.json();
      if (!result.success) {
        throw new Error(result.message || 'เกิดข้อผิดพลาดในการลบ');
      }
      
      showAlert('ลบตารางเวรสำเร็จ', 'success');
      await loadSchedules();
      closeModals();
    } catch (error) {
      console.error('Error deleting schedule:', error);
      showAlert(error.message || 'เกิดข้อผิดพลาดในการลบ', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteFromList = async (schedule) => {
    if (!window.confirm('คุณแน่ใจหรือไม่ที่จะลบตารางเวรนี้?')) return;
    setSaving(true);
    try {
      const response = await fetch(`${CONFIG.DUTY_SCHEDULE_API}/${schedule.duty_id}`, {
        method: 'DELETE'
      });
      
      const result = await response.json();
      if (!result.success) {
        throw new Error(result.message || 'เกิดข้อผิดพลาดในการลบ');
      }
      
      showAlert('ลบตารางเวรสำเร็จ', 'success');
      await loadSchedules();
    } catch (error) {
      console.error('Error deleting schedule:', error);
      showAlert(error.message || 'เกิดข้อผิดพลาดในการลบ', 'error');
    } finally {
      setSaving(false);
    }
  };

  const filteredSchedules = useMemo(() => {
    let filtered = schedules;
    
    if (filters.unit) {
      filtered = filtered.filter(schedule => 
        schedule.officer_unit_code === filters.unit || schedule.unit_code === filters.unit
      );
    }
    
    if (filters.officer) {
      filtered = filtered.filter(schedule => 
        schedule.officer_name && schedule.officer_name.toLowerCase().includes(filters.officer.toLowerCase())
      );
    }
    
    return filtered;
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
      {/* Alert System */}
      <AlertSystem 
        alert={alert} 
        onClose={() => setAlert({ show: false, message: '', type: 'info' })} 
      />
      
      {/* Tab Navigation */}
      <div className="border-b border-slate-200 bg-white">
        <div className="flex space-x-8 px-6">
          <button
            onClick={() => setActiveTab('shifts')}
            className={`flex items-center py-4 px-2 border-b-2 text-sm font-medium ${
              activeTab === 'shifts'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            <Calendar className="w-5 h-5 mr-2" />
            ตารางเวร
          </button>
          <button
            onClick={() => setActiveTab('officers')}
            className={`flex items-center py-4 px-2 border-b-2 text-sm font-medium ${
              activeTab === 'officers'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            <Shield className="w-5 h-5 mr-2" />
            จัดการเจ้าหน้าที่และโครงสร้าง
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'shifts' && (
          <div className="h-full flex flex-col">
            {/* View Mode Toggle */}
            <div className="bg-white border-b border-slate-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <h1 className="text-lg font-semibold text-slate-900">
                  ตารางเวร - {currentDate.toLocaleDateString('th-TH', { month: 'long', year: 'numeric' })}
                </h1>
                <div className="flex items-center bg-slate-100 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('calendar')}
                    className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      viewMode === 'calendar'
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Grid className="w-4 h-4 mr-2" />
                    ปฏิทิน
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      viewMode === 'list'
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <List className="w-4 h-4 mr-2" />
                    รายการ
                  </button>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-hidden p-6">
              {viewMode === 'calendar' ? (
                <ShiftCalendarView
                  currentDate={currentDate}
                  schedules={filteredSchedules}
                  officers={officers}
                  units={units}
                  holidays={holidays}
                  filters={filters}
                  setFilters={setFilters}
                  navigateMonth={navigateMonth}
                  goToToday={goToToday}
                  openAddModal={openAddModal}
                  openEditModal={openEditModal}
                />
              ) : (
                <ShiftListView
                  currentDate={currentDate}
                  schedules={filteredSchedules}
                  onEdit={openEditModal}
                  onDelete={handleDeleteFromList}
                />
              )}
            </div>
          </div>
        )}
        {activeTab === 'officers' && <UnitStructureManagement />}
      </div>

      {/* Modals */}
      <DutyScheduleModal
        showModal={showAddModal || showEditModal}
        isEditMode={showEditModal}
        formData={formData}
        setFormData={setFormData}
        selectedShiftPeriod={selectedShiftPeriod}
        setSelectedShiftPeriod={setSelectedShiftPeriod}
        selectedUnits={selectedUnits}
        setSelectedUnits={setSelectedUnits}
        selectedHeadUnit={selectedHeadUnit}
        setSelectedHeadUnit={setSelectedHeadUnit}
        availableOfficers={availableOfficers}
        manualAddedOfficers={manualAddedOfficers}
        setManualAddedOfficers={setManualAddedOfficers}
        removedPositions={removedPositions}
        setRemovedPositions={setRemovedPositions}
        manualSearch={manualSearch}
        setManualSearch={setManualSearch}
        units={units}
        officers={officers}
        holidays={holidays}
        saving={saving}
        onClose={closeModals}
        onSave={handleSave}
        onDelete={handleDelete}
        showAlert={showAlert}
      />
    </div>
  );
};

export default ShiftWorkPage;
