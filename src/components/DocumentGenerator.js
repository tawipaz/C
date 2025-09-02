import React, { useState, useMemo, useCallback } from "react";
import {
  FileText,
  Download,
  Printer,
  Copy,
  Save,
  ArrowLeft,
  Eye,
  EyeOff,
  Calendar,
  Clock,
  User,
  Building,
  Hash,
  Type,
  MessageSquare,
  Zap,
  CheckCircle,
  AlertCircle,
  RefreshCw
} from "lucide-react";

const DocumentGenerator = ({ template, onBack, onSave }) => {
  const [placeholderValues, setPlaceholderValues] = useState(
    template.placeholders.reduce((acc, placeholder) => {
      acc[placeholder] = '';
      return acc;
    }, {})
  );
  
  const [showPreview, setShowPreview] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // ข้อมูลตัวอย่างสำหรับ auto-fill
  const sampleData = {
    '{{วันที่}}': new Date().toLocaleDateString('th-TH'),
    '{{เวลา}}': new Date().toLocaleTimeString('th-TH', { 
      hour: '2-digit', 
      minute: '2-digit' 
    }),
    '{{เจ้าหน้าที่}}': 'ด.ต. สมชาย ใจดี',
    '{{สถานที่}}': 'ศาลอาญา',
    '{{หมายเลข}}': 'DOC-' + Date.now().toString().slice(-6),
    '{{ผู้ขอ}}': 'ด.ต. สมชาย ใจดี',
    '{{ผู้รับ}}': 'ส.ต.ต. วิชาย ศรีสุข',
    '{{วันที่เดิม}}': new Date().toLocaleDateString('th-TH'),
    '{{วันที่ใหม่}}': new Date(Date.now() + 86400000).toLocaleDateString('th-TH'),
    '{{เหตุผล}}': 'มีภารกิจเร่งด่วน',
    '{{เหตุการณ์}}': 'มีผู้มาติดต่องานเป็นจำนวนมาก',
    '{{ผู้เกี่ยวข้อง}}': 'ประชาชนทั่วไป',
    '{{การดำเนินการ}}': 'ให้บริการตามขั้นตอนปกติ และจัดลำดับความสำคัญ',
    '{{รายละเอียด}}': 'ปฏิบัติหน้าที่ตามปกติ ไม่มีเหตุการณ์พิเศษ'
  };

  // สร้างเอกสารที่แทนที่ placeholders แล้ว
  const generatedDocument = useMemo(() => {
    let content = template.content;
    
    Object.entries(placeholderValues).forEach(([placeholder, value]) => {
      const regex = new RegExp(placeholder.replace(/[{}]/g, '\\$&'), 'g');
      content = content.replace(regex, value || placeholder);
    });
    
    return content;
  }, [template.content, placeholderValues]);

  // ตรวจสอบว่า placeholders ทั้งหมดถูกกรอกแล้วหรือไม่
  const isComplete = useMemo(() => {
    return template.placeholders.every(placeholder => 
      placeholderValues[placeholder] && placeholderValues[placeholder].trim() !== ''
    );
  }, [template.placeholders, placeholderValues]);

  const handlePlaceholderChange = useCallback((placeholder, value) => {
    setPlaceholderValues(prev => ({
      ...prev,
      [placeholder]: value
    }));
  }, []);

  const fillSampleData = useCallback(() => {
    const newValues = { ...placeholderValues };
    
    template.placeholders.forEach(placeholder => {
      if (sampleData[placeholder]) {
        newValues[placeholder] = sampleData[placeholder];
      }
    });
    
    setPlaceholderValues(newValues);
  }, [template.placeholders, placeholderValues]);

  const clearAllFields = useCallback(() => {
    const emptyValues = {};
    template.placeholders.forEach(placeholder => {
      emptyValues[placeholder] = '';
    });
    setPlaceholderValues(emptyValues);
  }, [template.placeholders]);

  const handleSave = useCallback(async () => {
    setIsSaving(true);
    try {
      // จำลองการบันทึก
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const documentData = {
        templateId: template.id,
        templateName: template.name,
        content: generatedDocument,
        placeholders: placeholderValues,
        createdAt: new Date().toISOString(),
        id: Date.now()
      };
      
      onSave?.(documentData);
      alert('บันทึกเอกสารเรียบร้อยแล้ว');
    } catch (error) {
      alert('เกิดข้อผิดพลาดในการบันทึก');
    } finally {
      setIsSaving(false);
    }
  }, [template, generatedDocument, placeholderValues, onSave]);

  const handleDownload = useCallback(() => {
    const blob = new Blob([generatedDocument], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${template.name}_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [generatedDocument, template.name]);

  const handlePrint = useCallback(() => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>${template.name}</title>
          <style>
            body { 
              font-family: 'Sarabun', Arial, sans-serif; 
              line-height: 1.6; 
              margin: 20px; 
              white-space: pre-wrap;
            }
            @media print {
              body { margin: 0; }
            }
          </style>
        </head>
        <body>${generatedDocument.replace(/\n/g, '<br>')}</body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  }, [generatedDocument, template.name]);

  const copyToClipboard = useCallback(() => {
    navigator.clipboard.writeText(generatedDocument).then(() => {
      alert('คัดลอกเอกสารแล้ว');
    }).catch(() => {
      alert('ไม่สามารถคัดลอกได้');
    });
  }, [generatedDocument]);

  // ไอคอนสำหรับแต่ละประเภท placeholder
  const getPlaceholderIcon = (placeholder) => {
    if (placeholder.includes('วันที่')) return Calendar;
    if (placeholder.includes('เวลา')) return Clock;
    if (placeholder.includes('เจ้าหน้าที่') || placeholder.includes('ผู้')) return User;
    if (placeholder.includes('สถานที่')) return Building;
    if (placeholder.includes('หมายเลข')) return Hash;
    if (placeholder.includes('รายละเอียด') || placeholder.includes('เหตุ')) return MessageSquare;
    return Type;
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack}
              className="flex items-center space-x-2 px-3 py-2 text-slate-600 hover:bg-white rounded-lg transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>กลับ</span>
            </button>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{template.name}</h1>
              <p className="text-slate-600">{template.description}</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="flex items-center space-x-2 px-3 py-2 border border-slate-200 bg-white rounded-lg hover:bg-slate-50 transition-colors"
            >
              {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              <span>{showPreview ? 'ซ่อน' : 'แสดง'}ตัวอย่าง</span>
            </button>
            
            <button
              onClick={handlePrint}
              className="flex items-center space-x-2 px-3 py-2 border border-slate-200 bg-white rounded-lg hover:bg-slate-50 transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>พิมพ์</span>
            </button>
            
            <button
              onClick={copyToClipboard}
              className="flex items-center space-x-2 px-3 py-2 border border-slate-200 bg-white rounded-lg hover:bg-slate-50 transition-colors"
            >
              <Copy className="w-4 h-4" />
              <span>คัดลอก</span>
            </button>
            
            <button
              onClick={handleDownload}
              className="flex items-center space-x-2 px-3 py-2 border border-slate-200 bg-white rounded-lg hover:bg-slate-50 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>ดาวน์โหลด</span>
            </button>
            
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg transition-colors"
            >
              {isSaving ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>{isSaving ? 'กำลังบันทึก...' : 'บันทึก'}</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-slate-200 p-6 sticky top-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-slate-900">กรอกข้อมูล</h2>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={fillSampleData}
                    className="flex items-center space-x-1 px-2 py-1 text-xs text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                  >
                    <Zap className="w-3 h-3" />
                    <span>ใส่ตัวอย่าง</span>
                  </button>
                  <button
                    onClick={clearAllFields}
                    className="flex items-center space-x-1 px-2 py-1 text-xs text-slate-600 hover:bg-slate-50 rounded transition-colors"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>ล้างทั้งหมด</span>
                  </button>
                </div>
              </div>

              {/* Progress */}
              <div className="mb-6">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-slate-600">ความคืบหน้า</span>
                  <span className={`font-medium ${isComplete ? 'text-green-600' : 'text-slate-600'}`}>
                    {Object.values(placeholderValues).filter(v => v.trim() !== '').length}/{template.placeholders.length}
                  </span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${
                      isComplete ? 'bg-green-500' : 'bg-indigo-500'
                    }`}
                    style={{
                      width: `${(Object.values(placeholderValues).filter(v => v.trim() !== '').length / template.placeholders.length) * 100}%`
                    }}
                  />
                </div>
                {isComplete && (
                  <div className="flex items-center space-x-1 text-green-600 text-xs mt-2">
                    <CheckCircle className="w-3 h-3" />
                    <span>กรอกข้อมูลครบถ้วนแล้ว</span>
                  </div>
                )}
              </div>

              {/* Form Fields */}
              <div className="space-y-4">
                {template.placeholders.map((placeholder, index) => {
                  const IconComponent = getPlaceholderIcon(placeholder);
                  const isFilled = placeholderValues[placeholder]?.trim() !== '';
                  
                  return (
                    <div key={index}>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        <div className="flex items-center space-x-2">
                          <IconComponent className="w-4 h-4 text-slate-500" />
                          <span>{placeholder}</span>
                          {isFilled && <CheckCircle className="w-3 h-3 text-green-500" />}
                        </div>
                      </label>
                      
                      {placeholder.includes('รายละเอียด') || placeholder.includes('เหตุผล') || placeholder.includes('การดำเนินการ') ? (
                        <textarea
                          value={placeholderValues[placeholder]}
                          onChange={(e) => handlePlaceholderChange(placeholder, e.target.value)}
                          rows={3}
                          className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none transition-colors ${
                            isFilled ? 'border-green-200 bg-green-50' : 'border-slate-200'
                          }`}
                          placeholder={`กรอก${placeholder}`}
                        />
                      ) : (
                        <input
                          type="text"
                          value={placeholderValues[placeholder]}
                          onChange={(e) => handlePlaceholderChange(placeholder, e.target.value)}
                          className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors ${
                            isFilled ? 'border-green-200 bg-green-50' : 'border-slate-200'
                          }`}
                          placeholder={`กรอก${placeholder}`}
                        />
                      )}
                      
                      {sampleData[placeholder] && (
                        <button
                          onClick={() => handlePlaceholderChange(placeholder, sampleData[placeholder])}
                          className="text-xs text-indigo-600 hover:text-indigo-800 mt-1"
                        >
                          ใช้ตัวอย่าง: {sampleData[placeholder]}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Preview Panel */}
          {showPreview && (
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl border border-slate-200">
                <div className="border-b border-slate-200 p-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-slate-900 flex items-center space-x-2">
                      <FileText className="w-5 h-5" />
                      <span>ตัวอย่างเอกสาร</span>
                    </h2>
                    <div className="flex items-center space-x-2 text-sm text-slate-500">
                      <span>อัปเดตล่าสุด:</span>
                      <span>{new Date().toLocaleTimeString('th-TH')}</span>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <div className="prose max-w-none">
                    <pre className="whitespace-pre-wrap font-sans text-slate-900 leading-relaxed">
                      {generatedDocument}
                    </pre>
                  </div>
                </div>

                {/* Unfilled placeholders warning */}
                {!isComplete && (
                  <div className="border-t border-slate-200 p-4">
                    <div className="flex items-start space-x-2 text-amber-600">
                      <AlertCircle className="w-4 h-4 mt-0.5" />
                      <div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DocumentGenerator;