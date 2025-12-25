// src/components/AlertDialog.jsx
import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { ExclamationTriangleIcon, CheckCircleIcon, XCircleIcon, InformationCircleIcon } from '@heroicons/react/24/outline';

const AlertDialog = ({ isOpen, onClose, title, message, type = 'info' }) => {
  const { currentTheme } = useTheme();

  if (!isOpen) return null;

  const variants = {
    success: {
      icon: <CheckCircleIcon className={currentTheme?.kpiGood || 'text-emerald-600'} />,
      border: 'border-l-4 border-green-500',
      bg: currentTheme?.alertSuccessBg || 'bg-green-50',
      title: 'text-green-900',
    },
    error: {
      icon: <XCircleIcon className={currentTheme?.alertErrorText || 'text-red-800'} />,
      border: 'border-l-4 border-red-500',
      bg: currentTheme?.alertErrorBg || 'bg-red-50',
      title: 'text-red-900',
    },
    warning: {
      icon: <ExclamationTriangleIcon className={currentTheme?.alertWarningText || 'text-amber-800'} />,
      border: 'border-l-4 border-amber-500',
      bg: currentTheme?.alertWarningBg || 'bg-amber-50',
      title: 'text-amber-900',
    },
    info: {
      icon: <InformationCircleIcon className={currentTheme?.alertInfoText || 'text-blue-800'} />,
      border: 'border-l-4 border-blue-500',
      bg: currentTheme?.alertInfoBg || 'bg-blue-50',
      title: 'text-blue-900',
    },
  };

  const styles = variants[type] || variants.info;

  return (
    <div className={`fixed inset-0 ${currentTheme?.modalOverlay || 'bg-black/50'} overflow-y-auto h-full w-full flex items-center justify-center z-50 p-4`}>
      <div className={`relative w-full max-w-md rounded-lg ${currentTheme?.modalBg || 'bg-white'} ${currentTheme?.modalBorder || 'border border-gray-200'} ${currentTheme?.modalShadow || 'shadow-2xl'} ${styles.border}`}>
        <div className={`p-6 ${styles.bg}`}>
          {/* Header with Icon */}
          <div className="flex items-start gap-4 mb-4">
            <div className="flex-shrink-0">
              {styles.icon}
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
                  ? `${currentTheme?.btnPrimaryBg || 'bg-emerald-600'} ${currentTheme?.btnPrimaryHover || 'hover:bg-emerald-700'} ${currentTheme?.btnPrimaryText || 'text-white'}`
                  : type === 'error'
                  ? `${currentTheme?.btnDangerBg || 'bg-red-600'} ${currentTheme?.btnDangerHover || 'hover:bg-red-700'} ${currentTheme?.btnDangerText || 'text-white'}`
                  : type === 'warning'
                  ? `${currentTheme?.badgeWarningBg || 'bg-amber-100'} ${currentTheme?.badgeWarningText || 'text-amber-800'}`
                  : `${currentTheme?.btnPrimaryBg || 'bg-emerald-600'} ${currentTheme?.btnPrimaryHover || 'hover:bg-emerald-700'} ${currentTheme?.btnPrimaryText || 'text-white'}`
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
