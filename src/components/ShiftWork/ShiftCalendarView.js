import React, { useMemo, memo } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Filter, 
  Search, 
  Sun, 
  Moon 
} from 'lucide-react';

// Helper functions
const getDaysInMonth = (date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
const getFirstDayOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();
const isToday = (date, today) => date.toDateString() === today.toDateString();
const isSameDay = (date1, date2) => date1.toDateString() === date2.toDateString();

// ฟังก์ชันตรวจสอบวันหยุด
const isHoliday = (date, holidays = []) => {
  const dayOfWeek = date.getDay();
  if (dayOfWeek === 0 || dayOfWeek === 6) return true;
  return holidays.some(holiday => isSameDay(new Date(holiday.date + 'T00:00:00'), date));
};

const CalendarDayCell = memo(({ date, holidays, schedules, onAdd, onEdit }) => {
  const today = new Date();
  const isHolidayDate = isHoliday(date, holidays);
  
  // แปลง date เป็น YYYY-MM-DD สำหรับเปรียบเทียบ (ใช้ local time)
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const targetDateStr = `${year}-${month}-${day}`;
  
  const daySchedules = schedules.filter(schedule => {
    let scheduleDate = schedule.duty_date;
    // ถ้าเป็น ISO format ให้แปลงเป็น YYYY-MM-DD
    if (scheduleDate.includes('T')) {
      scheduleDate = scheduleDate.split('T')[0];
    }
    return scheduleDate === targetDateStr;
  });
  
  // Debug log
  if (daySchedules.length > 0) {
    console.log('Date:', date.getDate(), 'Target date string:', targetDateStr, 'Schedules:', daySchedules);
  }
  
  // จัดกลุ่มตามช่วงเวร
  const dayShifts = daySchedules.filter(s => s.shift_type === 'day');
  const nightShifts = daySchedules.filter(s => s.shift_type === 'night');
  
  // นับจำนวนคนในแต่ละช่วง
  const dayCount = dayShifts.length;
  const nightCount = nightShifts.length;
  
  // หาหน่วยงานที่เข้าเวร
  const units = [...new Set(daySchedules.map(s => s.officer_unit_name || s.unit_code).filter(Boolean))];

  return (
    <div 
      className={`min-h-[140px] border border-slate-200 p-2 cursor-pointer transition-all duration-200 hover:shadow-md ${
        isToday(date, today) ? 'bg-indigo-50 border-indigo-300 shadow-sm' : 'hover:bg-slate-50'
      } ${isHolidayDate ? 'bg-red-50 border-red-200' : ''}`}
      onClick={() => onAdd(date)}
    >
      {/* Header ของวัน */}
      <div className="flex justify-between items-start mb-2">
        <span className={`text-sm font-semibold ${
          isToday(date, today) ? 'text-indigo-700' : 
          isHolidayDate ? 'text-red-600' : 'text-slate-800'
        }`}>
          {date.getDate()}
        </span>
        {isHolidayDate && (
          <span className="text-xs bg-red-100 text-red-600 px-1 py-0.5 rounded font-medium">
            หยุด
          </span>
        )}
      </div>
      
      {/* แสดงจำนวนคนเข้าเวรแต่ละช่วง */}
      {(dayCount > 0 || nightCount > 0) && (
        <div className="space-y-1 mb-2">
          {dayCount > 0 && (
            <div className="flex items-center space-x-1">
              <Sun className="w-3 h-3 text-amber-500" />
              <span className="text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full font-medium">
                {dayCount} คน
              </span>
            </div>
          )}
          {nightCount > 0 && (
            <div className="flex items-center space-x-1">
              <Moon className="w-3 h-3 text-indigo-500" />
              <span className="text-xs bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded-full font-medium">
                {nightCount} คน
              </span>
            </div>
          )}
        </div>
      )}
      
      {/* แสดงหน่วยงานที่เข้าเวร */}
      {units.length > 0 && (
        <div className="space-y-1">
          {units.slice(0, 2).map((unit, index) => (
            <div key={index} className="text-xs bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded truncate font-medium">
              {unit}
            </div>
          ))}
          {units.length > 2 && (
            <div className="text-xs text-slate-500 font-medium">
              +{units.length - 2} หน่วยงาน
            </div>
          )}
        </div>
      )}
      
      {/* แสดงรายชื่อเจ้าหน้าที่ (แบบย่อ) */}
      <div className="mt-1 space-y-0.5">
        {daySchedules.slice(0, 3).map((schedule, index) => (
          <ScheduleItem key={schedule.duty_id || index} schedule={schedule} onEdit={onEdit} />
        ))}
        {daySchedules.length > 3 && (
          <div className="text-xs text-slate-500 text-center py-0.5">
            +{daySchedules.length - 3} คน
          </div>
        )}
      </div>
    </div>
  );
});

const ScheduleItem = memo(({ schedule, onEdit }) => {
  const officerName = schedule.officer_name || `เจ้าหน้าที่ ${schedule.position_number || 'ไม่ระบุ'}`;
  const shortName = officerName.length > 15 ? officerName.substring(0, 15) + '...' : officerName;
  
  return (
    <div 
      className={`text-xs p-1.5 rounded-md cursor-pointer transition-all duration-200 border ${
        schedule.shift_type === 'day' 
          ? 'bg-gradient-to-r from-amber-50 to-amber-100 text-amber-800 border-amber-200 hover:from-amber-100 hover:to-amber-200' 
          : 'bg-gradient-to-r from-indigo-50 to-indigo-100 text-indigo-800 border-indigo-200 hover:from-indigo-100 hover:to-indigo-200'
      }`}
      onClick={(e) => { e.stopPropagation(); onEdit(schedule); }}
      title={`${schedule.shift_type === 'day' ? '🌅 กลางวัน' : '🌙 กลางคืน'} - ${officerName} (${schedule.officer_unit_name || schedule.unit_code || 'ไม่ระบุหน่วยงาน'})`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-1 flex-1 min-w-0">
          {schedule.shift_type === 'day' ? 
            <Sun className="w-3 h-3 flex-shrink-0" /> : 
            <Moon className="w-3 h-3 flex-shrink-0" />
          }
          <span className="truncate font-medium">{shortName}</span>
        </div>
        <div className="text-xs opacity-75 ml-1">
          {schedule.officer_unit_name ? schedule.officer_unit_name.substring(0, 8) : (schedule.unit_code || '')}
        </div>
      </div>
    </div>
  );
});

const ShiftCalendarView = ({ 
  currentDate, 
  schedules, 
  officers, 
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
      {/* Header Controls */}
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
                <option key={unit.unit_code} value={unit.unit_code}>{unit.unit_name}</option>
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
        {/* Days of Week Header */}
        <div className="grid grid-cols-7 bg-slate-50 border-b border-slate-200">
          {['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์'].map(day => (
            <div key={day} className="p-3 text-center text-sm font-medium text-slate-600">
              {day}
            </div>
          ))}
        </div>
        
        {/* Calendar Days */}
        <div className="grid grid-cols-7">
          {/* Empty days from previous month */}
          {emptyDays.map(day => (
            <div key={`empty-${day}`} className="min-h-[140px] border border-slate-200 bg-slate-50"></div>
          ))}
          
          {/* Current month days */}
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

export default ShiftCalendarView;
