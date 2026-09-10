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
const StepCard = ({ product, cartState, onQuantityChange, assetUrls = {} }) => {
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
  // Badge display: prefer custom badge text from Shopify block or fallback to computed discount percent
  const displayBadge = product.badgeText || (hasDiscount ? `Save ${discountPercent}%` : null);

  // Variant image fallback: check if active variant has an image, else use primary product image
  const cardImage = activeVariant?.featured_image?.src || activeVariant?.image || product.images?.[0];

  // Determine if this product has any quantity selected in cart across all variants
  const totalProductQty = product.variants && product.variants.length > 0
    ? product.variants.reduce((sum, v) => sum + (cartState[`${product.id}-${v.id}`] || 0), 0)
    : quantity;
  const isSelected = totalProductQty > 0;

  // Compute card-level overrides from Shopify product block settings
  
  const getPx = (val, fallback) => {
    if (val === null || val === undefined || val === '') return fallback;
    return `${val}px`;
  };

  const getColor = (val, fallback) => {
    if (!val || val === 'rgba(0,0,0,0)' || val === 'transparent' || val.trim() === '') return fallback;
    return val;
  };

  const s = product.blockSettings || {};
  const cardCustomStyles = {
    '--card-bg-color': getColor(s.card_bg_color, 'var(--white)'),
    '--card-border-color': getColor(s.card_border_color, '#CED6DE'),
    '--card-selected-border-color': getColor(s.card_selected_border_color, '#4E2FD2'),
    '--card-padding': getPx(s.card_padding, '16px'),
    '--card-border-radius': getPx(s.card_border_radius, '12px'),

    '--card-image-width': getPx(s.card_image_width, '120px'),
    '--card-image-height': getPx(s.card_image_height, '120px'),
    '--card-image-offset-y': getPx(s.card_image_offset_y, '0px'),
    '--card-image-padding': getPx(s.card_image_padding, '0px'),

    '--card-title-font-family': s.card_title_font_family ? `'${s.card_title_font_family}', sans-serif` : "'Gilroy-Bold', sans-serif",
    '--card-title-font-size': getPx(s.card_title_font_size, '16px'),
    '--card-title-color': getColor(s.card_title_color, 'var(--text-dark)'),
    '--card-desc-font-size': getPx(s.card_desc_font_size, '12px'),
    '--card-desc-color': getColor(s.card_desc_color, '#6F7882'),

    '--variant-text-color': getColor(s.variant_text_color, '#4A5568'),
    '--variant-border-color': getColor(s.variant_border_color, '#E4E7EC'),
    '--variant-active-border': getColor(s.variant_active_border, '#4E2FD2'),
    '--variant-active-bg': getColor(s.variant_active_bg, '#EFEAFC'),
    '--variant-image-size': getPx(s.variant_image_size, '16px'),
    '--variant-padding-x': getPx(s.variant_padding_x, '10px'),
    '--variant-padding-y': getPx(s.variant_padding_y, '4px'),
    '--variant-border-radius': getPx(s.variant_border_radius, '6px'),
    '--variant-text-size': getPx(s.variant_text_size, '12px'),
  };

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
      className={`step-card ${isSelected ? 'selected' : ''}`}
      style={cardCustomStyles}
      data-shopify-editor-block={product.blockId ? JSON.stringify({ id: product.blockId }) : undefined}
    >
      {/* Product Image & Optional Discount Badge */}
      <div className="step-card-image-wrapper">
        {displayBadge && (
          <span className="discount-badge">{displayBadge}</span>
        )}
        {cardImage ? (
          <img src={cardImage} alt={product.title} />
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
          <a 
            href={product.learnMoreUrl} 
            className="learn-more-link" 
            target="_blank" 
            rel="noreferrer"
            onClick={(e) => {
              if (typeof window !== 'undefined' && window.Shopify && window.Shopify.designMode) {
                e.preventDefault();
              }
            }}
          >
            Learn More
          </a>
        )}

        {/* Variant Selector */}
        {product.variants && product.variants.length > 1 && (
          <VariantSelector 
            variants={product.variants} 
            activeVariant={activeVariant} 
            setActiveVariant={setActiveVariant} 
            productTitle={product.title}
            assetUrls={assetUrls}
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
