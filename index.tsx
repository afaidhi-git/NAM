import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

try {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} catch (error) {
  console.error("Critical Render Error:", error);
  rootElement.innerHTML = `
    <div style="padding: 20px; font-family: sans-serif; color: #ef4444; text-align: center;">
      <h1 style="margin-bottom: 10px;">Nexus Initialization Failed</h1>
      <p style="color: #64748b;">A critical error occurred while loading the application.</p>
      <pre style="text-align: left; background: #f1f5f9; padding: 15px; border-radius: 8px; margin-top: 20px; overflow-x: auto;">${error instanceof Error ? error.message : String(error)}</pre>
      <button onclick="window.location.reload()" style="margin-top: 20px; padding: 10px 20px; background: #3b82f6; color: white; border: none; border-radius: 6px; cursor: pointer;">Reload Application</button>
    </div>
  `;
}