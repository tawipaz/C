import React, { useState, useMemo } from 'react';
import { 
  ChevronLeft, 
  Users, 
  Search, 
  UserPlus, 
  Save,
  User,
  Plus,
  ArrowUpDown
} from 'lucide-react';
import { useAlert } from '../common/AlertSystem';
import CurrentMemberCard from './CurrentMemberCard';
import AvailableOfficerCard from './AvailableOfficerCard';
import EditMemberModal from './EditMemberModal';
import ReorderMembersModal from './ReorderMembersModal';
import AddMemberModal from './AddMemberModal';
import BulkAddModal from './BulkAddModal';

// Component สำหรับจัดการบุคลากรในส่วนงาน
const UnitManagementView = ({ 
  selectedUnit, 
  units, 
  officers, 
  unitStructures, 
  onBack, 
  onRefresh 
}) => {
  const [selectedOfficers, setSelectedOfficers] = useState([]);
  const [isAddingMultiple, setIsAddingMultiple] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [showReorderModal, setShowReorderModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBulkAddModal, setShowBulkAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const { success, error, warning } = useAlert();

  // กรองเจ้าหน้าที่ในส่วนงานที่เลือก
  const currentUnitMembers = useMemo(() => {
    if (!selectedUnit) return [];
    return unitStructures
      .filter(s => s.unit_code === selectedUnit.unit_code)
      .sort((a, b) => a.seniority_order - b.seniority_order);
  }, [unitStructures, selectedUnit]);

  // กรองเจ้าหน้าที่ที่ยังไม่ได้อยู่ในโครงสร้าง
  const availableOfficers = useMemo(() => {
    const usedPositions = unitStructures.map(s => s.position_number);
    let filtered = officers
      .filter(officer => !usedPositions.includes(officer.position_number));
    
    // กรองตามคำค้นหา
    if (searchTerm && searchTerm.trim() !== '') {
      const search = searchTerm.trim();
      
      filtered = filtered.filter(officer => {
        // ค้นหาจากชื่อ นามสกุล หรือเลขตำแหน่ง แบบตรงตัว
        const firstname = (officer.firstname || '').toString();
        const lastname = (officer.lastname || '').toString();
        const positionNumber = (officer.position_number || '').toString();
        
        const match = firstname.includes(search) || 
                     lastname.includes(search) || 
                     positionNumber.includes(search);
        
        return match;
      });
    }
    
    return filtered;
  }, [officers, unitStructures, searchTerm]);

  const handleBulkAdd = () => {
    if (!selectedUnit) {
      warning('กรุณาเลือกส่วนงานก่อน');
      return;
    }

    if (selectedOfficers.length === 0) {
      warning('กรุณาเลือกบุคลากรที่ต้องการเพิ่ม');
      return;
    }

    // เปิด Modal สำหรับกำหนดลำดับอาวุโส
    setShowBulkAddModal(true);
  };

  // ตรวจสอบว่ามีการเลือกส่วนงานหรือไม่
  if (!selectedUnit) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto text-center">
          <div className="bg-white rounded-xl p-8">
            <Users className="w-16 h-16 mx-auto mb-4 text-slate-400" />
            <h2 className="text-2xl font-bold text-slate-800 mb-2">กรุณาเลือกส่วนงาน</h2>
            <p className="text-slate-500">เลือกส่วนงานที่ต้องการจัดการบุคลากร</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack}
              className="flex items-center px-3 py-2 text-slate-600 hover:text-slate-800 transition-colors"
            >
              <ChevronLeft className="w-5 h-5 mr-1" />
              กลับ
            </button>
            <div>
              <h2 className="text-2xl font-bold text-slate-800">{selectedUnit.unit_name}</h2>
              <p className="text-slate-500">จัดการบุคลากรในส่วนงาน</p>
            </div>
          </div>
          <div className="flex space-x-3">
            {currentUnitMembers.length > 1 && (
              <button
                onClick={() => setShowReorderModal(true)}
                className="flex items-center px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors"
              >
                <ArrowUpDown className="w-4 h-4 mr-2" />
                จัดเรียงลำดับ
              </button>
            )}
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              เพิ่มบุคลากร
            </button>
            <button
              onClick={() => {
                if (isAddingMultiple) {
                  handleBulkAdd();
                } else {
                  setIsAddingMultiple(true);
                }
              }}
              className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                isAddingMultiple 
                  ? 'bg-green-600 text-white hover:bg-green-700' 
                  : 'bg-indigo-600 text-white hover:bg-indigo-700'
              }`}
            >
              {isAddingMultiple ? (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  เพิ่มหลายคน ({selectedOfficers.length})
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4 mr-2" />
                  เพิ่มหลายคน
                </>
              )}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Current Members */}
          <div className="bg-white rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center">
                <Users className="w-5 h-5 mr-2 text-indigo-600" />
                บุคลากรปัจจุบัน
              </h3>
              <span className="text-sm text-slate-500">
                {currentUnitMembers.length} คน
              </span>
            </div>
          
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {currentUnitMembers.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>ยังไม่มีบุคลากรในส่วนงานนี้</p>
              </div>
            ) : (
              currentUnitMembers.map(member => (
                <CurrentMemberCard 
                  key={member.id} 
                  member={member} 
                  onRefresh={onRefresh}
                  onEdit={setEditingMember}
                />
              ))
            )}
          </div>
        </div>

        {/* Available Officers */}
        <div className="bg-white rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold flex items-center">
              <Search className="w-5 h-5 mr-2 text-green-600" />
              รายชื่อเจ้าหน้าที่
            </h3>
            <span className="text-sm text-slate-500">
              {availableOfficers.length} คน
            </span>
          </div>

          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                placeholder="ค้นหาเจ้าหน้าที่..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {availableOfficers.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <User className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>
                  {searchTerm && searchTerm.trim() !== '' ? 'ไม่พบเจ้าหน้าที่ที่ตรงกับการค้นหา' : 'ไม่มีเจ้าหน้าที่ที่พร้อมเพิ่ม'}
                </p>
              </div>
            ) : (
              availableOfficers.map(officer => (
                <AvailableOfficerCard
                  key={officer.position_number}
                  officer={officer}
                  selectedUnit={selectedUnit}
                  isSelected={selectedOfficers.includes(officer.position_number)}
                  isMultipleMode={isAddingMultiple}
                  onToggleSelect={(positionNumber) => {
                    if (selectedOfficers.includes(positionNumber)) {
                      setSelectedOfficers(prev => prev.filter(p => p !== positionNumber));
                    } else {
                      setSelectedOfficers(prev => [...prev, positionNumber]);
                    }
                  }}
                  onAddSingle={onRefresh}
                />
              ))
            )}
          </div>
        </div>
        </div>

        {/* Modals */}
      {editingMember && (
        <EditMemberModal
          member={editingMember}
          units={units}
          officers={officers}
          unitStructures={unitStructures}
          onClose={() => setEditingMember(null)}
          onSave={() => {
            onRefresh();
            setEditingMember(null);
          }}
        />
      )}

      {showReorderModal && (
        <ReorderMembersModal
          unitCode={selectedUnit.unit_code}
          unitName={selectedUnit.unit_name}
          members={currentUnitMembers}
          onClose={() => setShowReorderModal(false)}
          onSave={() => {
            onRefresh();
            setShowReorderModal(false);
          }}
        />
      )}

      {showAddModal && (
        <AddMemberModal
          selectedUnit={selectedUnit}
          units={units}
          officers={officers}
          unitStructures={unitStructures}
          onClose={() => setShowAddModal(false)}
          onSave={() => {
            onRefresh();
            setShowAddModal(false);
          }}
        />
      )}

      {showBulkAddModal && (
        <BulkAddModal
          selectedOfficers={selectedOfficers}
          selectedUnit={selectedUnit}
          officers={officers}
          unitStructures={unitStructures}
          onClose={() => setShowBulkAddModal(false)}
          onSave={() => {
            setSelectedOfficers([]);
            setIsAddingMultiple(false);
            setShowBulkAddModal(false);
            onRefresh();
          }}
        />
      )}
    </div>
    </div>
  );
};

export default UnitManagementView;
