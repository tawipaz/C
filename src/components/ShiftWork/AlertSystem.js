import React from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

const AlertSystem = ({ alert, onClose }) => {
  if (!alert.show) return null;

  const getAlertStyles = () => {
    switch (alert.type) {
      case 'success':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'error':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'info':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getIcon = () => {
    switch (alert.type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 mr-2" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 mr-2" />;
      case 'info':
        return <Info className="w-5 h-5 mr-2" />;
      default:
        return <Info className="w-5 h-5 mr-2" />;
    }
  };

  return (
    <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg border-2 ${getAlertStyles()} max-w-md`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          {getIcon()}
          <span className="text-sm font-medium">{alert.message}</span>
        </div>
        <button
          onClick={onClose}
          className="ml-2 p-1 hover:bg-black/10 rounded-full transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default AlertSystem;
