# Project Rules & Guidelines

These rules dictate how development must be approached in this project. They must be strictly followed for every task.

## 1. Tech Stack & Styling
- **Framework:** Use **React** exclusively. Do not use any other framework or library for the core architecture.
- **Styling:** Use simple **vanilla CSS**. Do NOT use Tailwind CSS, Bootstrap, or any other CSS framework/library.

## 2. Planning & Workflow
- **No Rash Actions:** Do not act rashly or irrationally. For *everything*, you must first create an implementation plan and wait for the user's explicit approval before proceeding with the code.
- **Figma & Requirements:** The UI will be built using Figma frames provided by the user. The functional requirements (including options and bonuses) will be acquired from the requirement document/report.
- **Ask Before Building:** Do not reinvent the wheel. If there are existing files, components (e.g., a card), or functionalities that can help achieve the target quickly, ask the user about them before writing custom solutions.

## 3. Code Architecture
- **Strictly Necessary Code:** Do not write additional or unnecessary code. Only write the code that is explicitly needed to fulfill the requirement.
- **Single-Task Functions:** Functions should be single-task (single responsibility). This ensures they are easy to understand, test, and debug. 

## 4. Commenting Standards
- **Heavy Commenting:** Make sure to comment heavily on everything you do.
- **Function Documentation:** Every single function MUST be commented in the following format, strictly in this order:
  1. What is the goal of the function?
  2. How is it going to achieve that?
  3. What are the inputs and outputs of that function?

### Function Comment Example:
```javascript
/**
 * Goal: Explain what the function achieves.
 * Method: Explain how it achieves the goal.
 * Inputs/Outputs: Explain what arguments it takes and what it returns.
 */
const exampleFunction = (input) => { ... }
```
