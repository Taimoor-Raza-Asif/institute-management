// src/context/ThemeContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { themes, defaultThemeName } from '../themes/themesDefinition'; // FIX: Added .js extension

// 1. Create the Context
const ThemeContext = createContext();

// 2. Create the Provider Component
export const ThemeProvider = ({ children }) => {
  // Initialize theme name from localStorage, or use default
  const [currentThemeName, setCurrentThemeName] = useState(() => {
    return localStorage.getItem('appTheme') || defaultThemeName;
  });

  // Get the actual theme object based on the name
  const currentTheme = themes[currentThemeName] || themes[defaultThemeName];

  // Effect to save theme name to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('appTheme', currentThemeName);
  }, [currentThemeName]);

  // Context value to be exported
  const value = {
    currentThemeName,
    currentTheme,
    themes,
    setCurrentThemeName,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

// 3. Create the Custom Hook for easy consumption
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

