/**
 * Song Arranger - Application Entry Point
 * Initializes React app with Redux store
 */

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { store } from './store/store';
import App from './App';
import './styles/theme.css';
import './styles/theme-modern.css';
import './styles/phosphor-effects.css';
import './styles/global.css';
import './styles/crt-effects.css';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Failed to find the root element');
}

createRoot(rootElement).render(
  <StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </StrictMode>
);
