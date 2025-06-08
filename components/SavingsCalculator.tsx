import React, { useState, useEffect, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
    calculateSavingsGoal,
    calculateTimelineGoal,
    calculateManualGoal,
    SavingsGoalResult,
    TimelineResult,
    ManualGoalResult,
} from '../utils/savingsCalculator';
import { ArrowRightIcon, CalculatorIcon, CalendarIcon, ChartPieIcon, LightBulbIcon, SparklesIcon, XMarkIcon } from '../constants';

type Step = 'initial' | 'goal' | 'timeline' | 'result';
type GoalMode = 'auto' | 'manual';

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

    const MotionCard = ({ children, onClick, className = '' }: { children: React.ReactNode, onClick?: () => void, className?: string }) => (
        <motion.div
            onClick={onClick}
            className={`bg-slate-800/50 p-6 rounded-2xl border border-slate-700 hover:border-sky-500 transition-colors duration-300 cursor-pointer ${className}`}
            whileHover={{ y: -5, boxShadow: "0px 10px 20px rgba(0, 191, 255, 0.1)" }}
        >
            {children}
        </motion.div>
    );

    const InputField = ({ label, value, onChange, placeholder, type = "number" }: any) => (
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
    
    const pageVariants = {
        initial: { opacity: 0, x: 50 },
        in: { opacity: 1, x: 0 },
        out: { opacity: 0, x: -50 }
    };
    
    const itemVariants = {
      hidden: { opacity: 0, y: 20 },
      visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } }
    };

    return (
        <div className="w-full min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center font-sans p-4">
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
                                <InputField label="Monthly Income (R)" value={monthlyIncome} onChange={(e: any) => setMonthlyIncome(e.target.value)} placeholder="e.g., 25000" />
                                <InputField label="Savings Goal (R)" value={savingsGoal} onChange={(e: any) => setSavingsGoal(e.target.value)} placeholder="e.g., 100000" />
                                
                                {step === 'goal' && (
                                    <>
                                        <motion.div variants={itemVariants} className="flex bg-slate-800/70 rounded-full p-1">
                                            <button onClick={() => setGoalMode('auto')} className={`px-4 py-2 w-1/2 rounded-full text-sm font-semibold transition-colors ${goalMode === 'auto' ? 'bg-sky-600' : 'hover:bg-slate-700'}`}>Auto-calculate</button>
                                            <button onClick={() => setGoalMode('manual')} className={`px-4 py-2 w-1/2 rounded-full text-sm font-semibold transition-colors ${goalMode === 'manual' ? 'bg-sky-600' : 'hover:bg-slate-700'}`}>Manual Input</button>
                                        </motion.div>
                                        <AnimatePresence>
                                        {goalMode === 'manual' && (
                                            <motion.div initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}}>
                                                <InputField label="Monthly Saving Amount (R)" value={manualMonthlySaving} onChange={(e: any) => setManualMonthlySaving(e.target.value)} placeholder="e.g., 4000" />
                                            </motion.div>
                                        )}
                                        </AnimatePresence>
                                    </>
                                )}

                                {step === 'timeline' && (
                                     <motion.div variants={itemVariants} className="grid grid-cols-3 gap-2">
                                        <div className="col-span-2">
                                          <InputField label="Desired Timeframe" value={timeframe} onChange={(e: any) => setTimeframe(e.target.value)} placeholder="e.g., 12" />
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
                            <button onClick={resetCalculator} className="w-full mt-6 bg-slate-700 text-white font-bold py-3 px-4 rounded-lg hover:bg-slate-600 transition-colors">Start Over</button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

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
            <div className="pt-4 border-t border-slate-700">
                <h3 className="text-lg font-semibold text-sky-400 flex items-center gap-2 mb-2"><LightBulbIcon className="w-5 h-5"/> Advice</h3>
                <p className="text-slate-300 italic">{result.advice}</p>
                {('alternativeSuggestion' in result && result.alternativeSuggestion) && <p className="text-red-300 italic mt-2">{result.alternativeSuggestion}</p>}
            </div>
        </>
    );
};

const ResultItem = ({ label, value, className = '' }: {label: string, value: string | number, className?: string}) => (
    <div className="flex justify-between items-center py-2">
        <p className="text-slate-400">{label}</p>
        <p className={`text-lg font-bold text-white ${className}`}>{value}</p>
    </div>
);

export default SavingsCalculator;
