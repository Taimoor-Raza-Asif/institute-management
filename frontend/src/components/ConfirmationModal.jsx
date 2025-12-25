// src/components/ConfirmationModal.jsx
import React from 'react';
import { useTheme } from '../context/ThemeContext';

const ConfirmationModal = ({ isOpen, onClose, onConfirm, message }) => {
    const { currentTheme } = useTheme();
    if (!isOpen) return null;

    return (
        <div className={`fixed inset-0 ${currentTheme?.modalOverlay || 'bg-black/50'} overflow-y-auto h-full w-full flex items-center justify-center z-50`}>
            <div className={`relative p-6 rounded-lg max-w-sm mx-auto ${currentTheme?.modalBg || 'bg-white'} ${currentTheme?.modalBorder || 'border border-gray-200'} ${currentTheme?.modalShadow || 'shadow-2xl'}`}>
                <div className="text-center">
                    <p className={`text-lg font-semibold ${currentTheme?.text || 'text-gray-900'} mb-4`}>{message}</p>
                    <div className="flex justify-center space-x-4">
                        <button
                            onClick={onClose}
                            className={`px-4 py-2 rounded-md transition duration-200 ${currentTheme?.btnSecondaryBg || 'bg-white'} ${currentTheme?.btnSecondaryText || 'text-emerald-700'} ${currentTheme?.btnSecondaryBorder || 'border border-emerald-200'} ${currentTheme?.btnSecondaryHover || 'hover:bg-emerald-50'}`}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={onConfirm}
                            className={`px-4 py-2 rounded-md transition duration-200 ${currentTheme?.btnDangerBg || 'bg-red-600'} ${currentTheme?.btnDangerText || 'text-white'} ${currentTheme?.btnDangerBorder || 'border border-red-700'} ${currentTheme?.btnDangerHover || 'hover:bg-red-700'}`}
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