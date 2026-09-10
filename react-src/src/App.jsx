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

  /**
   * Goal: Parse the dynamic Shopify bundle configuration data from the DOM script element.
   * Method: Reads JSON content from document.getElementById('bundle-builder-data'), validates structure, and falls back to local products.json.
   * Inputs/Outputs:
   *  - Inputs: None (reads DOM).
   *  - Returns: Object containing sectionSettings, products, and assetUrls.
   */
  const loadShopifyData = () => {
    const dataElement = document.getElementById('bundle-builder-data');
    if (dataElement) {
      try {
        const parsedData = JSON.parse(dataElement.textContent);
        if (parsedData && Array.isArray(parsedData.products) && parsedData.products.length > 0) {
          return parsedData;
        }
      } catch (err) {
        console.error("Error parsing Shopify product data", err);
      }
    }
    return mockData;
  };

  /**
   * Goal: Build the initial default cart state matching the Figma preview across both mock data and real Shopify store data.
   * Method: Inspects loaded products by category and assigns initial quantities to the first matching items.
   * Inputs/Outputs:
   *  - productList (Array): The list of available products.
   *  - Returns: Object mapping `${productId}-${variantId}` to initial quantity.
   */
  const buildInitialCart = (productList) => {
    const initialCart = {};
    if (!productList || productList.length === 0) return initialCart;

    // Helper to add quantity for a product by index or title
    const addInitialQty = (predicate, qty) => {
      const prod = productList.find(predicate);
      if (prod && prod.variants && prod.variants.length > 0) {
        const variantId = prod.variants[0].id;
        initialCart[`${prod.id}-${variantId}`] = qty;
      }
    };

    // Pre-select items matching the Figma specification
    addInitialQty(p => p.title?.includes('Cam v4') || p.category === 'Cameras', 1);
    const cameras = productList.filter(p => p.category === 'Cameras');
    if (cameras.length > 1) {
      const secondCam = cameras[1];
      if (secondCam.variants && secondCam.variants.length > 0) {
        initialCart[`${secondCam.id}-${secondCam.variants[0].id}`] = 2;
      }
    }

    addInitialQty(p => p.category === 'Plan', 1);
    addInitialQty(p => p.category === 'Sensors' && p.title?.includes('Motion'), 2);
    addInitialQty(p => p.category === 'Sensors' && p.title?.includes('Hub'), 1);
    addInitialQty(p => p.category === 'Accessories', 2);

    return initialCart;
  };

  useEffect(() => {
    const initialData = loadShopifyData();
    setShopData(initialData);

    const savedCart = localStorage.getItem('bundle-builder-cart');
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        // Ensure saved cart keys belong to current product list
        const hasValidItems = Object.keys(parsedCart).some(key => {
          const [productId] = key.split('-');
          return initialData.products?.some(p => String(p.id) === String(productId));
        });

        if (hasValidItems) {
          setCartState(parsedCart);
        } else {
          setCartState(buildInitialCart(initialData.products));
        }
      } catch (err) {
        console.error("Error parsing saved cart data", err);
        setCartState(buildInitialCart(initialData.products));
      }
    } else {
      setCartState(buildInitialCart(initialData.products));
    }
    
    setIsLoaded(true);

    /**
     * Goal: Re-sync product data dynamically if Shopify Theme Editor triggers a section load.
     * Method: Attaches event listener to window/document for shopify:section:load and reloads shopData.
     * Inputs/Outputs: CustomEvent -> updates shopData state.
     */
    const handleSectionLoad = () => {
      const refreshedData = loadShopifyData();
      setShopData(refreshedData);
    };

    document.addEventListener('shopify:section:load', handleSectionLoad);
    return () => {
      document.removeEventListener('shopify:section:load', handleSectionLoad);
    };
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
            assetUrls={shopData.assetUrls}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
