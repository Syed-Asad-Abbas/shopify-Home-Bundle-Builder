import React, { useState, useEffect } from 'react';
import AccordionBuilder from './components/AccordionBuilder';
import ReviewPanel from './components/ReviewPanel';
import './index.css';

/**
 * Goal: Serve as the root container for the Bundle Builder React application.
 * Method: Parses initial data from the Shopify DOM script tag, manages the global cart state, and provides the layout.
 * Inputs/Outputs: None (Main component rendering the page structure).
 */
const App = () => {
  const [shopData, setShopData] = useState({ sectionSettings: {}, products: [] });
  const [cartState, setCartState] = useState({});
  const [activeStep, setActiveStep] = useState(1);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // 1. Fetch Shopify Data injected via Liquid
    const dataElement = document.getElementById('bundle-builder-data');
    if (dataElement) {
      try {
        const parsedData = JSON.parse(dataElement.textContent);
        setShopData(parsedData);
      } catch (err) {
        console.error("Error parsing Shopify product data", err);
      }
    }

    // 2. Load Cart State from LocalStorage
    const savedCart = localStorage.getItem('bundle-builder-cart');
    if (savedCart) {
      try {
        setCartState(JSON.parse(savedCart));
      } catch (err) {
        console.error("Error parsing saved cart data", err);
      }
    }
    
    setIsLoaded(true);
  }, []);

  /**
   * Goal: Handle updates to the cart quantities for specific product variants.
   * Method: Updates the `cartState` object mapping productId-variantId to the quantity.
   * Inputs/Outputs: 
   *  - productId (string/number)
   *  - variantId (string/number)
   *  - quantity (number)
   *  - Returns: void (Updates state)
   */
  const handleQuantityChange = (productId, variantId, quantity) => {
    setCartState(prev => {
      const newState = { ...prev };
      const key = `${productId}-${variantId}`;
      
      if (quantity <= 0) {
        delete newState[key];
      } else {
        newState[key] = quantity;
      }
      return newState;
    });
  };

  /**
   * Goal: Save the current bundle selection to localStorage so users can resume later.
   * Method: Serializes `cartState` and uses `localStorage.setItem`.
   * Inputs/Outputs: None (uses current state, returns void)
   */
  const handleSaveForLater = () => {
    localStorage.setItem('bundle-builder-cart', JSON.stringify(cartState));
    alert("Your system has been saved for later!");
  };

  if (!isLoaded) return <div>Loading Bundle Builder...</div>;

  return (
    <div className="bundle-builder-container">
      <h1 className="section-title">{shopData.sectionSettings?.heading || "Let's get started!"}</h1>
      
      <div className="bundle-builder-grid">
        <div className="left-column">
          <AccordionBuilder 
            products={shopData.products}
            cartState={cartState}
            activeStep={activeStep}
            setActiveStep={setActiveStep}
            onQuantityChange={handleQuantityChange}
          />
        </div>
        
        <div className="right-column">
          <ReviewPanel 
            products={shopData.products}
            cartState={cartState}
            onSaveForLater={handleSaveForLater}
            onQuantityChange={handleQuantityChange}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
