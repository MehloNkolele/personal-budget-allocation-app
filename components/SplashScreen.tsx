import React, { useState, useEffect } from 'react';
import {
  ChevronRightIcon,
  ChevronLeftIcon,
  XMarkIcon,
  SparklesIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  ShieldCheckIcon,
  TagIcon,
  DocumentTextIcon,
  CalendarIcon
} from '../constants';
import InteractiveDemo from './InteractiveDemo';

interface SplashScreenProps {
  onComplete: () => void;
}

interface SlideData {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
  bgGradient: string;
  interactive?: React.ReactNode;
  points: number;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [totalPoints, setTotalPoints] = useState(0);
  const [completedSlides, setCompletedSlides] = useState<Set<number>>(new Set());
  const [showSkipConfirm, setShowSkipConfirm] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const handleDemoInteraction = () => {
    // Award bonus points for interacting with demos
    setTotalPoints(prev => prev + 5);
  };

  const slides: SlideData[] = [
    {
      id: 0,
      title: "Welcome to Your Personal Budget Planner! 🎉",
      subtitle: "Take Control of Your Financial Future",
      description: "Transform the way you manage money with our intelligent budget planning system. Let's explore what makes this app special!",
      icon: SparklesIcon,
      color: "text-sky-400",
      bgGradient: "from-sky-500/20 to-purple-500/20",
      points: 10
    },
    {
      id: 1,
      title: "Smart Budget Planning 📊",
      subtitle: "Plan Today, Prosper Tomorrow",
      description: "Create detailed monthly budgets, set spending limits for categories, and track your progress in real-time. Copy successful budgets to future months!",
      icon: CalendarIcon,
      color: "text-emerald-400",
      bgGradient: "from-emerald-500/20 to-teal-500/20",
      interactive: <InteractiveDemo type="budget" onInteraction={handleDemoInteraction} />,
      points: 15
    },
    {
      id: 2,
      title: "Organize with Categories 🏷️",
      subtitle: "Every Dollar Has a Purpose",
      description: "Create custom categories and subcategories for your expenses. From groceries to entertainment, organize your spending like a pro!",
      icon: TagIcon,
      color: "text-orange-400",
      bgGradient: "from-orange-500/20 to-red-500/20",
      interactive: <InteractiveDemo type="category" onInteraction={handleDemoInteraction} />,
      points: 15
    },
    {
      id: 3,
      title: "Track Every Transaction 💰",
      subtitle: "Know Where Your Money Goes",
      description: "Log income and expenses instantly. Add descriptions, tags, and categorize everything to maintain perfect financial records.",
      icon: CurrencyDollarIcon,
      color: "text-green-400",
      bgGradient: "from-green-500/20 to-emerald-500/20",
      interactive: <InteractiveDemo type="transaction" onInteraction={handleDemoInteraction} />,
      points: 20
    },
    {
      id: 4,
      title: "Beautiful Reports & Analytics 📈",
      subtitle: "Insights That Drive Decisions",
      description: "Visualize your spending patterns with interactive charts, pie graphs, and detailed breakdowns. Make informed financial decisions!",
      icon: ChartBarIcon,
      color: "text-purple-400",
      bgGradient: "from-purple-500/20 to-pink-500/20",
      interactive: <InteractiveDemo type="chart" onInteraction={handleDemoInteraction} />,
      points: 20
    },
    {
      id: 5,
      title: "Your Data, Your Privacy 🔒",
      subtitle: "Complete Data Isolation",
      description: "Every user gets their own secure data space. Your financial information is completely private and isolated from other users.",
      icon: ShieldCheckIcon,
      color: "text-blue-400",
      bgGradient: "from-blue-500/20 to-indigo-500/20",
      points: 15
    },
    {
      id: 6,
      title: "Ready to Start Your Journey? 🚀",
      subtitle: "Your Financial Freedom Awaits",
      description: "You've earned all the achievement badges! Sign up now and start building the financial future you deserve.",
      icon: DocumentTextIcon,
      color: "text-yellow-400",
      bgGradient: "from-yellow-500/20 to-orange-500/20",
      points: 25
    }
  ];

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      // Award points for completing slide
      if (!completedSlides.has(currentSlide)) {
        setTotalPoints(prev => prev + slides[currentSlide].points);
        setCompletedSlides(prev => new Set([...prev, currentSlide]));
      }
      setCurrentSlide(currentSlide + 1);
    } else {
      onComplete();
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const skipToEnd = () => {
    setShowSkipConfirm(true);
  };

  const confirmSkip = () => {
    onComplete();
  };

  const cancelSkip = () => {
    setShowSkipConfirm(false);
  };

  // Touch gesture handlers for mobile
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && currentSlide < slides.length - 1) {
      nextSlide();
    }
    if (isRightSwipe && currentSlide > 0) {
      prevSlide();
    }
  };

  const currentSlideData = slides[currentSlide];
  const progress = ((currentSlide + 1) / slides.length) * 100;

  return (
    <div
      className="min-h-screen bg-slate-900 relative overflow-hidden"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* Animated Background */}
      <div className={`absolute inset-0 bg-gradient-to-br ${currentSlideData.bgGradient} transition-all duration-1000`}>
        <div className="absolute inset-0 bg-slate-900/80" />
      </div>

      {/* Skip Confirmation Modal */}
      {showSkipConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-2xl p-6 max-w-sm w-full border border-slate-700">
            <h3 className="text-xl font-bold text-white mb-4">Skip Introduction?</h3>
            <p className="text-slate-300 mb-6">
              You'll miss out on earning achievement points and learning about all the amazing features!
            </p>
            <div className="flex gap-3">
              <button
                onClick={cancelSkip}
                className="flex-1 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg font-medium transition-colors"
              >
                Continue Tour
              </button>
              <button
                onClick={confirmSkip}
                className="flex-1 px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg font-medium transition-colors"
              >
                Skip
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="relative z-10 flex justify-between items-center p-4 sm:p-6">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <SparklesIcon className="w-6 h-6 text-yellow-400" />
            <span className="text-yellow-400 font-bold text-lg">{totalPoints} pts</span>
          </div>
        </div>
        <button
          onClick={skipToEnd}
          className="flex items-center gap-2 px-4 py-2 text-slate-400 hover:text-white transition-colors"
        >
          <span className="text-sm">Skip</span>
          <XMarkIcon className="w-4 h-4" />
        </button>
      </div>

      {/* Progress Bar */}
      <div className="relative z-10 px-4 sm:px-6 mb-8">
        <div className="w-full bg-slate-700 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-sky-500 to-purple-500 h-2 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between mt-2">
          <span className="text-xs text-slate-400">Step {currentSlide + 1} of {slides.length}</span>
          <span className="text-xs text-slate-400">{Math.round(progress)}% Complete</span>
        </div>
      </div>

      {/* Swipe Indicator */}
      {currentSlide === 0 && (
        <div className="absolute bottom-32 left-1/2 transform -translate-x-1/2 z-10 animate-bounce">
          <div className="flex items-center gap-2 text-slate-400 text-sm">
            <span>Swipe to navigate</span>
            <ChevronRightIcon className="w-4 h-4" />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 sm:px-6 pb-20">
        <div className="max-w-2xl w-full text-center">
          {/* Icon */}
          <div className="mb-8">
            <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br ${currentSlideData.bgGradient} border-2 border-white/20`}>
              <currentSlideData.icon className={`w-10 h-10 ${currentSlideData.color}`} />
            </div>
          </div>

          {/* Content */}
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4 leading-tight">
            {currentSlideData.title}
          </h1>
          <h2 className={`text-xl sm:text-2xl font-semibold ${currentSlideData.color} mb-6`}>
            {currentSlideData.subtitle}
          </h2>
          <p className="text-lg text-slate-300 leading-relaxed mb-8">
            {currentSlideData.description}
          </p>

          {/* Interactive Demo Area */}
          {currentSlideData.interactive && (
            <div className="mb-8">
              {currentSlideData.interactive}
            </div>
          )}

          {/* Achievement Badge */}
          {completedSlides.has(currentSlide) && (
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-500/20 border border-yellow-500/30 rounded-full mb-8">
              <SparklesIcon className="w-4 h-4 text-yellow-400" />
              <span className="text-yellow-400 font-medium">+{currentSlideData.points} points earned!</span>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="relative z-10 flex justify-between items-center p-4 sm:p-6">
        <button
          onClick={prevSlide}
          disabled={currentSlide === 0}
          className={`flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all ${
            currentSlide === 0
              ? 'text-slate-500 cursor-not-allowed'
              : 'text-white bg-slate-700 hover:bg-slate-600'
          }`}
        >
          <ChevronLeftIcon className="w-4 h-4" />
          Previous
        </button>

        <div className="flex gap-2">
          {slides.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentSlide
                  ? 'bg-sky-400 w-8'
                  : index < currentSlide
                  ? 'bg-green-400'
                  : 'bg-slate-600'
              }`}
            />
          ))}
        </div>

        <button
          onClick={nextSlide}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-sky-500 to-purple-500 hover:from-sky-600 hover:to-purple-600 text-white rounded-full font-medium transition-all transform hover:scale-105"
        >
          {currentSlide === slides.length - 1 ? 'Get Started' : 'Next'}
          <ChevronRightIcon className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default SplashScreen;
