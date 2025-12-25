// src/components/Message.jsx
import React from 'react';
import { useTheme } from '../context/ThemeContext';

const Message = ({ type = 'info', children }) => {
  const { currentTheme } = useTheme();
  const variants = {
    success: {
      bg: currentTheme.alertSuccessBg || 'bg-green-50',
      text: currentTheme.alertSuccessText || 'text-green-800',
      border: currentTheme.alertSuccessBorder || 'border border-green-200',
    },
    error: {
      bg: currentTheme.alertErrorBg || 'bg-red-50',
      text: currentTheme.alertErrorText || 'text-red-800',
      border: currentTheme.alertErrorBorder || 'border border-red-200',
    },
    warning: {
      bg: currentTheme.alertWarningBg || 'bg-amber-50',
      text: currentTheme.alertWarningText || 'text-amber-800',
      border: currentTheme.alertWarningBorder || 'border border-amber-200',
    },
    info: {
      bg: currentTheme.alertInfoBg || 'bg-blue-50',
      text: currentTheme.alertInfoText || 'text-blue-800',
      border: currentTheme.alertInfoBorder || 'border border-blue-200',
    },
  };

  const selected = variants[type] || variants.info;

  return (
    <div
      className={`p-4 mb-4 text-sm rounded-lg border ${selected.bg} ${selected.text} ${selected.border}`}
      role="alert"
    >
      {children}
    </div>
  );
};

export default Message;