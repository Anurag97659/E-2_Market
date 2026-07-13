import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

// Global API interceptor to support production environment configuration
const originalFetch = window.fetch;
window.fetch = function (url, options) {
  const baseAPI = process.env.REACT_APP_API_URL || "http://localhost:8000/e-2market/v1";
  if (typeof url === "string" && url.includes("http://localhost:8000/e-2market/v1")) {
    url = url.replace("http://localhost:8000/e-2market/v1", baseAPI);
  }
  return originalFetch(url, options);
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
