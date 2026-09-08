import React, { useState } from 'react';
import VariantSelector from './VariantSelector';

/**
 * Goal: Render individual product cards inside the Accordion steps.
 * Method: Displays product info, price, and ties variant selection to the quantity stepper.
 * Inputs/Outputs:
 *  - product (Object): The Shopify product data.
 *  - cartState (Object): Global cart mapping.
 *  - onQuantityChange (Function): Handler to update quantities.
 *  - Returns: JSX Element
 */
const StepCard = ({ product, cartState, onQuantityChange }) => {
  // Use the first variant as default active
  const [activeVariant, setActiveVariant] = useState(product.variants?.[0] || null);

  // Retrieve current quantity from cartState based on active variant
  const cartKey = `${product.id}-${activeVariant?.id || ''}`;
  const quantity = cartState[cartKey] || 0;

  /**
   * Goal: Handle quantity updates for this specific product variant.
   * Method: Calls the global handler with the calculated new quantity.
   * Inputs/Outputs:
   *  - delta (Number): amount to change by (1 or -1)
   */
  const handleStepper = (delta) => {
    if (!activeVariant) return;
    const newQuantity = Math.max(0, quantity + delta);
    onQuantityChange(product.id, activeVariant.id, newQuantity);
  };

  return (
    <div className={`step-card ${quantity > 0 ? 'selected' : ''}`}>
      {/* Product Image */}
      <div className="step-card-image-wrapper">
        {product.images && product.images.length > 0 ? (
          <img src={product.images[0]} alt={product.title} />
        ) : (
          <div className="placeholder-image">Image</div>
        )}
      </div>

      {/* Product Info */}
      <div className="step-card-info">
        <h3>{product.title}</h3>
        
        {/* Variant Selector */}
        {product.variants && product.variants.length > 1 && (
          <VariantSelector 
            variants={product.variants} 
            activeVariant={activeVariant} 
            setActiveVariant={setActiveVariant} 
          />
        )}
        
        <div className="step-card-footer">
          {/* Quantity Stepper */}
          <div className="stepper">
            <button 
              className="stepper-btn" 
              onClick={() => handleStepper(-1)}
              disabled={quantity === 0}
            >
              -
            </button>
            <span className="stepper-qty">{quantity}</span>
            <button 
              className="stepper-btn" 
              onClick={() => handleStepper(1)}
            >
              +
            </button>
          </div>
          
          {/* Price */}
          <div className="price-container">
            {product.compare_at_price > product.price && (
              <span className="compare-price">${(product.compare_at_price / 100).toFixed(2)}</span>
            )}
            <span className="active-price">${(product.price / 100).toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StepCard;
