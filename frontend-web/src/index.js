import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css'; // This imports the Tailwind directives from Step 1
import App from './App'; // Or change to './TruthLensApp' if that is your filename

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);