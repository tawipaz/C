import React, { useMemo, useState } from 'react';
import { Calendar, Clock, User, Building2, Edit, Trash2, Sun, Moon, ChevronDown, ChevronRight } from 'lucide-react';

const ShiftListView = ({ 
  currentDate, 
  schedules, 
  onEdit, 
  onDelete 
}) => {
  const [expandedDates, setExpandedDates] = useState(new Set());

  const toggleDateExpanded = (date) => {
    const newExpanded = new Set(expandedDates);
    if (newExpanded.has(date)) {
      newExpanded.delete(date);
    } else {
      newExpanded.add(date);
    }
    setExpandedDates(newExpanded);
  };
  // จัดกลุ่มตารางเวรตามวันที่
  const groupedSchedules = useMemo(() => {
    const groups = {};
    schedules.forEach(schedule => {
      // Normalize date to YYYY-MM-DD format
      let date = schedule.duty_date;
      if (date.includes('T')) {
        date = date.split('T')[0];
      }
      
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push({
        ...schedule,
        duty_date: date // Use normalized date
      });
    });
    
    // เรียงลำดับวันที่
    const sortedDates = Object.keys(groups).sort();
    return sortedDates.map(date => ({
      date,
      schedules: groups[date].sort((a, b) => {
        // เรียงตาม shift_type แล้วตาม officer_name
        if (a.shift_type !== b.shift_type) {
          return a.shift_type === 'day' ? -1 : 1;
        }
        return (a.officer_name || '').localeCompare(b.officer_name || '');
      })
    }));
  }, [schedules]);

  const formatDate = (dateString) => {
    try {
      // Handle both YYYY-MM-DD and ISO format dates
      let date;
      if (dateString.includes('T')) {
        date = new Date(dateString);
      } else {
        date = new Date(dateString + 'T00:00:00');
      }
      
      if (isNaN(date.getTime())) {
        return 'วันที่ไม่ถูกต้อง';
      }
      const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      };
      return date.toLocaleDateString('th-TH', options);
    } catch (error) {
      return 'วันที่ไม่ถูกต้อง';
    }
  };

  const formatShortDate = (dateString) => {
    try {
      // Handle both YYYY-MM-DD and ISO format dates
      let date;
      if (dateString.includes('T')) {
        date = new Date(dateString);
      } else {
        date = new Date(dateString + 'T00:00:00');
      }
      
      if (isNaN(date.getTime())) {
        return '--/--';
      }
      return date.toLocaleDateString('th-TH', { 
        day: '2-digit', 
        month: 'short' 
      });
    } catch (error) {
      return '--/--';
    }
  };

  const getShiftIcon = (shiftType) => {
    return shiftType === 'day' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />;
  };

  const getShiftColor = (shiftType) => {
    return shiftType === 'day' 
      ? 'bg-amber-50 text-amber-700 border-amber-200' 
      : 'bg-indigo-50 text-indigo-700 border-indigo-200';
  };

  if (groupedSchedules.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-slate-500">
        <Calendar className="w-12 h-12 mb-4 opacity-50" />
        <p className="text-lg font-medium">ไม่มีตารางเวรในเดือนนี้</p>
        <p className="text-sm">คลิกที่วันในปฏิทินเพื่อเพิ่มตารางเวร</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-slate-800">
          รายการตารางเวร - {currentDate.toLocaleDateString('th-TH', { month: 'long', year: 'numeric' })}
        </h2>
        <div className="text-sm text-slate-600">
          รวม {schedules.length} รายการ
        </div>
      </div>

      <div className="space-y-4">
        {groupedSchedules.map(({ date, schedules: daySchedules }) => {
          const isExpanded = expandedDates.has(date);
          const dayShifts = daySchedules.filter(s => s.shift_type === 'day');
          const nightShifts = daySchedules.filter(s => s.shift_type === 'night');
          
          // Get unique units for this date
          const units = [...new Set(daySchedules.map(s => s.officer_unit_name || s.unit_code).filter(Boolean))];
          
          return (
            <div key={date} className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              {/* Clickable Header */}
              <div 
                className="bg-slate-50 px-4 py-4 border-b border-slate-200 cursor-pointer hover:bg-slate-100 transition-colors"
                onClick={() => toggleDateExpanded(date)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {/* Date Display */}
                    <div className="flex items-center space-x-3">
                      <div className="text-3xl font-bold text-slate-800">
                        {formatShortDate(date)}
                      </div>
                      <div>
                        <div className="text-lg font-semibold text-slate-800">
                          {formatDate(date)}
                        </div>
                        <div className="text-sm text-slate-500">
                          รวม {daySchedules.length} คน
                        </div>
                      </div>
                    </div>

                    {/* Units Summary */}
                    <div className="flex flex-wrap gap-2">
                      {units.slice(0, 3).map((unit, index) => (
                        <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          <Building2 className="w-3 h-3 mr-1" />
                          {unit}
                        </span>
                      ))}
                      {units.length > 3 && (
                        <span className="text-xs text-slate-500 font-medium">
                          +{units.length - 3} หน่วยงาน
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    {/* Shift Summary */}
                    <div className="flex space-x-2">
                      {dayShifts.length > 0 && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-amber-100 text-amber-800">
                          <Sun className="w-4 h-4 mr-1" />
                          {dayShifts.length} คน
                        </span>
                      )}
                      {nightShifts.length > 0 && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
                          <Moon className="w-4 h-4 mr-1" />
                          {nightShifts.length} คน
                        </span>
                      )}
                    </div>

                    {/* Expand/Collapse Icon */}
                    <div className="text-slate-400">
                      {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                    </div>
                  </div>
                </div>
              </div>

              {/* Expandable Content */}
              {isExpanded && (
                <div className="divide-y divide-slate-100">
                  {daySchedules.map((schedule, index) => (
                    <div key={schedule.duty_id || index} className="p-4 hover:bg-slate-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 flex-1">
                          {/* Shift Icon */}
                          <div className={`flex items-center justify-center w-10 h-10 rounded-full border ${getShiftColor(schedule.shift_type)}`}>
                            {getShiftIcon(schedule.shift_type)}
                          </div>

                          {/* ข้อมูลเจ้าหน้าที่ */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-3">
                              <div className="font-medium text-slate-900">
                                {schedule.officer_name || `เจ้าหน้าที่ ${schedule.position_number || 'ไม่ระบุ'}`}
                              </div>
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getShiftColor(schedule.shift_type)}`}>
                                {schedule.shift_type === 'day' ? 'กลางวัน' : 'กลางคืน'}
                              </span>
                            </div>
                            
                            <div className="mt-1 flex items-center space-x-4 text-sm text-slate-500">
                              {schedule.position_number && (
                                <div className="flex items-center space-x-1">
                                  <User className="w-3 h-3" />
                                  <span>เลขที่ {schedule.position_number}</span>
                                </div>
                              )}
                              {(schedule.officer_unit_name || schedule.unit_code) && (
                                <div className="flex items-center space-x-1">
                                  <Building2 className="w-3 h-3" />
                                  <span>{schedule.officer_unit_name || schedule.unit_code}</span>
                                </div>
                              )}
                              {schedule.day_type && (
                                <div className="flex items-center space-x-1">
                                  <Clock className="w-3 h-3" />
                                  <span>{schedule.day_type === 'holiday' ? 'วันหยุด' : 'วันปกติ'}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center space-x-2 ml-4">
                          <button
                            onClick={(e) => { e.stopPropagation(); onEdit(schedule); }}
                            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            title="แก้ไข"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); onDelete && onDelete(schedule); }}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="ลบ"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ShiftListView;
