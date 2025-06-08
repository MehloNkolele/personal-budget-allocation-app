// src/utils/savingsCalculator.ts

export interface SavingsGoalInput {
    monthlyIncome: number;
    savingsGoal: number;
}

export interface ManualGoalInput {
    monthlyIncome: number;
    savingsGoal: number;
    manualMonthlySaving: number;
}

export interface TimelineInput {
    monthlyIncome: number;
    savingsGoal: number;
    timeframe: number; // in months
}

export interface SavingsGoalResult {
    recommendedMonthlySaving: number;
    timeToGoalInMonths: number;
    savingsPercentageOfIncome: number;
    advice: string;
}

export interface ManualGoalResult {
    timeToGoalInMonths: number;
    savingsPercentageOfIncome: number;
    isFeasible: boolean;
    advice: string;
}

export interface TimelineResult {
    requiredMonthlySaving: number;
    isFeasible: boolean;
    advice: string;
    alternativeSuggestion?: string;
}

const FIFTY_THIRTY_TWENTY_RULE = {
    needs: 0.5,
    wants: 0.3,
    savings: 0.2,
};

const MIN_REALISTIC_SAVINGS_PERCENTAGE = 0.05; // 5%

/**
 * Validates common inputs for the savings calculator.
 * @param monthlyIncome - User's monthly income.
 * @param savingsGoal - User's savings goal.
 * @returns Error message string or null if valid.
 */
const validateInputs = (monthlyIncome: number, savingsGoal: number): string | null => {
    if (monthlyIncome <= 0) {
        return "Monthly income must be a positive number.";
    }
    if (savingsGoal <= 0) {
        return "Savings goal must be a positive number.";
    }
    if (savingsGoal < monthlyIncome * MIN_REALISTIC_SAVINGS_PERCENTAGE) {
        return "Savings goal seems too low to plan for. Try setting a higher goal.";
    }
    return null;
};

/**
 * Calculates the recommended savings plan based on a goal.
 * @param input - SavingsGoalInput object.
 * @returns SavingsGoalResult object.
 */
export const calculateSavingsGoal = (input: SavingsGoalInput): SavingsGoalResult | { error: string } => {
    const validationError = validateInputs(input.monthlyIncome, input.savingsGoal);
    if (validationError) {
        return { error: validationError };
    }

    const { monthlyIncome, savingsGoal } = input;

    // Recommendation based on the 50/30/20 rule
    const recommendedMonthlySaving = monthlyIncome * FIFTY_THIRTY_TWENTY_RULE.savings;
    const timeToGoalInMonths = Math.ceil(savingsGoal / recommendedMonthlySaving);
    const savingsPercentageOfIncome = FIFTY_THIRTY_TWENTY_RULE.savings * 100;

    let advice = `Based on the 50/30/20 rule, we recommend saving 20% of your income.`;
    if (timeToGoalInMonths > 60) {
        advice += ` At this rate, your goal seems far away. Consider increasing your savings contribution if possible.`
    } else {
        advice += ` You're on a great track to reach your goal in a reasonable time!`
    }

    return {
        recommendedMonthlySaving,
        timeToGoalInMonths,
        savingsPercentageOfIncome,
        advice,
    };
};

/**
 * Calculates the savings plan based on a user-defined monthly saving amount.
 * @param input - ManualGoalInput object.
 * @returns ManualGoalResult object.
 */
export const calculateManualGoal = (input: ManualGoalInput): ManualGoalResult | { error: string } => {
    const validationError = validateInputs(input.monthlyIncome, input.savingsGoal);
    if (validationError) {
        return { error: validationError };
    }

    if (input.manualMonthlySaving <= 0) {
        return { error: "Your monthly saving amount must be a positive number." };
    }

    const { monthlyIncome, savingsGoal, manualMonthlySaving } = input;

    const isFeasible = manualMonthlySaving < monthlyIncome;
    const timeToGoalInMonths = Math.ceil(savingsGoal / manualMonthlySaving);
    const savingsPercentageOfIncome = (manualMonthlySaving / monthlyIncome) * 100;

    let advice = "";
    if (!isFeasible) {
        advice = `Saving R ${manualMonthlySaving.toFixed(2)} per month is not feasible with your current income of R ${monthlyIncome.toFixed(2)}.`;
    } else if (savingsPercentageOfIncome > 75) {
        advice = `An aggressive goal! Saving ${savingsPercentageOfIncome.toFixed(1)}% of your income is impressive, but ensure you're not stretching yourself too thin.`;
    } else if (timeToGoalInMonths > 120) {
        advice = `You're on the right track, but at this rate, your goal will take over 10 years to reach. Consider increasing your monthly contribution if possible.`;
    } else {
        advice = `This is a solid plan. At a saving rate of ${savingsPercentageOfIncome.toFixed(1)}%, you're making steady progress toward your goal!`;
    }

    return {
        timeToGoalInMonths,
        savingsPercentageOfIncome,
        isFeasible,
        advice,
    };
};

/**
 * Calculates the required monthly savings based on a user-defined timeline.
 * @param input - TimelineInput object.
 * @returns TimelineResult object.
 */
export const calculateTimelineGoal = (input: TimelineInput): TimelineResult | { error: string } => {
    const validationError = validateInputs(input.monthlyIncome, input.savingsGoal);
    if (validationError) {
        return { error: validationError };
    }
    
    if (input.timeframe <= 0) {
        return { error: "Timeframe must be a positive number of months." };
    }

    const { monthlyIncome, savingsGoal, timeframe } = input;
    const requiredMonthlySaving = Math.ceil(savingsGoal / timeframe);
    const percentageOfIncome = (requiredMonthlySaving / monthlyIncome) * 100;

    const isFeasible = requiredMonthlySaving < monthlyIncome;

    let advice = "";
    let alternativeSuggestion: string | undefined;

    if (!isFeasible) {
        advice = "This savings goal is not feasible with your current income and timeframe.";
        alternativeSuggestion = `To make this work, you'd need to save more than your monthly income. Try extending your timeframe.`;
    } else if (percentageOfIncome > 50) {
        advice = `Saving over 50% of your income is very ambitious! While possible, ensure you can cover your essential needs.`;
    } else if (percentageOfIncome > FIFTY_THIRTY_TWENTY_RULE.savings * 100) {
        advice = `This is an aggressive but achievable goal. You'll be saving more than the recommended 20%. Keep it up!`;
    } else {
        advice = `This goal is well within the recommended savings guidelines. You're on the right track!`;
    }

    return {
        requiredMonthlySaving,
        isFeasible,
        advice,
        alternativeSuggestion,
    };
}; 