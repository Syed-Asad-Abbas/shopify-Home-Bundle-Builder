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
let reactRoot = window.__BUNDLE_BUILDER_REACT_ROOT__ || null;

/**
 * Goal: Mount or re-mount the React application onto the Shopify Liquid DOM root node safely.
 * Method: Locates 'react-bundle-builder-root'. If already mounted on this element, updates via render(); otherwise creates a new root safely with error handling and wraps in ErrorBoundary.
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
    // If a root already exists and its container is still the current DOM node, render into it directly
    if (reactRoot && reactRoot._internalRoot?.containerInfo === rootElement) {
      reactRoot.render(
        <React.StrictMode>
          <ErrorBoundary>
            <App />
          </ErrorBoundary>
        </React.StrictMode>,
      );
      return;
    }

    // If an old root was attached to a detached container, cleanly unmount it
    if (reactRoot) {
      try {
        reactRoot.unmount();
      } catch {
        // Suppress unmount errors on detached nodes
      }
      reactRoot = null;
    }

    reactRoot = ReactDOM.createRoot(rootElement);
    window.__BUNDLE_BUILDER_REACT_ROOT__ = reactRoot;

    reactRoot.render(
      <React.StrictMode>
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
      </React.StrictMode>,
    );
  } catch (error) {
    console.error("Bundle Builder mount failure, attempting recovery:", error);
    try {
      rootElement.innerHTML = '';
      reactRoot = ReactDOM.createRoot(rootElement);
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
 * Inputs/Outputs:
 *  - Inputs: CustomEvent fired by Shopify Theme Customizer.
 *  - Outputs: void (triggers mountReactApp or safely unmounts reactRoot).
 */
if (!window.__BUNDLE_BUILDER_LISTENERS_ATTACHED__) {
  window.__BUNDLE_BUILDER_LISTENERS_ATTACHED__ = true;

  document.addEventListener('shopify:section:load', (event) => {
    const container = document.getElementById('bundle-builder-container') || document.getElementById('react-bundle-builder-root');
    if (container || event.target?.querySelector?.('#react-bundle-builder-root')) {
      mountReactApp();
    }
  });

  document.addEventListener('shopify:section:unload', (event) => {
    if (event.target?.querySelector?.('#react-bundle-builder-root') && reactRoot) {
      try {
        reactRoot.unmount();
      } catch {
        // ignore
      }
      reactRoot = null;
      window.__BUNDLE_BUILDER_REACT_ROOT__ = null;
    }
  });
}
