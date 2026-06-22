// src/components/ConfirmationModal.jsx
import React from 'react';
import { useTheme } from '../context/ThemeContext';
import {
  ExclamationTriangleIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';

const iconMap = {
  warning: { icon: ExclamationTriangleIcon, bg: 'bg-amber-100', color: 'text-amber-600' },
  danger:  { icon: TrashIcon,               bg: 'bg-red-100',   color: 'text-red-600'   },
  info:    { icon: InformationCircleIcon,   bg: 'bg-blue-100',  color: 'text-blue-600'  },
  success: { icon: CheckCircleIcon,         bg: 'bg-green-100', color: 'text-green-600' },
};

const accentColors = {
  warning: 'bg-amber-400',
  danger:  'bg-red-500',
  info:    'bg-blue-500',
  success: 'bg-green-500',
};

const confirmColors = {
  warning: 'bg-amber-500 hover:bg-amber-600 text-white border-amber-600',
  danger:  'bg-red-600   hover:bg-red-700   text-white border-red-700',
  info:    'bg-blue-600  hover:bg-blue-700  text-white border-blue-700',
  success: 'bg-green-600 hover:bg-green-700 text-white border-green-700',
};

const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  // Legacy prop (plain string message — still supported)
  message,
  // Enhanced props
  title,
  description,
  bullets,
  confirmLabel = 'Confirm',
  cancelLabel  = 'Cancel',
  variant = 'danger',
}) => {
  const { currentTheme } = useTheme();
  if (!isOpen) return null;

  const iconCfg  = iconMap[variant]    || iconMap.danger;
  const IconComp = iconCfg.icon;
  const confirmCls = confirmColors[variant] || confirmColors.danger;
  const accentCls  = accentColors[variant]  || accentColors.danger;

  // Backward-compat: if only legacy `message` is passed, use it as description
  const displayTitle = title       || 'Are you sure?';
  const displayDesc  = description || message || '';

  return (
    <div
      className={`fixed inset-0 ${currentTheme?.modalOverlay || 'bg-black/50'} backdrop-blur-sm flex items-center justify-center z-50 p-4`}
      onClick={onClose}
    >
      <div
        className={`relative w-full max-w-md rounded-2xl shadow-2xl overflow-hidden ${currentTheme?.modalBg || 'bg-white'} ${currentTheme?.modalBorder || 'border border-gray-100'}`}
        onClick={e => e.stopPropagation()}
      >
        {/* Top accent stripe */}
        <div className={`h-1 w-full ${accentCls}`} />

        <div className="p-6">
          {/* Icon + Title row */}
          <div className="flex items-start gap-4 mb-3">
            <div className={`flex-shrink-0 h-11 w-11 rounded-full flex items-center justify-center ${iconCfg.bg}`}>
              <IconComp className={`h-6 w-6 ${iconCfg.color}`} />
            </div>
            <div className="flex-1 min-w-0 pt-0.5">
              <h3 className={`text-base font-bold leading-snug ${currentTheme?.text || 'text-gray-900'}`}>
                {displayTitle}
              </h3>
              {displayDesc && (
                <p className={`mt-1.5 text-sm leading-relaxed ${currentTheme?.mutedText || 'text-gray-500'}`}>
                  {displayDesc}
                </p>
              )}
            </div>
          </div>

          {/* Optional bullet points */}
          {bullets && bullets.length > 0 && (
            <ul className={`mb-1 ml-14 space-y-1.5 text-sm ${currentTheme?.mutedText || 'text-gray-600'}`}>
              {bullets.map((b, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className={`mt-1.5 h-1.5 w-1.5 rounded-full flex-shrink-0 ${iconCfg.color.replace('text-', 'bg-')}`} />
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          )}

          {/* Action buttons */}
          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={onClose}
              className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-150 border ${currentTheme?.btnSecondaryBg || 'bg-gray-50'} ${currentTheme?.btnSecondaryText || 'text-gray-700'} ${currentTheme?.btnSecondaryBorder || 'border-gray-200'} hover:bg-gray-100`}
            >
              {cancelLabel}
            </button>
            <button
              onClick={onConfirm}
              className={`px-5 py-2 text-sm font-bold rounded-lg transition-all duration-150 border shadow-sm hover:shadow-md ${confirmCls}`}
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;