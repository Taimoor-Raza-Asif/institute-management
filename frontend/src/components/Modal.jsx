// src/components/Modal.jsx
import React from 'react';
import { useTheme } from '../context/ThemeContext';
const Modal = ({ isOpen, onClose, children }) => {
  const { currentTheme } = useTheme();
  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 flex items-center justify-center z-50 p-4 ${currentTheme.overlayBg || 'bg-gray-600 bg-opacity-75'}`}>
      {/* Added overflow-y-auto to make content scrollable if it overflows */}
      <div className={`relative rounded-lg max-h-full w-full max-w-sm sm:max-w-md md:max-w-screen-lg lg:max-w-screen-xl xl:max-w-screen-2xl 2xl:max-w-screen-3xl overflow-y-auto ${currentTheme.cardBg} ${currentTheme.shadow}`}>
        {children}
      </div>
    </div>
  );
};

export default Modal;
