
import React, { useMemo } from 'react';
import type { QuizAttempt, Exam, Module } from '../types';
import Icon from './Icon';

interface ProgressViewProps {
    quizHistory: QuizAttempt[];
    exams: Exam[];
    onReturnToDashboard: () => void;
    onClearProgress: () => void;
}

const formatTime = (seconds: number): string => {
    if (isNaN(seconds) || seconds < 0) return "0s";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.round(seconds % 60);
    if (minutes > 0) {
        return `${minutes}m ${remainingSeconds}s`;
    }
    return `${remainingSeconds}s`;
};

const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-400";
    if (score >= 50) return "text-yellow-400";
    return "text-red-400";
};

const getProgressBarColor = (score: number) => {
    if (score >= 80) return "bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]";
    if (score >= 50) return "bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.5)]";
    return "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]";
}

const StatCard: React.FC<{ title: string; value: string; icon: React.ReactNode }> = ({ title, value, icon }) => (
    <div className="glass-card p-5 rounded-2xl flex items-center gap-4 hover:bg-white/5 transition-colors border border-white/5 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none group-hover:bg-white/10 transition-colors"></div>
        <div className="p-3 bg-white/5 rounded-xl border border-white/10 flex-shrink-0">{icon}</div>
        <div>
            <p className="text-sm text-gray-400 font-medium">{title}</p>
            <p className="text-xl sm:text-2xl font-bold text-white tracking-tight">{value}</p>
        </div>
    </div>
);

