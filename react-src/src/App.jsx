import React, { useState, useEffect } from 'react';
import AccordionBuilder from './components/AccordionBuilder';
import ReviewPanel from './components/ReviewPanel';
import mockData from './products.json';
import './index.css';

/**
 * Goal: Parse the dynamic Shopify bundle configuration data from the DOM script element.
 * Method: Reads JSON content from document.getElementById('bundle-builder-data'), validates structure, and immutably merges with local fallbacks.
 * Inputs/Outputs:
 *  - Inputs: None (reads DOM).
 *  - Returns: Object containing sectionSettings, products, and assetUrls.
 */
const loadShopifyData = () => {
  const dataElement = document.getElementById('bundle-builder-data');
  if (dataElement) {
    try {
      const parsedData = JSON.parse(dataElement.textContent);
      if (parsedData) {
        const products = Array.isArray(parsedData.products) && parsedData.products.length > 0
          ? parsedData.products.map(p => ({ ...p }))
          : (mockData.products || []).map(p => ({ ...p }));

        return {
          sectionSettings: {
            ...(mockData.sectionSettings || {}),
            ...(parsedData.sectionSettings || {})
          },
          products,
          assetUrls: {
            ...(mockData.assetUrls || {}),
            ...(parsedData.assetUrls || {})
          }
        };
      }
    } catch (err) {
      console.error("Error parsing Shopify product data", err);
    }
  }
  return {
    sectionSettings: { ...(mockData.sectionSettings || {}) },
    products: (mockData.products || []).map(p => ({ ...p })),
    assetUrls: { ...(mockData.assetUrls || {}) }
  };
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

/**
 * Goal: Initialize cart state synchronously from localStorage or Figma pre-selection defaults.
 * Method: Parses localStorage item 'bundle-builder-cart', verifies matching product IDs, or falls back to buildInitialCart.
 * Inputs/Outputs:
 *  - products (Array): The loaded products list.
 *  - Returns: Object representing initial cart quantities.
 */
const loadInitialCartState = (products) => {
  if (typeof window === 'undefined') return {};
  try {
    const savedCart = localStorage.getItem('bundle-builder-cart');
    if (savedCart) {
      const parsedCart = JSON.parse(savedCart);
      const hasValidItems = Object.keys(parsedCart).some(key => {
        const [productId] = key.split('-');
        return products?.some(p => String(p.id) === String(productId));
      });
      if (hasValidItems) {
        return parsedCart;
      }
    }
  } catch (err) {
    console.error("Error parsing saved cart data", err);
  }
  return buildInitialCart(products);
};

/**
 * Goal: Serve as the root container for the Bundle Builder React application.
 * Method: Parses initial data from the Shopify DOM script tag, manages the global cart state, and provides the layout.
 * Inputs/Outputs: None (Main component rendering the page structure).
 */
const App = () => {
  const [shopData, setShopData] = useState(loadShopifyData);
  const [cartState, setCartState] = useState(() => loadInitialCartState(shopData.products));
  const [activeStep, setActiveStep] = useState(1);

  // Removed redundant 'shopify:section:load' listener. main.jsx handles this by remounting the app.

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

  const s = shopData.sectionSettings || {};
  const customStyles = {
    '--section-heading-size': s.heading_size ? `${s.heading_size}px` : '32px',
    '--section-heading-align': s.heading_alignment || 'center',
    '--section-heading-color': s.heading_color || '#1F1F1F',
    '--section-heading-margin-bottom': s.heading_margin_bottom ? `${s.heading_margin_bottom}px` : '32px',

    '--step-title-font-family': s.step_title_font_family ? `'${s.step_title_font_family}', sans-serif` : "'Gilroy-semibold', sans-serif",
    '--step-title-font-size': s.step_title_font_size ? `${s.step_title_font_size}px` : '18px',
    '--step-title-color': s.step_title_color || '#0B0D10',
    '--step-header-padding-y': s.step_header_padding_y ? `${s.step_header_padding_y}px` : '0px',

    '--selected-count-font-family': s.selected_count_font_family ? `'${s.selected_count_font_family}', sans-serif` : "'Gilroy-Medium', sans-serif",
    '--selected-count-font-size': s.selected_count_font_size ? `${s.selected_count_font_size}px` : '14px',
    '--selected-count-color': s.selected_count_color || '#4E2FD2',

    '--price-font-size': s.price_font_size ? `${s.price_font_size}px` : '16px',
    '--price-color': s.price_color || '#1F1F1F',
    '--compare-price-color': s.compare_price_color || '#6F7882',

    '--stepper-bg': s.stepper_bg || '#F4F5F7',
    '--stepper-text-color': s.stepper_text_color || '#1F1F1F',
    '--stepper-border-color': s.stepper_border_color || '#E4E7EC',
    '--stepper-border-radius': s.stepper_border_radius !== undefined ? `${s.stepper_border_radius}px` : '6px',
    '--review-bg-color': s.review_bg_color || '#EDF4FF'
  };

  return (
    <div className="bundle-builder-container" style={customStyles}>
      <h1 className="section-title">{s.heading || "Let's get started!"}</h1>
      
      <div className="bundle-builder-grid">
        <div className="left-column">
          <AccordionBuilder 
            products={shopData.products}
            cartState={cartState}
            activeStep={activeStep}
            setActiveStep={setActiveStep}
            onQuantityChange={handleQuantityChange}
            assetUrls={shopData.assetUrls}
            sectionSettings={shopData.sectionSettings}
          />
        </div>
        
        <div className="right-column">
          <ReviewPanel 
            products={shopData.products}
            cartState={cartState}
            onSaveForLater={handleSaveForLater}
            onQuantityChange={handleQuantityChange}
            assetUrls={shopData.assetUrls}
            sectionSettings={shopData.sectionSettings}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
