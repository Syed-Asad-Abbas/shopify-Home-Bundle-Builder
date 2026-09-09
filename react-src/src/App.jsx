import React, { useState, useEffect } from 'react';
import AccordionBuilder from './components/AccordionBuilder';
import ReviewPanel from './components/ReviewPanel';
import mockData from './products.json';
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
        setShopData(mockData);
      }
    } else {
      // Fallback for local development environment
      setShopData(mockData);
    }

    // 2. Load Cart State from LocalStorage (or initialize with Figma preview values)
    const defaultFigmaCart = {
      '1-101': 1, // Wyze Cam v4
      '2-201': 2, // Wyze Cam Pan v3
      '3-301': 1, // Cam Unlimited
      '4-401': 2, // Wyze Sense Motion Sensor
      '5-501': 1, // Wyze Sense Hub
      '6-601': 2, // Wyze MicroSD Card (256GB)
    };

    const savedCart = localStorage.getItem('bundle-builder-cart');
    if (savedCart) {
      try {
        setCartState(JSON.parse(savedCart));
      } catch (err) {
        console.error("Error parsing saved cart data", err);
        setCartState(defaultFigmaCart);
      }
    } else {
      setCartState(defaultFigmaCart);
    }
    
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    /**
     * Goal: Automatically expand the matching accordion step when a merchant selects a block in the Shopify Customizer.
     * Method: Listens to Shopify's 'shopify:block:select' DOM event, finds the product by blockId, and updates activeStep.
     * Inputs/Outputs: 
     *  - event (CustomEvent): Contains selected blockId in event.detail.
     *  - Returns: void (Updates activeStep state).
     */
    const handleShopifyBlockSelect = (event) => {
      const selectedBlockId = event.detail?.blockId;
      if (!selectedBlockId) return;

      const matchingProduct = shopData.products?.find(
        (p) => String(p.blockId) === String(selectedBlockId)
      );
      if (!matchingProduct) return;

      const categoryToStep = {
        Cameras: 1,
        Plan: 2,
        Sensors: 3,
        Accessories: 4,
      };

      const targetStep = categoryToStep[matchingProduct.category];
      if (targetStep) {
        setActiveStep(targetStep);
      }
    };

    document.addEventListener('shopify:block:select', handleShopifyBlockSelect);
    return () => {
      document.removeEventListener('shopify:block:select', handleShopifyBlockSelect);
    };
  }, [shopData.products]);

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
