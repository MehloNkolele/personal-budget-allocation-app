import React, { useState, useEffect, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRightIcon, CalendarIcon, ChartPieIcon } from '../constants';

type Step = 'initial' | 'goal' | 'timeline' | 'result';
type GoalMode = 'auto' | 'manual';

// --- Type Definitions ---
export interface SavingsGoalInput {
  monthlyIncome: number;
  savingsGoal: number;
}

export interface TimelineGoalInput {
  monthlyIncome: number;
  savingsGoal: number;
  timeframe: number; // in months
}

export interface ManualGoalInput {
  monthlyIncome: number;
  savingsGoal: number;
  manualMonthlySaving: number;
}

export interface SavingsGoalResult {
  recommendedMonthlySaving: number;
  timeToGoalInMonths: number;
  savingsPercentageOfIncome: number;
}

export interface TimelineResult {
  requiredMonthlySaving: number;
  isFeasible: boolean;
}

export interface ManualGoalResult {
  manualMonthlySaving: number;
  timeToGoalInMonths: number;
  savingsPercentageOfIncome: number;
}

export interface CalculationError {
  error: string;
}

// --- Calculation Logic ---
const calculateSavingsGoal = (input: SavingsGoalInput): SavingsGoalResult | CalculationError => {
  const { monthlyIncome, savingsGoal } = input;
  if (monthlyIncome <= 0 || savingsGoal <= 0) {
    return { error: "Income and savings goal must be positive numbers." };
  }
  const recommendedPercentage = 0.20; // 20% savings rate
  const recommendedMonthlySaving = monthlyIncome * recommendedPercentage;
  const timeToGoalInMonths = Math.ceil(savingsGoal / recommendedMonthlySaving);

  return {
    recommendedMonthlySaving,
    timeToGoalInMonths,
    savingsPercentageOfIncome: recommendedPercentage * 100
  };
};

const calculateTimelineGoal = (input: TimelineGoalInput): TimelineResult | CalculationError => {
  const { monthlyIncome, savingsGoal, timeframe } = input;
  if (monthlyIncome <= 0 || savingsGoal <= 0 || timeframe <= 0) {
    return { error: "Income, goal, and timeframe must be positive." };
  }
  const requiredMonthlySaving = savingsGoal / timeframe;
  const isFeasible = requiredMonthlySaving <= monthlyIncome;

  return { requiredMonthlySaving, isFeasible };
};

const calculateManualGoal = (input: ManualGoalInput): ManualGoalResult | CalculationError => {
  const { monthlyIncome, savingsGoal, manualMonthlySaving } = input;
  if (monthlyIncome <= 0 || savingsGoal <= 0 || manualMonthlySaving <= 0) {
    return { error: "All input values must be positive." };
  }
  if (manualMonthlySaving > monthlyIncome) {
    return { error: "Monthly saving cannot exceed monthly income." };
  }
  const timeToGoalInMonths = Math.ceil(savingsGoal / manualMonthlySaving);
  const savingsPercentageOfIncome = (manualMonthlySaving / monthlyIncome) * 100;

  return {
    manualMonthlySaving,
    timeToGoalInMonths,
    savingsPercentageOfIncome
  };
};

// --- Helper Components (defined outside the main component to prevent re-rendering issues) ---

const pageVariants = {
    initial: { opacity: 0, x: 50 },
    in: { opacity: 1, x: 0 },
    out: { opacity: 0, x: -50 }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } }
};

const MotionCard = ({ children, onClick, className = '' }: { children: React.ReactNode, onClick?: () => void, className?: string }) => (
    <motion.div
        onClick={onClick}
        className={`bg-slate-800/50 p-6 rounded-2xl border border-slate-700 hover:border-sky-500 transition-colors duration-300 cursor-pointer ${className}`}
        whileHover={{ y: -5, boxShadow: "0px 10px 20px rgba(0, 191, 255, 0.1)" }}
    >
        {children}
    </motion.div>
);

const InputField = ({ label, value, onChange, placeholder, type = "number" }: { label: string, value: string, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, placeholder: string, type?: string }) => (
    <motion.div variants={itemVariants}>
        <label className="block text-sm font-medium text-slate-300 mb-1">{label}</label>
        <input
            type={type}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className="w-full p-3 bg-slate-700/50 border border-slate-600 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-all"
        />
    </motion.div>
);

const ResultItem = ({ label, value, className = '' }: { label: string, value: string | number, className?: string }) => (
    <div className="flex justify-between items-center py-2">
        <p className="text-slate-400">{label}</p>
        <p className={`text-lg font-bold text-white ${className}`}>{value}</p>
    </div>
);

