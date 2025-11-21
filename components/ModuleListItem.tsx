
import React, { useState, useRef, useMemo } from 'react';
import Icon from './Icon';
import type { Module, QuestionBank, SubTopic, Question } from '../types';

interface ModuleListItemProps {
  module: Module;
  questionBank: QuestionBank;
  onConfigure: (subTopic?: string, contentPoint?: string) => void;
  isAdmin: boolean;
  onManage: (subTopic: string, contentPoint?: string) => void;
  onEdit: (newTitle: string) => void;
  onExport: (subTopic: string, contentPoint?: string) => void;
  onImport: (event: React.ChangeEvent<HTMLInputElement>, subTopic: string, contentPoint?: string) => void;
  isVisible: boolean;
  onToggleVisibility: () => void;
  subTopicVisibility: { [subTopic: string]: boolean };
  onToggleSubTopicVisibility: (subTopic: string) => void;
  contentPointVisibility: { [subTopic: string]: { [contentPoint: string]: boolean } };
  onToggleContentPointVisibility: (subTopic: string, contentPoint: string) => void;
  onAddSubTopic: (subTopic: string) => void;
  onEditSubTopic: (oldSubTopic: string, newSubTopic: string) => void;
  onGenerateAI?: () => void;
  isGenerating?: boolean;
  generatingStatus?: string;
  isLocked?: boolean;
  unlockedSubTopics?: string[];
}

interface ContentPointItemProps {
  item: string;
  isAdmin: boolean;
  questionCount: number;
  onConfigureQuiz: () => void;
  isVisible: boolean;
  onToggleVisibility: () => void;
  onManage: () => void;
  onExport: () => void;
  onImport: (event: React.ChangeEvent<HTMLInputElement>) => void;
  isLocked?: boolean;
}

