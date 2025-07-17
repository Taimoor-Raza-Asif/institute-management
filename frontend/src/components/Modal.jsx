// src/components/Modal.jsx
import React from 'react';
const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 p-4">
      {/* Added overflow-y-auto to make content scrollable if it overflows */}
      <div className="relative bg-white rounded-lg shadow-xl max-h-full w-full max-w-sm sm:max-w-md md:max-w-screen-lg lg:max-w-screen-xl xl:max-w-screen-2xl 2xl:max-w-screen-3xl overflow-y-auto">
        {children}
      </div>
    </div>
  );
};

export default Modal;
