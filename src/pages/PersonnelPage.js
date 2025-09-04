import React, { useEffect, useState, useMemo, useCallback, memo } from "react";
import { 
  Search, 
  Filter, 
  Users, 
  Phone, 
  Mail, 
  Calendar,
  Award,
  Building2,
  UserCheck,
  UserX,
  TrendingUp,
  PieChart,
  BarChart3,
  Download,
  RefreshCw,
  Eye,
  Grid3X3,
  List,
  X,
  AlertCircle,
  CheckCircle2,
  Clock,
  Briefcase,
  GraduationCap,
  Edit2,
  Save,
  MapPin,
  Building,
  Crown,
  FileText
} from "lucide-react";
import { CONFIG } from '../config';
import DonutChart from '../components/DonutChart';
import LineChart from '../components/LineChart';

// Function to format phone number (add leading 0 if needed)
const formatPhoneNumber = (phone) => {
  if (!phone) return '';
  const cleanPhone = phone.replace(/\D/g, ''); // Remove non-digits
  if (cleanPhone.length === 9) {
    return '0' + cleanPhone; // Add leading 0 for 9-digit numbers
  }
  return cleanPhone; // Return as-is for other lengths
};



// StatCard Component
const StatCard = memo(({ title, value, icon: Icon, color = "blue", trend, subtitle }) => (
  <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
    <div className="flex items-center justify-between mb-2">
      <div className={`w-12 h-12 bg-${color}-100 rounded-xl flex items-center justify-center`}>
        <Icon className={`w-6 h-6 text-${color}-600`} />
      </div>
      {trend && (
        <div className="flex items-center text-green-600 text-sm">
          <TrendingUp className="w-4 h-4 mr-1" />
          <span>{trend}%</span>
        </div>
      )}
    </div>
    <div className="text-3xl font-bold text-slate-900 mb-1">{value}</div>
    <div className="text-sm text-slate-600">{title}</div>
    {subtitle && (
      <div className="text-xs text-slate-500 mt-1">{subtitle}</div>
    )}
  </div>
));

