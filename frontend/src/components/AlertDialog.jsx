// src/components/AlertDialog.jsx
import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { ExclamationTriangleIcon, CheckCircleIcon, XCircleIcon, InformationCircleIcon } from '@heroicons/react/24/outline';

const AlertDialog = ({ isOpen, onClose, title, message, type = 'info' }) => {
  const { currentTheme } = useTheme();

  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircleIcon className="h-6 w-6 text-green-600" />;
      case 'error':
        return <XCircleIcon className="h-6 w-6 text-red-600" />;
      case 'warning':
        return <ExclamationTriangleIcon className="h-6 w-6 text-yellow-600" />;
      default:
        return <InformationCircleIcon className="h-6 w-6 text-blue-600" />;
    }
  };

  const getStyles = () => {
    switch (type) {
      case 'success':
        return {
          border: 'border-l-4 border-green-500',
          bg: 'bg-green-50',
          title: 'text-green-900'
        };
      case 'error':
        return {
          border: 'border-l-4 border-red-500',
          bg: 'bg-red-50',
          title: 'text-red-900'
        };
      case 'warning':
        return {
          border: 'border-l-4 border-yellow-500',
          bg: 'bg-yellow-50',
          title: 'text-yellow-900'
        };
      default:
        return {
          border: 'border-l-4 border-blue-500',
          bg: 'bg-blue-50',
          title: 'text-blue-900'
        };
    }
  };

  const styles = getStyles();

  return (
    <div className={`fixed inset-0 ${currentTheme?.modalOverlay || 'bg-gray-600 bg-opacity-50'} overflow-y-auto h-full w-full flex items-center justify-center z-50 p-4`}>
      <div className={`relative w-full max-w-md ${currentTheme?.cardBg || 'bg-white'} rounded-lg ${currentTheme?.shadow || 'shadow-xl'} ${styles.border}`}>
        <div className={`p-6 ${styles.bg}`}>
          {/* Header with Icon */}
          <div className="flex items-start gap-4 mb-4">
            <div className="flex-shrink-0">
              {getIcon()}
            </div>
            <div className="flex-1">
              {title && (
                <h3 className={`text-lg font-semibold ${styles.title} mb-2`}>
                  {title}
                </h3>
              )}
              <p className={`text-sm ${currentTheme?.mutedText || 'text-gray-700'} whitespace-pre-wrap`}>
                {message}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={onClose}
              className={`px-6 py-2 rounded-lg font-semibold transition-all duration-200 ${
                type === 'success'
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : type === 'error'
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : type === 'warning'
                  ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              OK
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlertDialog;
