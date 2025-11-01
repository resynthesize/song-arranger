/**
 * Cyclone - Application Entry Point
 * Initializes React app with Redux store
 */

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { store } from './store/store';
import App from './App';
import ErrorBoundary from './components/atoms/ErrorBoundary';

// Design System - Token-based architecture
import './styles/tokens/index.css';
import './styles/themes/index.css';

// Global styles
import './styles/phosphor-effects.css';
import './styles/global.css';
import './styles/crt-effects.css';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Failed to find the root element');
}

// Expose store and test helpers to window for E2E testing
if (import.meta.env.DEV) {
  (window as any).__REDUX_STORE__ = store;

  // Expose test helpers
  import('./utils/cirklon/import').then((module) => {
    (window as any).__testHelpers__ = {
      parseCKSFile: module.parseCKSFile,
    };
  });
}

createRoot(rootElement).render(
  <StrictMode>
    <ErrorBoundary>
      <Provider store={store}>
        <App />
      </Provider>
    </ErrorBoundary>
  </StrictMode>
);
