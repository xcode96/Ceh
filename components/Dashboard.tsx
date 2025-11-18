import React, { useRef } from 'react';
import ModuleListItem from './ModuleListItem';
import Icon from './Icon';
import type { Module, QuestionBank } from '../types';

interface DashboardProps {
  examTitle: string;
  modules: Module[];
  onConfigureQuiz: (module: Module, subTopic?: string, contentPoint?: string) => void;
  onViewProgress: () => void;
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
}

const Dashboard: React.FC<DashboardProps> = ({ 
  examTitle, modules, onConfigureQuiz, onViewProgress, 
  isAdmin, onAdminLoginClick, onLogout, onManageQuestions, 
  onExportQuestions, onImportQuestions, onExportTopic, onImportTopic,
  moduleVisibility, onToggleModuleVisibility,
  subTopicVisibility, onToggleSubTopicVisibility,
  contentPointVisibility, onToggleContentPointVisibility,
  onAddModule, onEditModule, onAddSubTopic, onEditSubTopic, questionBank, onReturnToHome
}) => {
  const importInputRef = useRef<HTMLInputElement>(null);

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
      </aside>

      {/* Right Content */}
      <main className="w-full lg:w-3/4 p-6 lg:p-10 overflow-y-auto">
        <div className="flex items-center mb-8">
            <button onClick={onReturnToHome} className="p-2 rounded-full hover:bg-gray-100 mr-4" aria-label="Back to exams list">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            </button>
            <h1 className="text-3xl font-bold text-gray-900">{isAdmin ? `Manage Modules: ${examTitle}` : `Training Modules: ${examTitle}`}</h1>
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