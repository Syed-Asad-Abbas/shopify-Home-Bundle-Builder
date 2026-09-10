import React, { useState } from 'react';

/**
 * Goal: Resolve a verified image URL for a given variant, avoiding speculative 404 network requests.
 * Method: Checks if an image URL exists in the Shopify dynamic assetUrls dictionary, variant object, or known local dev files.
 * Inputs/Outputs:
 *  - productTitle (string): Parent product title (e.g., "Wyze Cam v4").
 *  - variantTitle (string): Variant title (e.g., "White", "Grey", "Black").
 *  - variant (Object): The Shopify variant object.
 *  - assetUrls (Object): Map of asset URLs from Liquid / shopData.
 *  - Returns: string URL or null.
 */
const getVariantImageUrl = (productTitle = '', variantTitle = '', variant = {}, assetUrls = {}) => {
  // 1. Check if Shopify variant object has a featured image URL
  if (variant?.featured_image?.src) {
    return variant.featured_image.src;
  }
  if (typeof variant?.image === 'string' && variant.image.length > 0) {
    return variant.image;
  }

  const normalized = variantTitle.toLowerCase().trim();
  const key = `${productTitle}-${normalized}`;

  // 2. Check if Liquid injected a verified asset URL
  if (assetUrls && assetUrls[key]) {
    return assetUrls[key];
  }

  // 3. Fallback for local Vite dev only for verified files (preventing 404s on Shopify)
  const isShopifyEnvironment = typeof window !== 'undefined' && (Boolean(window.Shopify) || window.location.port === '9292');
  if (!isShopifyEnvironment) {
    const verifiedLocalFiles = [
      'Wyze Cam v4-white',
      'Wyze Cam v4-grey',
      'Wyze Cam v4-black',
      'Wyze Cam Pan v3-white',
      'Wyze Cam Pan v3-black',
      'Wyze Cam Floodlight v2-black',
      'Wyze Battery Cam Pro-black'
    ];
    if (verifiedLocalFiles.includes(key)) {
      return `/${key}.png`;
    }
  }

  return null;
};

/**
 * Goal: Render a small thumbnail or color dot representing the variant without triggering 404 errors.
 * Method: Uses getVariantImageUrl to retrieve a verified image URL. If none is available, directly renders a CSS swatch dot.
 * Inputs/Outputs:
 *  - productTitle (string): Parent product title.
 *  - variantTitle (string): Variant title.
 *  - variant (Object): Variant data.
 *  - assetUrls (Object): Dynamic asset URLs mapping.
 *  - Returns: JSX Element.
 */
const VariantThumbnail = ({ productTitle = '', variantTitle = '', variant = {}, assetUrls = {} }) => {
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

  const imageUrl = getVariantImageUrl(productTitle, variantTitle, variant, assetUrls);

  if (imageUrl && !imgError) {
    return (
      <img
        src={imageUrl}
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
 *  - assetUrls (Object): Dynamic asset URLs mapping.
 *  - Returns: JSX Element.
 */
const VariantSelector = ({ variants = [], activeVariant, setActiveVariant, productTitle = '', assetUrls = {} }) => {
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
            <VariantThumbnail 
              productTitle={productTitle} 
              variantTitle={title} 
              variant={variant}
              assetUrls={assetUrls}
            />
            <span className="variant-btn-text">{title}</span>
          </button>
        );
      })}
    </div>
  );
};

export default VariantSelector;
