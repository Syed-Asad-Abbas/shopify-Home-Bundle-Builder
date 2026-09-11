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
const StepCard = ({ product, cartState, onQuantityChange, assetUrls = {}, sectionSettings = {} }) => {
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
  
  // Global settings for card features
  const showStatusBadges = sectionSettings.show_status_badges !== false;
  const showHoverImage = sectionSettings.enable_hover_image !== false;
  const aspectRatio = sectionSettings.card_aspect_ratio || 'square';
  
  // Badge display
  let displayBadge = product.badgeText;
  if (!displayBadge && showStatusBadges) {
    // If we have inventory tracking and it's sold out, could show "Sold Out" here.
    // For now, fallback to discount if available.
    displayBadge = hasDiscount ? `Save ${discountPercent}%` : null;
  }

  // Variant image fallback: check if active variant has an image, else use primary product image
  const cardImage = activeVariant?.featured_image?.src || activeVariant?.image || product.images?.[0];
  const hoverImage = showHoverImage && product.images?.[1] ? product.images[1] : null;

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
    '--card-image-offset-y': s.card_image_offset_y !== undefined ? `${s.card_image_offset_y - 30}px` : '0px',
    '--card-image-padding': getPx(s.card_image_padding, '0px'),

    '--card-title-font-family': s.card_title_font_family ? `'${s.card_title_font_family}', sans-serif` : "'Gilroy-Bold', sans-serif",
    '--card-title-font-size': getPx(s.card_title_font_size, '16px'),
    '--card-title-font-weight': s.card_title_font_weight || '700',
    '--card-title-color': getColor(s.card_title_color, 'var(--text-dark)'),
    '--card-desc-font-size': getPx(s.card_desc_font_size, '12px'),
    '--card-desc-font-weight': s.card_desc_font_weight || '400',
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
  const handleStepper = (delta, e) => {
    console.log(`[StepCard] handleStepper triggered with delta: ${delta}`, e?.target);
    if (!activeVariant) return;
    const newQuantity = Math.max(0, quantity + delta);
    onQuantityChange(product.id, activeVariant.id, newQuantity);
  };

  /**
   * Goal: Handle clicks on the entire card to toggle product selection.
   * Method: Toggles quantity between 1 and 0, ignoring clicks on buttons or links.
   */
  const handleCardClick = (e) => {
    console.log('[StepCard] handleCardClick (top-level wrapper) triggered.');
    console.log('[StepCard] Event target:', e.target);
    console.log('[StepCard] Event currentTarget:', e.currentTarget);

    // If we are inside the Shopify Customizer, do not toggle the quantity.
    // This keeps the DOM stable so Shopify can open the sidebar settings without crashing.
    if (typeof window !== 'undefined' && window.Shopify && window.Shopify.designMode) {
      return;
    }

    if (
      e.target.closest('button') ||
      e.target.closest('a') ||
      e.target.closest('.variant-swatch') ||
      e.target.closest('.variant-btn') ||
      e.target.closest('.variant-selector')
    ) {
      console.log('[StepCard] handleCardClick early exit: Click was inside a button/link/variant selector.', { target: e.target });
      return;
    }
    if (!activeVariant) {
      console.log('[StepCard] handleCardClick early exit: No activeVariant.');
      return;
    }

    console.log('[StepCard] handleCardClick proceeding to toggle quantity.');
    // If not selected, select 1. If already selected, deselect (0).
    const newQuantity = quantity === 0 ? 1 : 0;
    onQuantityChange(product.id, activeVariant.id, newQuantity);
  };

  // Extract exact data-shopify-editor-block from raw Liquid output to ensure Customizer compatibility
  let shopifyEditorBlock = product.blockId ? JSON.stringify({ id: product.blockId, type: "bundle_product" }) : undefined;
  if (product.shopifyAttributes) {
    // block.shopify_attributes outputs a string like: class="shopify-block" data-shopify-editor-block="{&quot;id&quot;:&quot;...&quot;}"
    const match = product.shopifyAttributes.match(/data-shopify-editor-block=["']([^"']+)["']/);
    if (match && match[1]) {
      // Decode HTML entities if present
      shopifyEditorBlock = match[1].replace(/&quot;/g, '"');
    }
  }

  return (
    <div
      className={`step-card shopify-block shopify-app-block ${isSelected ? 'selected' : ''}`}
      style={{ cursor: 'pointer', ...cardCustomStyles }}
      onClick={handleCardClick}
      data-shopify-editor-block={shopifyEditorBlock}
      data-block-id={product.blockId}
    >
      {/* Product Image & Optional Discount Badge */}
      <div className={`step-card-image-wrapper aspect-${aspectRatio} ${hoverImage ? 'has-hover' : ''}`} onClick={(e) => console.log('[StepCard] step-card-image-wrapper clicked', e.target)}>
        {displayBadge && (
          <span className="discount-badge" onClick={(e) => console.log('[StepCard] discount-badge clicked', e.target)}>{displayBadge}</span>
        )}
        {cardImage ? (
          <>
            <img src={cardImage} className="primary-image" alt={product.title} onClick={(e) => console.log('[StepCard] img clicked', e.target)} />
            {hoverImage && <img src={hoverImage} className="secondary-image" alt={`${product.title} alternate`} />}
          </>
        ) : (
          <div className="placeholder-image" onClick={(e) => console.log('[StepCard] placeholder-image clicked', e.target)}>Image</div>
        )}
      </div>

      {/* Product Info */}
      <div className="step-card-info" onClick={(e) => console.log('[StepCard] step-card-info clicked', e.target)}>
        <h3 onClick={(e) => console.log('[StepCard] h3 title clicked', e.target)}>{product.title}</h3>

        {/* Optional Short Description */}
        {product.description && (
          <p className="step-card-description" onClick={(e) => console.log('[StepCard] description clicked', e.target)}>{product.description}</p>
        )}

        {/* Optional Learn More Link */}
        {product.learnMoreUrl && (
          <a
            href={product.learnMoreUrl}
            className="learn-more-link"
            target="_blank"
            rel="noreferrer"
            onClick={(e) => {
              console.log('[StepCard] learn-more-link clicked', e.target);
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
          <div onClick={(e) => console.log('[StepCard] variant-selector wrapper clicked', e.target)}>
            <VariantSelector
              variants={product.variants}
              activeVariant={activeVariant}
              setActiveVariant={setActiveVariant}
              productTitle={product.title}
              assetUrls={assetUrls}
            />
          </div>
        )}

        <div className="step-card-footer" onClick={(e) => console.log('[StepCard] step-card-footer clicked', e.target)}>
          {/* Quantity Stepper */}
          <div className="stepper" onClick={(e) => console.log('[StepCard] stepper container clicked', e.target)}>
            <button
              type="button"
              className="stepper-btn"
              onClick={(e) => {
                console.log('[StepCard] minus button onClick triggered', e.target);
                handleStepper(-1, e);
              }}
              disabled={quantity === 0}
              aria-label="Decrease quantity"
            >
              -
            </button>
            <span className="stepper-qty" onClick={(e) => console.log('[StepCard] stepper-qty clicked', e.target)}>{quantity}</span>
            <button
              type="button"
              className="stepper-btn"
              onClick={(e) => {
                console.log('[StepCard] plus button onClick triggered', e.target);
                handleStepper(1, e);
              }}
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>

          {/* Dual Price Display */}
          <div className="price-container" onClick={(e) => console.log('[StepCard] price-container clicked', e.target)}>
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
