import React, { useState } from 'react';

/**
 * Goal: Render a small thumbnail or color dot representing the variant.
 * Method: Attempts to load the miniature product variant image matching the product title and option color, falling back to an elegant CSS color swatch dot.
 * Inputs/Outputs:
 *  - productTitle (string): Parent product title (e.g., "Wyze Cam v4").
 *  - variantTitle (string): Option name (e.g., "White", "Grey", "Black").
 *  - Returns: JSX Element.
 */
const VariantThumbnail = ({ productTitle = '', variantTitle = '' }) => {
  const [imgError, setImgError] = useState(false);
  const normalized = variantTitle.toLowerCase().trim();

  let bg = '#FFFFFF';
  let border = '#D0D5DD';

  if (normalized.includes('grey') || normalized.includes('gray')) {
    bg = '#787878';
    border = '#555555';
  } else if (normalized.includes('black')) {
    bg = '#1F1F1F';
    border = '#000000';
  }

  const imageSrc = `/${productTitle}-${normalized}.png`;

  if (!imgError && productTitle) {
    return (
      <img
        src={imageSrc}
        alt={variantTitle}
        className="variant-swatch-img"
        onError={() => setImgError(true)}
      />
    );
  }

  return (
    <span
      className="variant-swatch-dot"
      style={{ backgroundColor: bg, borderColor: border }}
      aria-hidden="true"
    />
  );
};

/**
 * Goal: Allow users to switch between variants (like color options) with visual swatch indicators.
 * Method: Renders an interactive pill list of variant options, displaying swatches/icons and applying active styling.
 * Inputs/Outputs:
 *  - variants (Array): List of variant objects.
 *  - activeVariant (Object): Currently selected variant.
 *  - setActiveVariant (Function): State updater function.
 *  - productTitle (string): Product title to resolve thumbnail imagery.
 *  - Returns: JSX Element.
 */
const VariantSelector = ({ variants = [], activeVariant, setActiveVariant, productTitle = '' }) => {
  return (
    <div className="variant-selector" role="radiogroup" aria-label="Product variants">
      {variants.map((variant) => {
        const isActive = activeVariant?.id === variant.id;
        const title = variant.title || variant.option1 || 'Option';
        return (
          <button
            key={variant.id}
            type="button"
            className={`variant-btn ${isActive ? 'active' : ''}`}
            onClick={() => setActiveVariant(variant)}
            role="radio"
            aria-checked={isActive}
          >
            <VariantThumbnail productTitle={productTitle} variantTitle={title} />
            <span className="variant-btn-text">{title}</span>
          </button>
        );
      })}
    </div>
  );
};

export default VariantSelector;
