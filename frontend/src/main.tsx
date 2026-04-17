import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './styles/globals.css';

// Registro del Service Worker (PWA) - solo en producción
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then(() => console.log('[sw] Service Worker registrado.'))
      .catch((err) => console.error('[sw] Error al registrar Service Worker:', err));
  });
}

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('No se encontró el elemento #root en el DOM.');

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
);
