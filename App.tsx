import React, { useState, useMemo, useCallback, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import QuizView from './components/QuizView';
import QuizResultsView from './components/QuizResultsView';
import LoginView from './components/LoginView';
import QuestionManager from './components/QuestionManager';
import Home from './components/Home';
import Footer from './components/Footer';
import QuizCustomizationModal from './components/QuizCustomizationModal';
import ProgressView from './components/ProgressView';
import { INITIAL_EXAM_DATA } from './constants';
import type { Module, QuestionBank, Question, Exam, SubTopic, QuizResult, QuizAttempt } from './types';

type View = 'dashboard' | 'quiz' | 'results' | 'progress' | 'home';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('home');
  const [activeExamId, setActiveExamId] = useState<number | null>(null);
  const [activeModule, setActiveModule] = useState<Module | null>(null);
  const [activeSubTopic, setActiveSubTopic] = useState<string | null>(null);
  const [activeContentPoint, setActiveContentPoint] = useState<string | null>(null);
  const [activeQuizQuestions, setActiveQuizQuestions] = useState<Question[]>([]);
  const [activeQuizMode, setActiveQuizMode] = useState<'study' | 'exam'>('study');
  
  // Quiz Results & History
  const [lastQuizResult, setLastQuizResult] = useState<QuizResult | null>(null);
  const [quizHistory, setQuizHistory] = useState<QuizAttempt[]>([]);

  // Admin and Question Bank State
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoginModalOpen, setLoginModalOpen] = useState(false);
  const [isQuestionManagerOpen, setQuestionManagerOpen] = useState(false);
  const [questionBank, setQuestionBank] = useState<QuestionBank>({});
  const [moduleVisibility, setModuleVisibility] = useState<{ [moduleId: number]: boolean }>({});
  const [subTopicVisibility, setSubTopicVisibility] = useState<{ [moduleId: number]: { [subTopic: string]: boolean } }>({});
  const [contentPointVisibility, setContentPointVisibility] = useState<{ [moduleId: number]: { [subTopic: string]: { [contentPoint: string]: boolean } } }>({});
  const [exams, setExams] = useState<Exam[]>([]);
  const [quizSettings, setQuizSettings] = useState<{
    isOpen: boolean;
    module: Module | null;
    subTopic: string | null;
    contentPoint: string | null;
    availableQuestions: number;
  }>({ isOpen: false, module: null, subTopic: null, contentPoint: null, availableQuestions: 0 });

  // Load data from local storage on initial render
  useEffect(() => {
    // Load Exams
    try {
        const savedExams = localStorage.getItem('exams');
        setExams(savedExams ? JSON.parse(savedExams) : INITIAL_EXAM_DATA);
    } catch(e) {
        console.error("Failed to load exams from local storage", e);
        setExams(INITIAL_EXAM_DATA);
    }
    
    // Load Question Bank
    try {
      const savedBank = localStorage.getItem('questionBank');
      if (savedBank) {
        setQuestionBank(JSON.parse(savedBank));
      }
    } catch (error) {
      console.error("Failed to load question bank from local storage:", error);
    }

    // Load Quiz History
    try {
      const savedHistory = localStorage.getItem('quizHistory');
      if (savedHistory) {
        setQuizHistory(JSON.parse(savedHistory));
      }
    } catch(error) {
      console.error("Failed to load quiz history from local storage", error);
    }

    const allModules = INITIAL_EXAM_DATA.flatMap(e => e.modules);

    // Load Module Visibility
    try {
        const savedVisibility = localStorage.getItem('moduleVisibility');
        const initialVisibility = allModules.reduce((acc, module) => {
            acc[module.id] = true; // Default to visible
            return acc;
        }, {} as { [moduleId: number]: boolean });

        if (savedVisibility) {
            const parsedVisibility = JSON.parse(savedVisibility);
            setModuleVisibility({ ...initialVisibility, ...parsedVisibility });
        } else {
            setModuleVisibility(initialVisibility);
        }
    } catch (error) {
        console.error("Failed to load module visibility settings:", error);
        const defaultVisibility = allModules.reduce((acc, module) => ({ ...acc, [module.id]: true }), {});
        setModuleVisibility(defaultVisibility);
    }
    
    // Load Sub-Topic Visibility
    try {
        const savedSubTopicVisibility = localStorage.getItem('subTopicVisibility');
        const initialSubTopicVisibility = allModules.reduce((acc, module) => {
            acc[module.id] = module.subTopics.reduce((subAcc, topic) => {
                subAcc[topic.title] = true; // Default all to visible
                return subAcc;
            }, {} as { [subTopic: string]: boolean });
            return acc;
        }, {} as { [moduleId: number]: { [subTopic: string]: boolean } });
        
        if (savedSubTopicVisibility) {
            const parsed = JSON.parse(savedSubTopicVisibility);
            // Deep merge to handle new subtopics gracefully
            Object.keys(initialSubTopicVisibility).forEach(modId => {
                const modIdNum = parseInt(modId, 10);
                if (parsed[modIdNum]) {
                    initialSubTopicVisibility[modIdNum] = { ...initialSubTopicVisibility[modIdNum], ...parsed[modIdNum] };
                }
            });
            setSubTopicVisibility(initialSubTopicVisibility);
        } else {
            setSubTopicVisibility(initialSubTopicVisibility);
        }

    } catch (error) {
         console.error("Failed to load sub-topic visibility settings:", error);
         // Initialize with defaults on error
         const defaultVisibility = allModules.reduce((acc, module) => {
            acc[module.id] = module.subTopics.reduce((subAcc, topic) => ({ ...subAcc, [topic.title]: true }), {});
            return acc;
         }, {} as { [moduleId: number]: { [subTopic: string]: boolean } });
         setSubTopicVisibility(defaultVisibility);
    }

    // Load Content Point Visibility
    try {
        const savedContentPointVisibility = localStorage.getItem('contentPointVisibility');
        const initialContentPointVisibility = allModules.reduce((acc, module) => {
            acc[module.id] = module.subTopics.reduce((subAcc, topic) => {
                subAcc[topic.title] = topic.content.reduce((contentAcc, point) => {
                    contentAcc[point] = true; // Default all to visible
                    return contentAcc;
                }, {} as { [contentPoint: string]: boolean });
                return subAcc;
            }, {} as { [subTopic: string]: { [contentPoint: string]: boolean } });
            return acc;
        }, {} as { [moduleId: number]: { [subTopic: string]: { [contentPoint: string]: boolean } } });

        if (savedContentPointVisibility) {
            const parsed = JSON.parse(savedContentPointVisibility);
            // Deep merge to handle new content points gracefully
            Object.keys(initialContentPointVisibility).forEach(modIdStr => {
                const modId = parseInt(modIdStr, 10);
                if (parsed[modId]) {
                    Object.keys(initialContentPointVisibility[modId]).forEach(subTopicTitle => {
                        if (parsed[modId][subTopicTitle]) {
                             initialContentPointVisibility[modId][subTopicTitle] = { ...initialContentPointVisibility[modId][subTopicTitle], ...parsed[modId][subTopicTitle] };
                        }
                    });
                }
            });
            setContentPointVisibility(initialContentPointVisibility);
        } else {
            setContentPointVisibility(initialContentPointVisibility);
        }
    } catch (error) {
        console.error("Failed to load content point visibility settings:", error);
        const defaultVisibility = allModules.reduce((acc, module) => {
            acc[module.id] = module.subTopics.reduce((subAcc, topic) => {
                subAcc[topic.title] = topic.content.reduce((contentAcc, point) => ({ ...contentAcc, [point]: true }), {});
                return subAcc;
            }, {} as { [subTopic: string]: { [contentPoint: string]: boolean } });
            return acc;
        }, {} as { [moduleId: number]: { [subTopic: string]: { [contentPoint: string]: boolean } } });
        setContentPointVisibility(defaultVisibility);
    }

  }, []);

  // Effect to save exams to local storage whenever they change
  useEffect(() => {
    if (exams.length > 0) {
        localStorage.setItem('exams', JSON.stringify(exams));
    }
  }, [exams]);

  // Effect to save quiz history to local storage whenever it changes
  useEffect(() => {
    localStorage.setItem('quizHistory', JSON.stringify(quizHistory));
  }, [quizHistory]);

  const getTopicIdentifier = (subTopic: string, contentPoint?: string | null) => {
    return contentPoint ? `${subTopic}::${contentPoint}` : subTopic;
  };

  const handleConfigureQuiz = useCallback((module: Module, subTopic?: string, contentPoint?: string) => {
    if (!subTopic) return;
    const topicIdentifier = getTopicIdentifier(subTopic, contentPoint);
    const availableQuestions = questionBank[module.id]?.[topicIdentifier]?.length || 0;

    if (availableQuestions > 0) {
      setQuizSettings({
        isOpen: true,
        module,
        subTopic,
        contentPoint: contentPoint || null,
        availableQuestions,
      });
    } else {
      alert("No questions available for this topic yet.");
    }
  }, [questionBank]);

  const handleStartQuiz = useCallback((numberOfQuestions: number, mode: 'study' | 'exam' = 'study') => {
    if (!quizSettings.module || !quizSettings.subTopic) return;
    
    const { module, subTopic, contentPoint } = quizSettings;
    const topicIdentifier = getTopicIdentifier(subTopic, contentPoint);
    const allQuestions = questionBank[module.id]?.[topicIdentifier] || [];

    // Shuffle and slice
    const shuffled = [...allQuestions].sort(() => 0.5 - Math.random());
    const selectedQuestions = shuffled.slice(0, numberOfQuestions);

    setActiveModule(module);
    setActiveSubTopic(subTopic);
    setActiveContentPoint(contentPoint);
    setActiveQuizQuestions(selectedQuestions);
    setActiveQuizMode(mode);
    setCurrentView('quiz');
    setQuizSettings({ isOpen: false, module: null, subTopic: null, contentPoint: null, availableQuestions: 0 });
  }, [questionBank, quizSettings]);


  const handleCompleteQuiz = useCallback((result: QuizResult) => {
    if (activeModule) {
      const topicTitle = activeContentPoint || activeSubTopic || activeModule.title;
      const attempt: QuizAttempt = {
        ...result,
        moduleId: activeModule.id,
        moduleTitle: activeModule.title,
        topicTitle: topicTitle,
        timestamp: new Date().toISOString(),
      };
      setQuizHistory(prev => [attempt, ...prev]);
    }
    setLastQuizResult(result);
    setCurrentView('results');
  }, [activeModule, activeSubTopic, activeContentPoint]);

  const handleReturnToDashboard = useCallback(() => {
    setActiveModule(null);
    setActiveSubTopic(null);
    setActiveContentPoint(null);
    setQuestionManagerOpen(false);
    setCurrentView('dashboard');
  }, []);
  
  const handleClearProgress = useCallback(() => {
    if (window.confirm("Are you sure you want to clear all your progress? This action cannot be undone.")) {
      setQuizHistory([]);
    }
  }, []);
  
  const handleViewProgress = useCallback(() => {
    setCurrentView('progress');
  }, []);

  const handleAdminLogin = (success: boolean) => {
    if (success) {
      setIsAdmin(true);
      setLoginModalOpen(false);
    } else {
      alert("Invalid credentials!");
    }
  };

  const handleLogout = () => {
    setIsAdmin(false);
  };
  
  const handleManageQuestions = useCallback((module: Module, subTopic: string, contentPoint?: string) => {
    setActiveModule(module);
    setActiveSubTopic(subTopic);
    setActiveContentPoint(contentPoint || null);
    setQuestionManagerOpen(true);
  }, []);

  const updateQuestionBank = useCallback((newBank: QuestionBank) => {
    setQuestionBank(newBank);
    localStorage.setItem('questionBank', JSON.stringify(newBank));
  }, []);

  const handleToggleModuleVisibility = useCallback((moduleId: number) => {
    setModuleVisibility(prev => {
        const newVisibility = { ...prev, [moduleId]: !prev[moduleId] };
        localStorage.setItem('moduleVisibility', JSON.stringify(newVisibility));
        return newVisibility;
    });
  }, []);

  const handleToggleSubTopicVisibility = useCallback((moduleId: number, subTopic: string) => {
    setSubTopicVisibility(prev => {
        const newVisibility = JSON.parse(JSON.stringify(prev)); // Deep copy
        if (!newVisibility[moduleId]) {
            newVisibility[moduleId] = {};
        }
        newVisibility[moduleId][subTopic] = !newVisibility[moduleId][subTopic];
        localStorage.setItem('subTopicVisibility', JSON.stringify(newVisibility));
        return newVisibility;
    });
  }, []);
  
  const handleToggleContentPointVisibility = useCallback((moduleId: number, subTopic: string, contentPoint: string) => {
    setContentPointVisibility(prev => {
        const newVisibility = JSON.parse(JSON.stringify(prev)); // Deep copy
        if (!newVisibility[moduleId]) newVisibility[moduleId] = {};
        if (!newVisibility[moduleId][subTopic]) newVisibility[moduleId][subTopic] = {};
        newVisibility[moduleId][subTopic][contentPoint] = !newVisibility[moduleId][subTopic][contentPoint];
        localStorage.setItem('contentPointVisibility', JSON.stringify(newVisibility));
        return newVisibility;
    });
  }, []);

  const handleSaveQuestions = (questions: Question[]) => {
      if (!activeModule || !activeSubTopic) return;
      const topicIdentifier = getTopicIdentifier(activeSubTopic, activeContentPoint);
      const newBank = { ...questionBank };
      if (!newBank[activeModule.id]) {
        newBank[activeModule.id] = {};
      }
      newBank[activeModule.id][topicIdentifier] = questions;
      updateQuestionBank(newBank);
  };

    const handleAddModule = useCallback((title: string) => {
        if (!title || title.trim() === '' || !activeExamId) return;

        setExams(prevExams => {
            const allModuleIds = prevExams.flatMap(e => e.modules.map(m => m.id));
            const newModuleId = allModuleIds.length > 0 ? Math.max(...allModuleIds) + 1 : 1;

            const newModule: Module = {
                id: newModuleId,
                title: title.trim(),
                icon: 'book-open',
                color: 'bg-gray-100 text-gray-600',
                subTopics: [],
            };
            
            setModuleVisibility(prev => {
                const newVisibility = { ...prev, [newModuleId]: true };
                localStorage.setItem('moduleVisibility', JSON.stringify(newVisibility));
                return newVisibility;
            });
    
            setSubTopicVisibility(prev => {
                const newVisibility = { ...prev, [newModuleId]: {} };
                localStorage.setItem('subTopicVisibility', JSON.stringify(newVisibility));
                return newVisibility;
            });
            
            setContentPointVisibility(prev => {
                const newVisibility = { ...prev, [newModuleId]: {} };
                localStorage.setItem('contentPointVisibility', JSON.stringify(newVisibility));
                return newVisibility;
            });

            return prevExams.map(exam => 
                exam.id === activeExamId ? { ...exam, modules: [...exam.modules, newModule] } : exam
            );
        });
    }, [activeExamId]);
    
    const handleEditModule = useCallback((moduleId: number, newTitle: string) => {
        if (!newTitle || newTitle.trim() === '') return;
        setExams(prevExams => 
            prevExams.map(exam => ({
                ...exam,
                modules: exam.modules.map(module => 
                    module.id === moduleId ? { ...module, title: newTitle.trim() } : module
                )
            }))
        );
    }, []);

    const handleAddSubTopic = useCallback((moduleId: number, subTopicTitle: string) => {
        if (!subTopicTitle || subTopicTitle.trim() === '') return;
        const trimmedTitle = subTopicTitle.trim();

        setExams(prevExams => 
            prevExams.map(exam => ({
                ...exam,
                modules: exam.modules.map(module => {
                    if (module.id === moduleId) {
                        if (module.subTopics.some(st => st.title === trimmedTitle)) {
                            alert("Sub-topic with this name already exists in this module.");
                            return module;
                        }
                        const newSubTopic: SubTopic = { title: trimmedTitle, content: [] };
                        const updatedModule = {
                            ...module,
                            subTopics: [...module.subTopics, newSubTopic]
                        };

                        setSubTopicVisibility(prev => {
                            const newVisibility = JSON.parse(JSON.stringify(prev));
                            if (!newVisibility[moduleId]) newVisibility[moduleId] = {};
                            newVisibility[moduleId][trimmedTitle] = true;
                            localStorage.setItem('subTopicVisibility', JSON.stringify(newVisibility));
                            return newVisibility;
                        });
                        
                        setContentPointVisibility(prev => {
                            const newVisibility = JSON.parse(JSON.stringify(prev));
                            if (!newVisibility[moduleId]) newVisibility[moduleId] = {};
                            newVisibility[moduleId][trimmedTitle] = {};
                            localStorage.setItem('contentPointVisibility', JSON.stringify(newVisibility));
                            return newVisibility;
                        });

                        return updatedModule;
                    }
                    return module;
                })
            }))
        );
    }, []);
    
    const handleEditSubTopic = useCallback((moduleId: number, oldSubTopicTitle: string, newSubTopicTitle: string) => {
        const trimmedNewSubTopicTitle = newSubTopicTitle.trim();
        if (!trimmedNewSubTopicTitle || oldSubTopicTitle === trimmedNewSubTopicTitle) return;

        let conflict = false;
        setExams(prevExams =>
            prevExams.map(exam => ({
                ...exam,
                modules: exam.modules.map(module => {
                    if (module.id === moduleId) {
                        if (module.subTopics.some(st => st.title === trimmedNewSubTopicTitle)) {
                            alert("A sub-topic with this name already exists in this module.");
                            conflict = true;
                            return module;
                        }
                        return {
                            ...module,
                            subTopics: module.subTopics.map(st => 
                                st.title === oldSubTopicTitle 
                                    ? { ...st, title: trimmedNewSubTopicTitle } 
                                    : st
                            )
                        };
                    }
                    return module;
                })
            }))
        );
        
        if (conflict) return;

        setQuestionBank(prevBank => {
            const newBank = JSON.parse(JSON.stringify(prevBank));
            if (newBank[moduleId]) {
                 Object.keys(newBank[moduleId]).forEach(key => {
                    if (key.startsWith(`${oldSubTopicTitle}::`) || key === oldSubTopicTitle) {
                        const newKey = key.replace(oldSubTopicTitle, trimmedNewSubTopicTitle);
                        newBank[moduleId][newKey] = newBank[moduleId][key];
                        delete newBank[moduleId][key];
                    }
                });
                localStorage.setItem('questionBank', JSON.stringify(newBank));
            }
            return newBank;
        });

        setSubTopicVisibility(prevVisibility => {
            const newVisibility = JSON.parse(JSON.stringify(prevVisibility));
            if (newVisibility[moduleId]?.hasOwnProperty(oldSubTopicTitle)) {
                newVisibility[moduleId][trimmedNewSubTopicTitle] = newVisibility[moduleId][oldSubTopicTitle];
                delete newVisibility[moduleId][oldSubTopicTitle];
                localStorage.setItem('subTopicVisibility', JSON.stringify(newVisibility));
            }
            return newVisibility;
        });

        setContentPointVisibility(prevVisibility => {
            const newVisibility = JSON.parse(JSON.stringify(prevVisibility));
            if (newVisibility[moduleId]?.hasOwnProperty(oldSubTopicTitle)) {
                newVisibility[moduleId][trimmedNewSubTopicTitle] = newVisibility[moduleId][oldSubTopicTitle];
                delete newVisibility[moduleId][oldSubTopicTitle];
                localStorage.setItem('contentPointVisibility', JSON.stringify(newVisibility));
            }
            return newVisibility;
        });

    }, []);

    const handleAddExam = useCallback((title: string, description: string) => {
        if (!title.trim() || !description.trim()) return;
        setExams(prevExams => {
            const newExamId = prevExams.length > 0 ? Math.max(...prevExams.map(e => e.id)) + 1 : 1;
            const newExam: Exam = {
                id: newExamId,
                title: title.trim(),
                description: description.trim(),
                modules: [],
            };
            return [...prevExams, newExam];
        });
    }, []);

  const handleExportQuestions = useCallback(() => {
    if (Object.keys(questionBank).length === 0) {
      alert("Question bank is empty. Nothing to export.");
      return;
    }
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(questionBank, null, 2)
    )}`;
    const link = document.createElement("a");
    link.href = jsonString;
    link.download = "cyber-security-question-bank.json";
    link.click();
  }, [questionBank]);

  const handleImportQuestions = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result;
        if (typeof text !== 'string') {
          throw new Error("Failed to read file.");
        }
        const importedBank = JSON.parse(text);
        if (typeof importedBank === 'object' && importedBank !== null && !Array.isArray(importedBank)) {
          updateQuestionBank(importedBank);
          alert("Question bank imported successfully!");
        } else {
          throw new Error("Invalid JSON format. The file should contain a JSON object.");
        }
      } catch (error) {
        const err = error as Error;
        console.error("Failed to import question bank:", err);
        alert(`Failed to import question bank. Please ensure the file is valid JSON. Error: ${err.message}`);
      }
      event.target.value = '';
    };
     reader.onerror = () => {
        alert("Error reading the file.");
        event.target.value = '';
    }
    reader.readAsText(file);
  }, [updateQuestionBank]);

  const handleExportTopic = useCallback((module: Module, subTopic: string, contentPoint?: string) => {
    const topicIdentifier = getTopicIdentifier(subTopic, contentPoint);
    const questionsToExport = questionBank[module.id]?.[topicIdentifier];
    if (!questionsToExport || questionsToExport.length === 0) {
      alert(`No questions to export for ${contentPoint || subTopic}.`);
      return;
    }
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(questionsToExport, null, 2)
    )}`;
    const link = document.createElement("a");
    link.href = jsonString;
    const safeFilename = (contentPoint || subTopic).replace(/[^a-z0-9]/gi, '_').toLowerCase();
    link.download = `${safeFilename}_questions.json`;
    link.click();
  }, [questionBank]);

  const handleImportTopic = useCallback((event: React.ChangeEvent<HTMLInputElement>, module: Module, subTopic: string, contentPoint?: string) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result;
        if (typeof text !== 'string') {
          throw new Error("Failed to read file.");
        }
        const importedQuestions = JSON.parse(text);
        
        if (Array.isArray(importedQuestions) && (importedQuestions.length === 0 || (
            importedQuestions[0].id && 
            importedQuestions[0].question &&
            Array.isArray(importedQuestions[0].options) &&
            importedQuestions[0].correctAnswer
        ))) {
            const topicIdentifier = getTopicIdentifier(subTopic, contentPoint);
            const newBank = { ...questionBank };
            if (!newBank[module.id]) {
                newBank[module.id] = {};
            }
            newBank[module.id][topicIdentifier] = importedQuestions as Question[];
            updateQuestionBank(newBank);
            alert(`Successfully imported ${importedQuestions.length} questions for ${contentPoint || subTopic}.`);
        } else {
          throw new Error("Invalid JSON format. File must contain an array of questions.");
        }
      } catch (error) {
        const err = error as Error;
        const topicName = contentPoint || subTopic;
        console.error(`Failed to import questions for ${topicName}:`, err);
        alert(`Failed to import questions. Please ensure the file is a valid JSON array of questions. Error: ${err.message}`);
      }
      event.target.value = '';
    };
    reader.readAsText(file);
  }, [questionBank, updateQuestionBank]);
  
  const handleSelectExam = (examId: number) => {
    setActiveExamId(examId);
    setCurrentView('dashboard');
  };

  const handleReturnToHome = () => {
    setActiveExamId(null);
    setCurrentView('home');
  };

  const activeExam = useMemo(() => exams.find(e => e.id === activeExamId), [exams, activeExamId]);

  const renderContent = () => {
    if (isQuestionManagerOpen && activeModule && activeSubTopic) {
      const topicIdentifier = getTopicIdentifier(activeSubTopic, activeContentPoint);
      return <QuestionManager 
        module={activeModule}
        subTopic={activeSubTopic}
        contentPoint={activeContentPoint}
        initialQuestions={questionBank[activeModule.id]?.[topicIdentifier] || []}
        onSave={handleSaveQuestions}
        onClose={handleReturnToDashboard}
      />
    }

    switch (currentView) {
      case 'quiz':
        return activeModule && <QuizView 
          module={activeModule} 
          subTopic={activeSubTopic} 
          contentPoint={activeContentPoint} 
          questions={activeQuizQuestions}
          mode={activeQuizMode}
          onCompleteQuiz={handleCompleteQuiz} 
        />;
      case 'results':
        return lastQuizResult && <QuizResultsView 
            result={lastQuizResult} 
            onReturnToDashboard={handleReturnToDashboard}
            onViewProgress={handleViewProgress}
        />;
      case 'progress':
          return <ProgressView 
              quizHistory={quizHistory}
              exams={exams}
              onReturnToDashboard={handleReturnToDashboard}
              onClearProgress={handleClearProgress}
          />;
      case 'dashboard':
        if (activeExam) {
            return <Dashboard 
                  examTitle={activeExam.title}
                  modules={activeExam.modules} 
                  onConfigureQuiz={handleConfigureQuiz} 
                  onViewProgress={handleViewProgress}
                  isAdmin={isAdmin}
                  onAdminLoginClick={() => setLoginModalOpen(true)}
                  onLogout={handleLogout}
                  onManageQuestions={handleManageQuestions}
                  onExportQuestions={handleExportQuestions}
                  onImportQuestions={handleImportQuestions}
                  onExportTopic={handleExportTopic}
                  onImportTopic={handleImportTopic}
                  moduleVisibility={moduleVisibility}
                  onToggleModuleVisibility={handleToggleModuleVisibility}
                  subTopicVisibility={subTopicVisibility}
                  onToggleSubTopicVisibility={handleToggleSubTopicVisibility}
                  contentPointVisibility={contentPointVisibility}
                  onToggleContentPointVisibility={handleToggleContentPointVisibility}
                  onAddModule={handleAddModule}
                  onEditModule={handleEditModule}
                  onAddSubTopic={handleAddSubTopic}
                  onEditSubTopic={handleEditSubTopic}
                  questionBank={questionBank}
                  onReturnToHome={handleReturnToHome}
                />;
        }
        // Fallback to home if no active exam
        setCurrentView('home');
        setActiveExamId(null);
        return null;

      case 'home':
      default:
        return <Home 
            exams={exams}
            onSelectExam={handleSelectExam}
            isAdmin={isAdmin}
            onAddExam={handleAddExam}
            onAdminLoginClick={() => setLoginModalOpen(true)}
            onLogout={handleLogout}
        />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-between p-4 sm:p-6 lg:p-8">
      <div className="flex-grow flex items-center justify-center w-full">
        {renderContent()}
      </div>
      <Footer />
      {isLoginModalOpen && <LoginView onLogin={handleAdminLogin} onClose={() => setLoginModalOpen(false)} />}
      {quizSettings.isOpen && quizSettings.module && (
        <QuizCustomizationModal
          isOpen={quizSettings.isOpen}
          onClose={() => setQuizSettings({ ...quizSettings, isOpen: false })}
          topicTitle={quizSettings.contentPoint || quizSettings.subTopic || ''}
          maxQuestions={quizSettings.availableQuestions}
          onStart={handleStartQuiz}
        />
      )}
    </div>
  );
};

export default App;