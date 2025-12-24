import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { initAnalytics, trackPageView } from './utils/analytics';

// Initialize Google Analytics (dynamically loads gtag.js script)
initAnalytics();

// Track initial page view (GA is loaded by initAnalytics above)
trackPageView(window.location.pathname);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