const ContentPointItem: React.FC<ContentPointItemProps> = ({ item, isAdmin, questionCount, onConfigureQuiz, isVisible, onToggleVisibility, onManage, onExport, onImport, isLocked }) => {
    const importInputRef = useRef<HTMLInputElement>(null);
    const handleImportClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        importInputRef.current?.click();
    };

  return (
    <li className={`text-sm text-gray-600 py-1 list-disc list-inside flex justify-between items-center group ${isAdmin && !isVisible ? 'opacity-40' : ''}`}>
      <div className="flex items-center gap-2">
        <span className={isLocked && !isAdmin ? 'text-gray-400' : ''}>{item}</span>
        {!isAdmin && questionCount > 0 && (
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${isLocked ? 'text-gray-400 bg-gray-100' : 'text-sky-700 bg-sky-100'}`}>
                {questionCount} Qs
            </span>
        )}
      </div>
      <div className="flex items-center gap-2 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        {isAdmin ? (
            <>
              <button
                  onClick={(e) => { e.stopPropagation(); onToggleVisibility(); }}
                  title={isVisible ? 'Hide topic' : 'Show topic'}
                  className="p-1 text-gray-500 hover:text-gray-800"
              >
                  <Icon iconName={isVisible ? 'eye' : 'eye-slash'} className="h-4 w-4" />
              </button>
              <input
                  type="file" ref={importInputRef} className="hidden" accept=".json"
                  onChange={(e) => onImport(e)}
              />
              <button onClick={handleImportClick} title={`Import questions for ${item}`} className="p-1 text-gray-500 hover:text-sky-600">
                  <Icon iconName="upload" className="h-4 w-4" />
              </button>
              <button onClick={(e) => { e.stopPropagation(); onExport(); }} title={`Export questions for ${item}`} className="p-1 text-gray-500 hover:text-pink-600">
                  <Icon iconName="download" className="h-4 w-4" />
              </button>
              <button 
                  onClick={(e) => { e.stopPropagation(); onManage(); }}
                  className="px-2 py-0.5 text-xs font-semibold text-purple-700 bg-purple-100 rounded-full hover:bg-purple-200"
                  aria-label={`Manage questions for ${item}`}
              >
                  Manage
              </button>
            </>
        ) : (
            !isLocked && (
              <button
                onClick={(e) => { e.stopPropagation(); onConfigureQuiz(); }}
                disabled={questionCount === 0}
                className="px-2 py-0.5 text-xs font-semibold text-indigo-700 bg-indigo-100 rounded-full hover:bg-indigo-200 disabled:bg-gray-200 disabled:text-gray-500 disabled:cursor-not-allowed"
                aria-label={`Start quiz for ${item}`}
              >
                {questionCount > 0 ? 'Quiz' : 'No Qs'}
              </button>
            )
        )}
      </div>
    </li>
  );
};

interface SubTopicItemProps {
  topic: SubTopic;
  isAdmin: boolean;
  questionCount: number;
  contentPointQuestionCounts: { [contentPoint: string]: number };
  onConfigureSubTopicQuiz: () => void;
  onConfigureContentPointQuiz: (contentPoint: string) => void;
  onManage: (subTopic: string, contentPoint?: string) => void;
  onEdit: (newTitle: string) => void;
  onExport: (subTopic: string, contentPoint?: string) => void;
  onImport: (event: React.ChangeEvent<HTMLInputElement>, subTopic: string, contentPoint?: string) => void;
  isVisible: boolean;
  onToggleVisibility: () => void;
  contentPointVisibility: { [contentPoint: string]: boolean };
  onToggleContentPointVisibility: (contentPoint: string) => void;
  isLocked?: boolean;
}

const SubTopicItem: React.FC<SubTopicItemProps> = ({ 
    topic, isAdmin, questionCount, contentPointQuestionCounts, onConfigureSubTopicQuiz, onConfigureContentPointQuiz, onManage, 
    onEdit, onExport, onImport, isVisible, onToggleVisibility, 
    contentPointVisibility, onToggleContentPointVisibility, isLocked 
}) => {
  const importInputRef = useRef<HTMLInputElement>(null);

  const handleImportClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    importInputRef.current?.click();
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newName = window.prompt("Enter new name for sub-topic:", topic.title);
    if (newName && newName.trim() !== '' && newName.trim() !== topic.title) {
        onEdit(newName);
    }
  };

  return (
    <li className={`flex flex-col rounded-md transition-all duration-200 group ${isAdmin && !isVisible ? 'opacity-40' : ''} ${isLocked && !isAdmin ? 'bg-gray-50' : ''}`}>
      <div className={`flex items-start justify-between py-2 px-2 rounded-md`}>
        <div className="flex items-start gap-3">
            <div className="relative">
               <Icon iconName={isLocked && !isAdmin ? 'lock' : 'folder'} className={`h-5 w-5 mt-px ${isLocked && !isAdmin ? 'text-gray-400' : 'text-indigo-500'}`} />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1">
                <span className={`text-sm font-semibold ${isLocked && !isAdmin ? 'text-gray-500' : 'text-gray-800'}`}>{topic.title}</span>
                {isAdmin && (
                    <button onClick={handleEdit} title="Edit sub-topic name" className="p-1 rounded-full text-gray-500 hover:bg-gray-200 hover:text-gray-800 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Icon iconName="edit" className="h-3 w-3" />
                    </button>
                )}
              </div>
              {!isAdmin && questionCount > 0 && (
                <p className="text-xs text-gray-500 mt-1">{questionCount} question{questionCount !== 1 ? 's' : ''} available</p>
              )}
              {topic.content.length > 0 && (
                <ul className="pl-0 pr-4 mt-1 space-y-1">
                    {topic.content.map((item, index) => {
                       const isContentPointVisible = contentPointVisibility?.[item] ?? true;
                       if (!isAdmin && !isContentPointVisible) return null;
                       return (
                           <ContentPointItem
                              key={index}
                              item={item}
                              isAdmin={isAdmin}
                              questionCount={contentPointQuestionCounts[item] || 0}
                              onConfigureQuiz={() => onConfigureContentPointQuiz(item)}
                              isVisible={isContentPointVisible}
                              onToggleVisibility={() => onToggleContentPointVisibility(item)}
                              onManage={() => onManage(topic.title, item)}
                              onExport={() => onExport(topic.title, item)}
                              onImport={(e) => onImport(e, topic.title, item)}
                              isLocked={isLocked}
                           />
                       )
                    })}
                </ul>
              )}
            </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {isAdmin ? (
            <>
              <button
                  onClick={(e) => {
                      e.stopPropagation();
                      onToggleVisibility();
                  }}
                  title={isVisible ? 'Hide sub-topic from users' : 'Show sub-topic to users'}
                  className="p-1 text-gray-500 hover:text-gray-800"
              >
                  <Icon iconName={isVisible ? 'eye' : 'eye-slash'} className="h-4 w-4" />
              </button>
              <input
                type="file"
                ref={importInputRef}
                className="hidden"
                accept=".json"
                onChange={(e) => onImport(e, topic.title)}
              />
              <button onClick={handleImportClick} title={`Import questions for ${topic.title}`} className="p-1 text-gray-500 hover:text-sky-600 transition-colors">
                <Icon iconName="upload" className="h-4 w-4" />
              </button>
              <button onClick={(e) => { e.stopPropagation(); onExport(topic.title); }} title={`Export questions for ${topic.title}`} className="p-1 text-gray-500 hover:text-pink-600 transition-colors">
                <Icon iconName="download" className="h-4 w-4" />
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); onManage(topic.title); }}
                className="px-3 py-1 text-xs font-semibold text-purple-700 bg-purple-100 rounded-full hover:bg-purple-200 transition-colors"
                aria-label={`Manage questions for ${topic.title}`}
              >
                Manage
              </button>
            </>
          ) : (
            topic.content.length === 0 && (
              isLocked ? (
                 <span className="text-xs text-gray-400 font-medium px-2 py-1">Locked</span>
              ) : (
                  <button
                    onClick={(e) => { e.stopPropagation(); onConfigureSubTopicQuiz(); }}
                    disabled={questionCount === 0}
                    className="px-3 py-1 text-xs font-semibold text-indigo-700 bg-indigo-100 rounded-full hover:bg-indigo-200 transition-colors disabled:bg-gray-200 disabled:text-gray-500 disabled:cursor-not-allowed"
                    aria-label={`Start quiz for ${topic.title}`}
                  >
                    Start Quiz
                  </button>
              )
            )
          )}
        </div>
      </div>
    </li>
  );
};


const ModuleListItem: React.FC<ModuleListItemProps> = ({ 
    module, questionBank, onConfigure, isAdmin, onManage, onEdit, onExport, onImport, isVisible, 
    onToggleVisibility, subTopicVisibility, onToggleSubTopicVisibility, 
    contentPointVisibility, onToggleContentPointVisibility,
    onAddSubTopic, onEditSubTopic, onGenerateAI, isGenerating, generatingStatus,
    isLocked, unlockedSubTopics
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const totalCustomQuestions = useMemo(() => {
    const moduleQuestions = questionBank[module.id];
    if (!moduleQuestions) {
      return 0;
    }
    return Object.values(moduleQuestions).reduce((sum: number, questionsArray) => {
        if (Array.isArray(questionsArray)) {
            return sum + questionsArray.length;
        }
        return sum;
    }, 0);
  }, [questionBank, module.id]);

  const handleAddSubTopicClick = () => {
    const name = window.prompt("Enter the name for the new sub-topic:");
    if (name) {
      onAddSubTopic(name);
    }
  };
  
  const handleEditClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      const newTitle = window.prompt("Enter the new title for the module:", module.title);
      if (newTitle) {
          onEdit(newTitle);
      }
  };

  const getStatusBadge = () => {
    if (isAdmin) {
        return <span className="text-xs font-semibold text-indigo-700 bg-indigo-100 px-2 py-1 rounded-full">Admin Mode</span>;
    }
    if (isLocked) {
        return <span className="text-xs font-semibold text-gray-500 bg-gray-200 px-2 py-1 rounded-full flex items-center gap-1"><Icon iconName="lock" className="h-3 w-3"/> Locked</span>;
    }
    return (
        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
            totalCustomQuestions > 0 
            ? 'text-sky-700 bg-sky-100' 
            : 'text-gray-500 bg-gray-200'
        }`}>
            {totalCustomQuestions} Question{totalCustomQuestions !== 1 ? 's' : ''}
        </span>
    );
  };

  const visibleSubTopics = isAdmin ? module.subTopics : module.subTopics.filter(topic => subTopicVisibility[topic.title] !== false);

  // Handle click to expand only if not locked or if admin
  const handleClick = () => {
      if (isAdmin || !isLocked) {
          setIsExpanded(!isExpanded);
      }
  }

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 transition-all duration-300 ${isAdmin && !isVisible ? 'opacity-50' : ''} ${isLocked && !isAdmin ? 'bg-gray-50 opacity-75 cursor-not-allowed' : 'hover:bg-gray-50 cursor-pointer'}`}>
      <div 
        className="p-4 flex items-center justify-between"
        onClick={handleClick}
        aria-expanded={isExpanded}
        aria-controls={`module-content-${module.id}`}
        role="button"
        tabIndex={isLocked && !isAdmin ? -1 : 0}
        onKeyDown={(e) => { if ((e.key === 'Enter' || e.key === ' ') && (!isLocked || isAdmin)) setIsExpanded(!isExpanded); }}
      >
        <div className="flex items-center gap-4">
          {isAdmin && (
            <div className="flex items-center gap-1">
              <button
                  onClick={(e) => {
                      e.stopPropagation();
                      onToggleVisibility();
                  }}
                  title={isVisible ? 'Hide module from users' : 'Show module to users'}
                  className="p-2 rounded-full hover:bg-gray-200 text-gray-500 hover:text-gray-800"
              >
                  <Icon iconName={isVisible ? 'eye' : 'eye-slash'} className="h-5 w-5" />
              </button>
              
              {/* Bulk AI Generate Button */}
              {onGenerateAI && (
                  <button
                    onClick={(e) => {
                        e.stopPropagation();
                        if (!isGenerating) onGenerateAI();
                    }}
                    title="Bulk Generate Questions using AI for all sub-topics"
                    className={`p-2 rounded-full hover:bg-indigo-50 ${isGenerating ? 'text-indigo-600' : 'text-gray-500 hover:text-indigo-600'}`}
                  >
                     {isGenerating ? (
                        <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                     ) : (
                         <Icon iconName="sparkles" className="h-5 w-5" />
                     )}
                  </button>
              )}
            </div>
          )}
          <div className={`p-3 rounded-lg ${isLocked && !isAdmin ? 'bg-gray-200 text-gray-400' : module.color}`}>
            <Icon iconName={isLocked && !isAdmin ? 'lock' : module.icon} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className={`font-bold ${isLocked && !isAdmin ? 'text-gray-500' : 'text-gray-900'}`}>{module.title}</h3>
              {isAdmin && (
                <button
                  onClick={handleEditClick}
                  title="Edit module title"
                  className="p-1 rounded-full text-gray-500 hover:bg-gray-200 hover:text-gray-800"
                >
                  <Icon iconName="edit" className="h-4 w-4" />
                </button>
              )}
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-sm text-gray-600">
                 <span>{module.subTopics.length} sub-topics</span>
                 {isGenerating && generatingStatus && (
                     <span className="text-xs text-indigo-600 font-medium animate-pulse hidden sm:inline-block">
                         — {generatingStatus}
                     </span>
                 )}
            </div>
            {isGenerating && generatingStatus && (
                 <p className="text-xs text-indigo-600 font-medium animate-pulse mt-1 sm:hidden">
                     {generatingStatus}
                 </p>
             )}
          </div>
        </div>
        <div className="flex items-center gap-4">
          {getStatusBadge()}
          {(!isLocked || isAdmin) && (
            <Icon iconName="chevron-down" className={`h-5 w-5 text-gray-500 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
          )}
        </div>
      </div>
      
      {isExpanded && (
        <div id={`module-content-${module.id}`} className="px-4 pb-4 pt-0 border-t border-gray-200">
          <h4 className="text-sm font-semibold text-gray-700 my-3 px-2">Sub-Topics Covered:</h4>
           {visibleSubTopics.length > 0 ? (
            <ul className="space-y-1">
                {visibleSubTopics.map((topic, index) => {
                    const moduleQuestions = questionBank[module.id] || {};

                    const contentPointQuestionCounts: { [key: string]: number } = {};
                    topic.content.forEach(cp => {
                        const contentPointIdentifier = `${topic.title}::${cp}`;
                        contentPointQuestionCounts[cp] = moduleQuestions[contentPointIdentifier]?.length || 0;
                    });

                    const subTopicOnlyQuestionCount = moduleQuestions[topic.title]?.length || 0;
                    const totalSubTopicQuestionCount = subTopicOnlyQuestionCount + Object.values(contentPointQuestionCounts).reduce((a, b) => a + b, 0);
                    
                    // Logic for locked subtopic: 
                    // If Admin: always unlocked. 
                    // If User: Module must be unlocked (implied since we are expanded) AND subtopic key must be in unlocked list.
                    const isSubTopicLocked = !isAdmin && !unlockedSubTopics?.includes(`${module.id}-${topic.title}`);

                    return (
                        <SubTopicItem
                          key={index}
                          topic={topic}
                          isAdmin={isAdmin}
                          questionCount={totalSubTopicQuestionCount}
                          contentPointQuestionCounts={contentPointQuestionCounts}
                          onConfigureSubTopicQuiz={() => onConfigure(topic.title)}
                          onConfigureContentPointQuiz={(contentPoint) => onConfigure(topic.title, contentPoint)}
                          onManage={onManage}
                          onEdit={(newTopicTitle) => onEditSubTopic(topic.title, newTopicTitle)}
                          onExport={onExport}
                          onImport={onImport}
                          isVisible={subTopicVisibility[topic.title] ?? true}
                          onToggleVisibility={() => onToggleSubTopicVisibility(topic.title)}
                          contentPointVisibility={contentPointVisibility[topic.title] || {}}
                          onToggleContentPointVisibility={(contentPoint) => onToggleContentPointVisibility(topic.title, contentPoint)}
                          isLocked={isSubTopicLocked}
                        />
                    );
                })}
            </ul>
           ) : (
            <p className="text-sm text-gray-500 text-center py-4">No sub-topics defined or all are currently hidden.</p>
           )}
           {isAdmin && (
                <div className="mt-4 px-2">
                    <button onClick={handleAddSubTopicClick} className="w-full py-2 border-2 border-dashed border-gray-300 text-gray-500 text-sm font-semibold rounded-lg hover:bg-gray-100 transition-colors">
                        + Add New Sub-Topic
                    </button>
                </div>
            )}
        </div>
      )}
    </div>
  );
};

export default ModuleListItem;
