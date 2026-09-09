import React, { useState } from 'react';
import VariantSelector from './VariantSelector';

/**
 * Goal: Render individual product cards inside the Accordion steps with dynamic options.
 * Method: Displays product info, optional discount badge, short description, learn-more link, and binds active variant to stepper and dual pricing.
 * Inputs/Outputs:
 *  - product (Object): The Shopify product data (images, title, price, compare_at_price, description, learnMoreUrl, variants).
 *  - cartState (Object): Global cart mapping of variant keys to quantities.
 *  - onQuantityChange (Function): Handler to update quantities.
 *  - Returns: JSX Element
 */
const StepCard = ({ product, cartState, onQuantityChange }) => {
  // Use the first variant as default active
  const [activeVariant, setActiveVariant] = useState(product.variants?.[0] || null);

  // Retrieve current quantity from cartState based on active variant
  const cartKey = `${product.id}-${activeVariant?.id || ''}`;
  const quantity = cartState[cartKey] || 0;

  // Compute pricing and discount percentage dynamically for active variant
  const comparePrice = activeVariant?.compare_at_price || product.compare_at_price;
  const currentPrice = activeVariant?.price || product.price;
  const hasDiscount = comparePrice && comparePrice > currentPrice;
  const discountPercent = hasDiscount ? Math.round(((comparePrice - currentPrice) / comparePrice) * 100) : 0;

  /**
   * Goal: Handle quantity updates for this specific product variant.
   * Method: Calls the global handler with the calculated new quantity ensuring it doesn't drop below 0.
   * Inputs/Outputs:
   *  - delta (Number): Amount to increment or decrement (+1 or -1).
   *  - Returns: void (Triggers onQuantityChange callback).
   */
  const handleStepper = (delta) => {
    if (!activeVariant) return;
    const newQuantity = Math.max(0, quantity + delta);
    onQuantityChange(product.id, activeVariant.id, newQuantity);
  };

  return (
    <div 
      className={`step-card ${quantity > 0 ? 'selected' : ''}`}
      data-shopify-editor-block={product.blockId ? JSON.stringify({ id: product.blockId }) : undefined}
    >
      {/* Product Image & Optional Discount Badge */}
      <div className="step-card-image-wrapper">
        {hasDiscount && (
          <span className="discount-badge">Save {discountPercent}%</span>
        )}
        {product.images && product.images.length > 0 ? (
          <img src={product.images[0]} alt={product.title} />
        ) : (
          <div className="placeholder-image">Image</div>
        )}
      </div>

      {/* Product Info */}
      <div className="step-card-info">
        <h3>{product.title}</h3>
        
        {/* Optional Short Description */}
        {product.description && (
          <p className="step-card-description">{product.description}</p>
        )}

        {/* Optional Learn More Link */}
        {product.learnMoreUrl && (
          <a href={product.learnMoreUrl} className="learn-more-link" target="_blank" rel="noreferrer">
            Learn More
          </a>
        )}

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
              type="button"
              className="stepper-btn" 
              onClick={() => handleStepper(-1)}
              disabled={quantity === 0}
              aria-label="Decrease quantity"
            >
              -
            </button>
            <span className="stepper-qty">{quantity}</span>
            <button 
              type="button"
              className="stepper-btn" 
              onClick={() => handleStepper(1)}
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>
          
          {/* Dual Price Display */}
          <div className="price-container">
            {hasDiscount && (
              <span className="compare-price">${(comparePrice / 100).toFixed(2)}</span>
            )}
            <span className="active-price">${(currentPrice / 100).toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StepCard;
