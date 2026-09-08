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
  // Find a product by its ID
  const getProductById = (id) => products.find(p => String(p.id) === String(id));

  // Compute total prices (Shopify prices are in cents, so we divide by 100)
  let activeTotalCents = 0;
  let compareAtTotalCents = 0;

  // Flatten the cart items for easy rendering
  const cartItems = Object.entries(cartState).map(([key, quantity]) => {
    const [productId, variantId] = key.split('-');
    const product = getProductById(productId);
    
    if (!product) return null;
    
    const variant = product.variants?.find(v => String(v.id) === variantId) || null;
    
    // Default to product price if variant doesn't have a specific price overriding
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

  const activeTotal = (activeTotalCents / 100).toFixed(2);
  const compareAtTotal = (compareAtTotalCents / 100).toFixed(2);
  const savings = ((compareAtTotalCents - activeTotalCents) / 100).toFixed(2);

  /**
   * Goal: Handle standard checkout redirection.
   * Method: Navigates the browser to the Shopify cart URL with the selected variants.
   * Inputs/Outputs: None (Side effect: Redirects window)
   */
  const handleCheckout = () => {
    // In Shopify, you can redirect to checkout using a permutation of variant IDs
    // Example: /cart/12345:1,67890:2
    if (cartItems.length === 0) return alert("Please select some products first!");
    
    const cartPermutation = cartItems.map(item => `${item.variant?.id || item.product.variants[0].id}:${item.quantity}`).join(',');
    window.location.href = `/cart/${cartPermutation}`;
  };

  return (
    <div className="review-panel">
      <h2>Your security system</h2>
      <p>Review your personalized protection system designed to keep what matters most safe.</p>

      <div className="review-items">
        {cartItems.map(item => (
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

        {cartItems.length === 0 && <p className="empty-cart-msg">Your bundle is empty.</p>}
      </div>

      <div className="review-summary-footer">
        <div className="totals-row">
          <span className="compare-price strikethrough">${compareAtTotal}</span>
          <span className="final-total">${activeTotal}</span>
        </div>
        
        {savings > 0 && (
          <div className="savings-callout">
            Congrats! You're saving ${savings} on your security bundle!
          </div>
        )}

        <button className="btn btn-primary" onClick={handleCheckout}>
          Checkout
        </button>
        
        <button className="btn btn-outline save-later-btn" onClick={onSaveForLater}>
          Save my system for later
        </button>
      </div>
    </div>
  );
};

export default ReviewPanel;
