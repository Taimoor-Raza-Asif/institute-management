// src/components/Modal.jsx
import React from 'react';
import { useTheme } from '../context/ThemeContext';
const Modal = ({ isOpen, onClose, children }) => {
  const { currentTheme } = useTheme();
  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 flex items-center justify-center z-50 p-4 ${currentTheme.modalOverlay || 'bg-black/50'}`}>
      <div className={`relative rounded-lg max-h-full w-full max-w-sm sm:max-w-md md:max-w-screen-lg lg:max-w-screen-xl xl:max-w-screen-2xl 2xl:max-w-screen-3xl overflow-y-auto ${currentTheme.modalBg || 'bg-white'} ${currentTheme.modalBorder || 'border border-gray-200'} ${currentTheme.modalShadow || 'shadow-2xl'}`}>
        {children}
      </div>
    </div>
  );
};

export default Modal;
