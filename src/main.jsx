import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './styles.css';
import { parseLocation, translateLegacyHash } from './routes.js';
import { loadRoutePayload, loadShell } from './content-load.js';

const rootEl = document.getElementById('root');

async function boot() {
  translateLegacyHash();
  const shell = await loadShell();
  translateLegacyHash(window.location, window.history, shell.manifest);
  const route = parseLocation(window.location, shell.manifest);
  const extra = await loadRoutePayload(route, shell);
  const initialData = { ...shell, ...extra };
  createRoot(rootEl).render(<App initialRoute={route} initialData={initialData} />);
}

boot();
