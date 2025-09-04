import React, { useState, useCallback, useEffect } from 'react';
import UnitSelector from './UnitSelector';
import UnitManagementView from './UnitManagementView';
import { CONFIG } from '../../config';

// Unit Structure Management Component
const UnitStructureManagement = () => {
  const [units, setUnits] = useState([]);
  const [officers, setOfficers] = useState([]);
  const [unitStructures, setUnitStructures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [view, setView] = useState('units'); // 'units' or 'management'

  // Fetch ข้อมูลส่วนงานจาก duty_unit
  const fetchUnits = useCallback(async () => {
    try {
      const response = await fetch(`${CONFIG.UNIT_STRUCTURE_API}/duty-units`);
      const data = await response.json();
      if (data.success) {
        setUnits(data.data);
      }
    } catch (error) {
      console.error('Error fetching units:', error);
    }
  }, []);

  // Fetch ข้อมูลเจ้าหน้าที่
  const fetchOfficers = useCallback(async () => {
    try {
      const response = await fetch(`${CONFIG.OFFICERS_API}`);
      const data = await response.json();
      if (data.success) {
        setOfficers(data.data);
      }
    } catch (error) {
      console.error('Error fetching officers:', error);
    }
  }, []);

  // Fetch ข้อมูลโครงสร้างส่วนงาน
  const fetchUnitStructures = useCallback(async () => {
    try {
      const response = await fetch(`${CONFIG.UNIT_STRUCTURE_API}`);
      const data = await response.json();
      if (data.success) {
        setUnitStructures(data.data);
      }
    } catch (error) {
      console.error('Error fetching unit structures:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUnits();
    fetchOfficers();
    fetchUnitStructures();
  }, [fetchUnits, fetchOfficers, fetchUnitStructures]);

  // แสดงหน้าเลือกส่วนงาน
  if (view === 'units') {
    return <UnitSelector 
      units={units} 
      unitStructures={unitStructures}
      onSelectUnit={(unit) => {
        setSelectedUnit(unit);
        setView('management');
      }}
      loading={loading}
    />;
  }

  // แสดงหน้าจัดการบุคลากรในส่วนงาน
  return <UnitManagementView
    selectedUnit={selectedUnit}
    units={units}
    officers={officers}
    unitStructures={unitStructures}
    searchTerm={searchTerm}
    setSearchTerm={setSearchTerm}
    onBack={() => {
      setView('units');
      setSelectedUnit(null);
    }}
    onRefresh={fetchUnitStructures}
  />;
};

export default UnitStructureManagement;
