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
  GraduationCap
} from "lucide-react";
import { CONFIG } from '../config';



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
  return affiliation.replace(/ศาล/gi, '').trim() || affiliation;
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

// Pie Chart Component - เปลี่ยนเป็น Donut Chart
const PieChartComponent = memo(({ title, data, colors = [] }) => {
  const total = useMemo(() => data.reduce((sum, d) => sum + d.value, 0), [data]);
  
  if (!data.length || total === 0) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
        <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
          <PieChart className="w-5 h-5 mr-2 text-slate-400" />
          {title}
        </h3>
        <div className="text-center py-8">
          <p className="text-slate-500">ไม่มีข้อมูลสำหรับแสดงกราฟ</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 h-fit">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-900 flex items-center">
          <PieChart className="w-5 h-5 mr-2 text-slate-400" />
          {title}
        </h3>
        <div className="text-right">
          <div className="text-lg font-bold text-slate-900">จำนวน {total} คน</div>
        </div>
      </div>
      
      <div className="relative border border-slate-200 rounded-lg p-4 bg-slate-50">
        <div className="flex flex-col items-center">
          {/* Donut Chart */}
          <div className="relative w-48 h-48">
            <svg width="192" height="192" viewBox="0 0 192 192" className="w-full h-full">
              {data.map((item, index) => {
                const percentage = item.value / total;
                const angle = percentage * 360;
                
                const prevPercentage = data.slice(0, index).reduce((sum, d) => sum + d.value, 0) / total;
                const startAngle = prevPercentage * 360 - 90;
                const endAngle = startAngle + angle;
                
                // Donut chart - outer radius 80, inner radius 45
                const outerRadius = 80;
                const innerRadius = 45;
                
                const startXOuter = 96 + outerRadius * Math.cos((startAngle * Math.PI) / 180);
                const startYOuter = 96 + outerRadius * Math.sin((startAngle * Math.PI) / 180);
                const endXOuter = 96 + outerRadius * Math.cos((endAngle * Math.PI) / 180);
                const endYOuter = 96 + outerRadius * Math.sin((endAngle * Math.PI) / 180);
                
                const startXInner = 96 + innerRadius * Math.cos((endAngle * Math.PI) / 180);
                const startYInner = 96 + innerRadius * Math.sin((endAngle * Math.PI) / 180);
                const endXInner = 96 + innerRadius * Math.cos((startAngle * Math.PI) / 180);
                const endYInner = 96 + innerRadius * Math.sin((startAngle * Math.PI) / 180);
                
                const largeArcFlag = angle > 180 ? 1 : 0;
                
                const pathData = [
                  'M', startXOuter, startYOuter,
                  'A', outerRadius, outerRadius, 0, largeArcFlag, 1, endXOuter, endYOuter,
                  'L', startXInner, startYInner,
                  'A', innerRadius, innerRadius, 0, largeArcFlag, 0, endXInner, endYInner,
                  'Z'
                ].join(' ');
                
                const pieColors = [
                  '#8b5cf6', '#ec4899', '#06b6d4', '#10b981', '#f59e0b', 
                  '#ef4444', '#84cc16', '#6366f1', '#f97316', '#14b8a6'
                ];
                const color = pieColors[index % pieColors.length];
                
                // คำนวณตำแหน่งสำหรับแสดง percentage
                const midAngle = startAngle + (angle / 2);
                const labelRadius = 90;
                const labelX = 96 + labelRadius * Math.cos((midAngle * Math.PI) / 180);
                const labelY = 96 + labelRadius * Math.sin((midAngle * Math.PI) / 180);
                const percentageText = `${(percentage * 100).toFixed(1)}%`;
                
                return (
                  <g key={`donut-${index}`}>
                    <path
                      d={pathData}
                      fill={color}
                      stroke="white"
                      strokeWidth="2"
                    />
                    {/* แสดง percentage ที่ขอบวงกลม */}
                    {percentage > 0.05 && (
                      <text
                        x={labelX}
                        y={labelY}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fill="#1e293b"
                        fontSize="10"
                        fontWeight="bold"
                        stroke="white"
                        strokeWidth="2"
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
          <div className="w-full mt-6">
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
                        className="w-3 h-3 rounded-full flex-shrink-0"
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
    </div>
  );
});

// Paste this code right after the PieChartComponent code block

// Horizontal Bar Chart Component
// Horizontal Bar Chart Component
const HorizontalBarChart = memo(({ title, data, colors = [] }) => {
  
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
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
        <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center"><BarChart3 className="w-5 h-5 mr-2 text-slate-400" />{title}</h3>
        <div className="text-center py-8"><p className="text-slate-500">ไม่มีข้อมูลสำหรับแสดงกราฟ</p></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
      <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center"><BarChart3 className="w-5 h-5 mr-2 text-slate-400" />{title}</h3>
      <div className="space-y-3">
        {data.map((item, index) => {
          const barWidth = (item.value / maxValue) * 100;
          const color = colors[index % colors.length] || '#8b5cf6';
          
          return (
            <div key={`${item.label}-${index}`} className="grid grid-cols-3 gap-2 items-center">
              {/* Left Column for Full Label (CHANGED to text-left) */}
              <div className="col-span-1 text-sm text-slate-700 font-medium text-left" title={item.label}>
                {item.label}
              </div>
              
              {/* Right Column for Bar */}
              <div className="col-span-2 w-full bg-slate-100 rounded-full h-7 relative">
                <div
                  className="h-7 rounded-full transition-all duration-700 flex items-center justify-end pr-3"
                  style={{
                    width: `${barWidth}%`, backgroundColor: color, minWidth: '40px'
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

// Bar Chart Component
const BarChart = memo(({ title, data, colors = [] }) => {
  const maxValue = useMemo(() => Math.max(...data.map(d => d.value)), [data]);
  
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
      <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
        <BarChart3 className="w-5 h-5 mr-2 text-slate-400" />
        {title}
      </h3>
      <div className="h-48 flex items-end justify-between space-x-1">
        {data.slice(0, 8).map((item, index) => {
          const height = (item.value / maxValue) * 100;
          const color = colors[index % colors.length] || '#6366f1';
          
          return (
            <div key={`bar-${item.label}-${index}`} className="flex-1 flex flex-col items-center max-w-[60px]">
              <div className="relative w-full bg-slate-100 rounded-t-lg overflow-hidden" style={{ height: '160px' }}>
                <div 
                  className="absolute bottom-0 w-full rounded-t-lg transition-all duration-700 flex items-end justify-center pb-1"
                  style={{ 
                    height: `${height}%`,
                    backgroundColor: color
                  }}
                >
                  <span className="text-white text-xs font-medium">
                    {item.value}
                  </span>
                </div>
              </div>
              <div className="text-xs text-slate-600 mt-2 text-center truncate w-full" title={item.label}>
                {item.label.length > 8 ? item.label.slice(0, 8) + '...' : item.label}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
});

// Personnel Card Component (MODIFIED)
const PersonnelCard = memo(({ person, onView }) => (
  <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 hover:shadow-lg transition-shadow duration-200 group relative">
    <button
      onClick={() => onView(person)}
      className="absolute top-3 right-3 p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100 focus:outline-none"
      title="ดูรายละเอียด"
    >
      <Eye className="w-4 h-4" />
    </button>

    <div className="flex items-start space-x-3 mb-3 pr-8">
      <div className="w-12 h-12 flex-shrink-0 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
        <span className="text-white text-sm font-bold">
          {person.firstname?.charAt(0) || "?"}
        </span>
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="text-sm font-semibold text-slate-900 truncate">
          {person.prefix} {person.firstname} {person.lastname}
        </h3>
        <p className="text-slate-600 text-xs truncate">{person.position || 'ไม่ระบุตำแหน่ง'}</p>
        {person.generation && (
          <span className="inline-flex mt-1 px-2 py-0.5 text-xs font-medium rounded-full bg-blue-100 text-blue-700">
            รุ่น {person.generation}
          </span>
        )}
      </div>
    </div>

    <div className="space-y-2 text-xs">
      {person.affiliation && (
        <div className="flex items-center text-slate-600">
          <Building2 className="w-3 h-3 mr-1.5 flex-shrink-0" />
          <span className="truncate">{person.affiliation}</span>
        </div>
      )}
      
      {person.phone && (
        <div className="flex items-center text-slate-600">
          <Phone className="w-3 h-3 mr-1.5 flex-shrink-0" />
          <span>{person.phone}</span>
        </div>
      )}

      {/* --- ADDED: Display Birthday on Card --- */}
      {person.dob && (
        <div className="flex items-center text-slate-600">
          <Calendar className="w-3 h-3 mr-1.5 flex-shrink-0" />
          <span>{person.dob}</span>
        </div>
      )}
    </div>
  </div>
));

// Filter Panel Component
// Filter Panel Component (MODIFIED)
const FilterPanel = memo(({ filters, onFiltersChange, stats, personnelData, isOpen, onToggle }) => {
  // --- MODIFIED: Logic for dynamic department options ---
  const departmentOptions = useMemo(() => {
    // If no affiliation is selected, show all departments from stats
    if (!filters.affiliation) {
      return Object.entries(stats.byDepartment).sort(([a], [b]) => a.localeCompare(b));
    }

    // If an affiliation IS selected, filter personnel to find departments within it
    const personnelInAffiliation = personnelData.filter(p => p.affiliation === filters.affiliation);
    
    const departmentsInAffiliation = personnelInAffiliation.reduce((acc, person) => {
      const dept = person.deph || 'ไม่ระบุ';
      acc[dept] = (acc[dept] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(departmentsInAffiliation).sort(([a], [b]) => a.localeCompare(b));
  }, [filters.affiliation, personnelData, stats.byDepartment]);

  const sortedAffiliations = useMemo(() => 
    Object.entries(stats.byAffiliation).sort(([a], [b]) => a.localeCompare(b)),
    [stats.byAffiliation]
  );

  const sortedPositions = useMemo(() => 
    Object.entries(stats.byPosition).sort(([a], [b]) => a.localeCompare(b)),
    [stats.byPosition]
  );

  if (!isOpen) return null;

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-900">ตัวกรอง</h3>
        <button onClick={onToggle} className="text-slate-400 hover:text-slate-600">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* ตำแหน่ง Dropdown */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">ตำแหน่ง</label>
          <select
            value={filters.position}
            onChange={(e) => onFiltersChange({ ...filters, position: e.target.value })}
            className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
          >
            <option value="">ทั้งหมด</option>
            {sortedPositions.map(([position, count]) => (
              <option key={position} value={position}>
                {position} ({count})
              </option>
            ))}
          </select>
        </div>

        {/* สังกัด Dropdown */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">สังกัด</label>
          <select
            value={filters.affiliation}
            onChange={(e) => onFiltersChange({ ...filters, affiliation: e.target.value, deph: '' })}
            className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
          >
            <option value="">ทั้งหมด</option>
            {sortedAffiliations.map(([affiliation, count]) => (
              <option key={affiliation} value={affiliation}>
                {affiliation} ({count})
              </option>
            ))}
          </select>
        </div>

        {/* หน่วยงาน Dropdown (Now correctly filtered) */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">หน่วยงาน</label>
          <select
            value={filters.deph}
            onChange={(e) => onFiltersChange({ ...filters, deph: e.target.value })}
            className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
            disabled={!filters.affiliation} // Disabled if no affiliation is selected
          >
            <option value="">ทั้งหมด</option>
            {departmentOptions.map(([dept, count]) => (
              <option key={dept} value={dept}>
                {dept} ({count})
              </option>
            ))}
          </select>
        </div>

        {/* รุ่น Dropdown */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">รุ่น</label>
          <select
            value={filters.generation}
            onChange={(e) => onFiltersChange({ ...filters, generation: e.target.value })}
            className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
          >
            <option value="">ทั้งหมด</option>
            {Object.entries(stats.byGeneration)
              .sort(([a], [b]) => (parseInt(a) || 0) - (parseInt(b) || 0))
              .map(([generation, count]) => (
                <option key={generation} value={generation}>
                  รุ่น {generation} ({count} คน)
                </option>
              ))}
          </select>
        </div>

        {/* สถานะการเชื่อมต่อ Dropdown */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">สถานะการเชื่อมต่อ</label>
          <select
            value={filters.connected}
            onChange={(e) => onFiltersChange({ ...filters, connected: e.target.value })}
            className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
          >
            <option value="">ทั้งหมด</option>
            <option value="true">เชื่อมต่อแล้ว</option>
            <option value="false">ยังไม่เชื่อมต่อ</option>
          </select>
        </div>
      </div>

      <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-200">
        <div className="text-sm text-slate-600">
          พบ {Object.values(filters).filter(v => v && v !== filters.search).length} ตัวกรองที่ใช้งาน
        </div>
        <button
          onClick={() => onFiltersChange({ position: '', affiliation: '', deph: '', generation: '', connected: '', search: filters.search })}
          className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
        >
          ล้างตัวกรองทั้งหมด
        </button>
      </div>
    </div>
  );
});


// Detail Modal Component (MODIFIED)
const PersonnelDetailModal = memo(({ person, isOpen, onClose }) => {
  if (!isOpen || !person) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black/50 transition-opacity" onClick={onClose} />
        
        <div className="relative bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 rounded-t-3xl">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-slate-900">รายละเอียดบุคลากร</h2>
              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="p-6">
            <div className="flex items-center space-x-6 mb-6 p-6 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl text-white">
              <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center">
                <span className="text-2xl font-bold">
                  {person.firstname?.charAt(0) || "?"}
                </span>
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold mb-1">
                  {person.prefix} {person.firstname} {person.lastname}
                </h3>
                <p className="text-white/90 mb-2">{person.position || 'ไม่ระบุตำแหน่ง'}</p>
                <div className="flex items-center space-x-4 text-sm">
                  
                  {/* --- REMOVED: Connection status span was here --- */}
                  
                  {person.generation && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-400/20 text-blue-100">
                      <GraduationCap className="w-3 h-3 mr-1" />
                      รุ่น {person.generation}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-semibold text-slate-900 flex items-center">
                  <Users className="w-4 h-4 mr-2" />
                  ข้อมูลส่วนตัว
                </h4>
                
                <div className="space-y-3">
                  {[
                    { label: 'คำนำหน้า', value: person.prefix },
                    { label: 'ชื่อ', value: person.firstname },
                    { label: 'นามสกุล', value: person.lastname },
                    { label: 'วันเกิด', value: person.dob },
                    { label: 'เบอร์โทรศัพท์', value: person.phone, icon: Phone },
                    { label: 'อีเมล', value: person.email, icon: Mail },
                  ].map((item, index) => (
                    <div key={index} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-b-0">
                      <div className="flex items-center text-slate-600">
                        {item.icon && <item.icon className="w-4 h-4 mr-2" />}
                        <span className="text-sm">{item.label}</span>
                      </div>
                      <span className="text-slate-900 font-medium text-right max-w-[60%] break-words">
                        {item.value || '-'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold text-slate-900 flex items-center">
                  <Building2 className="w-4 h-4 mr-2" />
                  ข้อมูลการทำงาน
                </h4>
                
                <div className="space-y-3">
                  {[
                    { label: 'ตำแหน่ง', value: person.position, icon: Award },
                    { label: 'สังกัด', value: person.affiliation, icon: Building2 },
                    { label: 'แผนก', value: person.deph, icon: Briefcase },
                    { label: 'รุ่น', value: person.generation, icon: GraduationCap },
                  ].map((item, index) => (
                    <div key={index} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-b-0">
                      <div className="flex items-center text-slate-600">
                        {item.icon && <item.icon className="w-4 h-4 mr-2" />}
                        <span className="text-sm">{item.label}</span>
                      </div>
                      <span className="text-slate-900 font-medium text-right max-w-[60%] break-words">
                        {item.value || '-'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

// --- NEW COMPONENT: SearchModal (Modified) ---
const SearchModal = memo(({ 
  isOpen, 
  onClose, 
  personnelData, 
  stats, 
  onViewPerson, 
  onExport, 
  user 
}) => {
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  
  // New state to track if a search has been initiated
  const [hasSearched, setHasSearched] = useState(false);

  const [filters, setFilters] = useState({
    search: "", position: "", affiliation: "", deph: "", generation: "", connected: ""
  });

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchInput), 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    // Automatically apply debounced search to filters if a search is active
    if (hasSearched) {
      setFilters(prev => ({ ...prev, search: debouncedSearch }));
    }
  }, [debouncedSearch, hasSearched]);

  const filteredPersonnel = useMemo(() => {
    // Only filter data if a search has been triggered
    if (!hasSearched || !personnelData.length) return [];
    
    return personnelData.filter(person => {
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase().trim();
        const searchableFields = [
          person.firstname, person.lastname, person.position, person.affiliation,
          person.deph, person.phone, person.email, person.prefix,
          person.generation ? `รุ่น${person.generation}` : '',
          person.generation ? `รุ่น ${person.generation}` : '',
          person.generation ? person.generation.toString() : ''
        ];
        const searchableText = searchableFields.filter(Boolean).join(' ').toLowerCase();
        if (!searchableText.includes(searchTerm)) return false;
      }
      if (filters.position && person.position !== filters.position) return false;
      if (filters.affiliation && person.affiliation !== filters.affiliation) return false;
      if (filters.deph && person.deph !== filters.deph) return false;
      if (filters.generation && (String(person.generation).trim() !== filters.generation)) return false;
      return true;
    });
  }, [personnelData, filters, hasSearched]); // hasSearched is now a dependency
  
  const handleFiltersChange = useCallback((newFilters) => {
    setFilters(newFilters);
    // If filters are changed, we consider it a new search action
    if (!hasSearched) setHasSearched(true);
  }, [hasSearched]);

  const clearAllFilters = useCallback(() => {
    setFilters({ search: "", position: "", affiliation: "", deph: "", generation: "", connected: "" });
    setSearchInput("");
    // Reset the search state to hide results
    setHasSearched(false); 
  }, []);

  const handleSearchClick = () => {
    // Trigger the search and apply the current search input to filters
    setFilters(prev => ({ ...prev, search: searchInput }));
    setHasSearched(true);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60">
      <div className="flex min-h-screen items-start justify-center p-4 sm:p-6 md:p-10">
        <div className="relative bg-slate-50 rounded-3xl shadow-2xl max-w-7xl w-full"> {/* Increased max-width for better layout */}
          <div className="sticky top-0 bg-slate-50/80 backdrop-blur-lg border-b border-slate-200 px-6 py-4 rounded-t-3xl z-10">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-slate-900">ค้นหาบุคลากร</h2>
              <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="ค้นหาด้วยชื่อ, ตำแหน่ง, สังกัด, รุ่น..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleSearchClick(); }} // Allow Enter key to search
                    className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl"
                  />
                </div>
                <div className="flex items-center space-x-2">
                   {/* New Search Button */}
                   <button 
                     onClick={handleSearchClick} 
                     className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-colors"
                   >
                     <Search className="w-4 h-4" />
                     <span>ค้นหา</span>
                   </button>
                   <button 
                     onClick={() => onExport(filteredPersonnel)} 
                     className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl disabled:opacity-50"
                     disabled={!hasSearched || filteredPersonnel.length === 0}
                   >
                     <Download className="w-4 h-4" />
                     <span>Export ({hasSearched ? filteredPersonnel.length : 0})</span>
                   </button>
                   <button 
                     onClick={() => setShowFilters(!showFilters)} 
                     className={`flex items-center space-x-2 px-4 py-2 border rounded-xl ${showFilters ? 'bg-indigo-50 border-indigo-200' : 'border-slate-200'}`}
                   >
                     <Filter className="w-4 h-4" />
                     <span>ตัวกรอง</span>
                   </button>
                </div>
              </div>
               {hasSearched && ( // Only show results count and clear button after a search
                <div className="mt-3 flex items-center justify-between text-sm text-slate-600">
                    <span>แสดง {filteredPersonnel.length} จาก {personnelData.length} คน</span>
                    <button onClick={clearAllFilters} className="text-indigo-600 hover:text-indigo-800 font-medium">ล้างการค้นหา</button>
                </div>
               )}
            </div>

            <FilterPanel
              filters={filters}
              onFiltersChange={handleFiltersChange}
              stats={stats}
              personnelData={personnelData}
              isOpen={showFilters}
              onToggle={() => setShowFilters(false)}
            />

            {/* --- MODIFIED RESULTS SECTION --- */}
            {!hasSearched ? (
                // Initial state before any search
                <div className="text-center py-16">
                    <Search className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-slate-900">เริ่มการค้นหา</h3>
                    <p className="text-slate-600">ใช้แถบค้นหาหรือตัวกรองเพื่อแสดงข้อมูลบุคลากร</p>
                </div>
            ) : filteredPersonnel.length === 0 ? (
                // State when search is done but no results are found
                 <div className="text-center py-16">
                    <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-slate-900">ไม่พบข้อมูล</h3>
                    <p className="text-slate-600">ลองปรับเปลี่ยนคำค้นหาหรือตัวกรองของคุณ</p>
                </div>
            ) : (
                <div className="animate-fade-in-up">
                    {/* Updated Grid Layout: 3 columns on large screens */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredPersonnel.map((person, index) => (
                            <PersonnelCard
                                key={`${person.phone}-${index}`}
                                person={person}
                                onView={onViewPerson}
                            />
                        ))}
                    </div>
                </div>
            )}
          </div>
        </div>
      </div>
      {/* --- Added Style for Animation --- */}
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
});

// Main PersonnelPage Component
// Main PersonnelPage Component
export default function PersonnelPage({ user }) {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [personnelData, setPersonnelData] = useState([]);
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);

  const logAdminActivity = useCallback((action, details) => {
    if (!user) return;
    fetch(CONFIG.ADMIN_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'log_activity', log_action: action, log_details: details || null,
        user_id: user.id, username: user.username,
      })
    }).catch(error => console.error('Failed to log activity:', error));
  }, [user]);

  const fetchPersonnelData = useCallback(async () => {
    try {
      const apiUrl = CONFIG.OFFICERS_API;
      const response = await fetch(apiUrl.toString());
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
     // Check if the response body is empty
      const text = await response.text();
      if (!text) throw new Error('Empty response from server');

      const result = JSON.parse(text);
      let data = result.success && Array.isArray(result.data) ? result.data : (Array.isArray(result) ? result : []);
      
      const formattedData = data.map(person => ({
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
        role: person.role || 'member' 
      }));
      setPersonnelData(formattedData);
      setError("");
    } catch (error) {
      setError(`⚠️ ${error.message}`);
      setPersonnelData([]);
    }
  }, [user, CONFIG.OFFICERS_API]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchPersonnelData();
      setLoading(false);
    };
    loadData();
  }, [fetchPersonnelData]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchPersonnelData();
    setRefreshing(false);
  }, [fetchPersonnelData]);

  const stats = useMemo(() => {
    const newStats = {
      total: personnelData.length,
      connected: personnelData.filter(p => p.lineUserId).length,
      byPosition: {}, byAffiliation: {}, byDepartment: {}, byGeneration: {},
    };
    personnelData.forEach(person => {
      const position = person.position || 'ไม่ระบุ';
      newStats.byPosition[position] = (newStats.byPosition[position] || 0) + 1;
      const affiliation = person.affiliation || 'ไม่ระบุ';
      newStats.byAffiliation[affiliation] = (newStats.byAffiliation[affiliation] || 0) + 1;
      const department = person.deph || 'ไม่ระบุ';
      newStats.byDepartment[department] = (newStats.byDepartment[department] || 0) + 1;
      const generation = person.generation ? String(person.generation).trim() : 'ไม่ระบุ';
      newStats.byGeneration[generation] = (newStats.byGeneration[generation] || 0) + 1;
    });
    return newStats;
  }, [personnelData]);
  
  const chartData = useMemo(() => {
    const positionChartData = Object.entries(stats.byPosition)
      .sort(([, a], [, b]) => b - a).slice(0, 8)
      .map(([label, value]) => ({ label: truncatePosition(label) || label, value }));

    const getRegionNumber = (affiliationString) => {
        const match = affiliationString.match(/ภาค\s*(\d+)/);
        return match ? parseInt(match[1]) : null;
    };
    const affiliationChartData = Object.entries(stats.byAffiliation)
      .filter(([label]) => label !== 'ไม่ระบุ' && label.trim() !== '')
      .sort(([affA], [affB]) => {
          const numA = getRegionNumber(affA);
          const numB = getRegionNumber(affB);
          if (numA !== null && numB !== null) return numA - numB;
          if (numA !== null) return -1;
          if (numB !== null) return 1;
          return (stats.byAffiliation[affB] || 0) - (stats.byAffiliation[affA] || 0);
      })
      .map(([label, value]) => ({ label, value }));

    const generationChartData = Object.entries(stats.byGeneration)
      .filter(([gen]) => gen !== 'ไม่ระบุ' && gen.trim() !== '')
      .sort(([a], [b]) => (parseInt(a) || 0) - (parseInt(b) || 0)).slice(0, 10)
      .map(([label, value]) => ({ label: `รุ่น ${label}`, value }));

    return { positionChartData, affiliationChartData, generationChartData };
  }, [stats]);

  const chartColors = ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#f97316', '#84cc16', '#ec4899', '#14b8a6'];
  
  const handleViewPerson = useCallback((person) => {
    logAdminActivity('view_personnel_detail', { person_name: `${person.firstname}`, phone: person.phone });
    setSelectedPerson(person);
    setShowDetail(true);
    setShowSearchModal(false);
  }, [logAdminActivity]);

  const exportToCSV = useCallback((dataToExport) => {
    logAdminActivity('export_personnel_csv', { record_count: dataToExport.length });
    if (dataToExport.length === 0) {
      alert('ไม่มีข้อมูลสำหรับ Export');
      return;
    }
    const headers = [ 'คำนำหน้า', 'ชื่อ', 'นามสกุล', 'ตำแหน่ง', 'สังกัด', 'แผนก', 'รุ่น', 'เบอร์โทรศัพท์', 'อีเมล', 'วันเกิด'];
    const rows = dataToExport.map(p => [ p.prefix, p.firstname, p.lastname, p.position, p.affiliation, p.deph, p.generation, p.phone, p.email, p.dob ]);
    const csvContent = [headers, ...rows].map(row => row.map(field => `"${String(field || '').replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `บุคลากร_${new Date().toISOString().slice(0,10)}.csv`;
    link.click();
  }, [logAdminActivity]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-indigo-600 border-t-transparent mx-auto mb-4"></div>
            <p className="text-slate-600 font-medium">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div></div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowSearchModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl"
          >
            <Search className="w-4 h-4" />
            <span>ค้นหาบุคลากร</span>
          </button>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl disabled:opacity-50"
          >
            <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {error && (
        <div className="border rounded-2xl p-4 flex items-start space-x-3 bg-red-50 border-red-200">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-500" />
          <div>
            <p className="font-medium text-red-800">เกิดข้อผิดพลาด</p>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard title="บุคลากรทั้งหมด" value={stats.total} icon={Users} color="blue" subtitle="ทั้งหมดในระบบ" />
        <StatCard title="จำนวนรุ่น" value={Object.keys(stats.byGeneration).filter(g => g !== 'ไม่ระบุ').length} icon={GraduationCap} color="purple" subtitle="รุ่นที่แตกต่าง" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        <div className="space-y-6 lg:col-span-1">
          <HorizontalBarChart title="เจ้าพนักงานตำรวจศาลแต่ละตำแหน่ง" data={chartData.positionChartData} colors={chartColors} />
          <BarChart title="เจ้าพนักงานตำรวจศาลแต่ละรุ่น" data={chartData.generationChartData} colors={chartColors} />
        </div>
        <div className="lg:col-span-2">
          <TreemapChart title="เจ้าพนักงานตำรวจศาลแบ่งตามภาค" data={chartData.affiliationChartData} colors={chartColors} />
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