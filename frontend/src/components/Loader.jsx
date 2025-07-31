// src/components/Loader.jsx
import React from 'react';

const Loader = () => {
  return (
    <div className="flex justify-center items-center h-full">
      <div className="flex space-x-2">
        <div className="dot animate-bounce-delay-1 bg-indigo-500 rounded-full w-4 h-4"></div>
        <div className="dot animate-bounce-delay-2 bg-indigo-500 rounded-full w-4 h-4"></div>
        <div className="dot animate-bounce-delay-3 bg-indigo-500 rounded-full w-4 h-4"></div>
      </div>
    </div>
  );
};

export default Loader;