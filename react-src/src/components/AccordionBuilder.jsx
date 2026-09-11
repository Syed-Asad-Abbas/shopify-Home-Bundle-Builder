import React from 'react';
import StepCard from './StepCard';
import { CameraIcon, PlanIcon, SensorsIcon, ProtectionIcon, AccordionArrow } from './Icons';

/**
 * Goal: Render the multi-step accordion system on the left column.
 * Method: Iterates through defined steps, displaying the header and conditionally rendering the body based on the `activeStep`.
 * Inputs/Outputs: 
 *  - products (Array): The list of Shopify products.
 *  - cartState (Object): The current cart quantities mapping.
 *  - activeStep (Number): The currently open step (1-4).
 *  - setActiveStep (Function): Updates the active step.
 *  - onQuantityChange (Function): Handler for quantity updates.
 *  - Returns: JSX Element
 */
const AccordionBuilder = ({ products, cartState, activeStep, setActiveStep, onQuantityChange, assetUrls = {}, sectionSettings = {} }) => {
  const s = sectionSettings || {};
  const steps = [
    { id: 1, title: s.step_1_title || 'Choose your cameras', category: 'Cameras', Icon: CameraIcon },
    { id: 2, title: s.step_2_title || 'Choose your plan', category: 'Plan', Icon: PlanIcon },
    { id: 3, title: s.step_3_title || 'Choose your sensors', category: 'Sensors', Icon: SensorsIcon },
    { id: 4, title: s.step_4_title || 'Add extra protection', category: 'Accessories', Icon: ProtectionIcon },
  ];

  /**
   * Goal: Calculate how many items are selected for a specific category.
   * Method: Filters cartState keys based on products matching the category.
   * Inputs/Outputs: category name -> returns number of selected items.
   */
  const getSelectedCount = (category) => {
    // We map products based on the category defined in the Shopify Customizer block
    const categoryProducts = products.filter(p => p.category === category);
    let count = 0;
    
    // Sum quantities for products in this category
    Object.entries(cartState).forEach(([key, qty]) => {
      const [productId] = key.split('-');
      if (categoryProducts.some(p => String(p.id) === String(productId))) {
        count += qty;
      }
    });
    
    return count;
  };

  return (
    <div className="accordion-container">
      {steps.map((step) => {
        const isOpen = activeStep === step.id;
        const selectedCount = getSelectedCount(step.category);
        
        // Filter products for this specific step/category
        const stepProducts = products.filter(p => p.category === step.category);

        return (
          <div key={step.id} className={`item-wrapper ${isOpen ? 'open' : 'closed'}`}>
            <div className="accordion-title-row">
              <span>{(s.step_prefix_text || 'STEP {id} OF 4').replace('{id}', step.id)}</span>
            </div>
            <div className={`accordion-step ${isOpen ? 'open' : 'closed'}`}>
              <div 
                className="accordion-header"
                onClick={() => setActiveStep(isOpen ? null : step.id)}
              >
                <div className="accordion-header-left">
                  <step.Icon className="step-icon" />
                  <h2>{step.title}</h2>
                </div>
                <div className="accordion-header-right">
                  {selectedCount > 0 && <span className="selected-text">{selectedCount} selected</span>}
                  <AccordionArrow isOpen={isOpen} />
                </div>
              </div>

              <div className="accordion-body" style={{ display: isOpen ? 'block' : 'none' }}>
                <div className="product-grid">
                  {stepProducts.map(product => (
                    <StepCard 
                      key={product.id} 
                      product={product} 
                      cartState={cartState}
                      onQuantityChange={onQuantityChange}
                      assetUrls={assetUrls}
                      sectionSettings={sectionSettings}
                    />
                  ))}
                  {stepProducts.length === 0 && <p>{s.empty_category_text || 'No products available in this category.'}</p>}
                </div>
                
                {step.id < 4 && (
                  <button 
                    type="button"
                    className="btn btn-outline next-step-btn"
                    onClick={() => setActiveStep(step.id + 1)}
                  >
                    {s.next_button_prefix || 'Next: '}{steps[step.id]?.title}
                  </button>
                )}
              </div>
          </div>
        </div>
        );
      })}
    </div>
  );
};

export default AccordionBuilder;
