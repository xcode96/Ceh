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

const getScoreColor = (score: number, type: 'text' | 'bg' | 'border' = 'text') => {
    const color = score >= 80 ? 'green' : score >= 50 ? 'yellow' : 'red';
    switch (type) {
        case 'text': return `text-${color}-500`;
        case 'bg': return `bg-${color}-500`;
        case 'border': return `border-${color}-500`;
        default: return '';
    }
};

const StatCard: React.FC<{ title: string; value: string; icon: React.ReactNode }> = ({ title, value, icon }) => (
    <div className="bg-gray-50 p-4 rounded-xl flex items-center gap-4 border border-gray-200">
        <div className="p-3 bg-gray-200 rounded-lg">{icon}</div>
        <div>
            <p className="text-sm text-gray-500">{title}</p>
            <p className="text-xl font-bold text-gray-800">{value}</p>
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
        <div className="w-full max-w-7xl mx-auto bg-white rounded-2xl shadow-xl p-6 lg:p-10 border border-gray-200 text-gray-900 overflow-y-auto" style={{ maxHeight: '95vh' }}>
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center">
                     <button onClick={onReturnToDashboard} className="p-2 rounded-full hover:bg-gray-100 mr-4" aria-label="Back to dashboard">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold">Your Study Progress</h1>
                        <p className="text-gray-600">All data is stored locally in your browser - no account needed!</p>
                    </div>
                </div>
            </div>

            {/* Overall Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-10">
                <StatCard title="Total Attempts" value={overallStats.totalAttempts.toString()} icon={<span className="text-2xl">🎯</span>} />
                <StatCard title="Average Score" value={`${overallStats.averageScore}%`} icon={<span className="text-2xl text-green-500">✓</span>} />
                <StatCard title="Study Time" value={formatTime(overallStats.studyTime)} icon={<span className="text-2xl">⏱️</span>} />
                <StatCard title="Best Score" value={`${overallStats.bestScore}%`} icon={<span className="text-2xl">🏆</span>} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Recent Attempts */}
                <div className="lg:col-span-1">
                    <h2 className="text-xl font-bold mb-4">Recent Quiz Attempts</h2>
                    <div className="space-y-3">
                        {quizHistory.slice(0, 5).map((attempt, index) => (
                            <div key={index} className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                                <div className="flex justify-between items-center">
                                    <p className="font-semibold text-gray-700 text-sm truncate pr-2" title={attempt.topicTitle}>{attempt.topicTitle}</p>
                                    <p className="text-xs text-gray-500">{new Date(attempt.timestamp).toLocaleDateString()}</p>
                                </div>
                                <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                                    <span>Score: <span className={`font-bold ${getScoreColor(attempt.score)}`}>{attempt.score}%</span></span>
                                    <span>Correct: <span className="text-gray-800 font-medium">{attempt.correctCount}/{attempt.totalQuestions}</span></span>
                                    <span>Time: <span className="text-gray-800 font-medium">{formatTime(attempt.totalTime)}</span></span>
                                </div>
                            </div>
                        ))}
                         {quizHistory.length === 0 && <p className="text-gray-500 text-sm">No quiz attempts recorded yet.</p>}
                    </div>
                </div>

                {/* Performance by Domain */}
                <div className="lg:col-span-2">
                    <h2 className="text-xl font-bold mb-4">Performance by Domain</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {performanceByDomain.map(domain => (
                            <div key={domain.id} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-xs text-gray-500">DOMAIN {domain.id}</p>
                                        <p className="font-bold text-gray-800">{domain.title.replace(/DOMAIN \d: /,'')}</p>
                                    </div>
                                    <span className={`text-lg font-bold ${getScoreColor(domain.score)}`}>{domain.score}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-1.5 my-2">
                                    <div className={`${getScoreColor(domain.score, 'bg')}`} style={{ width: `${domain.score}%` }}></div>
                                </div>
                                <div className="flex justify-between text-xs text-gray-500">
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
            <div className="mt-12">
                <h2 className="text-xl font-bold mb-4">Manage Your Progress</h2>
                 <div className="flex items-center gap-4">
                    <button className="py-2 px-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors">
                        Export Progress
                    </button>
                    <button onClick={onClearProgress} className="py-2 px-4 bg-red-100 text-red-700 font-semibold rounded-lg hover:bg-red-200 transition-colors">
                        Clear All Progress
                    </button>
                 </div>
                 <p className="text-xs text-gray-500 mt-2">💡 Tip: Export your progress regularly to back it up. Your data stays in your browser only.</p>
            </div>
        </div>
    );
}

export default ProgressView;