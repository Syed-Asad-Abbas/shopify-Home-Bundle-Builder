Frontend Take-Home: Bundle Builder & Review Panel
1. Project Overview & Objective
Build a fully interactive, data-driven React single-page application replicating a multi-step smart-home security bundle builder and a live-updating review panel based on the provided design specifications and mobile structure.

2. Core Functional Requirements
A. Multi-Step Accordion Builder (Left Column)
Structure: A vertical 4-step accordion system (Step 1 of 4 to Step 4 of 4).

Initial State: Step 1 ("Choose your cameras") must be expanded by default; steps 2, 3, and 4 must be collapsed.

Interactions: Clicking any step header expands it and collapses the others. Each header displays an icon, title, a dynamic selection count (e.g., “2 selected”), and a chevron indicator.

Progression: The expanded step includes a "Next: [Next Step Name]" button that smoothly advances user focus or opens the subsequent step.

B. Product Cards & Dynamic Options
Data-Driven Rendering: Render all products from a centralized JSON data file rather than hardcoding markup.

Elements Per Card: Optional discount badges (e.g., "Save 22%"), product images, titles, short descriptions, "Learn More" links, variant selectors, quantity steppers, and dual pricing (strikethrough compare-at price + active price).

Selection State: Cards with a quantity greater than zero visually reflect a selected state (highlighted border styling).

C. Variant Selector & Quantities
Independent Variant Tracking: Products with variants (e.g., color chips) must track quantities independently per variant (e.g., Red vs. Blue).

Stepper Binding: The card’s main quantity stepper binds to whichever variant is currently active/selected. Changing the active variant updates the stepper to reflect that specific option's quantity without resetting others.

D. Live Review Panel (Right Column / Summary)
Real-Time Sync: Instantly updates whenever quantities change or variants are added/modified on the left.

Category Grouping: Groups selected items under precise subheadings: Cameras, Sensors, Accessories, and Home Monitoring Plan.

Line Items: Each summary row features a thumbnail, product name, integrated quantity stepper, and pricing.

Financial Summary: Displays shipping row, satisfaction-guarantee badge, monthly financing text, strikethrough total, final calculated total, and a savings callout message.

Actions: Includes a functional "Checkout" placeholder button and a "Save my system for later" persistence link.

E. Client-Side Persistence (localStorage)
Clicking "Save my system for later" serializes and saves the current application state (selected products, variants, and quantities) to localStorage.

On initial app load (useEffect), the system checks for saved data and restores the custom bundle configuration automatically.

3. Component Architecture & Data Flow
App.js / Root Container: Manages global state (cartState), initialization from localStorage, and handles desktop two-column grid vs. mobile responsive stacking.

AccordionBuilder.js: Manages active accordion index state and renders the 4 structured steps.

StepCard.js / ProductCard.js: Handles individual product rendering, variant selection state, and local stepper interactions.

VariantSelector.js: Renders color chips/swatches and syncs active variant quantities.

ReviewPanel.js: Computes totals, renders categorized summary items, handles direct receipt steppers, and triggers localStorage persistence.

4. Seed Data Schema (products.json)
The application requires a structured JSON file mapping out categories, product descriptions, pricing, default pre-selected states to match the design initial load, and variant arrays where applicable.


for mobile 
iPhone 13 & 14 - 35 (Screen Root)

Let’s get started! (Text Heading)

Frame 4483 (Accordion Steps Container)

Frame 539 (Step 1 Container)

Frame 550 (Step Badge)

Step 1 of 4 (Text)

Frame 25 (Step 1 Content Header)

Frame 552 (Step 1 Header Inner Row)

Frame 1419 (Step Title Area)

icon/24/cam/livestream (Icon)

Choose your cameras (Text)

Frame 1418 (Step Status Area)

2 selected (Text)

12/carrot-up (Icon)

Frame 542 (Step 2 Container)

Frame 550 (Step Badge)

Step 2 of 4 (Text)

Frame 25 (Step 2 Content Header)

Frame 552 (Step 2 Header Inner Row)

Frame 1421 (Step Title Area)

logo_hms_new 1 (Icon)

Choose your plan (Text)

Frame 1418 (Step Status Area)

1 selected (Text)

12/carrot-up (Icon)

Frame 543 (Step 3 Container)

Frame 550 (Step Badge)

