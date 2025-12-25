// src/components/Loader.jsx
import React from 'react';
import { useTheme } from '../context/ThemeContext';

const Loader = () => {
  const { currentTheme } = useTheme();
  const dotColor = currentTheme?.kpiGood || 'text-emerald-600';
  return (
    <div className="flex justify-center items-center h-full">
      <div className="flex space-x-2">
        <div className={`dot animate-bounce-delay-1 ${dotColor} rounded-full w-4 h-4`}></div>
        <div className={`dot animate-bounce-delay-2 ${dotColor} rounded-full w-4 h-4`}></div>
        <div className={`dot animate-bounce-delay-3 ${dotColor} rounded-full w-4 h-4`}></div>
      </div>
    </div>
  );
};

export default Loader;