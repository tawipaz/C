import React from 'react';
import { Sun, Moon, CloudSun, Target, FileText } from 'lucide-react';

const DocumentManagementPage = () => {
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
    <div className="h-full flex flex-col">
      <div className="flex-grow p-4 bg-slate-50/50 overflow-y-auto">
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
      </div>
    </div>
  );
};

export default DocumentManagementPage;
