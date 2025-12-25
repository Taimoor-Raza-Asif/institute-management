import React, { useEffect, useRef } from 'react';
import { useTheme } from '../context/ThemeContext';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

// Self-managed compact popup (no backdrop overlay) to avoid long white background
const DuplicateFeeModal = ({ isOpen, onClose, message }) => {
  const { currentTheme } = useTheme();
  const ref = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    const onClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        onClose?.();
      }
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onClickOutside);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={ref}
      role="alertdialog"
      aria-modal="false"
      className={`fixed left-1/2 top-28 transform -translate-x-1/2 z-[9999] mx-4 w-full max-w-sm rounded-lg overflow-hidden ${currentTheme?.panelBg || 'bg-white'} ${currentTheme?.modalBorder || 'border border-gray-200'} ${currentTheme?.modalShadow || 'shadow-lg'}`}
    >
      <div className={`flex items-start gap-3 p-4 ${currentTheme?.modalHeaderBg || 'bg-white'}`}>
        <div className={`flex items-center justify-center h-10 w-10 rounded-md ${currentTheme?.badgeDangerBg || 'bg-rose-100'}`}>
          <ExclamationTriangleIcon className={`h-6 w-6 ${currentTheme?.badgeDangerText || 'text-rose-600'}`} />
        </div>
        <div className="flex-1">
          <h3 className={`text-lg font-semibold ${currentTheme?.title || 'text-gray-900'}`}>Duplicate Fee Record</h3>
          <p className={`text-sm mt-1 ${currentTheme?.mutedText || 'text-gray-600'}`}>{message || 'A fee record for this student for the selected month and year already exists.'}</p>
        </div>
        <button onClick={onClose} aria-label="Close" className={`text-sm ${currentTheme?.linkText || 'text-green-600'}`}>Close</button>
      </div>

      <div className="px-4 py-3 bg-transparent flex justify-end">
        <button onClick={onClose} className={`px-4 py-2 rounded-md font-semibold ${currentTheme?.btnPrimaryBg || 'bg-green-600'} ${currentTheme?.btnPrimaryText || 'text-white'} hover:opacity-95`}>OK</button>
      </div>
    </div>
  );
};

export default DuplicateFeeModal;
