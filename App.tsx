import React, { useState, useMemo, useCallback, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import QuizView from './components/QuizView';
import QuizCompletedView from './components/QuizCompletedView';
import LoginView from './components/LoginView';
import QuestionManager from './components/QuestionManager';
import Home from './components/Home';
import { INITIAL_EXAM_DATA } from './constants';
import type { Module, QuestionBank, Question, Exam } from './types';

type View = 'dashboard' | 'quiz' | 'completed' | 'home';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('home');
  const [activeExamId, setActiveExamId] = useState<number | null>(null);
  const [activeModule, setActiveModule] = useState<Module | null>(null);
  const [activeSubTopic, setActiveSubTopic] = useState<string | null>(null);
  const [completedModules, setCompletedModules] = useState<Set<number>>(new Set());
  
  // Admin and Question Bank State
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoginModalOpen, setLoginModalOpen] = useState(false);
  const [isQuestionManagerOpen, setQuestionManagerOpen] = useState(false);
  const [questionBank, setQuestionBank] = useState<QuestionBank>({});
  const [moduleVisibility, setModuleVisibility] = useState<{ [moduleId: number]: boolean }>({});
  const [subTopicVisibility, setSubTopicVisibility] = useState<{ [moduleId: number]: { [subTopic: string]: boolean } }>({});
  const [exams, setExams] = useState<Exam[]>([]);

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
                subAcc[topic] = true; // Default all to visible
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
            acc[module.id] = module.subTopics.reduce((subAcc, topic) => ({ ...subAcc, [topic]: true }), {});
            return acc;
         }, {} as { [moduleId: number]: { [subTopic: string]: boolean } });
         setSubTopicVisibility(defaultVisibility);
    }

  }, []);

  // Effect to save exams to local storage whenever they change
  useEffect(() => {
    if (exams.length > 0) {
        localStorage.setItem('exams', JSON.stringify(exams));
    }
  }, [exams]);


  const handleStartQuiz = useCallback((module: Module, subTopic?: string) => {
    setActiveModule(module);
    setActiveSubTopic(subTopic || null);
    setCurrentView('quiz');
  }, []);

  const handleCompleteQuiz = useCallback((moduleId: number) => {
    if (!activeSubTopic) {
      setCompletedModules(prev => new Set(prev).add(moduleId));
    }
    setCurrentView('completed');
  }, [activeSubTopic]);

  const handleReturnToDashboard = useCallback(() => {
    setActiveModule(null);
    setActiveSubTopic(null);
    setQuestionManagerOpen(false);
    setCurrentView('dashboard');
  }, []);
  
  const handleResetProgress = useCallback(() => {
    setCompletedModules(new Set());
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
  
  const handleManageQuestions = useCallback((module: Module, subTopic: string) => {
    setActiveModule(module);
    setActiveSubTopic(subTopic);
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

  const handleSaveQuestions = (moduleId: number, subTopic: string, questions: Question[]) => {
      const newBank = { ...questionBank };
      if (!newBank[moduleId]) {
        newBank[moduleId] = {};
      }
      newBank[moduleId][subTopic] = questions;
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

    const handleAddSubTopic = useCallback((moduleId: number, subTopic: string) => {
        if (!subTopic || subTopic.trim() === '') return;

        setExams(prevExams => 
            prevExams.map(exam => ({
                ...exam,
                modules: exam.modules.map(module => {
                    if (module.id === moduleId) {
                        if (module.subTopics.includes(subTopic.trim())) {
                            alert("Sub-topic with this name already exists in this module.");
                            return module;
                        }
                        const updatedModule = {
                            ...module,
                            subTopics: [...module.subTopics, subTopic.trim()]
                        };

                        setSubTopicVisibility(prev => {
                            const newVisibility = JSON.parse(JSON.stringify(prev));
                            if (!newVisibility[moduleId]) newVisibility[moduleId] = {};
                            newVisibility[moduleId][subTopic.trim()] = true;
                            localStorage.setItem('subTopicVisibility', JSON.stringify(newVisibility));
                            return newVisibility;
                        });
                        
                        return updatedModule;
                    }
                    return module;
                })
            }))
        );
    }, []);
    
    const handleEditSubTopic = useCallback((moduleId: number, oldSubTopic: string, newSubTopic: string) => {
        const trimmedNewSubTopic = newSubTopic.trim();
        if (!trimmedNewSubTopic || oldSubTopic === trimmedNewSubTopic) return;

        let conflict = false;
        setExams(prevExams =>
            prevExams.map(exam => ({
                ...exam,
                modules: exam.modules.map(module => {
                    if (module.id === moduleId) {
                        if (module.subTopics.includes(trimmedNewSubTopic)) {
                            alert("A sub-topic with this name already exists in this module.");
                            conflict = true;
                            return module;
                        }
                        return {
                            ...module,
                            subTopics: module.subTopics.map(st => st === oldSubTopic ? trimmedNewSubTopic : st)
                        };
                    }
                    return module;
                })
            }))
        );
        
        if (conflict) return;

        setQuestionBank(prevBank => {
            const newBank = JSON.parse(JSON.stringify(prevBank));
            if (newBank[moduleId]?.[oldSubTopic]) {
                newBank[moduleId][trimmedNewSubTopic] = newBank[moduleId][oldSubTopic];
                delete newBank[moduleId][oldSubTopic];
                localStorage.setItem('questionBank', JSON.stringify(newBank));
            }
            return newBank;
        });

        setSubTopicVisibility(prevVisibility => {
            const newVisibility = JSON.parse(JSON.stringify(prevVisibility));
            if (newVisibility[moduleId]?.hasOwnProperty(oldSubTopic)) {
                newVisibility[moduleId][trimmedNewSubTopic] = newVisibility[moduleId][oldSubTopic];
                delete newVisibility[moduleId][oldSubTopic];
                localStorage.setItem('subTopicVisibility', JSON.stringify(newVisibility));
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

  const handleExportSubTopic = useCallback((module: Module, subTopic: string) => {
    const questionsToExport = questionBank[module.id]?.[subTopic];
    if (!questionsToExport || questionsToExport.length === 0) {
      alert(`No questions to export for ${subTopic}.`);
      return;
    }
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(questionsToExport, null, 2)
    )}`;
    const link = document.createElement("a");
    link.href = jsonString;
    const safeFilename = subTopic.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    link.download = `${safeFilename}_questions.json`;
    link.click();
  }, [questionBank]);

  const handleImportSubTopic = useCallback((event: React.ChangeEvent<HTMLInputElement>, module: Module, subTopic: string) => {
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
        
        // Validate that it's an array of questions
        if (Array.isArray(importedQuestions) && (importedQuestions.length === 0 || (
            importedQuestions[0].id && 
            importedQuestions[0].question &&
            Array.isArray(importedQuestions[0].options) &&
            importedQuestions[0].correctAnswer
        ))) {
            const newBank = { ...questionBank };
            if (!newBank[module.id]) {
                newBank[module.id] = {};
            }
            newBank[module.id][subTopic] = importedQuestions as Question[];
            updateQuestionBank(newBank);
            alert(`Successfully imported ${importedQuestions.length} questions for ${subTopic}.`);
        } else {
          throw new Error("Invalid JSON format. File must contain an array of questions.");
        }
      } catch (error) {
        const err = error as Error;
        console.error(`Failed to import questions for ${subTopic}:`, err);
        alert(`Failed to import questions. Please ensure the file is a valid JSON array of questions. Error: ${err.message}`);
      }
      // Reset file input so the same file can be selected again
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
      return <QuestionManager 
        module={activeModule}
        subTopic={activeSubTopic}
        initialQuestions={questionBank[activeModule.id]?.[activeSubTopic] || []}
        onSave={handleSaveQuestions}
        onClose={handleReturnToDashboard}
      />
    }

    switch (currentView) {
      case 'quiz':
        return activeModule && <QuizView module={activeModule} subTopic={activeSubTopic} questionBank={questionBank} onCompleteQuiz={handleCompleteQuiz} />;
      case 'completed':
        return activeModule && <QuizCompletedView moduleTitle={activeSubTopic || activeModule.title} onReturnToDashboard={handleReturnToDashboard} />;
      case 'dashboard':
        if (activeExam) {
            return <Dashboard 
                  examTitle={activeExam.title}
                  modules={activeExam.modules} 
                  completedModules={completedModules} 
                  onStartQuiz={handleStartQuiz} 
                  onResetProgress={handleResetProgress}
                  isAdmin={isAdmin}
                  onAdminLoginClick={() => setLoginModalOpen(true)}
                  onLogout={handleLogout}
                  onManageQuestions={handleManageQuestions}
                  onExportQuestions={handleExportQuestions}
                  onImportQuestions={handleImportQuestions}
                  onExportSubTopic={handleExportSubTopic}
                  onImportSubTopic={handleImportSubTopic}
                  moduleVisibility={moduleVisibility}
                  onToggleModuleVisibility={handleToggleModuleVisibility}
                  subTopicVisibility={subTopicVisibility}
                  onToggleSubTopicVisibility={handleToggleSubTopicVisibility}
                  onAddModule={handleAddModule}
                  onEditModule={handleEditModule}
                  onAddSubTopic={handleAddSubTopic}
                  onEditSubTopic={handleEditSubTopic}
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
    <div className="min-h-screen bg-gradient-to-br from-white to-purple-50 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      {renderContent()}
      {isLoginModalOpen && <LoginView onLogin={handleAdminLogin} onClose={() => setLoginModalOpen(false)} />}
    </div>
  );
};

export default App;