const ResultRenderer: React.FC<{ result: SavingsGoalResult | TimelineResult | ManualGoalResult }> = ({ result }) => {
    return (
        <>
            {('recommendedMonthlySaving' in result) && (
                <>
                    <ResultItem label="Recommended Monthly Saving" value={`R ${result.recommendedMonthlySaving.toFixed(2)}`} />
                    <ResultItem label="Time to Goal" value={`${result.timeToGoalInMonths} Months`} />
                    <ResultItem label="Savings % of Income" value={`${result.savingsPercentageOfIncome.toFixed(1)}%`} />
                </>
            )}
            {('manualMonthlySaving' in result) && 'timeToGoalInMonths' in result && (
                <>
                    <ResultItem label="Time to Goal" value={`${result.timeToGoalInMonths} Months`} />
                    <ResultItem label="Savings % of Income" value={`${result.savingsPercentageOfIncome.toFixed(1)}%`} />
                </>
            )}
            {('requiredMonthlySaving' in result) && (
                <>
                    <ResultItem label="Required Monthly Saving" value={`R ${result.requiredMonthlySaving.toFixed(2)}`} />
                    <ResultItem label="Feasibility" value={result.isFeasible ? 'Achievable' : 'Not Feasible'} className={result.isFeasible ? 'text-green-400' : 'text-red-400'} />
                </>
            )}
        </>
    );
};

// --- Main Calculator Component ---

