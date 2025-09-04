import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

// Context สำหรับจัดการ Alert
const AlertContext = React.createContext();

// Hook สำหรับใช้ Alert
export const useAlert = () => {
  const context = React.useContext(AlertContext);
  if (!context) {
    throw new Error('useAlert must be used within AlertProvider');
  }
  return context;
};

// Alert Provider Component
export const AlertProvider = ({ children }) => {
  const [alerts, setAlerts] = useState([]);

  const showAlert = ({ type = 'info', title, message, duration = 5000 }) => {
    const id = Date.now() + Math.random();
    const alert = { id, type, title, message, duration };
    
    setAlerts(prev => [...prev, alert]);

    if (duration > 0) {
      setTimeout(() => {
        removeAlert(id);
      }, duration);
    }

    return id;
  };

  const removeAlert = (id) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id));
  };

  // Shorthand methods
  const success = (message, title = 'สำเร็จ') => showAlert({ type: 'success', title, message });
  const error = (message, title = 'ข้อผิดพลาด') => showAlert({ type: 'error', title, message });
  const warning = (message, title = 'คำเตือน') => showAlert({ type: 'warning', title, message });
  const info = (message, title = 'ข้อมูล') => showAlert({ type: 'info', title, message });

  return (
    <AlertContext.Provider value={{ showAlert, removeAlert, success, error, warning, info }}>
      {children}
      <AlertContainer alerts={alerts} onRemove={removeAlert} />
    </AlertContext.Provider>
  );
};

// Alert Container Component
const AlertContainer = ({ alerts, onRemove }) => {
  if (alerts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[9999] space-y-2">
      {alerts.map(alert => (
        <AlertItem key={alert.id} alert={alert} onRemove={onRemove} />
      ))}
    </div>
  );
};

// Individual Alert Item Component
const AlertItem = ({ alert, onRemove }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger animation
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  const handleRemove = () => {
    setIsVisible(false);
    setTimeout(() => onRemove(alert.id), 300);
  };

  const getAlertConfig = () => {
    switch (alert.type) {
      case 'success':
        return {
          icon: CheckCircle,
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          iconColor: 'text-green-600',
          titleColor: 'text-green-800',
          messageColor: 'text-green-700'
        };
      case 'error':
        return {
          icon: XCircle,
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          iconColor: 'text-red-600',
          titleColor: 'text-red-800',
          messageColor: 'text-red-700'
        };
      case 'warning':
        return {
          icon: AlertTriangle,
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          iconColor: 'text-yellow-600',
          titleColor: 'text-yellow-800',
          messageColor: 'text-yellow-700'
        };
      default:
        return {
          icon: Info,
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          iconColor: 'text-blue-600',
          titleColor: 'text-blue-800',
          messageColor: 'text-blue-700'
        };
    }
  };

  const config = getAlertConfig();
  const Icon = config.icon;

  return (
    <div
      className={`
        transform transition-all duration-300 ease-in-out
        ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
        ${config.bgColor} ${config.borderColor} border rounded-lg shadow-lg
        min-w-[320px] max-w-[400px] p-4
      `}
    >
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <Icon className={`w-5 h-5 ${config.iconColor}`} />
        </div>
        
        <div className="flex-1 min-w-0">
          <h4 className={`text-sm font-semibold ${config.titleColor}`}>
            {alert.title}
          </h4>
          {alert.message && (
            <p className={`mt-1 text-sm ${config.messageColor}`}>
              {alert.message}
            </p>
          )}
        </div>
        
        <button
          onClick={handleRemove}
          className={`flex-shrink-0 p-1 rounded-md hover:bg-black hover:bg-opacity-10 transition-colors ${config.iconColor}`}
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

// Confirmation Dialog Component
export const ConfirmDialog = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = 'ยืนยันการดำเนินการ',
  message = 'คุณแน่ใจหรือไม่ที่ต้องการดำเนินการนี้?',
  confirmText = 'ยืนยัน',
  cancelText = 'ยกเลิก',
  type = 'warning'
}) => {
  if (!isOpen) return null;

  const getTypeConfig = () => {
    switch (type) {
      case 'danger':
        return {
          icon: XCircle,
          iconColor: 'text-red-600',
          confirmBg: 'bg-red-600 hover:bg-red-700'
        };
      case 'success':
        return {
          icon: CheckCircle,
          iconColor: 'text-green-600',
          confirmBg: 'bg-green-600 hover:bg-green-700'
        };
      default:
        return {
          icon: AlertTriangle,
          iconColor: 'text-yellow-600',
          confirmBg: 'bg-yellow-600 hover:bg-yellow-700'
        };
    }
  };

  const config = getTypeConfig();
  const Icon = config.icon;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
      <div className="bg-white rounded-xl max-w-md w-full p-6 transform transition-all duration-300 scale-100">
        <div className="flex items-center space-x-3 mb-4">
          <div className="flex-shrink-0">
            <Icon className={`w-6 h-6 ${config.iconColor}`} />
          </div>
          <h3 className="text-lg font-semibold text-slate-800">{title}</h3>
        </div>
        
        <p className="text-slate-600 mb-6">{message}</p>
        
        <div className="flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`flex-1 px-4 py-2 text-white rounded-lg transition-colors ${config.confirmBg}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AlertProvider;
