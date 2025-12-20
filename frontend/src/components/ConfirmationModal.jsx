// src/components/ConfirmationModal.jsx
import React from 'react';
import { useTheme } from '../context/ThemeContext';

const ConfirmationModal = ({ isOpen, onClose, onConfirm, message }) => {
    const { currentTheme } = useTheme();
    if (!isOpen) return null;

    return (
        <div className={`fixed inset-0 ${currentTheme?.modalOverlay || 'bg-gray-600 bg-opacity-50'} overflow-y-auto h-full w-full flex items-center justify-center z-50`}>
            <div className={`relative p-6 ${currentTheme?.cardBg || 'bg-white'} rounded-lg ${currentTheme?.shadow || 'shadow-xl'} max-w-sm mx-auto`}>
                <div className="text-center">
                    <p className={`text-lg font-semibold ${currentTheme?.title || 'text-gray-900'} mb-4`}>{message}</p>
                    <div className="flex justify-center space-x-4">
                        <button
                            onClick={onClose}
                            className={`px-4 py-2 border ${currentTheme?.border || 'border-gray-300'} rounded-md ${currentTheme?.text || 'text-gray-700'} hover:${currentTheme?.inputBg || 'bg-gray-100'} transition duration-200`}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={onConfirm}
                            className={`px-4 py-2 ${currentTheme?.danger || 'bg-red-600'} text-white rounded-md hover:${currentTheme?.dangerHover || 'bg-red-700'} transition duration-200`}
                        >
                            Ok
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;