import React, { useRef } from 'react';
import ProgressCircle from './ProgressCircle';
import ModuleListItem from './ModuleListItem';
import Icon from './Icon';
import type { Module } from '../types';

interface DashboardProps {
  modules: Module[];
  completedModules: Set<number>;
  onStartQuiz: (module: Module, subTopic?: string) => void;
  onResetProgress: () => void;
  isAdmin: boolean;
  onAdminLoginClick: () => void;
  onLogout: () => void;
  onManageQuestions: (module: Module, subTopic: string) => void;
  onExportQuestions: () => void;
  onImportQuestions: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onExportSubTopic: (module: Module, subTopic: string) => void;
  onImportSubTopic: (event: React.ChangeEvent<HTMLInputElement>, module: Module, subTopic: string) => void;
  moduleVisibility: { [moduleId: number]: boolean };
  onToggleModuleVisibility: (moduleId: number) => void;
  subTopicVisibility: { [moduleId: number]: { [subTopic: string]: boolean } };
  onToggleSubTopicVisibility: (moduleId: number, subTopic: string) => void;
  onAddModule: (title: string) => void;
  onEditModule: (moduleId: number, newTitle: string) => void;
  onAddSubTopic: (moduleId: number, subTopic: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ 
  modules, completedModules, onStartQuiz, onResetProgress, 
  isAdmin, onAdminLoginClick, onLogout, onManageQuestions, 
  onExportQuestions, onImportQuestions, onExportSubTopic, onImportSubTopic,
  moduleVisibility, onToggleModuleVisibility,
  subTopicVisibility, onToggleSubTopicVisibility,
  onAddModule, onEditModule, onAddSubTopic
}) => {
  const completedCount = completedModules.size;
  const totalModules = modules.length;
  const progressPercentage = totalModules > 0 ? Math.round((completedCount / totalModules) * 100) : 0;
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
    <div className="w-full max-w-7xl mx-auto bg-white rounded-2xl shadow-xl flex flex-col lg:flex-row overflow-hidden" style={{ minHeight: '90vh' }}>
      {/* Left Sidebar */}
      <aside className="w-full lg:w-1/4 bg-white p-6 lg:p-8 border-b lg:border-r border-gray-100 flex flex-col items-center text-center">
        <h2 className="text-sm text-gray-500">Welcome</h2>
        <h1 className="text-2xl font-bold text-gray-800 mb-6">{isAdmin ? 'Admin User' : 'Demo User'}</h1>
        
        {!isAdmin && (
          <>
            <ProgressCircle progress={progressPercentage} />
            <div className="flex justify-between w-full max-w-[200px] mt-6 text-sm">
              <div className="text-center">
                <p className="font-bold text-gray-700">Modules Done</p>
                <p className="text-gray-500">{completedCount}/{totalModules}</p>
              </div>
              <div className="text-center">
                <p className="font-bold text-gray-700">Modules Left</p>
                <p className="text-gray-500">{totalModules - completedCount}</p>
              </div>
            </div>
          </>
        )}
        {isAdmin && <p className="text-gray-600 bg-indigo-50 p-3 rounded-lg">You are in Admin Mode.</p>}

        <div className="mt-auto w-full space-y-3 pt-6">
            <button onClick={isAdmin ? onLogout : onAdminLoginClick} className="w-full py-3 px-4 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors duration-300">
                {isAdmin ? 'Logout' : 'Admin Login'}
            </button>
            {isAdmin ? (
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
            ) : (
              <>
                <button onClick={onResetProgress} className="w-full py-3 px-4 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors duration-300">
                    Reset Progress
                </button>
                <button className="w-full py-3 px-4 bg-pink-500 text-white font-semibold rounded-lg hover:bg-pink-600 transition-colors duration-300 flex items-center justify-center gap-2">
                    <Icon iconName="download" className="h-5 w-5"/>
                    Export Progress
                </button>
              </>
            )}
        </div>
      </aside>

      {/* Right Content */}
      <main className="w-full lg:w-3/4 p-6 lg:p-10 bg-slate-50/50 overflow-y-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">{isAdmin ? 'Manage Training Modules' : 'Training Modules'}</h1>
        <div className="space-y-4">
          {visibleModules.map(module => (
            <ModuleListItem 
              key={module.id} 
              module={module}
              status={completedModules.has(module.id) ? 'completed' : 'not-started'} 
              onStart={(subTopic) => onStartQuiz(module, subTopic)}
              isAdmin={isAdmin}
              onManage={(subTopic) => onManageQuestions(module, subTopic)}
              onEdit={(newTitle) => onEditModule(module.id, newTitle)}
              onExport={(subTopic) => onExportSubTopic(module, subTopic)}
              onImport={(event, subTopic) => onImportSubTopic(event, module, subTopic)}
              isVisible={moduleVisibility[module.id]}
              onToggleVisibility={() => onToggleModuleVisibility(module.id)}
              subTopicVisibility={subTopicVisibility[module.id] || {}}
              onToggleSubTopicVisibility={(subTopic) => onToggleSubTopicVisibility(module.id, subTopic)}
              onAddSubTopic={(subTopic) => onAddSubTopic(module.id, subTopic)}
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
        {!isAdmin && <p className="text-center text-gray-400 mt-10 text-sm">Complete all modules to unlock your final report.</p>}
      </main>
    </div>
  );
};

export default Dashboard;