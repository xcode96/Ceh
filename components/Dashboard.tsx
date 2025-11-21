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
  moduleVisibility: { [moduleId: number]: boolean };
  onToggleModuleVisibility: (moduleId: number) => void;
  subTopicVisibility: { [moduleId: number]: { [subTopic: string]: boolean } };
  onToggleSubTopicVisibility: (moduleId: number, subTopic: string) => void;
  contentPointVisibility: { [moduleId: number]: { [contentPoint: string]: { [contentPoint: string]: boolean } } };
  onToggleContentPointVisibility: (moduleId: number, subTopic: string, contentPoint: string) => void;
  onAddModule: (title: string) => void;
  onEditModule: (moduleId: number, newTitle: string) => void;
  onAddSubTopic: (moduleId: number, subTopic: string) => void;
  onEditSubTopic: (moduleId: number, oldSubTopic: string, newSubTopic: string) => void;
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
  onExportQuestions, onImportQuestions, onExportTopic, onImportTopic,
  moduleVisibility, onToggleModuleVisibility,
  subTopicVisibility, onToggleSubTopicVisibility,
  contentPointVisibility, onToggleContentPointVisibility,
  onAddModule, onEditModule, onAddSubTopic, onEditSubTopic, questionBank, onReturnToHome,
  onGenerateModuleAI, generatingModuleId, generatingStatus,
  unlockedModules, unlockedSubTopics, onUnlockCode, syncStatus, onManualSync
}) => {
  const importInputRef = useRef<HTMLInputElement>(null);
  const [unlockCodeInput, setUnlockCodeInput] = useState('');

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
    <div className="w-full max-w-7xl mx-auto bg-white rounded-2xl shadow-xl flex flex-col lg:flex-row overflow-hidden border border-gray-200" style={{ minHeight: '90vh' }}>
      {/* Left Sidebar */}
      <aside className="w-full lg:w-1/4 bg-gray-50 p-6 lg:p-8 border-b lg:border-r border-gray-200 flex flex-col items-center text-center">
        <h2 className="text-sm text-gray-500">Welcome</h2>
        <h1 className="text-2xl font-bold text-gray-900 mb-6">{isAdmin ? 'Admin User' : 'XCODE96'}</h1>
        
        <div className="text-gray-600 bg-gray-200/60 p-4 rounded-lg w-full">
            <p className="text-sm">Track your performance, identify weak areas, and monitor improvement over time.</p>
             <button onClick={onViewProgress} className="mt-4 w-full py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-lg hover:opacity-90 transition-opacity duration-300">
                View My Progress
            </button>
             <button onClick={onViewLearningHub} className="mt-2 w-full py-2.5 bg-white border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors duration-300 flex items-center justify-center gap-2">
                <Icon iconName="book-open" className="h-4 w-4"/>
                Learning Hub
            </button>
        </div>
        
        {isAdmin && <p className="text-indigo-700 bg-indigo-100 p-3 rounded-lg mt-6 w-full">You are in Admin Mode.</p>}

        <div className="mt-auto w-full space-y-3 pt-6">
            <button onClick={isAdmin ? onLogout : onAdminLoginClick} className="w-full py-3 px-4 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors duration-300">
                {isAdmin ? 'Logout' : 'Admin Login'}
            </button>
            {isAdmin && (
              <>
                <input
                  type="file"
                  ref={importInputRef}
                  onChange={onImportQuestions}
                  accept=".json"
                  className="hidden"
                />
                <button onClick={handleImportClick} className="w-full py-3 px-4 bg-sky-500 text-white font-semibold rounded-lg hover:bg-sky-600 transition-colors duration-300 flex items-center justify-center gap-2">
                  <Icon iconName="upload" className="h-5 w-5"/>
                  Import All Questions
                </button>
                <button onClick={onExportQuestions} className="w-full py-3 px-4 bg-pink-500 text-white font-semibold rounded-lg hover:bg-pink-600 transition-colors duration-300 flex items-center justify-center gap-2">
                  <Icon iconName="download" className="h-5 w-5"/>
                  Export All Questions
                </button>
              </>
            )}
        </div>

        {!isAdmin && (
          <div className="mt-4 w-full pt-4 border-t border-gray-200">
               <p className="text-xs text-gray-500 mb-2 text-left">Have an unlock code?</p>
               <div className="flex gap-2">
                   <input
                      type="password"
                      value={unlockCodeInput}
                      onChange={(e) => setUnlockCodeInput(e.target.value)}
                      placeholder="Code"
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:border-indigo-500"
                   />
                   <button 
                      onClick={() => { onUnlockCode(unlockCodeInput); setUnlockCodeInput(''); }} 
                      className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-semibold rounded hover:bg-indigo-700"
                   >
                      Unlock
                   </button>
               </div>
          </div>
        )}
        
        {/* Sync Status Indicator */}
        {syncStatus && (
            <div className="mt-4 w-full flex items-center justify-between text-xs text-gray-500 bg-gray-100 p-2 rounded">
                 <div className="flex items-center gap-2">
                     <span className={`h-2 w-2 rounded-full ${
                         syncStatus === 'syncing' ? 'bg-yellow-400 animate-pulse' : 
                         syncStatus === 'synced' ? 'bg-green-500' : 
                         syncStatus === 'error' ? 'bg-red-500' : 'bg-gray-300'
                     }`}></span>
                     <span>
                        {syncStatus === 'syncing' ? 'Syncing Data...' : 
                         syncStatus === 'synced' ? 'Data Synced' : 
                         syncStatus === 'error' ? 'Sync Failed' : 'Offline'}
                     </span>
                 </div>
                 {onManualSync && (
                     <button onClick={onManualSync} title="Check for updates" className="hover:text-indigo-600 transition-colors">
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                         </svg>
                     </button>
                 )}
            </div>
        )}
      </aside>

      {/* Right Content */}
      <main className="w-full lg:w-3/4 p-6 lg:p-10 overflow-y-auto">
        <div className="flex items-start mb-8">
            <button onClick={onReturnToHome} className="p-2 rounded-full hover:bg-gray-100 mr-4 mt-1" aria-label="Back to exams list">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            </button>
            <div>
                <h1 className="text-3xl font-bold text-gray-900">{isAdmin ? `Manage Modules: ${examTitle}` : `Training Modules: ${examTitle}`}</h1>
                <div className="flex items-center gap-2 mt-2 text-gray-600">
                    <span className="bg-indigo-50 text-indigo-700 text-sm font-medium px-3 py-1 rounded-full border border-indigo-100">
                        {totalExamQuestions} Total Questions Available
                    </span>
                </div>
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
              onGenerateAI={() => onGenerateModuleAI(module)}
              isGenerating={generatingModuleId === module.id}
              generatingStatus={generatingStatus}
              isLocked={!isAdmin && !unlockedModules.includes(module.id)}
              unlockedSubTopics={unlockedSubTopics}
            />
          ))}
        </div>
        {isAdmin && (
            <div className="mt-6">
                <button onClick={handleAddModuleClick} className="w-full py-3 border-2 border-dashed border-gray-300 text-gray-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors duration-300">
                    + Add New Module
                </button>
            </div>
        )}
        {!isAdmin && <p className="text-center text-gray-500 mt-10 text-sm">Every expert was once a beginner. Keep studying!</p>}
      </main>
    </div>
  );
};

export default Dashboard;