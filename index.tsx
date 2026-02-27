import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { initAnalytics } from './src/analytics';
import './src/styles/index.css';
import './src/styles/custom-hovers.css';

const rootElement = document.getElementById('root')!;
const root = ReactDOM.createRoot(rootElement);

initAnalytics();

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
