import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
const themeClasses = localStorage.getItem('themeClasses');
if (themeClasses) {
  document.body.className = themeClasses;
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);