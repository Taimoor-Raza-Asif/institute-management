// src/pages/Unauthorized.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { useTheme } from '../context/ThemeContext';

const Unauthorized = () => {
  const { currentTheme } = useTheme();

  return (
    <div className={`flex flex-col items-center justify-center min-h-screen p-4 ${currentTheme.mainBg || 'bg-gray-100'}`}>
      <div className={`p-8 rounded-lg text-center ${currentTheme.cardBg || 'bg-white'} ${currentTheme.shadow || 'shadow-md'} ${currentTheme.border || ''}`}>
        <ExclamationTriangleIcon className="h-20 w-20 text-red-500 mx-auto mb-4" />
        <h1 className={`text-3xl font-bold mb-3 ${currentTheme.title || 'text-gray-800'}`}>Access Denied</h1>
        <p className={`${currentTheme.text || 'text-gray-600'} mb-6`}>You do not have the necessary permissions to view this page.</p>
        <Link
          to="/dashboard"
          className={`inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white ${currentTheme.buttonBg || 'bg-green-600'} ${currentTheme.buttonHover || 'hover:bg-green-700'}`}
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
};
export default Unauthorized;