Step 3 of 4 (Text)

Frame 25 (Step 3 Content Header)

Frame 1418 (Step Title Area)

Group 1417 (Icon Group)

Choose your sensors (Text)

Frame 1420 (Step Status Area)

2 selected (Text)

12/carrot-up (Icon)

Frame 544 (Step 4 Container)

Frame 550 (Step Badge)

Step 4 of 4 (Text)

Frame 25 (Step 4 Content Header)

Frame 553 (Step 4 Header Inner Row)

Frame 1422 (Step Title Area)

Frame 1419 (Icon Container)

Add extra protection (Text)

Frame 1418 (Step Status Area)

1 selected (Text)

12/carrot-up (Icon)

Frame 538 (Outer Review Container)

Frame 538 (Inner Review Container)

Frame 550 (Review Tab Badge)

Review (Text)

iPhone 13 & 14 - 30 (Review Panel Nested Frame)

Frame 4491 (Review Header)

Heading 2 → Place it anywhere. (Text)

Review your personalized protection system (Text)

Frame 4489 (Review Line-Items Container)

Frame 1420 (Cameras Group)

Cameras (Section Title)

Frame 1419 (Camera Product Row Outer)

Frame 1419 (Camera Row Inner)

Frame 1419 (Camera Row Details)

Wyze_Cam_V4_01.0001.png (Image)

Wyze Cam v4 (Text)

Frame 4473 (Stepper Container)

Frame 1419 (Minus Button)

12/minus (Icon)

1 (Quantity Value)

Frame 1419 (Add Button)

12/add (Icon)

Frame 1418 (Price Container)

$35.98 (Compare-at Price)

$27.98 (Active Price)

Frame 1423 (Sensors Group)

Sensors (Section Title)

Frame 1419 (Motion Sensor Row Outer)

Frame 1419 (Row Inner)

Frame 1419 (Product Details)

Wyze Sense Motion Sensor (Image)

Wyze Sense Motion Sensor (Text)

Frame 4473 (Stepper Container)

Frame 1418 (Price Container)

$59.98 (Price Text)

Frame 1420 (Hub Row Outer)

Frame 1419 (Row Inner)

Frame 1419 (Product Details)

Wyze Sense Hub (Image)

Wyze Sense Hub (Required) (Text)

Frame 4473 (Stepper Container)

Frame 1419 (Minus Button)

1 (Quantity Value)

Frame 1419 (Add Button)

Frame 1420 (Price Container)

$29.92 (Compare-at Price)

FREE (Active Price)

Frame 1422 (Accessories Group)

accessories (Section Title)

Frame 1419 (MicroSD Row Outer)

Frame 1419 (Row Inner)

Frame 1419 (Product Details)

Black 256GB microSD card w (Image)

Wyze MicroSD Card (256GB) (Text)

Frame 4473 (Stepper Container)

Frame 1418 (Price Container)

$41.96 (Price Text)

Frame 1421 (Home Monitoring Plan Group)

Home monitoring plan (Section Title)

Frame 1419 (Plan Row Container)

Frame 4488 (Plan Info Container)

Layer_1 (Icon)

Cam Unlimited (Text)

Frame 1419 (Price Container)

$12.99/mo (Compare-at Price)

$9.99/mo (Active Price)

Frame 1424 (Shipping Row Outer)

Frame 1419 (Shipping Row Inner)

Frame 1419 (Shipping Row Sub-wrapper)

Frame 1419 (Shipping Details)

Wyze Sense Keypad (Image/Icon)

Fast Shipping (Text)

Frame 1420 (Price Container)

$5.99 (Compare-at Price)

FREE (Active Price)

Frame 1733 (Summary, Totals & Actions)

Frame 1420 (Action & Pricing Box)

Frame 1419 (Guarantee & Price Subtotal Row)

Frame 1420 (Badge Container)

Satisfaction Badge-05 1 (Image)

Frame 1727 (Pricing Container)

Frame 17 (Financing Container)

as low as $19.19/mo (Text)

Frame 1417 (Total Display Container)

$238.81 (Compare-at Total)

$187.89 (Final Total)

Frame 4490 (Callout & CTA Container)

Congrats! You're saving $50.92 on this system (Text)

Button (CTA Element)

Label (Button Text)

Save my system for later (Link/Button)