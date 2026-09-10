import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import './index.css'

/**
 * Goal: Track active React root globally to prevent createRoot collisions during Shopify Theme Editor updates.
 * Method: Stores root reference on window.__BUNDLE_BUILDER_REACT_ROOT__ across script evaluations.
 * Inputs/Outputs: Window reference or null.
 */
// Cleanup any existing root left by a previous script evaluation
if (window.__BUNDLE_BUILDER_REACT_ROOT__) {
  try {
    window.__BUNDLE_BUILDER_REACT_ROOT__.unmount();
  } catch (e) {
    // suppress errors
  }
  window.__BUNDLE_BUILDER_REACT_ROOT__ = null;
}

/**
 * Goal: Mount or re-mount the React application onto the Shopify Liquid DOM root node safely.
 * Method: Uses window.__BUNDLE_BUILDER_REACT_ROOT__ exclusively to avoid closure staleness across script re-evaluations.
 * Inputs/Outputs:
 *  - Inputs: None (reads DOM element directly).
 *  - Outputs: void (side effect: creates or updates React component tree).
 */
const mountReactApp = () => {
  const rootElement = document.getElementById('react-bundle-builder-root');
  if (!rootElement) {
    return;
  }

  try {
    // If a root already exists in this script evaluation, cleanly unmount it
    if (window.__BUNDLE_BUILDER_REACT_ROOT__) {
      try {
        window.__BUNDLE_BUILDER_REACT_ROOT__.unmount();
      } catch {
        // Suppress unmount errors on detached nodes
      }
      window.__BUNDLE_BUILDER_REACT_ROOT__ = null;
    }

    const reactRoot = ReactDOM.createRoot(rootElement);
    window.__BUNDLE_BUILDER_REACT_ROOT__ = reactRoot;

    reactRoot.render(
      <React.StrictMode>
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
      </React.StrictMode>
    );
  } catch (error) {
    console.error("Bundle Builder mount failure, attempting recovery:", error);
    try {
      rootElement.innerHTML = '';
      const reactRoot = ReactDOM.createRoot(rootElement);
      window.__BUNDLE_BUILDER_REACT_ROOT__ = reactRoot;
      reactRoot.render(
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
      );
    } catch (retryErr) {
      console.error("Bundle Builder critical mount recovery failed:", retryErr);
    }
  }
};

// Initial mount on script evaluation
mountReactApp();

/**
 * Goal: Listen for Shopify Theme Editor section re-renders and re-mount the React application idempotently.
 * Method: Attaches event listeners for 'shopify:section:load' and 'shopify:section:unload' ensuring single registration via window flag. 
 * Uses global mount function reference so old listeners always call the latest code.
 */
window.__BUNDLE_BUILDER_MOUNT__ = mountReactApp;

if (!window.__BUNDLE_BUILDER_LISTENERS_ATTACHED__) {
  window.__BUNDLE_BUILDER_LISTENERS_ATTACHED__ = true;

  document.addEventListener('shopify:section:load', (event) => {
    const container = document.getElementById('bundle-builder-container') || document.getElementById('react-bundle-builder-root');
    if (container || event.target?.querySelector?.('#react-bundle-builder-root')) {
      if (typeof window.__BUNDLE_BUILDER_MOUNT__ === 'function') {
        window.__BUNDLE_BUILDER_MOUNT__();
      }
    }
  });

  document.addEventListener('shopify:section:unload', (event) => {
    if (event.target?.querySelector?.('#react-bundle-builder-root') && window.__BUNDLE_BUILDER_REACT_ROOT__) {
      try {
        window.__BUNDLE_BUILDER_REACT_ROOT__.unmount();
      } catch {
        // ignore
      }
      window.__BUNDLE_BUILDER_REACT_ROOT__ = null;
    }
  });
}
