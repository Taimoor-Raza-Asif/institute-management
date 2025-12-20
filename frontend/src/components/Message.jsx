// src/components/Message.jsx
import React from 'react';
import { useTheme } from '../context/ThemeContext';

const Message = ({ type = 'info', children }) => {
  const { currentTheme } = useTheme();
  let bgColorClass = '';
  let textColorClass = '';
  let borderColorClass = '';

  switch (type) {
    case 'success':
      bgColorClass = 'bg-green-100';
      textColorClass = 'text-green-800';
      borderColorClass = 'border-green-400';
      break;
    case 'error':
      bgColorClass = 'bg-red-100';
      textColorClass = 'text-red-800';
      borderColorClass = 'border-red-400';
      break;
    case 'warning':
      bgColorClass = 'bg-yellow-100';
      textColorClass = 'text-yellow-800';
      borderColorClass = 'border-yellow-400';
      break;
    case 'info':
    default:
      bgColorClass = 'bg-green-100';
      textColorClass = 'text-green-800';
      borderColorClass = 'border-green-400';
      break;
  }

  return (
    <div
      className={`p-4 mb-4 text-sm rounded-lg border ${bgColorClass} ${textColorClass} ${borderColorClass} ${currentTheme.cardBg}`}
      role="alert"
    >
      {children}
    </div>
  );
};

export default Message;