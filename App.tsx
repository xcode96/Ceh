
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import QuizView from './components/QuizView';
import QuizResultsView from './components/QuizResultsView';
import LoginView from './components/LoginView';
import QuestionManager from './components/QuestionManager';
import Home from './components/Home';
import Footer from './components/Footer';
import QuizCustomizationModal, { QuizStartConfig } from './components/QuizCustomizationModal';
import ProgressView from './components/ProgressView';
import LearningHub from './components/LearningHub';
import { INITIAL_EXAM_DATA } from './constants';
import { generateQuestionsForModule } from './services/geminiService';
import type { Module, QuestionBank, Question, Exam, SubTopic, QuizResult, QuizAttempt, DifficultyLevel, StudyResource } from './types';

type View = 'dashboard' | 'quiz' | 'results' | 'progress' | 'home' | 'learning-hub';

// Helper to generate unique key for subtopic locking
const getSubTopicLockKey = (moduleId: number, subTopicTitle: string) => `${moduleId}-${subTopicTitle}`;

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

  // Learning Hub Resources
  const [studyResources, setStudyResources] = useState<StudyResource[]>([]);

  // Admin and Question Bank State
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoginModalOpen, setLoginModalOpen] = useState(false);
  const [isQuestionManagerOpen, setQuestionManagerOpen] = useState(false);
  const [questionBank, setQuestionBank] = useState<QuestionBank>({});
  const [moduleVisibility, setModuleVisibility] = useState<{ [moduleId: number]: boolean }>({});
  const [subTopicVisibility, setSubTopicVisibility] = useState<{ [moduleId: number]: { [subTopic: string]: boolean } }>({});
  const [contentPointVisibility, setContentPointVisibility] = useState<{ [moduleId: number]: { [subTopic: string]: { [contentPoint: string]: boolean } } }>({});
  const [exams, setExams] = useState<Exam[]>([]);
  
  // Progression Locking State - Lazy Initialization from LocalStorage
  const [unlockedModules, setUnlockedModules] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem('unlockedModules');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error("Error loading unlockedModules", e);
      return [];
    }
  });

  const [unlockedSubTopics, setUnlockedSubTopics] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('unlockedSubTopics');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error("Error loading unlockedSubTopics", e);
      return [];
    }
  });

  const [quizSettings, setQuizSettings] = useState<{
    isOpen: boolean;
    module: Module | null;
    subTopic: string | null;
    contentPoint: string | null;
    availableQuestions: number;
  }>({ isOpen: false, module: null, subTopic: null, contentPoint: null, availableQuestions: 0 });

  const [generatingModuleId, setGeneratingModuleId] = useState<number | null>(null);
  const [generatingStatus, setGeneratingStatus] = useState<string>("");

  // Persistence Effects for Locking State
  useEffect(() => {
    localStorage.setItem('unlockedModules', JSON.stringify(unlockedModules));
  }, [unlockedModules]);

  useEffect(() => {
    localStorage.setItem('unlockedSubTopics', JSON.stringify(unlockedSubTopics));
  }, [unlockedSubTopics]);

  // Effect to set default unlocked content if everything is locked
  useEffect(() => {
    if (exams.length > 0) {
        // Default: Unlock 1st module of 1st exam if no modules are unlocked
        if (unlockedModules.length === 0 && exams[0].modules.length > 0) {
             const firstModId = exams[0].modules[0].id;
             setUnlockedModules([firstModId]);
        }

        // Default: Unlock 1st subtopic of 1st module if no subtopics are unlocked
        if (unlockedSubTopics.length === 0 && exams[0].modules.length > 0 && exams[0].modules[0].subTopics.length > 0) {
            const firstMod = exams[0].modules[0];
            const key = getSubTopicLockKey(firstMod.id, firstMod.subTopics[0].title);
            setUnlockedSubTopics([key]);
        }
    }
  }, [exams, unlockedModules.length, unlockedSubTopics.length]);

  // Load other data from local storage on initial render
  useEffect(() => {
    // Load Exams
    try {
        const savedExams = localStorage.getItem('exams');
        const loadedExams = savedExams ? JSON.parse(savedExams) : INITIAL_EXAM_DATA;
        setExams(loadedExams);
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
    
    // Load Study Resources
    try {
        const savedResources = localStorage.getItem('studyResources');
        if (savedResources) {
            setStudyResources(JSON.parse(savedResources));
        }
    } catch(error) {
        console.error("Failed to load study resources", error);
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
  
  // Effect to save resources
  useEffect(() => {
      if (studyResources.length > 0) {
          localStorage.setItem('studyResources', JSON.stringify(studyResources));
      }
  }, [studyResources]);

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

  const handleStartQuiz = useCallback((config: QuizStartConfig) => {
    if (!quizSettings.module || !quizSettings.subTopic) return;
    
    const { count, mode, shuffle, startIndex } = config;
    const { module, subTopic, contentPoint } = quizSettings;
    const topicIdentifier = getTopicIdentifier(subTopic, contentPoint);
    const allQuestions = questionBank[module.id]?.[topicIdentifier] || [];

    let selectedQuestions: Question[] = [];

    if (startIndex !== undefined) {
        // Daily / Sequential Mode: Select specific slice WITHOUT shuffling
        // Ensure we don't go out of bounds
        const end = Math.min(startIndex + count, allQuestions.length);
        selectedQuestions = allQuestions.slice(startIndex, end);
    } else {
        // Random Mode
        if (shuffle) {
             const shuffled = [...allQuestions].sort(() => 0.5 - Math.random());
             selectedQuestions = shuffled.slice(0, count);
        } else {
             selectedQuestions = allQuestions.slice(0, count);
        }
    }

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

      // --- UNLOCKING LOGIC ---
      // If user passes (score > 0 for now, can be strict > 70), unlock next section
      if (result.score > 0 && activeModule && activeSubTopic && !activeContentPoint) {
         // Find current hierarchy
         const currentExam = exams.find(e => e.modules.some(m => m.id === activeModule.id));
         if (currentExam) {
            const modIndex = currentExam.modules.findIndex(m => m.id === activeModule.id);
            const subIndex = activeModule.subTopics.findIndex(st => st.title === activeSubTopic);

            if (modIndex !== -1 && subIndex !== -1) {
                // 1. Is there a next Sub-Topic in THIS module?
                if (subIndex < activeModule.subTopics.length - 1) {
                    const nextSubTopic = activeModule.subTopics[subIndex + 1];
                    const key = getSubTopicLockKey(activeModule.id, nextSubTopic.title);
                    
                    if (!unlockedSubTopics.includes(key)) {
                        const newUnlockedSubs = [...unlockedSubTopics, key];
                        setUnlockedSubTopics(newUnlockedSubs);
                        // Persistence handled by useEffect
                        // alert(`Congratulations! You've unlocked the next sub-topic: ${nextSubTopic.title}`);
                    }
                } 
                // 2. No next sub-topic, is there a next Module?
                else if (modIndex < currentExam.modules.length - 1) {
                    const nextModule = currentExam.modules[modIndex + 1];
                    
                    let updatedModules = unlockedModules;
                    let updatedSubs = unlockedSubTopics;
                    let changed = false;

                    // Unlock Module
                    if (!unlockedModules.includes(nextModule.id)) {
                        updatedModules = [...unlockedModules, nextModule.id];
                        setUnlockedModules(updatedModules);
                        changed = true;
                    }

                    // Unlock First Sub-Topic of Next Module
                    if (nextModule.subTopics.length > 0) {
                        const nextSubKey = getSubTopicLockKey(nextModule.id, nextModule.subTopics[0].title);
                        if (!unlockedSubTopics.includes(nextSubKey)) {
                             updatedSubs = [...updatedSubs, nextSubKey];
                             setUnlockedSubTopics(updatedSubs);
                             changed = true;
                        }
                    }

                    if (changed) {
                        // alert(`Congratulations! You've completed ${activeModule.title} and unlocked ${nextModule.title}!`);
                    }
                }
            }
         }
      }
    }
    setLastQuizResult(result);
    setCurrentView('results');
  }, [activeModule, activeSubTopic, activeContentPoint, exams, unlockedModules, unlockedSubTopics]);

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
  
  const handleViewLearningHub = useCallback(() => {
      setCurrentView('learning-hub');
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

  const handleGenerateAIQuestions = async (count: number, difficulty: DifficultyLevel): Promise<Question[]> => {
      if (!activeModule || !activeSubTopic) return [];
      try {
        const generatedQuestions = await generateQuestionsForModule(
            activeModule.title, 
            activeModule.subTopics, 
            activeSubTopic, 
            activeContentPoint, 
            count,
            difficulty
        );
        
        // Assign unique IDs to generated questions
        const questionsWithIds: Question[] = generatedQuestions.map(q => ({
            ...q,
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9)
        }));
        
        return questionsWithIds;
      } catch (error) {
        console.error("Error generating questions:", error);
        throw error;
      }
  };

  const handleGenerateModuleQuestions = useCallback(async (module: Module) => {
    if (generatingModuleId !== null) return;
    
    const subTopicCount = module.subTopics.length;
    if (subTopicCount === 0) {
        alert("This module has no sub-topics.");
        return;
    }

    const confirmMsg = `🤖 Bulk AI Generation\n\nThis will generate 5 'Medium' difficulty questions for ALL ${subTopicCount} sub-topics in "${module.title}".\n\nTotal questions to generate: ${subTopicCount * 5}\nEstimated time: ~${Math.ceil(subTopicCount * 2 / 60)} minutes.\n\nContinue?`;
    
    if (!window.confirm(confirmMsg)) return;

    setGeneratingModuleId(module.id);
    setGeneratingStatus("Initializing...");

    try {
        const newBank = JSON.parse(JSON.stringify(questionBank)); // Deep copy
        if (!newBank[module.id]) newBank[module.id] = {};

        // Process sequentially to avoid rate limits
        for (let i = 0; i < module.subTopics.length; i++) {
            const subTopic = module.subTopics[i];
            setGeneratingStatus(`Processing: ${subTopic.title} (${i + 1}/${module.subTopics.length})`);
            
            try {
                const generatedQs = await generateQuestionsForModule(
                    module.title,
                    module.subTopics,
                    subTopic.title,
                    null,
                    5, // Count per sub-topic
                    'Medium' // Difficulty
                );

                const questionsWithIds = generatedQs.map(q => ({
                    ...q,
                    id: Date.now().toString() + Math.random().toString(36).substr(2, 9)
                }));

                const topicId = subTopic.title;
                // Append to existing
                newBank[module.id][topicId] = [
                    ...(newBank[module.id][topicId] || []),
                    ...questionsWithIds
                ];
            } catch (e) {
                console.error(`Error generating for sub-topic ${subTopic.title}:`, e);
            }
        }

        updateQuestionBank(newBank);
        setGeneratingStatus("Completed!");
        alert(`✅ Bulk generation complete for ${module.title}! Questions added to Question Bank.`);
    } catch (err) {
        console.error("Bulk generation error:", err);
        alert("An error occurred during bulk generation.");
    } finally {
        setGeneratingModuleId(null);
        setGeneratingStatus("");
    }
  }, [questionBank, updateQuestionBank, generatingModuleId]);

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
    // Transform ID-based bank to Title-based bank for portability
    // STRUCTURE AWARE EXPORT: Iterates through Exams to preserve structure of empty modules
    const titleBasedBank: Record<string, any> = {};
    
    // 1. Iterate through all exams and modules to build the structure
    exams.forEach(exam => {
        exam.modules.forEach(module => {
            const moduleQuestions: Record<string, Question[]> = {};
            
            // 1a. Get existing questions from the bank
            if (questionBank[module.id]) {
                Object.entries(questionBank[module.id]).forEach(([key, val]) => {
                    moduleQuestions[key] = val;
                });
            }
            
            // 1b. Ensure all SubTopics are present as keys, even if they have no questions
            module.subTopics.forEach(st => {
                // Ensure subtopic key exists
                if (!moduleQuestions[st.title]) {
                    moduleQuestions[st.title] = [];
                }
                // Ensure content point keys exist
                st.content.forEach(cp => {
                    const cpKey = `${st.title}::${cp}`;
                    if (!moduleQuestions[cpKey]) {
                        moduleQuestions[cpKey] = [];
                    }
                });
            });
            
            // 1c. Add to export object. 
            // Note: This assumes module titles are unique across exams or we accept merging.
            if (titleBasedBank[module.title]) {
                 titleBasedBank[module.title] = { ...titleBasedBank[module.title], ...moduleQuestions };
            } else {
                 titleBasedBank[module.title] = moduleQuestions;
            }
        });
    });
    
    // 2. Catch any orphan data (questions for modules that might have been deleted but persist in bank)
    const allModuleIds = new Set(exams.flatMap(e => e.modules.map(m => m.id)));
    Object.entries(questionBank).forEach(([moduleIdStr, topics]) => {
        const moduleId = parseInt(moduleIdStr);
        if (!allModuleIds.has(moduleId)) {
            titleBasedBank[`ID:${moduleId}`] = topics; 
        }
    });

    if (Object.keys(titleBasedBank).length === 0) {
        alert("No data to export.");
        return;
    }

    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(titleBasedBank, null, 2)
    )}`;
    const link = document.createElement("a");
    link.href = jsonString;
    link.download = "cyber-security-question-bank.json";
    link.click();
  }, [questionBank, exams]);

  const handleImportQuestions = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result;
        if (typeof text !== 'string') throw new Error("Failed to read file.");
        
        const importedData = JSON.parse(text);
        if (typeof importedData !== 'object' || importedData === null || Array.isArray(importedData)) {
             throw new Error("Invalid JSON format.");
        }

        // Deep copy current state to mutate
        const updatedExams = JSON.parse(JSON.stringify(exams));
        const updatedBank = { ...questionBank };
        let modulesAdded = 0;
        let subTopicsAdded = 0;
        
        // Visibility updates
        let newModuleVis = { ...moduleVisibility };
        let newSubTopicVis = JSON.parse(JSON.stringify(subTopicVisibility));
        let newContentPointVis = JSON.parse(JSON.stringify(contentPointVisibility));

        const allModules = updatedExams.flatMap((e: Exam) => e.modules);
        let maxModuleId = allModules.reduce((max: number, m: Module) => Math.max(max, m.id), 0);

        Object.entries(importedData).forEach(([key, topics]) => {
            // key is Module Title (or legacy ID)
            // topics is { "SubTopic": [...], "SubTopic::ContentPoint": [...] }
            
            let targetModule: Module | undefined;

            // 1. Try match by Title
            targetModule = updatedExams.flatMap((e: Exam) => e.modules).find((m: Module) => m.title === key);

            // 2. Try match by Legacy ID
            if (!targetModule && /^\d+$/.test(key)) {
                const id = parseInt(key, 10);
                targetModule = updatedExams.flatMap((e: Exam) => e.modules).find((m: Module) => m.id === id);
            }

            // 3. If not found, create new module (if we have an active exam to put it in)
            if (!targetModule && activeExamId) {
                 const activeExamIndex = updatedExams.findIndex((e: Exam) => e.id === activeExamId);
                 if (activeExamIndex !== -1) {
                     maxModuleId++;
                     const newModule: Module = {
                         id: maxModuleId,
                         title: key.startsWith('ID:') ? `Imported Module ${maxModuleId}` : key,
                         icon: 'folder', // Default icon
                         color: 'bg-gray-100 text-gray-600',
                         subTopics: []
                     };
                     updatedExams[activeExamIndex].modules.push(newModule);
                     targetModule = newModule;
                     modulesAdded++;
                     
                     // Init visibility
                     newModuleVis[newModule.id] = true;
                     newSubTopicVis[newModule.id] = {};
                     newContentPointVis[newModule.id] = {};
                 }
            }

            if (targetModule) {
                // Merge Questions
                updatedBank[targetModule.id] = { ...(updatedBank[targetModule.id] || {}), ...(topics as any) };

                // Sync Structure (SubTopics & Content Points)
                const importedTopics = topics as Record<string, any>;
                Object.keys(importedTopics).forEach(topicKey => {
                    const [subTopicTitle, contentPointTitle] = topicKey.split('::');
                    
                    // Ensure SubTopic exists
                    let subTopic = targetModule!.subTopics.find(st => st.title === subTopicTitle);
                    if (!subTopic) {
                        subTopic = { title: subTopicTitle, content: [] };
                        targetModule!.subTopics.push(subTopic);
                        subTopicsAdded++;
                        
                        // Init visibility
                        if (!newSubTopicVis[targetModule!.id]) newSubTopicVis[targetModule!.id] = {};
                        newSubTopicVis[targetModule!.id][subTopicTitle] = true;
                    }

                    // Ensure Content Point exists (if applicable)
                    if (contentPointTitle) {
                        if (!subTopic.content.includes(contentPointTitle)) {
                            subTopic.content.push(contentPointTitle);
                            
                            // Init visibility
                            if (!newContentPointVis[targetModule!.id]) newContentPointVis[targetModule!.id] = {};
                            if (!newContentPointVis[targetModule!.id][subTopicTitle]) newContentPointVis[targetModule!.id][subTopicTitle] = {};
                            newContentPointVis[targetModule!.id][subTopicTitle][contentPointTitle] = true;
                        }
                    }
                });
            }
        });

        // Commit updates
        setExams(updatedExams);
        updateQuestionBank(updatedBank);
        
        setModuleVisibility(newModuleVis);
        localStorage.setItem('moduleVisibility', JSON.stringify(newModuleVis));
        
        setSubTopicVisibility(newSubTopicVis);
        localStorage.setItem('subTopicVisibility', JSON.stringify(newSubTopicVis));
        
        setContentPointVisibility(newContentPointVis);
        localStorage.setItem('contentPointVisibility', JSON.stringify(newContentPointVis));

        alert(`Import successful!\n\nModules Added: ${modulesAdded}\nSub-topics synced: ${subTopicsAdded}`);

      } catch (error) {
        console.error("Import failed", error);
        alert("Failed to import. Check console for details.");
      }
      event.target.value = '';
    };
    reader.readAsText(file);
  }, [exams, questionBank, activeExamId, updateQuestionBank, moduleVisibility, subTopicVisibility, contentPointVisibility]);

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

  // Resource Handlers
  const handleAddResource = useCallback((resource: StudyResource) => {
      setStudyResources(prev => [resource, ...prev]);
  }, []);

  const handleDeleteResource = useCallback((id: string) => {
      if (window.confirm("Delete this resource?")) {
          setStudyResources(prev => prev.filter(r => r.id !== id));
      }
  }, []);
  
  const handleSelectExam = (examId: number) => {
    setActiveExamId(examId);
    setCurrentView('dashboard');
  };

  const handleReturnToHome = () => {
    setActiveExamId(null);
    setCurrentView('home');
  };

  // Unlock Code Handler
  const handleUnlockAllContent = useCallback((code: string) => {
    // Allow 'dqadm' OR 'adm' to be user-friendly
    if (code === 'dqadm' || code === 'adm') {
        const allModIds: number[] = [];
        const allSubKeys: string[] = [];

        exams.forEach(exam => {
            exam.modules.forEach(mod => {
                allModIds.push(mod.id);
                mod.subTopics.forEach(st => {
                    allSubKeys.push(getSubTopicLockKey(mod.id, st.title));
                });
            });
        });
        
        if (allModIds.length === 0) return;

        // Check if all modules are currently unlocked (checking length matching)
        // A more robust check would be every(id => unlockedModules.includes(id))
        const isFullyUnlocked = allModIds.every(id => unlockedModules.includes(id));

        if (isFullyUnlocked) {
            // TOGGLE OFF: Reset to default (First module/subtopic only)
            
            // Default logic: Unlock 1st of 1st
            const defaultModIds: number[] = [];
            const defaultSubKeys: string[] = [];
            
            if (exams.length > 0 && exams[0].modules.length > 0) {
                defaultModIds.push(exams[0].modules[0].id);
                if (exams[0].modules[0].subTopics.length > 0) {
                    defaultSubKeys.push(getSubTopicLockKey(exams[0].modules[0].id, exams[0].modules[0].subTopics[0].title));
                }
            }
            
            setUnlockedModules(defaultModIds);
            setUnlockedSubTopics(defaultSubKeys);
            localStorage.setItem('unlockedModules', JSON.stringify(defaultModIds));
            localStorage.setItem('unlockedSubTopics', JSON.stringify(defaultSubKeys));
            alert("🔒 Modules have been LOCKED (Reset to default).");

        } else {
            // TOGGLE ON: Unlock everything
            setUnlockedModules(allModIds);
            setUnlockedSubTopics(allSubKeys);
            // Force explicit save to localStorage immediately to prevent refresh issues
            localStorage.setItem('unlockedModules', JSON.stringify(allModIds));
            localStorage.setItem('unlockedSubTopics', JSON.stringify(allSubKeys));
            alert("🔓 Success! All modules and sub-topics have been UNLOCKED.");
        }

    } else {
        alert("Invalid unlock code. Try 'dqadm' or 'adm'.");
    }
  }, [exams, unlockedModules]);

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
        onGenerateAI={handleGenerateAIQuestions}
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
      case 'learning-hub':
          return <LearningHub 
            exams={exams}
            resources={studyResources}
            isAdmin={isAdmin}
            onAddResource={handleAddResource}
            onDeleteResource={handleDeleteResource}
            onReturnToHome={handleReturnToHome}
          />;
      case 'dashboard':
        if (activeExam) {
            return <Dashboard 
                  examTitle={activeExam.title}
                  modules={activeExam.modules} 
                  onConfigureQuiz={handleConfigureQuiz} 
                  onViewProgress={handleViewProgress}
                  onViewLearningHub={handleViewLearningHub}
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
                  onGenerateModuleAI={handleGenerateModuleQuestions}
                  generatingModuleId={generatingModuleId}
                  generatingStatus={generatingStatus}
                  unlockedModules={unlockedModules}
                  unlockedSubTopics={unlockedSubTopics}
                  onUnlockCode={handleUnlockAllContent}
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
            onViewLearningHub={handleViewLearningHub}
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