// Table Chart Component (สำหรับแสดงข้อมูลตำแหน่งแบบตาราง)
const TableChart = memo(({ title, data, colors = [] }) => {
  const total = useMemo(() => data.reduce((sum, d) => sum + d.value, 0), [data]);
  
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
      <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
        <BarChart3 className="w-5 h-5 mr-2 text-slate-400" />
        {title}
      </h3>
      <div className="space-y-3">
        <div className="text-center mb-4">
          <div className="text-2xl font-bold text-slate-900">{total}</div>
          <div className="text-sm text-slate-500">ทั้งหมด</div>
        </div>
        
        <div className="grid gap-2">
          {data.slice(0, 8).map((item, index) => {
            const percentage = ((item.value / total) * 100).toFixed(1);
            const color = colors[index % colors.length] || '#6366f1';
            
            return (
              <div key={`${item.label}-${index}`} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <div 
                    className="w-4 h-4 rounded-sm flex-shrink-0"
                    style={{ backgroundColor: color }}
                  />
                  <span className="text-sm text-slate-700 font-medium truncate" title={item.label}>
                    {item.label}
                  </span>
                </div>
                <div className="flex items-center space-x-2 text-right">
                  <div className="text-sm font-bold text-slate-900">{item.value}</div>
                  <div className="text-xs text-slate-500">{percentage}%</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
});

// Function สำหรับตัดคำยาว
const truncatePosition = (position) => {
  if (!position) return '';
  
  const removePatterns = [
    'เจ้าพนักงานตำรวจศาล',
    'ตำรวจศาล',
    'ตำรวจ',
    'พนักงาน'
  ];
  
  let result = position;
  for (const pattern of removePatterns) {
    result = result.replace(new RegExp(pattern, 'gi'), '');
  }
  
  return result.trim() || position;
};

// Function สำหรับตัดคำ "ศาล" ออกจากสังกัด
const truncateAffiliation = (affiliation) => {
  if (!affiliation) return '';
  const lower = affiliation.toLowerCase();

  // Only remove the leading word 'ศาล' for affiliations that describe
  // 'ในสังกัดสำนักยุติธรรมประจำภาค' (or variants). Do not strip 'ศาล'
  // from other court names like 'ศาลสูง' or 'ศาลชำนาญพิเศษ'.
  if (lower.includes('ในสังกัดสำนักยุติธรรมประจำภาค') || lower.includes('ในสังกัดสำนักยุติธรรม')) {
    return affiliation.replace(/^ศาล\s*/i, '').trim() || affiliation;
  }

  // Otherwise return affiliation unchanged
  return affiliation;
};

// --- NEW: Proportional Treemap Chart Component ---
// --- NEW: Proportional Treemap Chart Component (MODIFIED FOR LOGARITHMIC SCALE) ---
const TreemapChart = memo(({ title, data, colors = [] }) => {
  // --- ส่วนที่แก้ไข: คำนวณ total จากค่าจริงก่อนแปลงสเกล ---
  const originalTotal = useMemo(() => data.reduce((sum, d) => sum + d.value, 0), [data]);

  // --- ส่วนที่แก้ไข: สร้างข้อมูลชุดใหม่ที่มีการปรับสเกลด้วย Math.log1p ---
  // Math.log1p(x) จะคำนวณ log(1+x) ช่วยให้ค่าที่น้อยๆ มีขนาดใหญ่ขึ้นเมื่อเทียบกับค่ามากๆ
  const scaledData = useMemo(() => data.map(item => ({
    ...item,
    scaledValue: Math.log1p(item.value) 
  })), [data]);

  const generateTreemapLayout = useCallback((items, width, height) => {
    let rects = [];
    const layoutRow = (rowItems, x, y, w, h) => {
      if (!rowItems.length) return;
      // --- ส่วนที่แก้ไข: ใช้ scaledValue ในการคำนวณสัดส่วน ---
      const totalValue = rowItems.reduce((sum, i) => sum + i.scaledValue, 0);
      if (totalValue === 0) return;
      let offset = 0;
      const isHorizontal = w > h;
      for (const item of rowItems) {
        // --- ส่วนที่แก้ไข: ใช้ scaledValue ในการคำนวณสัดส่วน ---
        const percentage = item.scaledValue / totalValue;
        if (isHorizontal) {
          const rectWidth = w * percentage;
          rects.push({ x: x + offset, y, width: rectWidth, height: h, item });
          offset += rectWidth;
        } else {
          const rectHeight = h * percentage;
          rects.push({ x, y: y + offset, width: w, height: rectHeight, item });
          offset += rectHeight;
        }
      }
    };
    const squarify = (items, x, y, w, h) => {
      if (!items.length) return;
      if (items.length <= 4) {
        layoutRow(items, x, y, w, h);
        return;
      }
      // --- ส่วนที่แก้ไข: ใช้ scaledValue ในการคำนวณสัดส่วน ---
      const halfValue = items.reduce((sum, i) => sum + i.scaledValue, 0) / 2;
      let runningTotal = 0;
      let splitIndex = 0;
      for (let i = 0; i < items.length; i++) {
        // --- ส่วนที่แก้ไข: ใช้ scaledValue ในการคำนวณสัดส่วน ---
        runningTotal += items[i].scaledValue;
        if (runningTotal >= halfValue) {
          splitIndex = i + 1;
          break;
        }
      }
      splitIndex = Math.max(1, splitIndex);
      const groupA = items.slice(0, splitIndex);
      const groupB = items.slice(splitIndex);
      const groupATotal = groupA.reduce((sum, i) => sum + i.scaledValue, 0);
      const totalValue = groupATotal + (groupB.reduce((sum, i) => sum + i.scaledValue, 0));

      if (totalValue === 0) return;
      if (w > h) {
        const groupAWidth = w * (groupATotal / totalValue);
        squarify(groupA, x, y, groupAWidth, h);
        squarify(groupB, x + groupAWidth, y, w - groupAWidth, h);
      } else {
        const groupAHeight = h * (groupATotal / totalValue);
        squarify(groupA, x, y, w, groupAHeight);
        squarify(groupB, x, y + groupAHeight, w, h - groupAHeight);
      }
    };
    squarify(items, 0, 0, 1000, 1000); // Use a relative base for layout
    return rects;
  }, []);

  // --- ส่วนที่แก้ไข: ส่ง scaledData เข้าไปคำนวณ layout ---
  const layout = useMemo(() => generateTreemapLayout(scaledData), [scaledData, generateTreemapLayout]);

  if (!data.length || originalTotal === 0) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 h-full">
        <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center"><BarChart3 className="w-5 h-5 mr-2 text-slate-400" />{title}</h3>
        <div className="text-center py-8"><p className="text-slate-500">ไม่มีข้อมูลสำหรับแสดงกราฟ</p></div>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-900 flex items-center">
          <BarChart3 className="w-5 h-5 mr-2 text-slate-400" />{title}
        </h3>
        <div className="text-right">
          {/* --- ส่วนที่แก้ไข: แสดงผลรวมจากค่าจริง --- */}
          <div className="text-lg font-bold text-slate-900">{originalTotal}</div>
          <div className="text-xs text-slate-500">ทั้งหมด</div>
        </div>
      </div>
      
      <div className="relative w-full flex-1">
        {layout.map((rect) => {
          const itemIndex = scaledData.findIndex(d => d.label === rect.item.label);
          const color = colors[itemIndex % colors.length];
          
          // --- ส่วนที่แก้ไข: คำนวณ % จากค่าจริง ---
          const percentage = originalTotal > 0 ? ((rect.item.value / originalTotal) * 100).toFixed(1) : 0;
          const valueText = `${rect.item.value} (${percentage}%)`;
          const fontSize = Math.min(rect.width / 10, rect.height / 5, 16);
          const textShadowStyle = { textShadow: '0px 1px 3px rgba(0, 0, 0, 0.6)' };

          return (
            <div
              key={rect.item.label}
              className="absolute border-2 border-white rounded-md flex flex-col items-center justify-center p-1 overflow-hidden text-center"
              style={{
                left: `${rect.x / 10}%`, top: `${rect.y / 10}%`, width: `${rect.width / 10}%`, height: `${rect.height / 10}%`,
                backgroundColor: color, transition: 'all 0.4s ease-in-out'
              }}
            >
              <div className="text-white font-bold" style={{ fontSize: `${fontSize}px`, ...textShadowStyle }}>
                {valueText}
              </div>
              <div className="text-white opacity-90 leading-tight" style={{ fontSize: `${Math.max(fontSize * 0.7, 10)}px`, ...textShadowStyle }}>
                {rect.item.label}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
});

// Pie Chart Component - ปรับปรุงให้สวยงาม
const PieChartComponent = memo(({ title, data, colors = [] }) => {
  const total = useMemo(() => data.reduce((sum, d) => sum + d.value, 0), [data]);
  
  if (!data.length || total === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center py-8">
          <p className="text-slate-500">ไม่มีข้อมูลสำหรับแสดงกราฟ</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-center mb-6">
        <div className="text-xl font-bold text-slate-900">จำนวน {total} คน</div>
      </div>
      
      <div className="flex-1 flex flex-col items-center justify-center">
        {/* Pie Chart - ขยายขนาดให้ใหญ่ขึ้น */}
        <div className="relative w-80 h-80 mb-8">
          <svg width="320" height="320" viewBox="0 0 320 320" className="w-full h-full">
            {data.map((item, index) => {
              const percentage = item.value / total;
              const angle = percentage * 360;
              
              const prevPercentage = data.slice(0, index).reduce((sum, d) => sum + d.value, 0) / total;
              const startAngle = prevPercentage * 360 - 90;
              const endAngle = startAngle + angle;
              
              // Pie chart - เป็นวงกลมเต็ม ไม่ใช่โดนัท
              const radius = 140;
              
              const startX = 160 + radius * Math.cos((startAngle * Math.PI) / 180);
              const startY = 160 + radius * Math.sin((startAngle * Math.PI) / 180);
              const endX = 160 + radius * Math.cos((endAngle * Math.PI) / 180);
              const endY = 160 + radius * Math.sin((endAngle * Math.PI) / 180);
              
              const largeArcFlag = angle > 180 ? 1 : 0;
              
              const pathData = [
                'M', 160, 160, // เริ่มที่จุดกึ่งกลาง
                'L', startX, startY,
                'A', radius, radius, 0, largeArcFlag, 1, endX, endY,
                'Z'
              ].join(' ');
              
              const pieColors = [
                '#8b5cf6', '#ec4899', '#06b6d4', '#10b981', '#f59e0b', 
                '#ef4444', '#84cc16', '#6366f1', '#f97316', '#14b8a6'
              ];
              const color = pieColors[index % pieColors.length];
              
              // คำนวณตำแหน่งสำหรับแสดง percentage
              const midAngle = startAngle + (angle / 2);
              const labelRadius = 120;
              const labelX = 160 + labelRadius * Math.cos((midAngle * Math.PI) / 180);
              const labelY = 160 + labelRadius * Math.sin((midAngle * Math.PI) / 180);
              const percentageText = `${(percentage * 100).toFixed(1)}%`;
              
              return (
                <g key={`pie-${index}`}>
                  <path
                    d={pathData}
                    fill={color}
                    stroke="white"
                    strokeWidth="3"
                    className="hover:opacity-80 transition-opacity duration-200"
                  />
                  {/* แสดง percentage */}
                  {percentage > 0.05 && (
                    <text
                      x={labelX}
                      y={labelY}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill="white"
                      fontSize="14"
                      fontWeight="bold"
                      stroke="#1e293b"
                      strokeWidth="1"
                      paintOrder="stroke"
                    >
                      {percentageText}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
        </div>
        
        {/* Legend */}
        <div className="w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
            {data.map((item, index) => {
              const percentage = ((item.value / total) * 100).toFixed(0);
              const pieColors = [
                '#8b5cf6', '#ec4899', '#06b6d4', '#10b981', '#f59e0b', 
                '#ef4444', '#84cc16', '#6366f1', '#f97316', '#14b8a6'
              ];
              const color = pieColors[index % pieColors.length];
              
              return (
                <div key={`legend-${item.label}-${index}`} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 min-w-0 flex-1">
                    <div 
                      className="w-4 h-4 rounded-full flex-shrink-0"
                      style={{ backgroundColor: color }}
                    />
                    <span className="text-sm text-slate-700">
                      {truncateAffiliation(item.label)} <span className="font-bold text-slate-900">{item.value}</span> คน
                    </span>
                  </div>
                  <div className="text-sm font-bold text-slate-900 ml-2">{percentage}%</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
});

// Horizontal Bar Chart Component
const HorizontalBarChart = memo(({ title, data, colors = [], maxHeight = '320px' }) => {
  
  const getSortOrder = (label) => {
    const regionMatch = label.match(/ภาค\s*(\d+)/);
    if (regionMatch) return parseInt(regionMatch[1]);
    const customOrder = ['ศาลชั้นต้นในเขตกรุงเทพมหานคร', 'ศูนย์รักษาความปลอดภัย', 'ศาลชำนาญพิเศษ', 'ศาลสูง'];
    const index = customOrder.findIndex(item => label.includes(item));
    if (index !== -1) return 100 + index;
    return 999;
  };

  const sortedData = useMemo(() => 
    [...data].sort((a, b) => getSortOrder(a.label) - getSortOrder(b.label)), 
    [data]
  );
  
  const maxValue = useMemo(() => {
    if (!sortedData || sortedData.length === 0) return 0;
    return Math.max(...sortedData.map(d => d.value));
  }, [sortedData]);

  if (!sortedData.length || maxValue === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center py-8">
          <p className="text-slate-500">ไม่มีข้อมูลสำหรับแสดงกราฟ</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full">
      <div className="space-y-2 h-full overflow-y-auto">
        {sortedData.map((item, index) => {
          const barWidth = (item.value / maxValue) * 100;
          const color = colors[index % colors.length] || '#8b5cf6';
          
          return (
            <div key={`${item.label}-${index}`} className="grid grid-cols-3 gap-2 items-center">
              {/* Left Column for Full Label (CHANGED to text-left) */}
              <div className="col-span-1 text-sm text-slate-700 font-medium text-left truncate" title={item.label}>
                {item.label}
              </div>
              
              {/* Right Column for Bar */}
              <div className="col-span-2 w-full bg-slate-100 rounded-full h-7 relative">
                <div
                  className="h-7 rounded-full transition-all duration-700 flex items-center justify-end pr-3"
                  style={{
                    width: `${barWidth}%`, backgroundColor: color, minWidth: '36px'
                  }}
                >
                   <span className="text-white text-sm font-bold">{item.value}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
});

// SummaryCards Component - แทนที่กราฟโดนัท
const SummaryCards = memo(({ data, colors = [] }) => {
  const total = useMemo(() => data.reduce((sum, d) => sum + d.value, 0), [data]);
  const sortedData = useMemo(() => 
    [...data].sort((a, b) => b.value - a.value), [data]
  );

  if (!data.length || total === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center py-8">
          <p className="text-slate-500">ไม่มีข้อมูลสำหรับแสดงผล</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        {/* สรุปรวม */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-xl">
          <div className="text-2xl font-bold">{total}</div>
          <div className="text-sm opacity-90">รวมทั้งหมด</div>
        </div>
        
        {/* ข้อมูลสูงสุด */}
        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-xl">
          <div className="text-2xl font-bold">{sortedData[0]?.value || 0}</div>
          <div className="text-sm opacity-90">สูงสุด: {sortedData[0]?.label || 'ไม่มีข้อมูล'}</div>
        </div>
      </div>

      {/* รายการข้อมูลแบบการ์ด */}
      <div className="space-y-3">
        {sortedData.map((item, index) => {
          const percentage = ((item.value / total) * 100).toFixed(1);
          const color = colors[index % colors.length] || '#8b5cf6';
          
          return (
            <div 
              key={`${item.label}-${index}`} 
              className="bg-gradient-to-r from-slate-50 to-slate-100 border border-slate-200 rounded-lg p-4 hover:shadow-md transition-all duration-200"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-4 h-4 rounded-full" 
                    style={{ backgroundColor: color }}
                  />
                  <span className="font-medium text-slate-800">{item.label}</span>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-slate-900">{item.value}</div>
                  <div className="text-xs text-slate-500">{percentage}%</div>
                </div>
              </div>
              
              {/* Progress bar */}
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div 
                  className="h-2 rounded-full transition-all duration-700" 
                  style={{ 
                    width: `${percentage}%`, 
                    backgroundColor: color 
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
});

// (moved into the PersonnelPage component to avoid calling hooks at top level)

// EditableCard Component (restored minimal implementation)
const EditableCard = memo(({ title, value, icon: Icon, color = "blue", isEditing, onEdit, onChange, isAdmin }) => {
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleChange = (e) => {
    const newValue = parseInt(e.target.value) || 0;
    setLocalValue(newValue);
    onChange(newValue);
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
      <div className="flex items-center justify-between mb-2">
        <div className={`w-12 h-12 bg-${color}-100 rounded-xl flex items-center justify-center`}>
          {Icon && <Icon className={`w-6 h-6 text-${color}-600`} />}
        </div>
        {isAdmin && (
          <button
            onClick={onEdit}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            {isEditing ? <Save className="w-5 h-5" /> : <Edit2 className="w-5 h-5" />}
          </button>
        )}
      </div>
      {isEditing ? (
        <input
          type="number"
          value={localValue}
          onChange={handleChange}
          className="w-full text-3xl font-bold text-slate-900 mb-1 bg-slate-50 border border-slate-200 rounded px-2 py-1"
          min="0"
        />
      ) : (
        <div className="text-3xl font-bold text-slate-900 mb-1">{localValue}</div>
      )}
      <div className="text-sm text-slate-600">{title}</div>
    </div>
  );
});

// PersonnelDetailModal (minimal)
const PersonnelDetailModal = memo(({ person, isOpen, onClose }) => {
  if (!isOpen || !person) return null;

  // Calculate age from birth date
  const calculateAge = (dob) => {
    if (!dob) return 'ไม่ระบุ';
    try {
      const birthDate = new Date(dob);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      
      return `${age} ปี`;
    } catch (error) {
      return 'ไม่ระบุ';
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 hide-scrollbar">
      <div className="flex min-h-screen items-start justify-center p-3 sm:p-6 md:p-10">
        <div className="relative bg-gradient-to-br from-white via-slate-50 to-indigo-50 rounded-2xl sm:rounded-3xl shadow-2xl max-w-3xl w-full p-4 sm:p-6">
          {/* Header with game-card style */}
          <div className="flex items-start justify-between mb-6 pb-4 border-b border-slate-200">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-lg sm:text-xl font-bold shadow-lg">
                {(person.firstname || 'N')[0]}
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                  {person.prefix} {person.firstname} {person.lastname}
                </h2>
                <p className="text-sm text-slate-600">{person.position || 'ไม่ระบุตำแหน่ง'}</p>
              </div>
            </div>
            <button 
              onClick={onClose} 
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-white/80 rounded-lg transition-all duration-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {/* Contact Information Card */}
            <div className="bg-gradient-to-br from-white to-blue-50 rounded-xl p-4 sm:p-5 shadow-lg border border-slate-200/50">
              <h3 className="text-base sm:text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <Phone className="w-5 h-5 text-blue-600" />
                ข้อมูลติดต่อ
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-2 rounded-lg bg-white/70 hover:bg-white transition-colors">
                  <Phone className="w-4 h-4 text-slate-500" />
                  <span className="text-sm text-slate-700">{formatPhoneNumber(person.phone) || 'ไม่ระบุ'}</span>
                </div>
                <div className="flex items-center gap-3 p-2 rounded-lg bg-white/70 hover:bg-white transition-colors">
                  <Mail className="w-4 h-4 text-slate-500" />
                  <span className="text-sm text-slate-700">{person.email || 'ไม่ระบุ'}</span>
                </div>
              </div>
            </div>

            {/* Work Information Card */}
            <div className="bg-gradient-to-br from-white to-green-50 rounded-xl p-4 sm:p-5 shadow-lg border border-slate-200/50">
              <h3 className="text-base sm:text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <Building className="w-5 h-5 text-green-600" />
                ข้อมูลการทำงาน
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-2 rounded-lg bg-white/70 hover:bg-white transition-colors">
                  <Building2 className="w-4 h-4 text-slate-500" />
                  <div className="text-sm">
                    <div className="font-medium text-slate-700">สังกัด</div>
                    <div className="text-slate-600">{person.affiliation || 'ไม่ระบุ'}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-2 rounded-lg bg-white/70 hover:bg-white transition-colors">
                  <Users className="w-4 h-4 text-slate-500" />
                  <div className="text-sm">
                    <div className="font-medium text-slate-700">หน่วยงาน</div>
                    <div className="text-slate-600">{person.deph || 'ไม่ระบุ'}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-2 rounded-lg bg-white/70 hover:bg-white transition-colors">
                  <Crown className="w-4 h-4 text-slate-500" />
                  <div className="text-sm">
                    <div className="font-medium text-slate-700">ตำแหน่ง</div>
                    <div className="text-slate-600">{person.position || 'ไม่ระบุ'}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Information Card */}
            <div className="lg:col-span-2 bg-gradient-to-br from-white to-purple-50 rounded-xl p-4 sm:p-5 shadow-lg border border-slate-200/50">
              <h3 className="text-base sm:text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-purple-600" />
                ข้อมูลเพิ่มเติม
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="text-sm font-medium text-slate-700">อายุ</div>
                  <div className="text-sm text-slate-600 p-2 bg-white/70 rounded-lg">
                    {calculateAge(person.dob)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 mt-6 pt-4 border-t border-slate-200">
            {person.phone && (
              <button 
                onClick={() => window.open(`tel:${formatPhoneNumber(person.phone)}`, '_self')} 
                className="flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <Phone className="w-4 h-4" />
                <span className="text-sm font-medium">โทรหา</span>
              </button>
            )}
            {person.email && (
              <button 
                onClick={() => window.open(`mailto:${person.email}`, '_self')} 
                className="flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <Mail className="w-4 h-4" />
                <span className="text-sm font-medium">ส่งอีเมล</span>
              </button>
            )}
            <button 
              onClick={onClose} 
              className="flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-slate-500 to-slate-600 text-white rounded-lg hover:from-slate-600 hover:to-slate-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 sm:ml-auto"
            >
              <span className="text-sm font-medium">ปิด</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

// SearchModal (enhanced with department filtering and game-card style)
// Small visual card for a person used in search results (game-card style)
const PersonCard = memo(({ person, onView, onCall, onMail }) => {
  return (
    <div className="bg-gradient-to-br from-white via-blue-50 to-indigo-100 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-4 sm:p-6 border border-indigo-200 hover:border-indigo-300 transform hover:scale-105">
      {/* Header with name and position */}
      <div className="mb-4">
        <div className="text-sm sm:text-base font-bold text-slate-900 mb-1">
          {person.prefix} {person.firstname} {person.lastname}
        </div>
        <div className="text-xs sm:text-sm text-indigo-600 font-medium">
          {person.position || 'ไม่ระบุตำแหน่ง'}
        </div>
      </div>

      {/* Info section */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-600">
          <Building2 className="w-4 h-4 text-indigo-500 flex-shrink-0" />
          <span className="truncate">{person.affiliation || 'ไม่ระบุสังกัด'}</span>
        </div>
        <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-600">
          <Briefcase className="w-4 h-4 text-purple-500 flex-shrink-0" />
          <span className="truncate">{person.deph || 'ไม่ระบุหน่วยงาน'}</span>
        </div>
      </div>

      {/* Action buttons */}
      <div className="space-y-2">
        <button 
          onClick={() => onView(person)} 
          className="w-full px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-all duration-200 shadow-md hover:shadow-lg"
        >
          <Eye className="w-4 h-4" /> 
          ดูรายละเอียด
        </button>
        
        {/* Contact buttons */}
        <div className="flex items-center gap-2">
          {person.phone && (
            <button 
              onClick={() => onCall(formatPhoneNumber(person.phone))} 
              className="flex-1 p-2 rounded-xl bg-green-100 hover:bg-green-200 text-green-600 transition-colors shadow-sm flex items-center justify-center gap-1" 
              title="โทร"
            >
              <Phone className="w-4 h-4" />
              <span className="text-xs">โทร</span>
            </button>
          )}
          {person.email && (
            <button 
              onClick={() => onMail(person.email)} 
              className="flex-1 p-2 rounded-xl bg-blue-100 hover:bg-blue-200 text-blue-600 transition-colors shadow-sm flex items-center justify-center gap-1" 
              title="อีเมล"
            >
              <Mail className="w-4 h-4" />
              <span className="text-xs">อีเมล</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
});

const SearchModal = memo(({ isOpen, onClose, personnelData = [], stats = {}, onViewPerson = () => {}, onExport = () => {}, user }) => {
  const [query, setQuery] = useState('');
  const [filterAff, setFilterAff] = useState('');
  const [filterDept, setFilterDept] = useState('');
  const [filterPos, setFilterPos] = useState('');

  // Get unique affiliations
  const affiliations = useMemo(() => {
    const setAff = new Set();
    personnelData.forEach(p => setAff.add(p.affiliation || 'ไม่ระบุ'));
    return Array.from(setAff).sort();
  }, [personnelData]);

  // Get departments based on selected affiliation
  const departments = useMemo(() => {
    const relevantPersonnel = filterAff 
      ? personnelData.filter(p => (p.affiliation || 'ไม่ระบุ') === filterAff)
      : personnelData;
    
    const setDept = new Set();
    relevantPersonnel.forEach(p => setDept.add(p.deph || 'ไม่ระบุ'));
    return Array.from(setDept).sort();
  }, [personnelData, filterAff]);

  // Get positions
  const positions = useMemo(() => {
    const s = new Set();
    personnelData.forEach(p => s.add(p.position || 'ไม่ระบุ'));
    return Array.from(s).sort();
  }, [personnelData]);

  // Reset department when affiliation changes
  useEffect(() => {
    if (filterAff) {
      setFilterDept('');
    }
  }, [filterAff]);

  if (!isOpen) return null;

  const results = personnelData.filter(p => {
    const hay = `${p.firstname} ${p.lastname} ${p.position || ''} ${p.affiliation || ''} ${p.deph || ''}`.toLowerCase();
    if (query && !hay.includes(query.toLowerCase())) return false;
    if (filterAff && (p.affiliation || 'ไม่ระบุ') !== filterAff) return false;
    if (filterDept && (p.deph || 'ไม่ระบุ') !== filterDept) return false;
    if (filterPos && (p.position || 'ไม่ระบุ') !== filterPos) return false;
    return true;
  });

  const handleCall = (tel) => window.open(`tel:${tel}`, '_self');
  const handleMail = (email) => window.open(`mailto:${email}`, '_self');

  const clearFilters = () => { 
    setFilterAff(''); 
    setFilterDept(''); 
    setFilterPos(''); 
    setQuery(''); 
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 hide-scrollbar">
      <div className="flex min-h-screen items-start justify-center p-3 sm:p-6 md:p-10">
        <div className="relative bg-white rounded-2xl sm:rounded-3xl shadow-2xl max-w-6xl w-full p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">🔍 ค้นหาบุคลากร</h2>
            <button 
              onClick={onClose} 
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Enhanced Search Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
            <input 
              value={query} 
              onChange={(e) => setQuery(e.target.value)} 
              className="w-full p-2 sm:p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm" 
              placeholder="🔍 ค้นหาชื่อ, ตำแหน่ง..." 
            />
            
            <select 
              value={filterAff} 
              onChange={(e) => setFilterAff(e.target.value)} 
              className="p-2 sm:p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm"
            >
              <option value="">🏢 ทั้งหมด (สังกัด)</option>
              {affiliations.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
            
            <select 
              value={filterDept} 
              onChange={(e) => setFilterDept(e.target.value)} 
              className="p-2 sm:p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm"
              disabled={!filterAff}
            >
              <option value="">🏛️ ทั้งหมด (หน่วยงาน)</option>
              {departments.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            
            <select 
              value={filterPos} 
              onChange={(e) => setFilterPos(e.target.value)} 
              className="p-2 sm:p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm"
            >
              <option value="">👤 ทั้งหมด (ตำแหน่ง)</option>
              {positions.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>

          {/* Results header and actions */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-3">
            <div className="text-sm text-slate-600 flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-500" />
              พบ <span className="font-bold text-indigo-600">{results.length}</span> รายการ
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={clearFilters} 
                className="text-sm text-slate-600 px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                🗑️ ล้างตัวกรอง
              </button>
              <button 
                onClick={() => onExport(results)} 
                className="text-sm px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center gap-1"
              >
                <Download className="w-4 h-4" />
                ส่งออก
              </button>
            </div>
          </div>

          {/* Results grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 max-h-[60vh] overflow-y-auto hide-scrollbar">
            {results.map((p, i) => (
              <PersonCard 
                key={`${p.phone || i}-${i}`} 
                person={p} 
                onView={onViewPerson} 
                onCall={handleCall} 
                onMail={handleMail} 
              />
            ))}
            {results.length === 0 && (
              <div className="col-span-full text-center text-slate-500 py-12">
                <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-600 mb-2">ไม่พบผลลัพธ์</h3>
                <p className="text-sm">ลองเปลี่ยนคำค้นหาหรือตัวกรองข้อมูล</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

export default function PersonnelPage({ user }) {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [personnelData, setPersonnelData] = useState([]);
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);

  const [quota, setQuota] = useState(100);
  const [vacancy, setVacancy] = useState(20);
  const [isEditingQuota, setIsEditingQuota] = useState(false);
  const [isEditingVacancy, setIsEditingVacancy] = useState(false);

  const [selectedChart, setSelectedChart] = useState("position"); // Default chart type
  const [selectedAffiliation, setSelectedAffiliation] = useState(""); // For department filtering
  const [filters, setFilters] = useState({
    affiliation: "",
    department: "",
    ageRange: "",
    gender: "",
  });

  const logAdminActivity = useCallback((action, details) => {
    if (!user) return;
    fetch(CONFIG.ADMIN_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'log_activity',
        log_action: action,
        log_details: details || null,
        user_id: user.id,
        username: user.username,
      }),
    }).catch((error) => console.error('Failed to log activity:', error));
  }, [user]);

  const fetchPersonnelData = useCallback(async () => {
    try {
      const apiUrl = CONFIG.OFFICERS_API;
      const response = await fetch(apiUrl);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const text = await response.text();
      if (!text) throw new Error('Empty response from server');
      const result = JSON.parse(text);
      const data = result.success && Array.isArray(result.data) ? result.data : [];
      const formattedData = data.map((person) => ({
        phone: person.phone || '',
        prefix: person.prefix || '',
        firstname: person.firstname || '',
        lastname: person.lastname || '',
        position: person.position || '',
        affiliation: person.affiliation || '',
        deph: person.department || '',
        generation: person.generation || '',
        email: person.email || '',
        dob: person.dob || '',
        lineUserId: person.lineUserId || '',
        role: person.role || 'member',
      }));
      setPersonnelData(formattedData);
      setError("");
    } catch (error) {
      setError(`⚠️ ${error.message}`);
      setPersonnelData([]);
    }
  }, []);

  useEffect(() => {
    fetchPersonnelData();
  }, [fetchPersonnelData]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchPersonnelData().finally(() => setRefreshing(false));
  };

  const handleViewPerson = (person) => {
  // If user opened from search, close search modal first so detail appears on top
  setShowSearchModal(false);
  setSelectedPerson(person);
  setShowDetail(true);
  };

  const exportToCSV = (data) => {
    // Implement CSV export logic here
  };

  const affiliationAbbreviations = {
    "ศูนย์รักษาความปลอดภัย": "ส่วนกลาง",
    "ศาลชั้นต้นในกรุงเทพมหานคร": "กทม.",
  };

  const filteredAffiliationData = useMemo(() => {
    return personnelData.reduce((acc, person) => {
      let affiliation = (person.affiliation || '').trim();
      if (!affiliation) affiliation = 'ไม่ระบุ';

      const lower = affiliation.toLowerCase();

      // Normalize known patterns using targeted rules
      let normalized = affiliation;

      // If it's the regional office pattern that contains สำนักศาลยุติธรรมประจำภาค
      // we want to convert it to: 'ภาค <n>' when a number exists, otherwise 'ภาค'
      if (
        lower.includes('สำนักศาลยุติธรรมประจำภาค') ||
        lower.includes('สำนักยุติธรรมประจำภาค') ||
        lower.includes('ในสังกัดสำนักศาลยุติธรรมประจำภาค') ||
        lower.includes('ศาลในสังกัดสำนักศาลยุติธรรมประจำภาค')
      ) {
        // Try to extract explicit 'ภาค <number>' first
        const matchRegion = affiliation.match(/ภาค\s*(\d{1,3})/i);
        if (matchRegion && matchRegion[1]) {
          normalized = `ภาค ${matchRegion[1]}`;
        } else {
          // Fallback: find any trailing number in the string (e.g., '... ประจำภาค 4')
          const trailingNum = affiliation.match(/(\d{1,3})\s*$/);
          if (trailingNum && trailingNum[1]) {
            normalized = `ภาค ${trailingNum[1]}`;
          } else {
            // Last-resort: any first number in the string
            const anyNum = affiliation.match(/(\d{1,3})/);
            normalized = anyNum && anyNum[1] ? `ภาค ${anyNum[1]}` : 'ภาค';
          }
        }
      } else if (lower.includes('ศูนย์รักษาความปลอดภัย')) {
        normalized = 'ส่วนกลาง';
      } else if (lower.includes('กรุงเทพ') || lower.includes('กรุงเทพมหานคร') || lower.includes('ศาลชั้นต้นในกรุงเทพมหานคร')) {
        normalized = 'กทม.';
      } else {
        // fallback to any exact mapping we defined, otherwise keep original
        normalized = affiliationAbbreviations[affiliation] || affiliation;
      }

      acc[normalized] = (acc[normalized] || 0) + 1;
      return acc;
    }, {});
  }, [personnelData]);

  const chartData = useMemo(() => {
    const entries = Object.entries(filteredAffiliationData).map(([label, value]) => ({ label, value }));

    const getOrderKey = (label) => {
      if (!label) return 9999;
      const l = String(label).trim();

      // Match 'ภาค' followed by number e.g. 'ภาค 1' or 'ภาค1'
      const m = l.match(/ภาค\s*(\d{1,3})/);
      if (m && m[1]) {
        // Put ภาค N in order 0.. (keep N small)
        const num = parseInt(m[1], 10);
        return num; // 1..9 -> 1..9 (smaller is earlier)
      }

      // If label is exactly 'ภาค' (no number), put after numbered ภาค
      if (/^ภาค$/i.test(l)) return 999;

      // Specific named orders after ภาค group
      if (l === 'กทม.' || l.toLowerCase() === 'กทม.') return 1000;
      if (l === 'ส่วนกลาง' || l.toLowerCase() === 'ส่วนกลาง') return 1001;
      if (l.includes('ศาลสูง')) return 1002;
      // handle both spellings 'ชำนาญ' and 'ชำนัญ'
      if (l.includes('ชำนาญ') || l.includes('ชำนัญ') || l.includes('ชำนัญพิเศษ') || l.includes('ชำนาญพิเศษ')) return 1003;

      // Default: place after known groups but preserve alphabetical order by returning a high key plus name
      return 5000 + l.charCodeAt(0);
    };

    entries.sort((a, b) => {
      const ka = getOrderKey(a.label);
      const kb = getOrderKey(b.label);
      if (ka === kb) {
        // fallback alphabetical
        return String(a.label).localeCompare(String(b.label));
      }
      return ka - kb;
    });

    return entries;
  }, [filteredAffiliationData]);

  const stats = useMemo(() => {
    const newStats = {
      total: personnelData.length,
      connected: personnelData.filter((p) => p.lineUserId).length,
      byPosition: {},
      byAffiliation: {},
      byDepartment: {},
      byGeneration: {},
    };
    personnelData.forEach((person) => {
      const position = person.position || 'ไม่ระบุ';
      newStats.byPosition[position] = (newStats.byPosition[position] || 0) + 1;
      const affiliation = person.affiliation || 'ไม่ระบุ';
      newStats.byAffiliation[affiliation] = (newStats.byAffiliation[affiliation] || 0) + 1;
      const department = person.deph || 'ไม่ระบุตำแหน่ง';
      newStats.byDepartment[department] = (newStats.byDepartment[department] || 0) + 1;
      const generation = person.generation ? String(person.generation).trim() : 'ไม่ระบุตำแหน่ง';
      newStats.byGeneration[generation] = (newStats.byGeneration[generation] || 0) + 1;
    });
    return newStats;
  }, [personnelData]);

  useEffect(() => {
    console.log("Personnel Data:", personnelData);
  }, [personnelData]);

  useEffect(() => {
    console.log("Stats:", stats);
    console.log("Chart Data:", chartData);
  }, [stats, chartData]);

  const chartColors = [
    "#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF", "#FF9F40", "#FFCD56", "#C9CBCF"
  ];

  // Helper: build chart data for different types (inside component)
  const getChartData = useCallback((type) => {
    if (type === 'affiliation') return chartData; // already normalized affiliation entries

    if (type === 'position') {
      // build from stats.byPosition
      const entries = Object.entries(stats.byPosition || {}).map(([label, value]) => ({ label, value }));
      // sort by value desc
      entries.sort((a, b) => b.value - a.value);
      return entries;
    }

    if (type === 'department') {
      // build from deph field - filter by selected affiliation if any
      const groups = {};
      const filteredData = selectedAffiliation 
        ? personnelData.filter(p => (p.affiliation || 'ไม่ระบุ') === selectedAffiliation)
        : personnelData;
        
      filteredData.forEach(p => {
        const dept = p.deph || 'ไม่ระบุ';
        groups[dept] = (groups[dept] || 0) + 1;
      });
      return Object.entries(groups).map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value);
    }

    if (type === 'age') {
      // derive age groups from dob (basic)
      const groups = { '<30': 0, '30-39': 0, '40-49': 0, '50-59': 0, '60+': 0 };
      const now = new Date();
      personnelData.forEach(p => {
        if (!p.dob) return;
        const m = String(p.dob).match(/(\d{4})/);
        if (!m) return;
        const year = parseInt(m[1], 10);
        if (isNaN(year)) return;
        const age = now.getFullYear() - year;
        if (age < 30) groups['<30']++;
        else if (age < 40) groups['30-39']++;
        else if (age < 50) groups['40-49']++;
        else if (age < 60) groups['50-59']++;
        else groups['60+']++;
      });
      return Object.entries(groups).map(([label, value]) => ({ label, value }));
    }

    if (type === 'gender') {
      // no gender field in data - return empty to show no data
      const genders = (personnelData || []).reduce((acc, p) => {
        const g = (p.gender || '').trim();
        if (!g) return acc;
        acc[g] = (acc[g] || 0) + 1;
        return acc;
      }, {});
      return Object.entries(genders).map(([label, value]) => ({ label, value }));
    }

    return [];
  }, [chartData, stats, personnelData, selectedAffiliation]); // Add selectedAffiliation dependency

  // Helper function to get chart title
  const getChartTitle = (chartType) => {
    switch (chartType) {
      case "position":
        return "ตำแหน่ง";
      case "affiliation":
        return "สัดส่วนแต่ละสังกัด";
      case "department":
        return selectedAffiliation 
          ? `หน่วยงานใน${selectedAffiliation}`
          : "หน่วยงาน (เลือกสังกัดก่อน)";
      case "gender":
        return "เพศ";
      case "age":
        return "ช่วงอายุ";
      default:
        return "ข้อมูลบุคลากร";
    }
  };

  const renderChart = () => {
    switch (selectedChart) {
      case "position":
        return (
          <HorizontalBarChart
            data={getChartData('position')}
            colors={chartColors}
            title="ตำแหน่ง"
            maxHeight="800px"
          />
        );
      case "affiliation":
        return (
          <HorizontalBarChart
            data={getChartData('affiliation')}
            colors={chartColors}
            title="สัดส่วนแต่ละสังกัด"
            maxHeight="800px"
          />
        );
      case "department":
        return (
          <div className="space-y-4">
            {!selectedAffiliation ? (
              <div className="text-center py-8">
                <Building2 className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-600 mb-2">เลือกสังกัดก่อน</h3>
                <p className="text-sm text-slate-500 mb-4">กรุณาเลือกสังกัดเพื่อดูหน่วยงานในสังกัดนั้น</p>
                <select 
                  value={selectedAffiliation}
                  onChange={(e) => setSelectedAffiliation(e.target.value)}
                  className="p-2 border border-slate-300 rounded-lg"
                >
                  <option value="">เลือกสังกัด</option>
                  {Array.from(new Set(personnelData.map(p => p.affiliation || 'ไม่ระบุ'))).sort().map(aff => (
                    <option key={aff} value={aff}>{aff}</option>
                  ))}
                </select>
              </div>
            ) : (
              <HorizontalBarChart
                data={getChartData('department')}
                colors={chartColors}
                title={`หน่วยงานใน${selectedAffiliation}`}
                maxHeight="320px"
              />
            )}
          </div>
        );
      case "gender":
        return (
          <PieChartComponent
            data={getChartData('gender')}
            colors={chartColors}
            title="เพศ"
          />
        );
      case "age":
        return (
          <HorizontalBarChart
            data={getChartData('age')}
            colors={chartColors}
            title="ช่วงอายุ"
            maxHeight="240px"
          />
        );
      default:
        return <p>ไม่มีข้อมูลสำหรับแสดงผล</p>;
    }
  };

  return (
    <div className="w-full min-h-full p-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-3">
        <div className="flex items-center gap-4">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800">ข้อมูลบุคลากร</h1>
          <button
            onClick={() => setShowSearchModal(true)}
            className="flex items-center space-x-2 px-3 sm:px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow text-sm transition-colors"
          >
            <Search className="w-4 h-4" />
            <span>ค้นหาบุคลากร</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <EditableCard
          title="กรอบอัตรา"
          value={quota}
          icon={Briefcase}
          color="blue"
          isEditing={isEditingQuota}
          onEdit={() => setIsEditingQuota(!isEditingQuota)}
          onChange={(value) => setQuota(value)}
          isAdmin={user?.role === 'admin'}
        />
        <EditableCard
          title="ตำแหน่งว่าง"
          value={vacancy}
          icon={UserX}
          color="red"
          isEditing={isEditingVacancy}
          onEdit={() => setIsEditingVacancy(!isEditingVacancy)}
          onChange={(value) => setVacancy(value)}
          isAdmin={user?.role === 'admin'}
        />
        <StatCard
          title="บุคลากรทั้งหมด"
          value={stats.total}
          icon={Users}
          color="green"
          subtitle="ทั้งหมดในระบบ"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2 sm:gap-4 mb-4 sm:mb-6">
        <button
          onClick={() => setSelectedChart("position")}
          className={`px-3 sm:px-4 py-2 rounded-lg text-sm transition-colors ${selectedChart === "position" ? "bg-indigo-600 text-white" : "bg-gray-200 text-gray-800 hover:bg-gray-300"}`}
        >
          ตำแหน่ง
        </button>
        <button
          onClick={() => setSelectedChart("affiliation")}
          className={`px-3 sm:px-4 py-2 rounded-lg text-sm transition-colors ${selectedChart === "affiliation" ? "bg-indigo-600 text-white" : "bg-gray-200 text-gray-800 hover:bg-gray-300"}`}
        >
          สังกัด
        </button>
        <button
          onClick={() => {
            setSelectedChart("department");
            if (!selectedAffiliation) {
              // Auto-select first affiliation if none selected
              const affiliations = Array.from(new Set(personnelData.map(p => p.affiliation || 'ไม่ระบุ'))).sort();
              if (affiliations.length > 0) {
                setSelectedAffiliation(affiliations[0]);
              }
            }
          }}
          className={`px-3 sm:px-4 py-2 rounded-lg text-sm transition-colors ${selectedChart === "department" ? "bg-indigo-600 text-white" : "bg-gray-200 text-gray-800 hover:bg-gray-300"}`}
        >
          หน่วยงาน
        </button>
        <button
          onClick={() => setSelectedChart("gender")}
          className={`px-3 sm:px-4 py-2 rounded-lg text-sm transition-colors ${selectedChart === "gender" ? "bg-indigo-600 text-white" : "bg-gray-200 text-gray-800 hover:bg-gray-300"}`}
        >
          เพศ
        </button>
        <button
          onClick={() => setSelectedChart("age")}
          className={`px-3 sm:px-4 py-2 rounded-lg text-sm transition-colors ${selectedChart === "age" ? "bg-indigo-600 text-white" : "bg-gray-200 text-gray-800 hover:bg-gray-300"}`}
        >
          ช่วงอายุ
        </button>
        
        {selectedChart === "department" && (
          <select 
            value={selectedAffiliation}
            onChange={(e) => setSelectedAffiliation(e.target.value)}
            className="ml-2 p-2 border border-slate-300 rounded-lg text-sm bg-white"
          >
            <option value="">เลือกสังกัด</option>
            {Array.from(new Set(personnelData.map(p => p.affiliation || 'ไม่ระบุ'))).sort().map(aff => (
              <option key={aff} value={aff}>{aff}</option>
            ))}
          </select>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 sm:p-6 min-h-[600px]">
          <h2 className="text-base sm:text-lg font-semibold text-slate-800 mb-4">กราฟแท่ง</h2>
          <div className="h-[520px]">
            {renderChart()}
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 sm:p-6 min-h-[600px]">
          <h2 className="text-base sm:text-lg font-semibold text-slate-800 mb-4">กราฟวงกลม</h2>
          <div className="h-[520px]">
            <PieChartComponent data={getChartData(selectedChart)} colors={chartColors} title={getChartTitle(selectedChart)} />
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 sm:p-6 h-[600px]">
          <h2 className="text-base sm:text-lg font-semibold text-slate-800 mb-4">สรุปข้อมูล</h2>
          <SummaryCards data={getChartData(selectedChart)} colors={chartColors} title={getChartTitle(selectedChart)} />
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 sm:p-6 min-h-[600px]">
          <h2 className="text-base sm:text-lg font-semibold text-slate-800 mb-4">กราฟเส้น</h2>
          <div className="h-[520px]">
            <LineChart data={getChartData(selectedChart)} colors={chartColors} title={getChartTitle(selectedChart)} />
          </div>
        </div>
      </div>

      <PersonnelDetailModal
        person={selectedPerson}
        isOpen={showDetail}
        onClose={() => setShowDetail(false)}
      />
      <SearchModal
        isOpen={showSearchModal}
        onClose={() => setShowSearchModal(false)}
        personnelData={personnelData}
        stats={stats}
        onViewPerson={handleViewPerson}
        onExport={exportToCSV}
        user={user}
      />
    </div>
  );
}