const ProgressView: React.FC<ProgressViewProps> = ({ quizHistory, exams, onReturnToDashboard, onClearProgress }) => {
    const allModules = useMemo(() => exams.flatMap(exam => exam.modules), [exams]);

    const overallStats = useMemo(() => {
        if (quizHistory.length === 0) {
            return { totalAttempts: 0, averageScore: 0, studyTime: 0, bestScore: 0 };
        }
        const totalAttempts = quizHistory.length;
        const totalScore = quizHistory.reduce((sum, attempt) => sum + attempt.score, 0);
        const averageScore = Math.round(totalScore / totalAttempts);
        const studyTime = quizHistory.reduce((sum, attempt) => sum + attempt.totalTime, 0);
        const bestScore = Math.max(...quizHistory.map(a => a.score));
        return { totalAttempts, averageScore, studyTime, bestScore };
    }, [quizHistory]);

    const performanceByDomain = useMemo(() => {
        const domainStats: { [moduleId: number]: { correct: number, total: number, time: number, count: number } } = {};
        quizHistory.forEach(attempt => {
            if (!domainStats[attempt.moduleId]) {
                domainStats[attempt.moduleId] = { correct: 0, total: 0, time: 0, count: 0 };
            }
            domainStats[attempt.moduleId].correct += attempt.correctCount;
            domainStats[attempt.moduleId].total += attempt.totalQuestions;
            domainStats[attempt.moduleId].time += attempt.totalTime;
            domainStats[attempt.moduleId].count++;
        });

        return allModules.map(module => {
            const stats = domainStats[module.id];
            if (!stats) return { ...module, score: 0, correct: 0, total: 0, avgTime: 0, status: "Not Started" };

            const score = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;
            const avgTime = stats.total > 0 ? (stats.time / stats.total) : 0;
            const status = score < 50 ? "Needs Practice" : score < 80 ? "Good" : "Excellent";
            return { ...module, score, correct: stats.correct, total: stats.total, avgTime, status };
        });
    }, [quizHistory, allModules]);

    return (
        <div className="w-full max-w-7xl mx-auto glass-panel rounded-3xl p-6 sm:p-10 lg:p-12 text-gray-200 overflow-y-auto relative" style={{ maxHeight: '95vh' }}>
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none"></div>

            <div className="flex items-center justify-between mb-10 relative z-10">
                <div className="flex items-center">
                    <button onClick={onReturnToDashboard} className="p-2 rounded-xl hover:bg-white/10 mr-4 text-gray-400 hover:text-white transition-all group" aria-label="Back to dashboard">
                        <Icon iconName="chevron-down" className="h-6 w-6 rotate-90 group-hover:-translate-x-1 transition-transform" />
                    </button>
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Your Study Progress</h1>
                        <p className="text-sm sm:text-base text-gray-400 mt-1">All data is stored locally in your browser - no account needed!</p>
                    </div>
                </div>
            </div>

            {/* Overall Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-12 relative z-10">
                <StatCard title="Total Attempts" value={overallStats.totalAttempts.toString()} icon={<span className="text-2xl grayscale brightness-150">🎯</span>} />
                <StatCard title="Average Score" value={`${overallStats.averageScore}%`} icon={<span className="text-2xl text-green-400 drop-shadow-[0_0_5px_rgba(74,222,128,0.5)]">✓</span>} />
                <StatCard title="Study Time" value={formatTime(overallStats.studyTime)} icon={<span className="text-2xl grayscale brightness-150">⏱️</span>} />
                <StatCard title="Best Score" value={`${overallStats.bestScore}%`} icon={<span className="text-2xl grayscale brightness-150">🏆</span>} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">
                {/* Recent Attempts */}
                <div className="lg:col-span-1">
                    <h2 className="text-xl font-bold mb-6 text-white flex items-center gap-2">
                        <Icon iconName="clock" className="h-5 w-5 text-indigo-400" />
                        Recent Quiz Attempts
                    </h2>
                    <div className="space-y-4">
                        {quizHistory.slice(0, 5).map((attempt, index) => (
                            <div key={index} className="glass-card p-4 rounded-xl hover:bg-white/5 transition-all border border-white/5">
                                <div className="flex justify-between items-center mb-2">
                                    <p className="font-semibold text-gray-200 text-sm truncate pr-2" title={attempt.topicTitle}>{attempt.topicTitle}</p>
                                    <p className="text-xs text-gray-500 font-mono">{new Date(attempt.timestamp).toLocaleDateString()}</p>
                                </div>
                                <div className="flex items-center justify-between text-xs text-gray-400">
                                    <div className="flex items-center gap-3">
                                        <span className={`font-bold ${getScoreColor(attempt.score)}`}>{attempt.score}%</span>
                                        <span>{attempt.correctCount}/{attempt.totalQuestions} Correct</span>
                                    </div>
                                    <span className="font-mono">{formatTime(attempt.totalTime)}</span>
                                </div>
                            </div>
                        ))}
                        {quizHistory.length === 0 && (
                            <div className="text-center py-10 px-4 glass-card rounded-xl border-dashed border border-gray-700">
                                <p className="text-gray-500 text-sm italic">No quiz attempts recorded yet.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Performance by Domain */}
                <div className="lg:col-span-2">
                    <h2 className="text-xl font-bold mb-6 text-white flex items-center gap-2">
                        <Icon iconName="chart-bar" className="h-5 w-5 text-purple-400" />
                        Performance by Domain
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {performanceByDomain.map(domain => (
                            <div key={domain.id} className="glass-card p-5 rounded-xl border border-white/5 hover:border-white/10 transition-all group">
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">DOMAIN {domain.id}</p>
                                        <p className="font-bold text-gray-200 group-hover:text-white transition-colors">{domain.title.replace(/DOMAIN \d: /, '')}</p>
                                    </div>
                                    <span className={`text-xl font-bold ${getScoreColor(domain.score)} drop-shadow-sm`}>{domain.score}%</span>
                                </div>
                                <div className="w-full bg-gray-800 rounded-full h-2 my-3 overflow-hidden">
                                    <div className={`h-full rounded-full transition-all duration-1000 ${getProgressBarColor(domain.score)}`} style={{ width: `${domain.score}%` }}></div>
                                </div>
                                <div className="flex justify-between text-xs text-gray-500 font-medium">
                                    <span>{domain.correct}/{domain.total} CORRECT</span>
                                    <span>AVG {domain.avgTime.toFixed(1)}s</span>
                                    <span className={getScoreColor(domain.score)}>● {domain.status}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Manage Progress */}
            <div className="mt-16 pt-8 border-t border-white/10 relative z-10">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                    <div>
                        <h2 className="text-lg font-bold text-white mb-1">Manage Data</h2>
                        <p className="text-xs text-gray-500">Your progress is stored in your browser.</p>
                    </div>
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <button className="flex-1 sm:flex-none py-2.5 px-5 glass-button rounded-xl text-gray-300 hover:text-white border border-white/5 hover:border-indigo-500/30 transition-all text-sm font-medium">
                            Export Data
                        </button>
                        <button onClick={onClearProgress} className="flex-1 sm:flex-none py-2.5 px-5 bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 hover:text-red-300 rounded-xl transition-all text-sm font-medium">
                            Clear Progress
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ProgressView;
