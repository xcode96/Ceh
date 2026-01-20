import React, { useState } from 'react';
import type { Exam } from '../types';
import Icon from './Icon';

interface HomeProps {
    exams: Exam[];
    onSelectExam: (examId: number) => void;
    isAdmin: boolean;
    onAddExam: (title: string, description: string) => void;
    onEditExam: (examId: number, title: string, description: string) => void;
    onDeleteExam: (examId: number) => void;
    onAdminLoginClick: () => void;
    onLogout: () => void;
    onViewLearningHub: () => void;
}

const ExamCard: React.FC<{ exam: Exam, onSelect: () => void, isAdmin: boolean, onEdit: (e: React.MouseEvent) => void, onDelete: (e: React.MouseEvent) => void }> = ({ exam, onSelect, isAdmin, onEdit, onDelete }) => (
    <div className="glass-card rounded-2xl p-6 flex flex-col relative group overflow-hidden border border-white/5 hover:border-indigo-500/30 transition-all duration-300 hover:-translate-y-1">
        {/* Glow Effect */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full blur-[64px] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

        {isAdmin && (
            <div className="absolute top-4 right-4 flex gap-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <button
                    onClick={onEdit}
                    className="p-2 rounded-full glass-button text-gray-400 hover:text-white hover:bg-white/10"
                    title="Edit Exam Details"
                >
                    <Icon iconName="edit" className="h-4 w-4" />
                </button>
                <button
                    onClick={onDelete}
                    className="p-2 rounded-full glass-button text-gray-400 hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/30"
                    title="Delete Exam Folder"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
            </div>
        )}

        <div className="relative z-10 flex flex-col h-full">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center mb-6 text-indigo-400 group-hover:scale-110 group-hover:from-indigo-500/30 group-hover:to-purple-500/30 transition-transform duration-300 shadow-lg shadow-indigo-900/20 border border-white/5">
                <Icon iconName={exam.icon || "folder"} className="h-7 w-7" />
            </div>

            <h3 className="text-xl font-bold text-white mb-3 group-hover:text-indigo-300 transition-colors">{exam.title}</h3>
            <p className="text-gray-400 text-sm line-clamp-3 mb-6 leading-relaxed">{exam.description || "Master this domain with our comprehensive cybersecurity training modules."}</p>

            <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5">
                <span className="text-xs font-semibold text-gray-500 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5 flex items-center gap-2">
                    <Icon iconName="collection" className="h-3 w-3" />
                    {exam.modules.length} Modules
                </span>
                <button onClick={onSelect} className="py-2 px-5 glass-button rounded-xl text-sm font-semibold hover:bg-indigo-500/20 hover:border-indigo-500/40 hover:text-white transition-all shadow-md">
                    Start Learning
                </button>
            </div>
        </div>
    </div>
);

const Home: React.FC<HomeProps> = ({ exams, onSelectExam, isAdmin, onAddExam, onEditExam, onDeleteExam, onAdminLoginClick, onLogout, onViewLearningHub }) => {
    const [searchQuery, setSearchQuery] = useState("");

    const handleAddExamClick = () => {
        const title = window.prompt("Enter the title for the new exam folder:");
        if (title && title.trim()) {
            const description = window.prompt("Enter the description for the new exam folder:", "");
            if (description && description.trim()) {
                onAddExam(title, description);
            }
        }
    };

    const handleEditExamClick = (exam: Exam) => {
        const title = window.prompt("Edit exam title:", exam.title);
        if (title && title.trim()) {
            const description = window.prompt("Edit exam description:", exam.description);
            if (description !== null) { // Allow empty description
                onEditExam(exam.id, title, description);
            }
        }
    }

    const filteredExams = exams.filter(exam =>
        exam.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (exam.description && exam.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
        <div className="min-h-screen pt-12 pb-24 max-w-7xl mx-auto px-6">

            {/* Minimal Header & Search */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                            <Icon iconName="shield-check" className="text-white h-6 w-6" />
                        </div>
                        Security Training Platform
                    </h1>
                    <p className="text-gray-400 text-sm max-w-md ml-14">
                        Select a certification folder to access training modules and exams.
                    </p>
                </div>

                <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="relative group w-full md:w-80">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Icon iconName="search" className="h-4 w-4 text-gray-500 group-focus-within:text-indigo-400 transition-colors" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search certifications..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="block w-full pl-10 pr-4 py-3 glass-input rounded-xl text-sm placeholder-gray-500 text-gray-200 transition-all shadow-sm focus:shadow-indigo-500/10 bg-white/5 border border-white/10 focus:border-indigo-500/50"
                        />
                    </div>
                    <button onClick={onViewLearningHub} className="px-4 py-3 glass-button rounded-xl text-sm font-semibold text-gray-300 hover:text-white hover:bg-white/10 transition-all flex items-center gap-2 border border-white/5">
                        <Icon iconName="book-open" className="h-4 w-4" />
                        Hub
                    </button>
                </div>
            </div>

            <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                    <Icon iconName="collection" className="text-indigo-400" />
                    Available Certifications
                </h2>
                <span className="text-sm text-gray-500">{filteredExams.length} Courses Available</span>
            </div>

            {filteredExams.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredExams.map(exam => (
                        <ExamCard
                            key={exam.id}
                            exam={exam}
                            onSelect={() => onSelectExam(exam.id)}
                            isAdmin={isAdmin}
                            onEdit={(e) => { e.stopPropagation(); handleEditExamClick(exam); }}
                            onDelete={(e) => { e.stopPropagation(); onDeleteExam(exam.id); }}
                        />
                    ))}

                    {/* Add New Exam Card (Admin Only) */}
                    {isAdmin && !searchQuery && (
                        <button onClick={handleAddExamClick} className="glass-card rounded-2xl p-8 flex flex-col justify-center items-center min-h-[320px] border-dashed border-2 border-gray-700/50 hover:border-indigo-500/50 hover:bg-indigo-500/5 transition-all group cursor-pointer animate-fade-in relative overflow-hidden">
                            <div className="absolute inset-0 bg-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <div className="w-20 h-20 rounded-full bg-gray-800/50 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-indigo-500/20 transition-all shadow-lg group-hover:shadow-indigo-500/20">
                                <span className="text-4xl text-gray-500 group-hover:text-indigo-400 font-light transition-colors">+</span>
                            </div>
                            <span className="text-lg font-medium text-gray-400 group-hover:text-white transition-colors relative z-10">Add New Exam Folder</span>
                        </button>
                    )}
                </div>
            ) : (
                <div className="text-center py-32 glass-panel rounded-3xl border border-white/5">
                    <div className="w-16 h-16 bg-gray-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Icon iconName="search" className="h-8 w-8 text-gray-600" />
                    </div>
                    <div className="text-gray-400 text-xl font-light mb-2">No exams found matching "{searchQuery}".</div>
                    <p className="text-gray-600 text-sm mb-6">Try checking your spelling or using different keywords.</p>
                    <button onClick={() => setSearchQuery('')} className="text-indigo-400 hover:text-indigo-300 font-medium hover:underline transition-colors">Clear Search Filters</button>
                </div>
            )}
        </div>
    );
}

export default Home;