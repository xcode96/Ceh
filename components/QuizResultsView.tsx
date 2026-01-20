
import React, { useRef, useState } from 'react';
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import type { QuizResult } from '../types';
import Icon from './Icon';

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
    if (score >= 80) return "text-green-400 shadow-green-500/50";
    if (score >= 50) return "text-yellow-400 shadow-yellow-500/50";
    return "text-red-400 shadow-red-500/50";
};

const getSpeedLabel = (avgTime: number) => {
    if (avgTime <= 10) return { label: "Very Fast", color: "text-green-400" };
    if (avgTime <= 20) return { label: "Fast", color: "text-sky-400" };
    if (avgTime <= 30) return { label: "Moderate", color: "text-yellow-400" };
    return { label: "Slow", color: "text-orange-400" };
}

const ResultCard: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="glass-card p-6 sm:p-8 rounded-2xl border border-white/5 flex flex-col items-center justify-center text-center hover:bg-white/5 transition-colors duration-300">
        {children}
    </div>
);

const QuizResultsView: React.FC<QuizResultsViewProps> = ({ result, onReturnToDashboard, onViewProgress }) => {
    const { score, correctCount, totalQuestions, avgTimePerQuestion, totalTime, userAnswers } = result;
    const incorrectCount = totalQuestions - correctCount;
    const speed = getSpeedLabel(avgTimePerQuestion);

    const incorrectAnswers = userAnswers.filter(a => !a.isCorrect);

    const reportRef = useRef<HTMLDivElement>(null);
    const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

    const handleDownloadPdf = async () => {
        if (!reportRef.current) return;
        setIsGeneratingPdf(true);

        try {
            const element = reportRef.current;
            // Create a temporary dark background container for PDF capture to preserve style
            const originalStyle = element.style.cssText;
            element.style.background = '#0f172a';
            element.style.color = '#ffffff';

            const canvas = await html2canvas(element, {
                scale: 2,
                useCORS: true,
                logging: false,
                backgroundColor: '#0f172a' // Dark background for PDF
            });

            // Revert style
            element.style.cssText = originalStyle;

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const imgWidth = canvas.width;
            const imgHeight = canvas.height;
            const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);

            const imgHeightInPdf = imgHeight * ratio;

            // Fill page with dark background
            pdf.setFillColor(15, 23, 42); // #0f172a
            pdf.rect(0, 0, pdfWidth, pdfHeight, 'F');

            if (imgHeightInPdf > pdfHeight) {
                pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, (imgHeight * pdfWidth) / imgWidth);
            } else {
                pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, imgHeightInPdf);
            }

            pdf.save(`quiz-results-${new Date().toISOString().split('T')[0]}.pdf`);
        } catch (error) {
            console.error("Error generating PDF:", error);
            alert("Failed to generate PDF. Please try again.");
        } finally {
            setIsGeneratingPdf(false);
        }
    };

    return (
        <div className="w-full max-w-7xl mx-auto my-4 sm:my-8 px-4">
            {/* Content to capture for PDF */}
            <div ref={reportRef} className="glass-panel p-6 sm:p-10 lg:p-14 rounded-3xl shadow-2xl text-center text-gray-200 border border-white/10 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
                <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

                <h1 className="text-4xl sm:text-5xl font-bold mb-4 text-white tracking-tight drop-shadow-lg">Quiz Results</h1>
                <p className="text-gray-400 mb-10 sm:mb-14 text-sm sm:text-base">
                    <span className="text-purple-400 font-semibold tracking-wide uppercase">🔮 Every expert was once a beginner.</span> Keep studying!
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                    {/* Score Card */}
                    <ResultCard>
                        <div className="relative h-32 w-32 sm:h-40 sm:w-40 mb-6 group">
                            <div className="absolute inset-0 bg-indigo-500/20 rounded-full blur-xl animate-pulse"></div>
                            <svg className="absolute inset-0 w-full h-full rotate-[-90deg]" viewBox="0 0 120 120">
                                <circle className="text-gray-800" strokeWidth="8" stroke="currentColor" fill="transparent" r="52" cx="60" cy="60" />
                                <circle
                                    className={`${getScoreColor(score)} transition-all duration-1000 ease-out`}
                                    strokeWidth="8"
                                    strokeDasharray={52 * 2 * Math.PI}
                                    strokeDashoffset={(52 * 2 * Math.PI) * (1 - score / 100)}
                                    strokeLinecap="round"
                                    stroke="currentColor"
                                    fill="transparent"
                                    r="52"
                                    cx="60"
                                    cy="60"
                                    style={{ filter: 'drop-shadow(0 0 4px currentColor)' }}
                                />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className={`text-4xl sm:text-5xl font-bold text-white drop-shadow-md`}>{score}%</span>
                                <span className="text-xs sm:text-sm text-gray-500 font-bold uppercase tracking-widest mt-1">SCORE</span>
                            </div>
                        </div>
                        <p className={`font-bold text-xl ${getScoreColor(score).split(' ')[0]}`}>{score >= 50 ? 'Good Job!' : 'Keep Practicing'}</p>
                        <p className="text-sm text-gray-500 mt-2">{correctCount} out of {totalQuestions} correct</p>
                    </ResultCard>

                    {/* Speed Card */}
                    <ResultCard>
                        <div className="text-5xl sm:text-6xl font-bold mb-4 text-white drop-shadow-sm">
                            {avgTimePerQuestion}<span className="text-2xl text-gray-600">s</span>
                        </div>
                        <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-4">AVG / QUESTION</p>
                        <div className={`font-bold text-xl px-4 py-1 rounded-full bg-white/5 border border-white/10 ${speed.color}`}>{speed.label}</div>
                        <p className="text-sm text-gray-500 mt-auto pt-4">Total Time: <span className="text-gray-300">{formatTime(totalTime)}</span></p>
                    </ResultCard>

                    {/* Answer Breakdown Card */}
                    <ResultCard>
                        <div className="flex w-full justify-around items-center mb-6 flex-grow">
                            <div className="flex flex-col items-center group">
                                <span className="text-5xl sm:text-6xl font-bold text-green-400 drop-shadow-[0_0_10px_rgba(74,222,128,0.3)]">{correctCount}</span>
                                <span className="text-xs text-green-500/50 font-bold uppercase mt-2 tracking-widest group-hover:text-green-500 transition-colors">Correct</span>
                            </div>
                            <div className="w-px h-16 bg-gray-700"></div>
                            <div className="flex flex-col items-center group">
                                <span className="text-5xl sm:text-6xl font-bold text-red-400 drop-shadow-[0_0_10px_rgba(248,113,113,0.3)]">{incorrectCount}</span>
                                <span className="text-xs text-red-500/50 font-bold uppercase mt-2 tracking-widest group-hover:text-red-500 transition-colors">Wrong</span>
                            </div>
                        </div>
                        <p className="text-sm text-gray-500 mt-auto pt-4">{totalQuestions} total questions</p>
                    </ResultCard>
                </div>

                {/* Incorrect Answers Review Section */}
                {incorrectAnswers.length > 0 && (
                    <div className="mb-8 text-left max-w-4xl mx-auto">
                        <div className="flex items-center gap-3 mb-8">
                            <h2 className="text-xl sm:text-2xl font-bold text-white">Review Incorrect Answers</h2>
                            <span className="bg-red-500/20 text-red-300 text-sm font-bold px-3 py-1 rounded-full border border-red-500/30">{incorrectAnswers.length} Mistakes</span>
                        </div>
                        <div className="space-y-6">
                            {incorrectAnswers.map((ans, idx) => (
                                <div key={idx} className="bg-white/5 border-l-4 border-red-500 rounded-r-xl p-5 sm:p-6 border-y border-r border-white/5 hover:bg-white/10 transition-colors">
                                    <h3 className="text-base sm:text-lg font-semibold text-gray-200 mb-4">{ans.questionText}</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                        <div className="bg-red-500/10 p-4 rounded-xl border border-red-500/20">
                                            <p className="text-xs text-red-400 font-bold uppercase mb-2 tracking-wide">Your Answer</p>
                                            <p className="text-red-200 font-medium text-sm sm:text-base">{ans.selectedAnswer}</p>
                                        </div>
                                        <div className="bg-green-500/10 p-4 rounded-xl border border-green-500/20">
                                            <p className="text-xs text-green-400 font-bold uppercase mb-2 tracking-wide">Correct Answer</p>
                                            <p className="text-green-200 font-medium text-sm sm:text-base">{ans.correctAnswer}</p>
                                        </div>
                                    </div>
                                    {ans.explanation && (
                                        <div className="text-sm text-indigo-200 mt-2 bg-indigo-500/10 p-4 rounded-xl border border-indigo-500/10">
                                            <span className="font-bold text-indigo-400 block mb-2 uppercase text-xs tracking-wider">Explanation</span>
                                            {ans.explanation}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Navigation Buttons - Hidden in PDF */}
                <div data-html2canvas-ignore className="mt-12 max-w-md mx-auto space-y-4">
                    <button
                        onClick={onViewProgress}
                        className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl hover:from-indigo-500 hover:to-purple-500 transition-all shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_30px_rgba(79,70,229,0.5)] hover:-translate-y-0.5 text-sm sm:text-base"
                    >
                        Review Complete Progress
                    </button>

                    <button
                        onClick={handleDownloadPdf}
                        disabled={isGeneratingPdf}
                        className="w-full py-3.5 bg-white/5 border border-white/10 text-gray-300 font-semibold rounded-xl hover:bg-white/10 hover:text-white transition-colors duration-300 text-sm sm:text-base flex items-center justify-center gap-2"
                    >
                        {isGeneratingPdf ? (
                            <span className="animate-pulse">Generating PDF...</span>
                        ) : (
                            <>
                                <Icon iconName="download" className="h-5 w-5" />
                                <span>Download Results PDF</span>
                            </>
                        )}
                    </button>

                    <button
                        onClick={onReturnToDashboard}
                        className="w-full py-2 text-gray-500 hover:text-white transition-colors text-sm"
                    >
                        Back to Dashboard
                    </button>
                </div>
            </div>
        </div>
    );
};

export default QuizResultsView;
