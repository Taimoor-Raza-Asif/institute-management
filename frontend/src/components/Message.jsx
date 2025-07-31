// src/components/Message.jsx
import React from 'react';

const Message = ({ type = 'info', children }) => {
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
      bgColorClass = 'bg-blue-100';
      textColorClass = 'text-blue-800';
      borderColorClass = 'border-blue-400';
      break;
  }

  return (
    <div
      className={`p-4 mb-4 text-sm rounded-lg border ${bgColorClass} ${textColorClass} ${borderColorClass}`}
      role="alert"
    >
      {children}
    </div>
  );
};

export default Message;