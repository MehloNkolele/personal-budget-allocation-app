# Personal Budget Allocation App - Plan

This document outlines the development plan for the Personal Budget Allocation App.

## [2024-07-25] - Intelligent Savings Calculator (User Request)

- [x] **Core Logic:** Create `src/utils/savingsCalculator.ts` for all calculation logic.
    - [x] Implement Savings Goal Calculator function.
    - [x] Implement Timeline-Based Calculator function.
    - [x] Add input validation for realistic values.
    - [x] Implement feasibility analysis for savings goals.
- [x] **UI Component:** Create `src/components/SavingsCalculator.tsx`.
    - [x] Design a clean, intuitive form with labeled inputs:
        - [x] Monthly Income
        - [x] Savings Goal Amount
        - [x] Desired Timeframe (Months/Years)
    - [x] Ensure real-time calculation updates.
    - [x] Implement mobile-first responsive design.
- [x] **Smart Features:**
    - [x] Display results with visual charts or progress bars.
    - [x] Show clear warning messages for unrealistic goals.
    - [x] Develop an advice system with personalized recommendations (e.g., 50/30/20 rule).
- [x] **Integration:**
    - [x] Add the `SavingsCalculator` component to the main app layout.
    - [x] Ensure seamless navigation and data flow.
- [x] **Documentation:**
    - [x] Update `README.md` with details about the new feature.
    
## [2024-07-25] - Manual Savings Input (User Request)
- [x] **Core Logic:** Update `src/utils/savingsCalculator.ts`.
    - [x] Add `calculateManualGoal` function for user-defined monthly savings.
    - [x] Include feasibility checks and tailored advice.
- [x] **UI Component:** Update `src/components/SavingsCalculator.tsx`.
    - [x] Add a toggle to switch between "Auto" (recommended) and "Manual" savings input.
    - [x] Create an input field for manual monthly savings amount.
    - [x] Update component state and effects to handle the new manual mode.
    - [x] Display results dynamically based on the manual calculation.

## [2024-07-25] - UI Refinement for Clarity (User Request)
- [x] **Component Refactor:** Reverted `src/components/SavingsCalculator.tsx` to a clearer structure.
    - [x] Restored the primary "Goal" vs. "Timeline" toggle for distinct planning modes.
    - [x] Re-implemented the nested "Auto" vs. "Manual" toggle, which appears only under the "Goal" mode.
    - [x] This structural change provides a more intuitive user flow, directly addressing user confusion. 