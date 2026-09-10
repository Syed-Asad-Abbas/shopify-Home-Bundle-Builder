import React from 'react';
import { PlanIcon } from './Icons';

/**
 * Goal: Render the live summary review panel matching the Figma mobile specification.
 * Method: Iterates through cartState to display selected items grouped by category, calculates totals/savings, and renders review details.
 * Inputs/Outputs:
 *  - products (Array): Shopify products.
 *  - cartState (Object): Selected items.
 *  - onSaveForLater (Function): Triggered to persist bundle state.
 *  - onQuantityChange (Function): Directly alter quantities from the review panel.
 *  - assetUrls (Object): Shopify dynamic asset URLs (e.g. satisfactionBadge).
 *  - Returns: JSX Element
 */
const ReviewPanel = ({ products, cartState, onSaveForLater, onQuantityChange, assetUrls = {} }) => {
  /**
   * Goal: Retrieve a product object by its ID.
   * Method: Searches the products array matching string IDs.
   * Inputs/Outputs: id (string|number) -> returns product object or undefined.
   */
  const getProductById = (id) => products.find(p => String(p.id) === String(id));

  let activeTotalCents = 0;
  let compareAtTotalCents = 0;

  const cartItems = Object.entries(cartState).map(([key, quantity]) => {
    const [productId, variantId] = key.split('-');
    const product = getProductById(productId);
    
    if (!product) return null;
    
    const variant = product.variants?.find(v => String(v.id) === variantId) || null;
    const price = variant?.price || product.price || 0;
    const comparePrice = variant?.compare_at_price || product.compare_at_price || price;

    activeTotalCents += price * quantity;
    compareAtTotalCents += comparePrice * quantity;

    return {
      key,
      productId,
      variantId,
      product,
      variant,
      quantity,
      price,
      comparePrice,
    };
  }).filter(Boolean);

  // Categories matching the Figma design sequence
  const categoryConfigs = [
    { key: 'Cameras', label: 'CAMERAS' },
    { key: 'Sensors', label: 'SENSORS' },
    { key: 'Accessories', label: 'ACCESSORIES' },
    { key: 'Plan', label: 'HOME MONITORING PLAN' }
  ];

  const groupedItems = categoryConfigs.reduce((acc, cat) => {
    acc[cat.key] = cartItems.filter(item => item.product.category === cat.key);
    return acc;
  }, {});

  const activeTotal = (activeTotalCents / 100).toFixed(2);
  const compareAtTotal = (compareAtTotalCents / 100).toFixed(2);
  const savings = ((compareAtTotalCents - activeTotalCents) / 100).toFixed(2);

  /**
   * Goal: Redirect user to checkout with the selected bundle permutation.
   * Method: Formats variant IDs and quantities into Shopify cart permalink.
   * Inputs/Outputs: None -> triggers window.location navigation.
   */
  const handleCheckout = () => {
    if (cartItems.length === 0) return alert("Please select some products first!");
    const cartPermutation = cartItems.map(item => `${item.variant?.id || item.product.variants[0].id}:${item.quantity}`).join(',');
    window.location.href = `/cart/${cartPermutation}`;
  };

  return (
    <div className="review-panel">
      <div className="review-header-label">REVIEW</div>
      <div className="review-title-wrapper">
        <div className="review-title">Your security system</div>
        <div className="review-subtitle">Review your personalized protection system designed to keep what matters most safe.</div>
      </div>

      <div className="review-items">
        {categoryConfigs.map(({ key, label }) => {
          const items = groupedItems[key];
          if (!items || items.length === 0) return null;

          return (
            <div key={key} className="review-category-group">
              <div className="review-category-header">{label}</div>
              
              {items.map(item => {
                const isPlan = item.product.category === 'Plan';

                if (isPlan) {
                  return (
                    <div key={item.key} className="review-line-item plan-line-item">
                      <div className="review-plan-left">
                        <PlanIcon className="plan-icon" />
                        <span className="plan-title">
                          Cam <span className="plan-title-highlight">Unlimited</span>
                        </span>
                      </div>
                      <div className="review-price">
                        <span className="compare-price">${((item.comparePrice * item.quantity) / 100).toFixed(2)}/mo</span>
                        <span className="active-price">${((item.price * item.quantity) / 100).toFixed(2)}/mo</span>
                      </div>
                    </div>
                  );
                }

                return (
                  <div key={item.key} className="review-line-item">
                    <div className="review-thumbnail">
                      <img src={item.product.images?.[0] || ''} alt={item.product.title} />
                    </div>
                    <div className="review-details">
                      <h4>{item.product.title}</h4>
                    </div>
                    <div className="review-stepper">
                      <button 
                        type="button"
                        onClick={() => onQuantityChange(item.productId, item.variantId, item.quantity - 1)}
                        aria-label="Decrease quantity"
                      >
                        −
                      </button>
                      <span>{item.quantity}</span>
                      <button 
                        type="button"
                        onClick={() => onQuantityChange(item.productId, item.variantId, item.quantity + 1)}
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>
                    <div className="review-price">
                      {item.comparePrice > item.price && (
                        <span className="compare-price">
                          ${((item.comparePrice * item.quantity) / 100).toFixed(2)}
                        </span>
                      )}
                      <span className="active-price">
                        {item.price === 0 ? 'FREE' : `$${((item.price * item.quantity) / 100).toFixed(2)}`}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}

        {/* Fast Shipping Row */}
        {cartItems.length > 0 && (
          <div className="review-category-group shipping-group">
            <div className="review-line-item shipping-row">
              <div className="review-thumbnail shipping-icon-box">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00A88F" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="1" y="3" width="15" height="13" rx="1.5"></rect>
                  <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
                  <circle cx="5.5" cy="18.5" r="2.5"></circle>
                  <circle cx="18.5" cy="18.5" r="2.5"></circle>
                  <line x1="1" y1="9" x2="6" y2="9"></line>
                  <line x1="2" y1="12" x2="5" y2="12"></line>
                </svg>
              </div>
              <div className="review-details">
                <h4>Fast Shipping</h4>
              </div>
              <div className="review-price">
                <span className="compare-price">$5.99</span>
                <span className="active-price">FREE</span>
              </div>
            </div>
          </div>
        )}

        {cartItems.length === 0 && <p className="empty-cart-msg">Your bundle is empty.</p>}
      </div>

      {/* Guarantee Badge & Pricing Block */}
      <div className="review-summary-footer">
        <div className="guarantee-badge">
          <img 
            src={assetUrls?.satisfactionBadge || '/satisfaction-badge.png'} 
            alt="100% Wyze satisfaction guarantee" 
            className="satisfaction-badge-img" 
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
          />
        </div>

        <div className="totals-section">
          <div className="financing-pill">
            <span className="financing-pill-text">as low as $19.19/mo</span>
          </div>
          <div className="totals-row">
            <span className="compare-price strikethrough">${compareAtTotal}</span>
            <span className="final-total">${activeTotal}</span>
          </div>
        </div>
      </div>

      {/* Savings Callout */}
      {savings > 0 && (
        <div className="savings-callout">
          Congrats! You're saving ${savings} on your security bundle!
        </div>
      )}

      {/* Checkout Button */}
      <button className="btn btn-checkout" onClick={handleCheckout}>
        Checkout
      </button>
      
      {/* Save for later link */}
      <button className="save-later-link" onClick={onSaveForLater}>
        Save my system for later
      </button>
    </div>
  );
};

export default ReviewPanel;
