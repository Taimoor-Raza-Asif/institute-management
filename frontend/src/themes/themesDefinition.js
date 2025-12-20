// src/themes/themeDefinitions.js

/**
 * Defines the application's color themes.
 * Each theme provides Tailwind CSS class strings for main UI elements.
 * This makes it easy to switch styles globally.
 */
export const themes = {
  // Theme 1: Original Green (Light) - Default
  Green: {
    sidebarClasses: 'bg-gradient-to-r from-green-100 to-white text-gray-800 border-r-2 border-green-200',
    headerText: 'text-green-800',
    linkHover: 'hover:bg-gradient-to-r hover:from-gray-300 hover:to-green-500 hover:text-black',
    linkText: 'text-gray-800',
    mainBg: 'bg-gray-50',
    logoSvg: 'text-green-600',
    cardBg: 'bg-white', // Generic card/content background for light themes
    border: 'border-gray-300',
    shadow: 'shadow-md',
  },
  // Theme 2: General Dark (High Contrast Dark Mode)
  'General Dark': {
    sidebarClasses: 'bg-gray-700 text-gray-200 border-r-2 border-gray-600',
    headerText: 'text-white',
    linkHover: 'hover:bg-gray-600 hover:text-white',
    linkText: 'text-gray-200',
    mainBg: 'bg-gray-900',
    logoSvg: 'text-gray-400',
    cardBg: 'bg-gray-800', // Card/content background for dark themes
    border: 'border-gray-700',
    shadow: 'shadow-xl shadow-gray-900',
  },
  // Theme 3: Deep Blue (Dark Mode)
  'Deep Blue': {
    sidebarClasses: 'bg-gray-900 text-white border-r-2 border-blue-700',
    headerText: 'text-blue-500',
    linkHover: 'hover:bg-blue-800 hover:text-white',
    linkText: 'text-gray-300',
    mainBg: 'bg-gray-800',
    logoSvg: 'text-blue-500',
    cardBg: 'bg-gray-900',
    border: 'border-blue-700',
    shadow: 'shadow-lg shadow-blue-900/50',
  },
  // Theme 4: Royal Purple (Vibrant Light)
  'Royal Purple': {
    sidebarClasses: 'bg-purple-50 text-purple-900 border-r-2 border-purple-300',
    headerText: 'text-purple-800',
    linkHover: 'hover:bg-purple-200 hover:text-purple-900',
    linkText: 'text-purple-800',
    mainBg: 'bg-white',
    logoSvg: 'text-purple-600',
    cardBg: 'bg-white',
    border: 'border-purple-300',
    shadow: 'shadow-md shadow-purple-200',
  },
  // Theme 5: Sunset Orange (Warm Light)
  'Sunset Orange': {
    sidebarClasses: 'bg-orange-50 text-orange-900 border-r-2 border-orange-200',
    headerText: 'text-orange-800',
    linkHover: 'hover:bg-orange-200 hover:text-orange-900',
    linkText: 'text-orange-800',
    mainBg: 'bg-white',
    logoSvg: 'text-orange-500',
    cardBg: 'bg-white',
    border: 'border-orange-300',
    shadow: 'shadow-md shadow-orange-200',
  },
  // Theme 6: Black & Teal (Contrast Dark Mode)
  'Black & Teal': {
    sidebarClasses: 'bg-gray-800 text-teal-300 border-r-2 border-teal-500',
    headerText: 'text-teal-400',
    linkHover: 'hover:bg-teal-700 hover:text-white',
    linkText: 'text-teal-300',
    mainBg: 'bg-gray-900',
    logoSvg: 'text-teal-500',
    cardBg: 'bg-gray-800',
    border: 'border-teal-500',
    shadow: 'shadow-lg shadow-teal-900/50',
  },
  // Theme 7: Vibrant Magenta (New Theme)
  'Vibrant Magenta': {
    sidebarClasses: 'bg-pink-100 text-pink-900 border-r-2 border-pink-400',
    headerText: 'text-pink-700',
    linkHover: 'hover:bg-pink-300 hover:text-pink-900',
    linkText: 'text-pink-800',
    mainBg: 'bg-white',
    logoSvg: 'text-pink-600',
    cardBg: 'bg-white',
    border: 'border-pink-400',
    shadow: 'shadow-md shadow-pink-200',
  }
};

export const defaultThemeName = 'Green';
