import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

/**
 * Goal: Initialize the React application on the specific DOM node provided by the Shopify Liquid section.
 * Method: It searches for the 'react-bundle-builder-root' element. If found, it renders the App component.
 * Inputs/Outputs: None (Side effect: mounts the React tree).
 */
let reactRoot = null;

/**
 * Goal: Mount or re-mount the React application onto the Shopify Liquid DOM root node.
 * Method: Searches for 'react-bundle-builder-root'. If an existing ReactDOM root is active, unmounts it first to prevent memory leaks and hydration mismatches, then mounts a fresh React root with <App />.
 * Inputs/Outputs:
 *  - Inputs: None (reads DOM element directly).
 *  - Outputs: void (side effect: creates or updates React component tree).
 */
const mountReactApp = () => {
  const rootElement = document.getElementById('react-bundle-builder-root');
  if (rootElement) {
    if (reactRoot) {
      reactRoot.unmount();
      reactRoot = null;
    }
    reactRoot = ReactDOM.createRoot(rootElement);
    reactRoot.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>,
    );
  } else {
    console.error('Bundle Builder root element not found.');
  }
};

// Initial mount on script evaluation
mountReactApp();

/**
 * Goal: Listen for Shopify Theme Editor section re-renders and re-mount the React application.
 * Method: Attaches event listeners for 'shopify:section:load' and 'shopify:section:unload' to window/document.
 * Inputs/Outputs:
 *  - Inputs: CustomEvent fired by Shopify Theme Customizer.
 *  - Outputs: void (triggers mountReactApp or unmounts reactRoot).
 */
document.addEventListener('shopify:section:load', (event) => {
  const container = document.getElementById('bundle-builder-container') || document.getElementById('react-bundle-builder-root');
  if (container || event.target.querySelector?.('#react-bundle-builder-root')) {
    mountReactApp();
  }
});

document.addEventListener('shopify:section:unload', (event) => {
  if (event.target.querySelector?.('#react-bundle-builder-root') && reactRoot) {
    reactRoot.unmount();
    reactRoot = null;
  }
});
