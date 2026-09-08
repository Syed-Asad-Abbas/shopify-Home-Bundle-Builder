import React from 'react';

/**
 * Goal: Render the live summary on the right side.
 * Method: Iterates through cartState to display selected items grouped by category, calculates totals/savings, and handles actions.
 * Inputs/Outputs:
 *  - products (Array): Shopify products.
 *  - cartState (Object): Selected items.
 *  - onSaveForLater (Function): Triggered to persist bundle state.
 *  - onQuantityChange (Function): Directly alter quantities from the review panel.
 *  - Returns: JSX Element
 */
const ReviewPanel = ({ products, cartState, onSaveForLater, onQuantityChange }) => {
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

  // Group items by category to match the Figma design
  const categories = ['Cameras', 'Sensors', 'Accessories', 'Plan'];
  const groupedItems = categories.reduce((acc, cat) => {
    acc[cat] = cartItems.filter(item => item.product.category === cat);
    return acc;
  }, {});

  const activeTotal = (activeTotalCents / 100).toFixed(2);
  const compareAtTotal = (compareAtTotalCents / 100).toFixed(2);
  const savings = ((compareAtTotalCents - activeTotalCents) / 100).toFixed(2);

  const handleCheckout = () => {
    if (cartItems.length === 0) return alert("Please select some products first!");
    const cartPermutation = cartItems.map(item => `${item.variant?.id || item.product.variants[0].id}:${item.quantity}`).join(',');
    window.location.href = `/cart/${cartPermutation}`;
  };

  return (
    <div className="review-panel">
      <div className="review-header-label">REVIEW</div>
      <h2>Your security system</h2>
      <p>Review your personalized protection system designed to keep what matters most safe.</p>

      <div className="review-items">
        {categories.map(category => {
          const items = groupedItems[category];
          if (!items || items.length === 0) return null;

          return (
            <div key={category} className="review-category-group">
              <h3 className="review-category-title">{category.toUpperCase()}</h3>
              {items.map(item => (
                <div key={item.key} className="review-line-item">
                  <div className="review-thumbnail">
                    <img src={item.product.images?.[0] || ''} alt={item.product.title} />
                  </div>
                  <div className="review-details">
                    <h4>{item.product.title} {item.variant ? `(${item.variant.title})` : ''}</h4>
                    <div className="review-stepper">
                      <button onClick={() => onQuantityChange(item.productId, item.variantId, item.quantity - 1)}>-</button>
                      <span>{item.quantity}</span>
                      <button onClick={() => onQuantityChange(item.productId, item.variantId, item.quantity + 1)}>+</button>
                    </div>
                  </div>
                  <div className="review-price">
                    {item.comparePrice > item.price && <span className="compare-price">${(item.comparePrice / 100).toFixed(2)}</span>}
                    <span className="active-price">${(item.price / 100).toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
          );
        })}

        {cartItems.length > 0 && (
          <div className="review-category-group">
            <div className="review-line-item shipping-row">
              <div className="review-thumbnail icon-wrapper">
                {/* Truck icon placeholder */}
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>
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

      <div className="review-summary-footer">
        <div className="guarantee-badge">
          {/* Badge Placeholder */}
          <div className="badge-circle">
            <span className="badge-text">100%<br/>Guarantee</span>
          </div>
        </div>

        <div className="totals-section">
          <div className="financing-pill">as low as $19.19/mo</div>
          <div className="totals-row">
            <span className="compare-price strikethrough">${compareAtTotal}</span>
            <span className="final-total">${activeTotal}</span>
          </div>
        </div>
      </div>

      {savings > 0 && (
        <div className="savings-callout">
          Congrats! You're saving ${savings} on your security bundle!
        </div>
      )}

      <button className="btn btn-primary btn-checkout" onClick={handleCheckout}>
        Checkout
      </button>
      
      <button className="btn btn-outline save-later-btn" onClick={onSaveForLater}>
        Save my system for later
      </button>
    </div>
  );
};

export default ReviewPanel;
