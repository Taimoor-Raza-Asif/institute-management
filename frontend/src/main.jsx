
// src/main.jsx (or index.jsx)
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx'; // Correct import for a default export
import './index.css'; // Assuming you have an index.css for global styles

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
