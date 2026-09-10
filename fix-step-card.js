const fs = require('fs');

const path = 'react-src/src/components/StepCard.jsx';
let content = fs.readFileSync(path, 'utf8');

// We need to add helper functions to StepCard.jsx
const helpers = `
  const getPx = (val, fallback) => {
    if (val === null || val === undefined || val === '') return fallback;
    return \`\${val}px\`;
  };

  const getColor = (val, fallback) => {
    if (!val || val === 'rgba(0,0,0,0)' || val === 'transparent' || val.trim() === '') return fallback;
    return val;
  };
`;

// Find where to insert helpers
const insertPos = content.indexOf('const s = product.blockSettings || {};');

content = content.slice(0, insertPos) + helpers + '\n  ' + content.slice(insertPos);

// Replace the cardCustomStyles object
const oldStylesRegex = /const cardCustomStyles = {[\s\S]*?};\n/;
const newStyles = `const cardCustomStyles = {
    '--card-bg-color': getColor(s.card_bg_color, 'var(--white)'),
    '--card-border-color': getColor(s.card_border_color, '#CED6DE'),
    '--card-selected-border-color': getColor(s.card_selected_border_color, '#4E2FD2'),
    '--card-padding': getPx(s.card_padding, '16px'),
    '--card-border-radius': getPx(s.card_border_radius, '12px'),

    '--card-image-width': getPx(s.card_image_width, '120px'),
    '--card-image-height': getPx(s.card_image_height, '120px'),
    '--card-image-offset-y': getPx(s.card_image_offset_y, '0px'),
    '--card-image-padding': getPx(s.card_image_padding, '0px'),

    '--card-title-font-family': s.card_title_font_family ? \`'\${s.card_title_font_family}', sans-serif\` : "'Gilroy-Bold', sans-serif",
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
`;

content = content.replace(oldStylesRegex, newStyles);
fs.writeFileSync(path, content, 'utf8');
console.log('Successfully updated StepCard.jsx');
