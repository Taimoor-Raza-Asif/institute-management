// src/components/FeeModal.jsx
import React from 'react';
import { useTheme } from '../context/ThemeContext';
const FeeModal = ({ isOpen, onClose, children }) => {
  const { currentTheme } = useTheme();
  if (!isOpen) return null;
  return (
    <div className={`fixed inset-0 ${currentTheme?.modalOverlay || 'bg-black bg-opacity-40'} flex items-center justify-center z-50`}>
      <div className={`${currentTheme?.cardBg || 'bg-white'} p-6 rounded-lg ${currentTheme?.shadow || 'shadow-lg'} w-full max-w-xl max-h-full relative overflow-y-auto`}>
        {/* <button
          className={`absolute top-2 right-2 ${currentTheme?.icon || 'text-gray-500'} hover:${currentTheme?.danger || 'text-red-500'}`}
          // onClick={onClose}
        >
          &times;
        </button> */}
        {children}
      </div>
    </div>
  );
};

export default FeeModal;
