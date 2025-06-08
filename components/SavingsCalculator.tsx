import React, { useState, useEffect, useMemo } from 'react';
import {
    calculateSavingsGoal,
    calculateTimelineGoal,
    calculateManualGoal,
    SavingsGoalResult,
    TimelineResult,
    ManualGoalResult,
} from '../utils/savingsCalculator';
import ProgressBar from './ProgressBar';
import { SparklesIcon } from '../constants'; // Using a nice icon for effect

type CalculatorMode = 'goal' | 'timeline';
type GoalMode = 'auto' | 'manual';

const SavingsCalculator: React.FC = () => {
    const [mode, setMode] = useState<CalculatorMode>('goal');
    const [goalMode, setGoalMode] = useState<GoalMode>('auto');
    const [monthlyIncome, setMonthlyIncome] = useState<string>('');
    const [savingsGoal, setSavingsGoal] = useState<string>('');
    const [manualMonthlySaving, setManualMonthlySaving] = useState<string>('');
    const [timeframe, setTimeframe] = useState<string>('');
    const [timeframeUnit, setTimeframeUnit] = useState<'months' | 'years'>('months');

    const [goalResult, setGoalResult] = useState<SavingsGoalResult | null>(null);
    const [manualGoalResult, setManualGoalResult] = useState<ManualGoalResult | null>(null);
    const [timelineResult, setTimelineResult] = useState<TimelineResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    const timeInMonths = useMemo(() => {
        const frame = parseInt(timeframe, 10);
        if (!frame || frame <= 0) return 0;
        return timeframeUnit === 'years' ? frame * 12 : frame;
    }, [timeframe, timeframeUnit]);

    useEffect(() => {
        const income = parseFloat(monthlyIncome);
        const goal = parseFloat(savingsGoal);
        
        const clearResults = () => {
            setGoalResult(null);
            setManualGoalResult(null);
            setTimelineResult(null);
            setError(null);
        };

        if (!income || !goal) {
            clearResults();
            return;
        }

        setError(null);

        if (mode === 'goal') {
            setTimelineResult(null);
            if (goalMode === 'auto') {
                const result = calculateSavingsGoal({ monthlyIncome: income, savingsGoal: goal });
                if ('error' in result) { setError(result.error); setGoalResult(null); } else { setGoalResult(result); }
                setManualGoalResult(null);
            } else {
                const manualSaving = parseFloat(manualMonthlySaving);
                if (manualSaving > 0) {
                    const result = calculateManualGoal({ monthlyIncome: income, savingsGoal: goal, manualMonthlySaving: manualSaving });
                    if ('error' in result) { setError(result.error); setManualGoalResult(null); } else { setManualGoalResult(result); }
                } else {
                    setManualGoalResult(null);
                }
                setGoalResult(null);
            }
        } else { // timeline mode
            setGoalResult(null);
            setManualGoalResult(null);
            if (timeInMonths > 0) {
                const result = calculateTimelineGoal({ monthlyIncome: income, savingsGoal: goal, timeframe: timeInMonths });
                if ('error' in result) { setError(result.error); setTimelineResult(null); } else { setTimelineResult(result); }
            } else {
                setTimelineResult(null);
            }
        }
    }, [monthlyIncome, savingsGoal, manualMonthlySaving, timeInMonths, mode, goalMode]);

    const ResultCard: React.FC<{title: string, value: string, description: string}> = ({title, value, description}) => (
        <div className="bg-slate-800/50 backdrop-blur-sm p-4 rounded-lg border border-slate-700/50 flex-1 min-w-[200px] transform hover:scale-105 transition-transform duration-300">
            <p className="text-sm text-slate-400">{title}</p>
            <p className="text-2xl font-bold text-sky-400 my-1">{value}</p>
            <p className="text-xs text-slate-500">{description}</p>
        </div>
    );
    
    const renderGoalResult = () => {
        if (!goalResult) return null;
        return (
            <div className="space-y-4 animate-fade-in">
                <div className="flex flex-wrap gap-4">
                    <ResultCard title="Recommended Saving" value={`R ${goalResult.recommendedMonthlySaving.toFixed(2)}`} description="Based on the 50/30/20 savings rule."/>
                    <ResultCard title="Time to Goal" value={`${goalResult.timeToGoalInMonths} Months`} description="The total time to reach your savings goal."/>
                    <ResultCard title="Savings %" value={`${goalResult.savingsPercentageOfIncome.toFixed(1)}%`} description="Percentage of your income to save."/>
                </div>
                <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700/50">
                    <p className="text-sm font-medium text-white mb-2 flex items-center"><SparklesIcon className="w-5 h-5 mr-2 text-yellow-400"/>Personalized Advice</p>
                    <p className="text-sm text-slate-300 italic">{goalResult.advice}</p>
                </div>
            </div>
        );
    };

    const renderManualGoalResult = () => {
        if (!manualGoalResult) return null;
        const { isFeasible, timeToGoalInMonths, savingsPercentageOfIncome, advice } = manualGoalResult;
        return (
             <div className="space-y-4 animate-fade-in">
                <div className="flex flex-wrap gap-4">
                    <ResultCard title="Time to Goal" value={`${timeToGoalInMonths} Months`} description="Based on your manual monthly saving."/>
                    <ResultCard title="Savings %" value={`${savingsPercentageOfIncome.toFixed(1)}%`} description="Percentage of your income you're saving."/>
                </div>
                <div className={`p-4 rounded-lg border ${isFeasible ? 'bg-slate-800/50 border-slate-700/50' : 'bg-red-900/30 border-red-700/50'}`}>
                    <p className="text-sm font-medium text-white mb-2 flex items-center"><SparklesIcon className="w-5 h-5 mr-2 text-yellow-400"/>Personalized Advice</p>
                    <p className="text-sm text-slate-300 italic">{advice}</p>
                </div>
            </div>
        )
    }

    const renderTimelineResult = () => {
        if (!timelineResult) return null;
        const { isFeasible, requiredMonthlySaving, advice, alternativeSuggestion } = timelineResult;
        
        const feasibilityColor = isFeasible ? "text-green-400" : "text-red-400";
        const feasibilityText = isFeasible ? "This is achievable!" : "This is not feasible.";

        return (
            <div className="space-y-4 animate-fade-in">
                 <div className="flex flex-wrap gap-4">
                    <ResultCard title="Required Saving" value={`R ${requiredMonthlySaving.toFixed(2)}`} description="per month to reach your goal in time."/>
                    <div className="bg-slate-800/50 backdrop-blur-sm p-4 rounded-lg border border-slate-700/50 flex-1 min-w-[200px]">
                        <p className="text-sm text-slate-400">Feasibility</p>
                        <p className={`text-2xl font-bold ${feasibilityColor} my-1`}>{feasibilityText}</p>
                        <ProgressBar value={requiredMonthlySaving} max={parseFloat(monthlyIncome)} colorClass={isFeasible ? 'bg-green-500' : 'bg-red-500'} />
                    </div>
                </div>
                <div className={`p-4 rounded-lg border ${isFeasible ? 'bg-slate-800/50 border-slate-700/50' : 'bg-red-900/30 border-red-700/50'}`}>
                    <p className="text-sm font-medium text-white mb-2 flex items-center"><SparklesIcon className="w-5 h-5 mr-2 text-yellow-400"/>Personalized Advice</p>
                    <p className="text-sm text-slate-300 italic">{advice}</p>
                    {!isFeasible && alternativeSuggestion && <p className="text-sm text-red-300 mt-2">{alternativeSuggestion}</p>}
                </div>
            </div>
        );
    };
    
    return (
        <div className="w-full min-h-screen bg-slate-900 text-white flex flex-col lg:flex-row items-center justify-center font-sans p-4 gap-8">
             {/* Left Panel: Inputs */}
            <div className="w-full max-w-md lg:max-w-sm p-8 bg-slate-800/30 backdrop-blur-xl rounded-2xl border border-slate-700/50 shadow-2xl shadow-sky-900/20">
                <h2 className="text-3xl font-bold mb-2 text-center text-sky-400">Savings Calculator</h2>
                <p className="text-center text-slate-400 mb-6 text-sm">Plan your financial future.</p>
                
                <div className="flex bg-slate-800/70 rounded-full p-1 mb-6">
                    <button onClick={() => setMode('goal')} className={`px-6 py-2 w-1/2 rounded-full text-sm font-semibold transition-all duration-300 ${mode === 'goal' ? 'bg-sky-600 shadow-lg shadow-sky-600/30' : 'text-slate-300 hover:bg-slate-700/50'}`}>Goal</button>
                    <button onClick={() => setMode('timeline')} className={`px-6 py-2 w-1/2 rounded-full text-sm font-semibold transition-all duration-300 ${mode === 'timeline' ? 'bg-sky-600 shadow-lg shadow-sky-600/30' : 'text-slate-300 hover:bg-slate-700/50'}`}>Timeline</button>
                </div>

                <div className="space-y-4">
                    {mode === 'goal' && (
                        <div className="bg-slate-800/70 rounded-full p-1 mb-4 flex text-xs">
                           <button onClick={() => setGoalMode('auto')} className={`w-1/2 py-2 rounded-full ${goalMode === 'auto' ? 'bg-slate-600' : ''}`}>Auto</button>
                           <button onClick={() => setGoalMode('manual')} className={`w-1/2 py-2 rounded-full ${goalMode === 'manual' ? 'bg-slate-600' : ''}`}>Manual</button>
                        </div>
                    )}
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Monthly Income (R)</label>
                        <input type="number" value={monthlyIncome} onChange={(e) => setMonthlyIncome(e.target.value)} placeholder="e.g., 25000" className="w-full p-3 bg-slate-700/50 border border-slate-600 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none transition-all duration-300"/>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Savings Goal (R)</label>
                        <input type="number" value={savingsGoal} onChange={(e) => setSavingsGoal(e.target.value)} placeholder="e.g., 100000" className="w-full p-3 bg-slate-700/50 border border-slate-600 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none transition-all duration-300"/>
                    </div>
                    
                    {mode === 'goal' && goalMode === 'manual' && (
                         <div className="animate-fade-in">
                            <label className="block text-sm font-medium text-slate-300 mb-1">Monthly Saving Amount (R)</label>
                            <input type="number" value={manualMonthlySaving} onChange={(e) => setManualMonthlySaving(e.target.value)} placeholder="e.g., 4000" className="w-full p-3 bg-slate-700/50 border border-slate-600 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none transition-all duration-300"/>
                        </div>
                    )}

                    {mode === 'timeline' && (
                        <div className="animate-fade-in">
                            <label className="block text-sm font-medium text-slate-300 mb-1">Desired Timeframe</label>
                            <div className="grid grid-cols-3 gap-2">
                                <input type="number" value={timeframe} onChange={(e) => setTimeframe(e.target.value)} placeholder="e.g., 12" className="col-span-2 w-full p-3 bg-slate-700/50 border border-slate-600 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none transition-all duration-300"/>
                                <select value={timeframeUnit} onChange={(e) => setTimeframeUnit(e.target.value as 'months' | 'years')} className="w-full p-3 bg-slate-700/50 border border-slate-600 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none transition-all duration-300 appearance-none text-center">
                                    <option value="months">Months</option>
                                    <option value="years">Years</option>
                                </select>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Right Panel: Results */}
            <div className="w-full max-w-md lg:max-w-lg p-8 h-full min-h-[380px] flex flex-col justify-center">
                {error && (
                    <div className="p-4 bg-red-900/50 text-red-300 rounded-lg text-center animate-fade-in">
                        {error}
                    </div>
                )}
                {!error && !goalResult && !manualGoalResult && !timelineResult && (
                    <div className="text-center text-slate-500 animate-fade-in">
                        <p>Enter your details to see your savings plan.</p>
                    </div>
                )}
                {goalResult && renderGoalResult()}
                {manualGoalResult && renderManualGoalResult()}
                {timelineResult && renderTimelineResult()}
            </div>
        </div>
    );
};

export default SavingsCalculator;
