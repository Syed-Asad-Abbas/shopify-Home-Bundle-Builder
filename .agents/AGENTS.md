# Project Rules and Guidelines

These rules dictate how development must be approached in this project. They must be strictly followed for every task.

## 1. Tech Stack & Styling
- **Frontend Framework**: React ONLY. Do not use any other framework or library for the core architecture.
- **Language**: JavaScript ONLY. Do not use TypeScript.
- **Styling**: Vanilla CSS ONLY. Do not use Tailwind CSS, Bootstrap, or any other CSS framework/library.

## 2. Planning and Execution (Workflow)
- **No Rash Actions**: Do not act rashly or irrationally. For *everything*, an Implementation Plan must be created before making changes.
- **Detailed Planning**: Describe everything in detail in the plan.
- **Explicit Approval**: The plan must be reviewed, checked thoroughly, and explicitly agreed upon by the user before proceeding with any implementation code.
- **Figma & Requirements**: The UI will be built using Figma frames provided by the user. The functional requirements (including options and bonuses) will be acquired from the requirement document/report.
- **Ask Before Building**: Do not reinvent the wheel. If there are existing files, components (e.g., a card), or functionalities that can help achieve the target quickly, ask the user about them before writing custom solutions.

## 3. Coding Architecture & Standards
- **Strictly Necessary Code**: Do not write additional or unnecessary code. Only write the code that is explicitly needed to fulfill the requirement.
- **Single Responsibility**: Functions must be single-purpose (single responsibility). Do not combine too much functionality into a single function. Separate them so they can be easily understood, tested, and debugged.
- **Function Comments**: Each function MUST be commented heavily and in detail with the following three steps:
  1. **What it does / Goal**: A clear explanation of the function's purpose.
  2. **Why this approach / Method**: The reasoning behind the specific approach or how it achieves the goal.
  3. **Inputs & Outputs**: A clear description of the parameters accepted and the value(s) returned.

### Function Comment Example:
```javascript
/**
 * Goal: Explain what the function achieves.
 * Method: Explain how it achieves the goal.
 * Inputs/Outputs: Explain what arguments it takes and what it returns.
 */
const exampleFunction = (input) => { ... }
```

## 4. Git Commit Practices
- **Commit Frequency**: Do not commit too frequently. Commit only when a logical target is achieved (e.g., finishing a feature, accomplishing a Figma design assigned to you).
- **Commit Messages**: Each commit must include a brief but detailed message that explains:
  - What is being done in the commit.
  - Which files were changed.
  - What the specific changes were.
  - *Goal*: The commit history should clearly explain exactly what was done in each step.
