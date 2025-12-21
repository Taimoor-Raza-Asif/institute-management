import React from 'react';
import { useTheme } from '../context/ThemeContext.jsx';
import { Sun, Moon } from 'lucide-react';

const ThemeToggle = () => {
  const { currentThemeName, setCurrentThemeName } = useTheme();
  const isDark = ['General Dark', 'Deep Blue', 'Black & Teal'].includes(currentThemeName);

  const toggle = () => {
    setCurrentThemeName(isDark ? 'Green' : 'General Dark');
  };

  return (
    <button
      onClick={toggle}
      className={`inline-flex items-center gap-2 px-3 py-2 rounded-md border transition-colors
                  ${isDark ? 'bg-gray-800 text-white border-gray-600 hover:bg-gray-700' : 'bg-white text-gray-800 border-gray-300 hover:bg-gray-100'}`}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      <span className="text-sm">{isDark ? 'Light' : 'Dark'} Mode</span>
    </button>
  );
};

export default ThemeToggle;
