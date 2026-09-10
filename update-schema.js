const fs = require('fs');
const path = require('path');

const liquidPath = path.join(__dirname, 'sections', 'bundle-builder.liquid');
let content = fs.readFileSync(liquidPath, 'utf8');

const schemaStart = content.indexOf('{% schema %}');
const schemaEnd = content.indexOf('{% endschema %}');

if (schemaStart !== -1 && schemaEnd !== -1) {
  const jsonStr = content.substring(schemaStart + 12, schemaEnd).trim();
  const schema = JSON.parse(jsonStr);

  const newSettings = [
    { type: "header", content: "Accordion Text Settings" },
    { type: "text", id: "step_1_title", label: "Step 1 Title", default: "Choose your cameras" },
    { type: "text", id: "step_2_title", label: "Step 2 Title", default: "Choose your plan" },
    { type: "text", id: "step_3_title", label: "Step 3 Title", default: "Choose your sensors" },
    { type: "text", id: "step_4_title", label: "Step 4 Title", default: "Add extra protection" },
    { type: "text", id: "step_prefix_text", label: "Step Prefix Text", default: "STEP {id} OF 4" },
    { type: "text", id: "next_button_prefix", label: "Next Button Prefix", default: "Next: " },
    { type: "text", id: "empty_category_text", label: "Empty Category Text", default: "No products available in this category." },
    
    { type: "header", content: "Review Panel Text Settings" },
    { type: "text", id: "review_panel_title", label: "Review Panel Title", default: "Your security system" },
    { type: "textarea", id: "review_panel_subtitle", label: "Review Panel Subtitle", default: "Review your personalized protection system designed to keep what matters most safe." },
    { type: "text", id: "review_header_label", label: "Review Label", default: "REVIEW" },
    { type: "text", id: "plan_highlight_text", label: "Plan Highlight Text", default: "Unlimited" },
    { type: "text", id: "shipping_title", label: "Shipping Row Title", default: "Fast Shipping" },
    { type: "text", id: "shipping_price_text", label: "Shipping Price Text", default: "FREE" },
    { type: "text", id: "shipping_compare_text", label: "Shipping Compare Price Text", default: "$5.99" },
    { type: "text", id: "empty_cart_text", label: "Empty Bundle Text", default: "Your bundle is empty." },
    { type: "text", id: "financing_pill_text", label: "Financing Pill Text", default: "as low as $19.19/mo" },
    { type: "text", id: "savings_prefix_text", label: "Savings Prefix Text", default: "Congrats! You're saving $" },
    { type: "text", id: "savings_suffix_text", label: "Savings Suffix Text", default: " on your security bundle!" },
    { type: "text", id: "checkout_button_text", label: "Checkout Button Text", default: "Checkout" },
    { type: "text", id: "save_for_later_text", label: "Save for later link Text", default: "Save my system for later" },
    
    { type: "header", content: "Price Styling" },
    { type: "range", id: "price_font_size", label: "Price Font Size", min: 10, max: 24, step: 1, unit: "px", default: 16 },
    { type: "color", id: "price_color", label: "Price Color", default: "#1F1F1F" },
    { type: "color", id: "compare_price_color", label: "Compare-at Price Color", default: "#6F7882" },
    
    { type: "header", content: "Quantity Stepper Styling" },
    { type: "color", id: "stepper_bg", label: "Stepper Background", default: "#F4F5F7" },
    { type: "color", id: "stepper_text_color", label: "Stepper Text Color", default: "#1F1F1F" },
    { type: "color", id: "stepper_border_color", label: "Stepper Border Color", default: "#E4E7EC" },
    { type: "range", id: "stepper_border_radius", label: "Stepper Border Radius", min: 0, max: 24, step: 2, unit: "px", default: 6 },
    
    { type: "header", content: "Variant Swatch Styling" },
    { type: "color", id: "variant_text_color", label: "Variant Text Color", default: "#4A5568" },
    { type: "color", id: "variant_border_color", label: "Variant Border Color", default: "#E4E7EC" },
    { type: "color", id: "variant_active_border", label: "Variant Active Border Color", default: "#4E2FD2" },
    { type: "color", id: "variant_active_bg", label: "Variant Active Background", default: "#EFEAFC" }
  ];

  schema.settings.push(...newSettings);

  const updatedSchemaStr = JSON.stringify(schema, null, 2);
  const newContent = content.substring(0, schemaStart + 12) + '\n' + updatedSchemaStr + '\n' + content.substring(schemaEnd);
  
  fs.writeFileSync(liquidPath, newContent, 'utf8');
  console.log('Successfully updated schema!');
} else {
  console.log('Could not find schema tags.');
}
