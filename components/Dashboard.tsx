import React, { useRef, useMemo, useState } from 'react';
import ModuleListItem from './ModuleListItem';
import Icon from './Icon';
import type { Module, QuestionBank } from '../types';

interface DashboardProps {
    examTitle: string;
    modules: Module[];
    onConfigureQuiz: (module: Module, subTopic?: string, contentPoint?: string) => void;
    onViewProgress: () => void;
    onViewLearningHub: () => void;
    isAdmin: boolean;
    onAdminLoginClick: () => void;
    onLogout: () => void;
    onManageQuestions: (module: Module, subTopic: string, contentPoint?: string) => void;
    onExportQuestions: () => void;
    onImportQuestions: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onExportTopic: (module: Module, subTopic: string, contentPoint?: string) => void;
    onImportTopic: (event: React.ChangeEvent<HTMLInputElement>, module: Module, subTopic: string, contentPoint?: string) => void;
    onExportSourceCode: () => void;
    onDownloadProject: () => void;
    moduleVisibility: { [moduleId: number]: boolean };
    onToggleModuleVisibility: (moduleId: number) => void;
    subTopicVisibility: { [moduleId: number]: { [subTopic: string]: boolean } };
    onToggleSubTopicVisibility: (moduleId: number, subTopic: string) => void;
    contentPointVisibility: { [moduleId: number]: { [contentPoint: string]: { [contentPoint: string]: boolean } } };
    onToggleContentPointVisibility: (moduleId: number, subTopic: string, contentPoint: string) => void;
    onAddModule: (title: string) => void;
    onEditModule: (moduleId: number, newTitle: string) => void;
    onDeleteModule: (moduleId: number) => void;
    onAddSubTopic: (moduleId: number, subTopic: string) => void;
    onEditSubTopic: (moduleId: number, oldSubTopic: string, newSubTopic: string) => void;
    onDeleteSubTopic: (moduleId: number, subTopic: string) => void;
    questionBank: QuestionBank;
    onReturnToHome: () => void;
    onGenerateModuleAI: (module: Module) => void;
    generatingModuleId: number | null;
    generatingStatus: string;
    unlockedModules: number[];
    unlockedSubTopics: string[];
    onUnlockCode: (code: string) => void;
    syncStatus?: 'idle' | 'syncing' | 'synced' | 'error';
    onManualSync?: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({
    examTitle, modules, onConfigureQuiz, onViewProgress, onViewLearningHub,
    isAdmin, onAdminLoginClick, onLogout, onManageQuestions,
    onExportQuestions, onImportQuestions, onExportTopic, onImportTopic, onExportSourceCode, onDownloadProject,
    moduleVisibility, onToggleModuleVisibility,
    subTopicVisibility, onToggleSubTopicVisibility,
    contentPointVisibility, onToggleContentPointVisibility,
    onAddModule, onEditModule, onDeleteModule, onAddSubTopic, onEditSubTopic, onDeleteSubTopic, questionBank, onReturnToHome,
    onGenerateModuleAI, generatingModuleId, generatingStatus,
    unlockedModules, unlockedSubTopics, onUnlockCode, syncStatus, onManualSync
}) => {
    const importInputRef = useRef<HTMLInputElement>(null);
    const [unlockCodeInput, setUnlockCodeInput] = useState('');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const handleImportClick = () => {
        importInputRef.current?.click();
    };

    const handleAddModuleClick = () => {
        const title = window.prompt("Enter the title for the new module:");
        if (title) {
            onAddModule(title);
        }
    };

    const visibleModules = isAdmin ? modules : modules.filter(m => moduleVisibility[m.id] !== false);

    // Calculate total questions available for this specific exam
    const totalExamQuestions = useMemo(() => {
        return modules.reduce((acc, module) => {
            const moduleQuestions = questionBank[module.id];
            if (!moduleQuestions) return acc;

            const moduleTotal = Object.values(moduleQuestions).reduce((mAcc: number, questions) => {
                return mAcc + (Array.isArray(questions) ? questions.length : 0);
            }, 0);

            return acc + moduleTotal;
        }, 0);
    }, [modules, questionBank]);

    return (
        <div className="w-full glass-panel rounded-3xl flex flex-col md:flex-row overflow-hidden" style={{ height: '93vh' }}>
            {/* Left Sidebar */}
            <aside className="w-full md:w-72 lg:w-80 flex-shrink-0 bg-gray-900/50 backdrop-blur-md border-b md:border-b-0 md:border-r border-white/10 flex flex-col overflow-y-auto custom-scrollbar">
                {/* Mobile Menu Toggle */}
                <div className="p-4 md:hidden flex justify-between items-center bg-white/5 border-b border-white/10">
                    <div className="flex items-center gap-2">
                        <span className="font-bold text-white">{isAdmin ? 'Admin' : 'Menu'}</span>
                        {syncStatus && (
                            <div className="flex items-center gap-1 text-[10px] text-gray-400">
                                <span className={`h-1.5 w-1.5 rounded-full ${syncStatus === 'syncing' ? 'bg-yellow-400 animate-pulse' :
                                    syncStatus === 'synced' ? 'bg-green-500' :
                                        syncStatus === 'error' ? 'bg-red-500' : 'bg-gray-600'
                                    }`}></span>
                                <span>{syncStatus === 'synced' ? 'Synced' : ''}</span>
                            </div>
                        )}
                    </div>
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="text-gray-300 hover:text-white focus:outline-none"
                    >
                        <Icon iconName="chevron-down" className={`h-5 w-5 transform transition-transform duration-200 ${isMobileMenuOpen ? 'rotate-180' : ''}`} />
                    </button>
                </div>

                {/* Sidebar Content */}
                <div className={`p-6 lg:p-8 flex flex-col items-center text-center transition-all duration-300 ease-in-out h-full overflow-y-auto ${isMobileMenuOpen ? 'flex' : 'hidden md:flex'}`}>
                    <h2 className="text-sm text-gray-400 uppercase tracking-wider mb-1">Welcome</h2>
                    <h1 className="text-2xl font-bold text-white mb-6 tracking-tight">{isAdmin ? 'Admin User' : 'XCODE96'}</h1>

                    <div className="glass-card p-5 rounded-xl w-full text-left mb-6 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/20 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
                        <p className="text-sm text-gray-300 relative z-10">Track performance & master new skills.</p>
                    </div>

                    {isAdmin && <p className="text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 p-3 rounded-lg mt-2 w-full text-sm">Admin Access Active</p>}

                    <div className="mt-auto w-full space-y-3 pt-6 border-t border-white/10">
                        {isAdmin && (
                            <div className="grid grid-cols-1 gap-2 pt-2">
                                <input
                                    type="file"
                                    ref={importInputRef}
                                    onChange={onImportQuestions}
                                    accept=".json"
                                    className="hidden"
                                />
                                <button onClick={handleImportClick} className="w-full py-2 px-4 bg-sky-600/20 text-sky-300 border border-sky-500/30 font-medium rounded-lg hover:bg-sky-600/30 transition-colors text-sm flex items-center justify-center gap-2">
                                    <Icon iconName="upload" className="h-4 w-4" />
                                    Import JSON
                                </button>
                                <button onClick={onExportQuestions} className="w-full py-2 px-4 bg-pink-600/20 text-pink-300 border border-pink-500/30 font-medium rounded-lg hover:bg-pink-600/30 transition-colors text-sm flex items-center justify-center gap-2">
                                    <Icon iconName="download" className="h-4 w-4" />
                                    Export JSON
                                </button>
                                <button onClick={onExportSourceCode} className="w-full py-2 px-4 bg-slate-700/50 text-slate-300 border border-slate-600 font-medium rounded-lg hover:bg-slate-700 transition-colors text-sm flex items-center justify-center gap-2" title="Download constants.ts">
                                    <Icon iconName="code-bracket" className="h-4 w-4" />
                                    Get Source
                                </button>
                                <button onClick={onDownloadProject} className="w-full py-2 px-4 bg-green-600/20 text-green-300 border border-green-500/30 font-medium rounded-lg hover:bg-green-600/30 transition-colors text-sm flex items-center justify-center gap-2" title="Download ZIP">
                                    <Icon iconName="folder-open" className="h-4 w-4" />
                                    Get ZIP
                                </button>
                            </div>
                        )}
                    </div>

                    {!isAdmin && (
                        <div className="mt-4 w-full pt-4 border-t border-white/10">
                            <p className="text-xs text-gray-500 mb-2 text-left uppercase tracking-wider">Unlock Code</p>
                            <div className="flex gap-2">
                                <input
                                    type="password"
                                    value={unlockCodeInput}
                                    onChange={(e) => setUnlockCodeInput(e.target.value)}
                                    placeholder="Enter code..."
                                    className="glass-input w-full px-3 py-1.5 text-sm rounded bg-black/20 focus:bg-black/40 transition-colors"
                                />
                                <button
                                    onClick={() => { onUnlockCode(unlockCodeInput); setUnlockCodeInput(''); }}
                                    className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-semibold rounded hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-900/20"
                                >
                                    Go
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Sync Status Indicator */}
                    {syncStatus && (
                        <div className="mt-4 w-full flex items-center justify-between text-xs text-gray-400 bg-white/5 p-2 rounded border border-white/5">
                            <div className="flex items-center gap-2">
                                <span className={`h-2 w-2 rounded-full ${syncStatus === 'syncing' ? 'bg-yellow-400 animate-pulse' :
                                    syncStatus === 'synced' ? 'bg-green-500' :
                                        syncStatus === 'error' ? 'bg-red-500' : 'bg-gray-600'
                                    }`}></span>
                                <span>
                                    {syncStatus === 'syncing' ? 'Syncing...' :
                                        syncStatus === 'synced' ? 'Synced' :
                                            syncStatus === 'error' ? 'Sync Failed' : 'Offline'}
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            </aside>

            {/* Right Content */}
            <main className="flex-1 p-4 sm:p-6 lg:p-10 overflow-y-auto bg-gradient-to-br from-gray-900/50 to-black/50">
                <div className="flex flex-col sm:flex-row items-start mb-8 gap-4">
                    <div className="flex items-center w-full sm:w-auto">
                        <button onClick={onReturnToHome} className="p-2 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors mr-2" aria-label="Back to exams list">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                        </button>
                        <div className="flex-1">
                            <h1 className="text-2xl sm:text-3xl font-bold text-white leading-tight tracking-tight">
                                {isAdmin ? <span className="text-indigo-400 font-normal">Manage: </span> : ''}
                                {examTitle}
                            </h1>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 mt-1 ml-10 sm:ml-0">
                        <span className="bg-indigo-500/10 text-indigo-300 text-xs sm:text-sm font-medium px-3 py-1 rounded-full border border-indigo-500/20 whitespace-nowrap backdrop-blur-sm">
                            {totalExamQuestions} Questions Available
                        </span>
                    </div>
                </div>

                <div className="space-y-4">
                    {visibleModules.map(module => (
                        <ModuleListItem
                            key={module.id}
                            module={module}
                            questionBank={questionBank}
                            onConfigure={(subTopic, contentPoint) => onConfigureQuiz(module, subTopic, contentPoint)}
                            isAdmin={isAdmin}
                            onManage={(subTopic, contentPoint) => onManageQuestions(module, subTopic, contentPoint)}
                            onEdit={(newTitle) => onEditModule(module.id, newTitle)}
                            onDelete={() => onDeleteModule(module.id)}
                            onExport={(subTopic, contentPoint) => onExportTopic(module, subTopic, contentPoint)}
                            onImport={(event, subTopic, contentPoint) => onImportTopic(event, module, subTopic, contentPoint)}
                            isVisible={moduleVisibility[module.id]}
                            onToggleVisibility={() => onToggleModuleVisibility(module.id)}
                            subTopicVisibility={subTopicVisibility[module.id] || {}}
                            onToggleSubTopicVisibility={(subTopic) => onToggleSubTopicVisibility(module.id, subTopic)}
                            contentPointVisibility={contentPointVisibility[module.id] || {}}
                            onToggleContentPointVisibility={(subTopic, contentPoint) => onToggleContentPointVisibility(module.id, subTopic, contentPoint)}
                            onAddSubTopic={(subTopic) => onAddSubTopic(module.id, subTopic)}
                            onEditSubTopic={(oldSubTopic, newSubTopic) => onEditSubTopic(module.id, oldSubTopic, newSubTopic)}
                            onDeleteSubTopic={(subTopic) => onDeleteSubTopic(module.id, subTopic)}
                            onGenerateAI={() => onGenerateModuleAI(module)}
                            isGenerating={generatingModuleId === module.id}
                            generatingStatus={generatingStatus}
                            isLocked={!isAdmin && !unlockedModules.includes(module.id)}
                            unlockedSubTopics={unlockedSubTopics}
                        />
                    ))}
                </div>

                {isAdmin && (
                    <div className="mt-8">
                        <button onClick={handleAddModuleClick} className="w-full py-4 glass-card border-dashed border-2 border-white/20 text-gray-400 font-semibold rounded-xl hover:bg-white/5 hover:text-white hover:border-indigo-500/50 transition-all duration-300 flex items-center justify-center gap-2 group">
                            <span className="bg-white/10 rounded-full p-1 group-hover:bg-indigo-500 group-hover:text-white transition-colors duration-300">
                                <Icon iconName="plus" className="h-5 w-5" />
                            </span>
                            Add New Module
                        </button>
                    </div>
                )}

                {!isAdmin && <p className="text-center text-gray-500 mt-12 text-sm italic">"Every expert was once a beginner. Keep studying!"</p>}
            </main>
        </div>
    );
};

export default Dashboard;