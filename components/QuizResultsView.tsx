
import React from 'react';
import type { QuizResult } from '../types';
import ProgressCircle from './ProgressCircle';

interface QuizResultsViewProps {
    result: QuizResult;
    onReturnToDashboard: () => void;
    onViewProgress: () => void;
}

const formatTime = (seconds: number): string => {
    if (isNaN(seconds) || seconds < 0) return "0s";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    if (minutes > 0) {
        return `${minutes}m ${remainingSeconds}s`;
    }
    return `${remainingSeconds}s`;
};

const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500";
    if (score >= 50) return "text-yellow-500";
    return "text-red-500";
};

const getSpeedLabel = (avgTime: number) => {
    if (avgTime <= 10) return { label: "Very Fast", color: "text-green-500" };
    if (avgTime <= 20) return { label: "Fast", color: "text-sky-500" };
    if (avgTime <= 30) return { label: "Moderate", color: "text-yellow-500" };
    return { label: "Slow", color: "text-orange-500" };
}

const ResultCard: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200 flex flex-col items-center justify-center text-center">
        {children}
    </div>
);

const QuizResultsView: React.FC<QuizResultsViewProps> = ({ result, onReturnToDashboard, onViewProgress }) => {
    const { score, correctCount, totalQuestions, avgTimePerQuestion, totalTime, userAnswers } = result;
    const incorrectCount = totalQuestions - correctCount;
    const speed = getSpeedLabel(avgTimePerQuestion);
    
    const incorrectAnswers = userAnswers.filter(a => !a.isCorrect);

    return (
        <div className="w-full max-w-4xl bg-white p-8 sm:p-12 rounded-2xl shadow-xl text-center text-gray-800 border border-gray-200 my-8">
            <h1 className="text-4xl font-bold mb-4">Quiz Results</h1>
            <p className="text-gray-600 mb-10">
                <span className="text-purple-600 font-semibold">🔮 Every expert was once a beginner.</span> Keep studying!
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                {/* Score Card */}
                <ResultCard>
                    <div className="relative h-40 w-40 mb-4">
                         <svg className="absolute inset-0 w-full h-full" viewBox="0 0 120 120">
                            <circle className="text-gray-200" strokeWidth="8" stroke="currentColor" fill="transparent" r="52" cx="60" cy="60" />
                            <circle 
                                className={getScoreColor(score)}
                                strokeWidth="8" 
                                strokeDasharray={52 * 2 * Math.PI}
                                strokeDashoffset={(52 * 2 * Math.PI) * (1 - score / 100)}
                                strokeLinecap="round" 
                                stroke="currentColor" 
                                fill="transparent" 
                                r="52" 
                                cx="60" 
                                cy="60"
                                style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%', transition: 'stroke-dashoffset 0.8s ease-out' }}
                             />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-4xl font-bold">{score}%</span>
                            <span className="text-sm text-gray-500">SCORE</span>
                        </div>
                    </div>
                    <p className={`font-bold text-lg ${getScoreColor(score)}`}>{score >= 50 ? 'Good Job!' : 'Keep Practicing'}</p>
                    <p className="text-sm text-gray-500">{correctCount} out of {totalQuestions} correct</p>
                </ResultCard>

                {/* Speed Card */}
                <ResultCard>
                    <div className="text-6xl font-bold mb-4">
                        {avgTimePerQuestion}<span className="text-2xl text-gray-500">s</span>
                    </div>
                    <p className="text-sm text-gray-500 mb-2">AVG/QUESTION</p>
                    <p className={`font-bold text-xl ${speed.color}`}>{speed.label}</p>
                    <p className="text-sm text-gray-500 mt-auto pt-4">Total: {formatTime(totalTime)}</p>
                </ResultCard>
                
                {/* Answer Breakdown Card */}
                <ResultCard>
                     <div className="flex w-full justify-around items-center mb-4 flex-grow">
                        <div className="flex flex-col items-center">
                             <span className="text-5xl font-bold text-green-500">{correctCount}</span>
                             <span className="text-xs text-gray-500 font-bold uppercase mt-2">Correct</span>
                        </div>
                        <div className="w-px h-16 bg-gray-300"></div>
                        <div className="flex flex-col items-center">
                             <span className="text-5xl font-bold text-red-500">{incorrectCount}</span>
                             <span className="text-xs text-gray-500 font-bold uppercase mt-2">Wrong</span>
                        </div>
                     </div>
                     <p className="text-sm text-gray-500 mb-2 uppercase tracking-wide">Answer Breakdown</p>
                    <p className="text-sm text-gray-500 mt-auto pt-4">{totalQuestions} total questions</p>
                </ResultCard>
            </div>
            
            {/* Incorrect Answers Review Section */}
            {incorrectAnswers.length > 0 && (
                <div className="mb-10 text-left">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                        Review Incorrect Answers
                        <span className="bg-red-100 text-red-600 text-sm px-2 py-1 rounded-full">{incorrectAnswers.length}</span>
                    </h2>
                    <div className="space-y-6">
                        {incorrectAnswers.map((ans, idx) => (
                            <div key={idx} className="bg-white border-l-4 border-red-500 shadow-sm rounded-r-lg p-6 border border-gray-200">
                                <h3 className="text-lg font-semibold text-gray-900 mb-3">{ans.questionText}</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                                    <div className="bg-red-50 p-3 rounded-lg border border-red-100">
                                        <p className="text-xs text-red-500 font-bold uppercase mb-1">Your Answer</p>
                                        <p className="text-red-700 font-medium">{ans.selectedAnswer}</p>
                                    </div>
                                    <div className="bg-green-50 p-3 rounded-lg border border-green-100">
                                        <p className="text-xs text-green-500 font-bold uppercase mb-1">Correct Answer</p>
                                        <p className="text-green-700 font-medium">{ans.correctAnswer}</p>
                                    </div>
                                </div>
                                {ans.explanation && (
                                    <div className="text-sm text-gray-600 mt-2 bg-gray-50 p-3 rounded-lg">
                                        <span className="font-semibold text-gray-700 block mb-1">Explanation:</span>
                                        {ans.explanation}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <button
                onClick={onViewProgress}
                className="w-full max-w-sm mx-auto py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-lg hover:opacity-90 transition-opacity duration-300 text-lg shadow-lg"
            >
                → View Your Complete Domain Progress
            </button>
            <p className="text-sm text-gray-600 mt-3">Track your performance, identify weak areas, and monitor improvement over time.</p>
             <button
                onClick={onReturnToDashboard}
                className="mt-8 text-gray-500 hover:text-gray-800 transition-colors"
            >
                Back to Dashboard
            </button>
        </div>
    );
};

export default QuizResultsView;
