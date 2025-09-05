import React from 'react';
import { X, Sun, Moon, Save, Plus, Trash2 } from 'lucide-react';

// ฟังก์ชันตรวจสอบวันหยุด
const isHoliday = (date, holidays = []) => {
  const dayOfWeek = date.getDay();
  if (dayOfWeek === 0 || dayOfWeek === 6) return true;
  const isSameDay = (date1, date2) => date1.toDateString() === date2.toDateString();
  return holidays.some(holiday => isSameDay(new Date(holiday.date + 'T00:00:00'), date));
};

const DutyScheduleModal = ({
  showModal,
  isEditMode,
  formData,
  setFormData,
  selectedShiftPeriod,
  setSelectedShiftPeriod,
  selectedUnits,
  setSelectedUnits,
  selectedHeadUnit,
  setSelectedHeadUnit,
  availableOfficers,
  manualAddedOfficers,
  setManualAddedOfficers,
  removedPositions,
  setRemovedPositions,
  manualSearch,
  setManualSearch,
  units,
  officers,
  holidays,
  saving,
  onClose,
  onSave,
  onDelete,
  showAlert
}) => {
  if (!showModal) return null;

  // --- ฟังก์ชันจัดการการเลือกส่วนงาน ---
  const handleUnitSelect = (unitCode) => {
    setSelectedUnits(prev => {
      const newUnits = prev.includes(unitCode)
        ? prev.filter(code => code !== unitCode)
        : [...prev, unitCode];
      
      // ล้างการเลือกหน่วยงานหลักถ้าไม่มีส่วนงานที่เลือก
      if (newUnits.length === 0) {
        setSelectedHeadUnit('');
      }
      
      return newUnits;
    });
  };

  const handleHeadUnitSelect = (unitCode) => {
    setSelectedHeadUnit(unitCode);
  };

  const handleAddManualOfficer = () => {
    const q = manualSearch && manualSearch.trim();
    if (!q) return showAlert('กรุณากรอกข้อมูลเพื่อค้นหา/เพิ่ม', 'error');
    
    // หาใน officers จาก unit_structure
    const found = officers.find(o => 
      String(o.position_number) === q || 
      (`${o.firstname} ${o.lastname}`).toLowerCase().includes(q.toLowerCase())
    );
    
    if (found) {
      // ถ้ายังไม่มีใน manualAdded หรือ available ให้เพิ่ม
      const key = String(found.position_number);
      const already = manualAddedOfficers.find(a => String(a.position_number) === key) || 
                     availableOfficers.find(a => String(a.position_number) === key);
      
      if (already) {
        showAlert('เจ้าหน้าที่คนนี้ถูกเพิ่มแล้ว', 'info');
      } else {
        setManualAddedOfficers(prev => [...prev, found]);
        showAlert('เพิ่มเจ้าหน้าที่สำเร็จ', 'success');
      }
    } else {
      showAlert('ไม่พบเจ้าหน้าที่ตามคำค้น', 'error');
    }
    setManualSearch('');
  };

  const handleRemoveOfficer = (positionNumber) => {
    const key = String(positionNumber);
    setRemovedPositions(prev => [...prev, key]);
  };

  const handleRestoreOfficer = (positionNumber) => {
    const key = String(positionNumber);
    setRemovedPositions(prev => prev.filter(p => p !== key));
  };

  const handleRemoveManualOfficer = (positionNumber) => {
    const key = String(positionNumber);
    setManualAddedOfficers(prev => prev.filter(o => String(o.position_number) !== key));
  };

  // รวมรายการที่จะแสดง
  const combinedOfficers = [];
  const mapPos = new Map();
  (availableOfficers || []).forEach(o => mapPos.set(String(o.position_number), { ...o, source: 'unit' }));
  (manualAddedOfficers || []).forEach(o => mapPos.set(String(o.position_number), { ...o, source: 'manual' }));

  for (const [pos, off] of mapPos.entries()) {
    const isRemoved = removedPositions.includes(pos);
    combinedOfficers.push({ ...off, isRemoved });
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold">
                {isEditMode ? '✏️ แก้ไขตารางเวร' : '➕ เพิ่มตารางเวรใหม่'}
              </h3>
              {formData.duty_date && (
                <p className="text-indigo-100 mt-1 flex items-center">
                  📅 วันที่ {new Date(formData.duty_date + 'T00:00:00').toLocaleDateString('th-TH', { 
                    weekday: 'long',
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                  {isHoliday(new Date(formData.duty_date + 'T00:00:00'), holidays) && (
                    <span className="ml-3 px-2 py-1 bg-red-500 text-white text-xs rounded-full font-medium">
                      🏖️ วันหยุด
                    </span>
                  )}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="p-6 space-y-6">
            {/* วันที่ */}
            <div className="bg-slate-50 rounded-xl p-4">
              <label className="block text-sm font-semibold text-slate-700 mb-3 flex items-center">
                📅 เลือกวันที่
              </label>
              <input
                type="date"
                value={formData.duty_date}
                onChange={(e) => {
                  setFormData(prev => ({ 
                    ...prev, 
                    duty_date: e.target.value,
                    day_type: isHoliday(new Date(e.target.value + 'T00:00:00'), holidays) ? 'holiday' : 'normal'
                  }));
                }}
                className="w-full border-2 border-slate-300 rounded-lg px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
              />
              
              {/* แสดงประเภทวัน */}
              {formData.duty_date && (
                <div className="mt-3 p-3 bg-white rounded-lg border-l-4 border-indigo-500">
                  <div className="flex items-center text-sm">
                    <span className="font-medium text-slate-700">ประเภทวัน:</span>
                    {isHoliday(new Date(formData.duty_date + 'T00:00:00'), holidays) ? (
                      <span className="ml-2 px-2 py-1 bg-red-100 text-red-700 rounded-full font-medium">
                        🏖️ วันหยุด
                      </span>
                    ) : (
                      <span className="ml-2 px-2 py-1 bg-green-100 text-green-700 rounded-full font-medium">
                        📋 วันปกติ
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* เลือกช่วงเวร */}
            <div className="bg-slate-50 rounded-xl p-4">
              <label className="block text-sm font-semibold text-slate-700 mb-4 flex items-center">
                ⏰ เลือกช่วงเวร
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedShiftPeriod('day');
                    setFormData(prev => ({ ...prev, shift_type: 'day' }));
                  }}
                  className={`flex items-center justify-center px-6 py-4 rounded-xl border-2 text-sm font-semibold transition-all ${
                    selectedShiftPeriod === 'day' 
                      ? 'bg-gradient-to-r from-amber-50 to-orange-50 border-amber-300 text-amber-700 shadow-md'
                      : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Sun className="w-5 h-5 mr-3" />
                  <div className="text-left">
                    <div>🌅 กลางวัน</div>
                    <div className="text-xs opacity-75">(08:30-16:30)</div>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedShiftPeriod('night');
                    setFormData(prev => ({ ...prev, shift_type: 'night' }));
                  }}
                  className={`flex items-center justify-center px-6 py-4 rounded-xl border-2 text-sm font-semibold transition-all ${
                    selectedShiftPeriod === 'night' 
                      ? 'bg-gradient-to-r from-indigo-50 to-blue-50 border-indigo-300 text-indigo-700 shadow-md'
                      : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Moon className="w-5 h-5 mr-3" />
                  <div className="text-left">
                    <div>🌙 กลางคืน</div>
                    <div className="text-xs opacity-75">(16:30-08:30)</div>
                  </div>
                </button>
              </div>
            </div>

            {/* เลือกส่วนงาน */}
            <div className="bg-slate-50 rounded-xl p-4">
              <label className="block text-sm font-semibold text-slate-700 mb-4 flex items-center">
                🏢 เลือกส่วนงานที่เข้าเวร
              </label>
              <div className="bg-white border-2 border-slate-300 rounded-lg p-4 max-h-40 overflow-y-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {Array.isArray(units) && units.map(unit => (
                    <label key={unit.unit_code} className="flex items-center p-2 hover:bg-slate-50 rounded-lg cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedUnits.includes(unit.unit_code)}
                        onChange={() => handleUnitSelect(unit.unit_code)}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-slate-300 rounded"
                      />
                      <span className="ml-3 text-sm font-medium text-slate-900">{unit.unit_name}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* เลือกหน่วยงานหลัก */}
            {selectedUnits.length > 0 && (
              <div className="bg-blue-50 rounded-xl p-4 border-2 border-blue-200">
                <label className="block text-sm font-semibold text-blue-800 mb-3 flex items-center">
                  👑 เลือกหน่วยงานหลักที่เป็นหัวหน้าเวร
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {selectedUnits.map(unitCode => {
                    const unit = units.find(u => u.unit_code === unitCode);
                    return (
                      <label key={unitCode} className="flex items-center p-2 bg-white rounded-lg cursor-pointer">
                        <input
                          type="radio"
                          name="headUnit"
                          value={unitCode}
                          checked={selectedHeadUnit === unitCode}
                          onChange={() => handleHeadUnitSelect(unitCode)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300"
                        />
                        <span className="ml-3 text-sm font-medium text-slate-900">{unit?.unit_name}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}

            {/* รายชื่อเจ้าหน้าที่ */}
            <div className="bg-slate-50 rounded-xl p-4">
              <label className="block text-sm font-semibold text-slate-700 mb-4 flex items-center">
                👥 รายชื่อเจ้าหน้าที่ที่จะเข้าเวร
                {combinedOfficers.length > 0 && (
                  <span className="ml-2 px-2 py-1 bg-indigo-100 text-indigo-700 text-xs rounded-full font-medium">
                    {combinedOfficers.filter(o => !o.isRemoved).length} คน
                  </span>
                )}
              </label>

              {/* Manual search / add */}
              <div className="mb-4 flex items-center space-x-2">
                <input
                  type="text"
                  placeholder="ค้นหา/เพิ่มเจ้าหน้าที่ (ระบุหมายเลขตำแหน่งหรือชื่อ)"
                  value={manualSearch}
                  onChange={(e) => setManualSearch(e.target.value)}
                  className="flex-1 border-2 border-slate-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  onKeyPress={(e) => e.key === 'Enter' && handleAddManualOfficer()}
                />
                <button
                  type="button"
                  onClick={handleAddManualOfficer}
                  className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  เพิ่ม
                </button>
              </div>

              {/* Officers list */}
              <div className="bg-white border-2 border-slate-300 rounded-lg p-3 max-h-60 overflow-y-auto">
                {combinedOfficers.length > 0 ? (
                  <div className="space-y-2">
                    {combinedOfficers.map((officer, index) => (
                      <div
                        key={index}
                        className={`flex items-center justify-between p-3 rounded-lg border ${
                          officer.isRemoved 
                            ? 'bg-red-50 border-red-200 opacity-60' 
                            : 'bg-slate-50 border-slate-200'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`w-2 h-2 rounded-full ${
                            officer.source === 'manual' ? 'bg-blue-500' : 'bg-green-500'
                          }`}></div>
                          <div>
                            <div className="font-medium text-slate-900">
                              {officer.prefix} {officer.firstname} {officer.lastname}
                            </div>
                            <div className="text-xs text-slate-600">
                              ตำแหน่ง: {officer.position_number} | {officer.unit_name}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {officer.isRemoved ? (
                            <button
                              onClick={() => handleRestoreOfficer(officer.position_number)}
                              className="text-green-600 hover:text-green-800 text-sm font-medium"
                            >
                              เรียกคืน
                            </button>
                          ) : (
                            <button
                              onClick={() => officer.source === 'manual' 
                                ? handleRemoveManualOfficer(officer.position_number)
                                : handleRemoveOfficer(officer.position_number)
                              }
                              className="text-red-600 hover:text-red-800"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-slate-500 py-8">
                    <p>ยังไม่มีเจ้าหน้าที่ในรายการ</p>
                    <p className="text-sm">กรุณาเลือกส่วนงานหรือเพิ่มเจ้าหน้าที่ด้วยตนเอง</p>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-6 border-t border-slate-200">
              {isEditMode && (
                <button
                  onClick={onDelete}
                  disabled={saving}
                  className="flex items-center px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  ลบตารางเวร
                </button>
              )}
              <div className="flex space-x-3 ml-auto">
                <button
                  onClick={onClose}
                  disabled={saving}
                  className="px-6 py-2 border-2 border-slate-300 text-sm font-medium rounded-lg text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  ยกเลิก
                </button>
                <button
                  onClick={onSave}
                  disabled={saving || combinedOfficers.filter(o => !o.isRemoved).length === 0 || !selectedHeadUnit}
                  className="inline-flex items-center px-6 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      กำลังบันทึก...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      บันทึก
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DutyScheduleModal;
