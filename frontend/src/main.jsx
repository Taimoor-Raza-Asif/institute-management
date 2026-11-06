
// src/main.jsx (or index.jsx)
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx'; // Correct import for a default export
import ErrorBoundary from './components/ErrorBoundary.jsx';
import './index.css'; // Assuming you have an index.css for global styles
import './mobile.css'; // Mobile-only responsive overhaul

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
);
