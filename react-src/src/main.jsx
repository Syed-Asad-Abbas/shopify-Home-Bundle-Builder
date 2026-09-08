import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

/**
 * Goal: Initialize the React application on the specific DOM node provided by the Shopify Liquid section.
 * Method: It searches for the 'react-bundle-builder-root' element. If found, it renders the App component.
 * Inputs/Outputs: None (Side effect: mounts the React tree).
 */
const mountReactApp = () => {
  const rootElement = document.getElementById('react-bundle-builder-root')
  if (rootElement) {
    ReactDOM.createRoot(rootElement).render(
      <React.StrictMode>
        <App />
      </React.StrictMode>,
    )
  } else {
    console.error('Bundle Builder root element not found.')
  }
}

mountReactApp()