const SavingsCalculator: React.FC = () => {
    const [step, setStep] = useState<Step>('initial');
    const [goalMode, setGoalMode] = useState<GoalMode>('auto');
    
    // State for inputs
    const [monthlyIncome, setMonthlyIncome] = useState('');
    const [savingsGoal, setSavingsGoal] = useState('');
    const [manualMonthlySaving, setManualMonthlySaving] = useState('');
    const [timeframe, setTimeframe] = useState('');
    const [timeframeUnit, setTimeframeUnit] = useState<'months' | 'years'>('months');

    // State for results
    const [result, setResult] = useState<SavingsGoalResult | TimelineResult | ManualGoalResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    const timeInMonths = useMemo(() => {
        const frame = parseInt(timeframe, 10);
        if (!frame || isNaN(frame) || frame <= 0) return 0;
        return timeframeUnit === 'years' ? frame * 12 : frame;
    }, [timeframe, timeframeUnit]);

    const handleGoBackToEdit = () => {
        if (!result) return;

        // Determine which form was used based on properties in the result object
        if ('recommendedMonthlySaving' in result || ('manualMonthlySaving' in result && 'timeToGoalInMonths' in result)) {
            setStep('goal');
        } else if ('requiredMonthlySaving' in result) {
            setStep('timeline');
        }
        
        setResult(null);
        setError(null);
    };

    const handleCalculate = () => {
        const income = parseFloat(monthlyIncome);
        const goal = parseFloat(savingsGoal);
        
        if (isNaN(income) || isNaN(goal) || income <= 0 || goal <= 0) {
            setError("Please enter valid income and goal amounts.");
            return;
        }

        setError(null);
        let res;

        if (step === 'goal') {
            if (goalMode === 'auto') {
                res = calculateSavingsGoal({ monthlyIncome: income, savingsGoal: goal });
            } else {
                const manualSaving = parseFloat(manualMonthlySaving);
                if (isNaN(manualSaving) || manualSaving <= 0) {
                    setError("Please enter a valid monthly saving amount.");
                    return;
                }
                res = calculateManualGoal({ monthlyIncome: income, savingsGoal: goal, manualMonthlySaving: manualSaving });
            }
        } else if (step === 'timeline') {
            if (timeInMonths <= 0) {
                setError("Please enter a valid timeframe.");
                return;
            }
            res = calculateTimelineGoal({ monthlyIncome: income, savingsGoal: goal, timeframe: timeInMonths });
        }

        if (res && 'error' in res) {
            setError(res.error);
            setResult(null);
        } else {
            setResult(res || null);
            setStep('result');
        }
    };

    const resetCalculator = () => {
        setStep('initial');
        setMonthlyIncome('');
        setSavingsGoal('');
        setManualMonthlySaving('');
        setTimeframe('');
        setTimeframeUnit('months');
        setResult(null);
        setError(null);
    };

    return (
        <div className="w-full flex-grow bg-slate-900 text-white flex flex-col items-center justify-center font-sans p-4">
            <div className="w-full max-w-md">
                <AnimatePresence mode="wait">
                    {step === 'initial' && (
                        <motion.div key="initial" initial="initial" animate="in" exit="out" variants={pageVariants} transition={{ duration: 0.3 }}>
                            <h1 className="text-4xl font-bold text-center mb-2 text-white">Savings Calculator</h1>
                            <p className="text-center text-slate-400 mb-8">What is your primary financial goal?</p>
                            <div className="space-y-4">
                                <MotionCard onClick={() => setStep('goal')}>
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <h2 className="text-xl font-bold text-sky-400">Reach a Savings Goal</h2>
                                            <p className="text-slate-400 text-sm mt-1">Calculate how long it will take to save.</p>
                                        </div>
                                        <ChartPieIcon className="w-8 h-8 text-slate-500" />
                                    </div>
                                </MotionCard>
                                <MotionCard onClick={() => setStep('timeline')}>
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <h2 className="text-xl font-bold text-sky-400">Save on a Timeline</h2>
                                            <p className="text-slate-400 text-sm mt-1">Calculate how much to save each month.</p>
                                        </div>
                                        <CalendarIcon className="w-8 h-8 text-slate-500" />
                                    </div>
                                </MotionCard>
                            </div>
                        </motion.div>
                    )}

                    {(step === 'goal' || step === 'timeline') && (
                        <motion.div key="form" initial="initial" animate="in" exit="out" variants={pageVariants} transition={{ duration: 0.3 }}>
                            <button onClick={() => setStep('initial')} className="text-slate-400 hover:text-white mb-4">&larr; Back</button>
                            <h1 className="text-3xl font-bold mb-6">{step === 'goal' ? 'Goal Calculator' : 'Timeline Calculator'}</h1>
                            <div className="space-y-4">
                                <InputField label="Monthly Income (R)" value={monthlyIncome} onChange={(e) => setMonthlyIncome(e.target.value)} placeholder="e.g., 25000" />
                                <InputField label="Savings Goal (R)" value={savingsGoal} onChange={(e) => setSavingsGoal(e.target.value)} placeholder="e.g., 100000" />
                                
                                {step === 'goal' && (
                                    <>
                                        <motion.div variants={itemVariants} className="flex bg-slate-800/70 rounded-full p-1">
                                            <button onClick={() => setGoalMode('auto')} className={`px-4 py-2 w-1/2 rounded-full text-sm font-semibold transition-colors ${goalMode === 'auto' ? 'bg-sky-600' : 'hover:bg-slate-700'}`}>Auto-calculate</button>
                                            <button onClick={() => setGoalMode('manual')} className={`px-4 py-2 w-1/2 rounded-full text-sm font-semibold transition-colors ${goalMode === 'manual' ? 'bg-sky-600' : 'hover:bg-slate-700'}`}>Manual Input</button>
                                        </motion.div>
                                        <AnimatePresence>
                                        {goalMode === 'manual' && (
                                            <motion.div initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}}>
                                                <InputField label="Monthly Saving Amount (R)" value={manualMonthlySaving} onChange={(e) => setManualMonthlySaving(e.target.value)} placeholder="e.g., 4000" />
                                            </motion.div>
                                        )}
                                        </AnimatePresence>
                                    </>
                                )}

                                {step === 'timeline' && (
                                     <motion.div variants={itemVariants} className="grid grid-cols-3 gap-2">
                                        <div className="col-span-2">
                                          <InputField label="Desired Timeframe" value={timeframe} onChange={(e) => setTimeframe(e.target.value)} placeholder="e.g., 12" />
                                        </div>
                                        <div className="self-end">
                                            <select value={timeframeUnit} onChange={(e) => setTimeframeUnit(e.target.value as 'months' | 'years')} className="w-full p-3 bg-slate-700/50 border border-slate-600 rounded-lg h-full">
                                                <option>Months</option>
                                                <option>Years</option>
                                            </select>
                                        </div>
                                    </motion.div>
                                )}
                                
                                {error && <p className="text-red-400 text-sm animate-pulse">{error}</p>}

                                <motion.button variants={itemVariants} onClick={handleCalculate} className="w-full bg-sky-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-sky-700 transition-colors flex items-center justify-center gap-2">
                                    Calculate <ArrowRightIcon className="w-5 h-5"/>
                                </motion.button>
                            </div>
                        </motion.div>
                    )}

                    {step === 'result' && result && (
                        <motion.div key="result" initial="initial" animate="in" exit="out" variants={pageVariants} transition={{ duration: 0.3 }} className="w-full">
                            <h1 className="text-3xl font-bold text-center mb-4">Your Savings Plan</h1>
                            <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700 space-y-4">
                                <ResultRenderer result={result} />
                            </div>
                            <div className="w-full mt-6 flex flex-col sm:flex-row gap-4">
                                <motion.button 
                                    onClick={handleGoBackToEdit} 
                                    className="w-full bg-sky-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-sky-700 transition-colors flex-1"
                                    whileHover={{ y: -2 }}
                                >
                                    Make Changes
                                </motion.button>
                                <motion.button 
                                    onClick={resetCalculator} 
                                    className="w-full bg-slate-700 text-white font-semibold py-3 px-4 rounded-lg hover:bg-slate-600 transition-colors sm:w-auto"
                                    whileHover={{ y: -2 }}
                                >
                                    Start Over
                                </motion.button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default SavingsCalculator;
