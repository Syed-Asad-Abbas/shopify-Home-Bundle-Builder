import React from 'react';

/**
 * Goal: Allow users to switch between variants (like colors).
 * Method: Renders a list of variant options and sets the active variant when clicked.
 * Inputs/Outputs:
 *  - variants (Array): List of variant objects.
 *  - activeVariant (Object): Currently selected variant.
 *  - setActiveVariant (Function): State updater.
 *  - Returns: JSX Element
 */
const VariantSelector = ({ variants, activeVariant, setActiveVariant }) => {
  return (
    <div className="variant-selector">
      {variants.map(variant => (
        <button
          key={variant.id}
          className={`variant-btn ${activeVariant?.id === variant.id ? 'active' : ''}`}
          onClick={() => setActiveVariant(variant)}
        >
          {variant.title}
        </button>
      ))}
    </div>
  );
};

export default VariantSelector;
