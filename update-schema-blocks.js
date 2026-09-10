const fs = require('fs');

const liquidPath = 'sections/bundle-builder.liquid';
let content = fs.readFileSync(liquidPath, 'utf8');

const schemaStart = content.indexOf('{% schema %}');
const schemaEnd = content.indexOf('{% endschema %}');

const jsonStr = content.substring(schemaStart + 12, schemaEnd).trim();
const schema = JSON.parse(jsonStr);

const idsToMove = [
  'card_bg_color', 'card_border_color', 'card_selected_border_color',
  'card_padding', 'card_border_radius', 'card_image_width',
  'card_image_height', 'card_image_offset_y', 'card_image_padding',
  'card_title_font_family', 'card_title_font_size', 'card_title_color',
  'card_desc_font_size', 'card_desc_color', 'variant_text_color',
  'variant_border_color', 'variant_active_border', 'variant_active_bg'
];

// Extract from settings
const settingsToMove = schema.settings.filter(s => idsToMove.includes(s.id));
schema.settings = schema.settings.filter(s => !idsToMove.includes(s.id));

// Remove headers that are now empty (or just remove specific ones)
schema.settings = schema.settings.filter(s => 
  !(s.type === 'header' && ['Product Card Settings', 'Product Image Placement & Size', 'Product Typography', 'Variant Swatch Styling'].includes(s.content))
);

// We should also remove 'custom_image_offset_y' and 'custom_image_padding' from the block 
// since we now moved 'card_image_offset_y' and 'card_image_padding' there.
let blockSettings = schema.blocks[0].settings.filter(s => 
  !['custom_image_offset_y', 'custom_image_padding'].includes(s.id)
);

// Add headers and moved settings to block
blockSettings.push(
  { type: "header", content: "Card Styling" },
  ...settingsToMove.filter(s => s.id && s.id.startsWith('card_')),
  { type: "header", content: "Variant Styling" },
  ...settingsToMove.filter(s => s.id && s.id.startsWith('variant_')),
  {
    type: "range",
    id: "variant_image_size",
    label: "Variant Image Size",
    min: 8,
    max: 32,
    step: 2,
    unit: "px",
    default: 16
  },
  {
    type: "range",
    id: "variant_padding_x",
    label: "Variant Container Padding X",
    min: 0,
    max: 20,
    step: 2,
    unit: "px",
    default: 10
  },
  {
    type: "range",
    id: "variant_padding_y",
    label: "Variant Container Padding Y",
    min: 0,
    max: 20,
    step: 2,
    unit: "px",
    default: 4
  },
  {
    type: "range",
    id: "variant_border_radius",
    label: "Variant Container Border Radius",
    min: 0,
    max: 24,
    step: 2,
    unit: "px",
    default: 6
  },
  {
    type: "range",
    id: "variant_text_size",
    label: "Variant Text Font Size",
    min: 10,
    max: 18,
    step: 1,
    unit: "px",
    default: 12
  }
);

schema.blocks[0].settings = blockSettings;

const updatedSchemaStr = JSON.stringify(schema, null, 2);
content = content.substring(0, schemaStart + 12) + '\n' + updatedSchemaStr + '\n' + content.substring(schemaEnd);

fs.writeFileSync(liquidPath, content, 'utf8');
console.log('Successfully updated schema!');
