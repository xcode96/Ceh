import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
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
import { INITIAL_EXAM_DATA, INITIAL_QUESTION_BANK } from './constants';
import { generateQuestionsForModule } from './services/geminiService';
import type { Module, QuestionBank, Question, Exam, SubTopic, QuizResult, QuizAttempt, DifficultyLevel, StudyResource } from './types';
import JSZip from 'jszip';
import Icon from './components/Icon';

import Dock from './components/Dock';

type View = 'dashboard' | 'quiz' | 'results' | 'progress' | 'home' | 'learning-hub';

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
    const [quizSettings, setQuizSettings] = useState<{
        isOpen: boolean;
        module: Module | null;
        subTopic: string | null;
        contentPoint: string | null;
        availableQuestions: number;
    }>({ isOpen: false, module: null, subTopic: null, contentPoint: null, availableQuestions: 0 });

    const [generatingModuleId, setGeneratingModuleId] = useState<number | null>(null);
    const [generatingStatus, setGeneratingStatus] = useState<string>("");

    // Locking State
    const [unlockedModules, setUnlockedModules] = useState<number[]>([]);
    const [unlockedSubTopics, setUnlockedSubTopics] = useState<string[]>([]);

    // Sync State
    const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'synced' | 'error'>('idle');

    // Refs for state access in async operations
    const questionBankRef = useRef(questionBank);
    const examsRef = useRef(exams);

    // Keep refs in sync
    useEffect(() => {
        questionBankRef.current = questionBank;
    }, [questionBank]);

    useEffect(() => {
        examsRef.current = exams;
    }, [exams]);

    // Helper to generate unique key for sub-topic locking
    const getSubTopicLockKey = (moduleId: number, subTopicTitle: string) => `${moduleId}-${subTopicTitle}`;

    // Initialize Data
    useEffect(() => {
        // Load Exams
        try {
            const savedExams = localStorage.getItem('exams');
            setExams(savedExams ? JSON.parse(savedExams) : INITIAL_EXAM_DATA);
        } catch (e) {
            console.error("Failed to load exams from local storage", e);
            setExams(INITIAL_EXAM_DATA);
        }

        // Load Question Bank
        try {
            const savedBank = localStorage.getItem('questionBank');
            if (savedBank) {
                setQuestionBank(JSON.parse(savedBank));
            } else {
                setQuestionBank(INITIAL_QUESTION_BANK);
            }
        } catch (error) {
            console.error("Failed to load question bank from local storage:", error);
            setQuestionBank(INITIAL_QUESTION_BANK);
        }

        // Load Quiz History
        try {
            const savedHistory = localStorage.getItem('quizHistory');
            if (savedHistory) {
                setQuizHistory(JSON.parse(savedHistory));
            }
        } catch (error) {
            console.error("Failed to load quiz history from local storage", error);
        }

        // Load Study Resources
        try {
            const savedResources = localStorage.getItem('studyResources');
            if (savedResources) {
                setStudyResources(JSON.parse(savedResources));
            }
        } catch (error) {
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
            setModuleVisibility(allModules.reduce((acc, module) => ({ ...acc, [module.id]: true }), {}));
        }

        // Load Sub-Topic Visibility
        try {
            const savedSubTopicVisibility = localStorage.getItem('subTopicVisibility');
            const initialSubTopicVisibility = allModules.reduce((acc, module) => {
                acc[module.id] = module.subTopics.reduce((subAcc, topic) => {
                    subAcc[topic.title] = true;
                    return subAcc;
                }, {} as { [subTopic: string]: boolean });
                return acc;
            }, {} as { [moduleId: number]: { [subTopic: string]: boolean } });

            if (savedSubTopicVisibility) {
                const parsed = JSON.parse(savedSubTopicVisibility);
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
                        contentAcc[point] = true;
                        return contentAcc;
                    }, {} as { [contentPoint: string]: boolean });
                    return subAcc;
                }, {} as { [subTopic: string]: { [contentPoint: string]: boolean } });
                return acc;
            }, {} as { [moduleId: number]: { [subTopic: string]: { [contentPoint: string]: boolean } } });

            if (savedContentPointVisibility) {
                const parsed = JSON.parse(savedContentPointVisibility);
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
            const defaultVisibility = allModules.reduce((acc, module) => {
                acc[module.id] = module.subTopics.reduce((subAcc, topic) => {
                    subAcc[topic.title] = topic.content.reduce((contentAcc, point) => ({ ...contentAcc, [point]: true }), {});
                    return subAcc;
                }, {} as { [subTopic: string]: { [contentPoint: string]: boolean } });
                return acc;
            }, {} as { [moduleId: number]: { [subTopic: string]: { [contentPoint: string]: boolean } } });
            setContentPointVisibility(defaultVisibility);
        }

        // Load Unlocked State
        try {
            const savedUnlockedModules = localStorage.getItem('unlockedModules');
            if (savedUnlockedModules) {
                setUnlockedModules(JSON.parse(savedUnlockedModules));
            } else {
                // Unlock first module of EACH exam by default
                const initialUnlockedModules = INITIAL_EXAM_DATA.map(exam => exam.modules[0]?.id).filter(id => id !== undefined);
                setUnlockedModules(initialUnlockedModules);
            }

            const savedUnlockedSubTopics = localStorage.getItem('unlockedSubTopics');
            if (savedUnlockedSubTopics) {
                setUnlockedSubTopics(JSON.parse(savedUnlockedSubTopics));
            } else {
                // Unlock first subtopic of first module of EACH exam
                const initialUnlockedSubTopics = INITIAL_EXAM_DATA.map(exam => {
                    const firstMod = exam.modules[0];
                    if (firstMod && firstMod.subTopics.length > 0) {
                        return getSubTopicLockKey(firstMod.id, firstMod.subTopics[0].title);
                    }
                    return null;
                }).filter((key): key is string => key !== null);

                setUnlockedSubTopics(initialUnlockedSubTopics);
            }
        } catch (error) {
            console.error("Failed to load lock state", error);
        }

    }, []);

    // Persistence Effects
    useEffect(() => {
        if (exams.length > 0) localStorage.setItem('exams', JSON.stringify(exams));
    }, [exams]);

    useEffect(() => {
        localStorage.setItem('quizHistory', JSON.stringify(quizHistory));
    }, [quizHistory]);

    useEffect(() => {
        if (studyResources.length > 0) localStorage.setItem('studyResources', JSON.stringify(studyResources));
    }, [studyResources]);

    useEffect(() => {
        if (unlockedModules.length > 0) localStorage.setItem('unlockedModules', JSON.stringify(unlockedModules));
    }, [unlockedModules]);

    useEffect(() => {
        if (unlockedSubTopics.length > 0) localStorage.setItem('unlockedSubTopics', JSON.stringify(unlockedSubTopics));
    }, [unlockedSubTopics]);

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

        const { module, subTopic, contentPoint } = quizSettings;
        const topicIdentifier = getTopicIdentifier(subTopic, contentPoint);
        const allQuestions = questionBank[module.id]?.[topicIdentifier] || [];

        let selectedQuestions: Question[] = [];

        if (config.mode === 'exam') {
            // Exam Mode: Take ALL questions
            selectedQuestions = [...allQuestions].sort(() => 0.5 - Math.random());
        } else if (config.startIndex !== undefined) {
            // Daily / Sequential Mode
            const end = Math.min(config.startIndex + config.count, allQuestions.length);
            selectedQuestions = allQuestions.slice(config.startIndex, end);
        } else {
            // Random Study Mode
            const shuffled = [...allQuestions].sort(() => 0.5 - Math.random());
            selectedQuestions = shuffled.slice(0, config.count);
        }

        setActiveModule(module);
        setActiveSubTopic(subTopic);
        setActiveContentPoint(contentPoint);
        setActiveQuizQuestions(selectedQuestions);
        setActiveQuizMode(config.mode);
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

            // Progression Logic
            if (activeQuizMode === 'exam' && result.score >= 80) {
                const currentExam = exams.find(e => e.modules.some(m => m.id === activeModule.id));
                if (currentExam && activeSubTopic) {
                    const currentModuleIndex = currentExam.modules.findIndex(m => m.id === activeModule.id);
                    const currentSubTopicIndex = activeModule.subTopics.findIndex(st => st.title === activeSubTopic);

                    if (currentModuleIndex !== -1 && currentSubTopicIndex !== -1) {
                        // Check if there's a next sub-topic
                        if (currentSubTopicIndex < activeModule.subTopics.length - 1) {
                            const nextSubTopic = activeModule.subTopics[currentSubTopicIndex + 1];
                            const lockKey = getSubTopicLockKey(activeModule.id, nextSubTopic.title);
                            if (!unlockedSubTopics.includes(lockKey)) {
                                setUnlockedSubTopics(prev => [...prev, lockKey]);
                                alert(`🎉 Congratulations! You've unlocked the next topic: ${nextSubTopic.title}`);
                            }
                        }
                        // If last sub-topic, check for next module
                        else if (currentModuleIndex < currentExam.modules.length - 1) {
                            const nextModule = currentExam.modules[currentModuleIndex + 1];
                            if (!unlockedModules.includes(nextModule.id)) {
                                setUnlockedModules(prev => [...prev, nextModule.id]);
                                // Also unlock first subtopic of next module
                                if (nextModule.subTopics.length > 0) {
                                    const lockKey = getSubTopicLockKey(nextModule.id, nextModule.subTopics[0].title);
                                    setUnlockedSubTopics(prev => [...prev, lockKey]);
                                }
                                alert(`🏆 Module Completed! You've unlocked the next module: ${nextModule.title}`);
                            }
                        }
                    }
                }
            }
        }
        setLastQuizResult(result);
        setCurrentView('results');
    }, [activeModule, activeSubTopic, activeContentPoint, exams, activeQuizMode, unlockedModules, unlockedSubTopics]);

    const handleUnlockAllContent = useCallback((code: string) => {
        const normalizedCode = code.trim().toLowerCase();

        // Global Unlock
        if (normalizedCode === 'dqadm' || normalizedCode === 'adm') {
            const allModuleIds = exams.flatMap(e => e.modules.map(m => m.id));

            // If already unlocked, reset to locked state (keep first modules)
            const isFullyUnlocked = allModuleIds.every(id => unlockedModules.includes(id));

            if (isFullyUnlocked) {
                const firstModuleIds = exams.map(e => e.modules[0]?.id).filter(id => id !== undefined);
                const firstSubTopicKeys = exams.map(e => {
                    const mod = e.modules[0];
                    return mod && mod.subTopics.length > 0 ? getSubTopicLockKey(mod.id, mod.subTopics[0].title) : null;
                }).filter((k): k is string => k !== null);

                setUnlockedModules(firstModuleIds);
                setUnlockedSubTopics(firstSubTopicKeys);
                alert("Content locked. Progress reset to default.");
            } else {
                // Unlock Everything
                setUnlockedModules(allModuleIds);
                const allSubTopicKeys = exams.flatMap(e => e.modules.flatMap(m => m.subTopics.map(st => getSubTopicLockKey(m.id, st.title))));
                setUnlockedSubTopics(allSubTopicKeys);
                alert("🔓 All content unlocked!");
            }
            return;
        }

        // Folder or Module Unlock
        let unlockedCount = 0;
        let newUnlockedModules = [...unlockedModules];
        let newUnlockedSubTopics = [...unlockedSubTopics];

        exams.forEach(exam => {
            // Check Exam Title (Folder)
            if (exam.title.toLowerCase() === normalizedCode) {
                exam.modules.forEach(m => {
                    if (!newUnlockedModules.includes(m.id)) {
                        newUnlockedModules.push(m.id);
                        unlockedCount++;
                    }
                    m.subTopics.forEach(st => {
                        const key = getSubTopicLockKey(m.id, st.title);
                        if (!newUnlockedSubTopics.includes(key)) newUnlockedSubTopics.push(key);
                    });
                });
            } else {
                // Check Module Titles
                exam.modules.forEach(m => {
                    if (m.title.toLowerCase() === normalizedCode) {
                        if (!newUnlockedModules.includes(m.id)) {
                            newUnlockedModules.push(m.id);
                            unlockedCount++;
                        }
                        m.subTopics.forEach(st => {
                            const key = getSubTopicLockKey(m.id, st.title);
                            if (!newUnlockedSubTopics.includes(key)) newUnlockedSubTopics.push(key);
                        });
                    }
                });
            }
        });

        if (unlockedCount > 0) {
            setUnlockedModules(newUnlockedModules);
            setUnlockedSubTopics(newUnlockedSubTopics);
            alert(`🔓 Unlocked content matching "${code}"`);
        } else {
            // Only alert failure if not one of the global codes
            if (normalizedCode !== 'dqadm' && normalizedCode !== 'adm') {
                // Optional: feedback for invalid code
            }
        }

    }, [exams, unlockedModules, unlockedSubTopics]);

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

    const handleDeleteModule = useCallback((moduleId: number) => {
        if (!window.confirm("Are you sure you want to delete this module? This action cannot be undone.")) return;

        setExams(prevExams =>
            prevExams.map(exam => ({
                ...exam,
                modules: exam.modules.filter(module => module.id !== moduleId)
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

    const handleDeleteSubTopic = useCallback((moduleId: number, subTopicTitle: string) => {
        if (!window.confirm("Are you sure you want to delete this sub-topic?")) return;

        setExams(prevExams =>
            prevExams.map(exam => ({
                ...exam,
                modules: exam.modules.map(module => {
                    if (module.id === moduleId) {
                        return {
                            ...module,
                            subTopics: module.subTopics.filter(st => st.title !== subTopicTitle)
                        };
                    }
                    return module;
                })
            }))
        );
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

    const handleDeleteExam = useCallback((examId: number) => {
        if (!window.confirm("Are you sure you want to delete this entire Exam Folder? This will remove all contained modules and questions.")) return;
        setExams(prevExams => prevExams.filter(e => e.id !== examId));
    }, []);

    const handleEditExam = useCallback((examId: number, title: string, description: string) => {
        setExams(prevExams => prevExams.map(e =>
            e.id === examId ? { ...e, title: title.trim(), description: description.trim() } : e
        ));
    }, []);

    const handleExportQuestions = useCallback(() => {
        // Ensure we export based on current structure, including empty modules if any
        const titleBasedBank: Record<string, any> = {};
        const allModules = examsRef.current.flatMap(e => e.modules);
        const currentBank = questionBankRef.current;

        allModules.forEach(module => {
            const moduleQuestions = currentBank[module.id] || {};
            titleBasedBank[module.title] = moduleQuestions;

            // Ensure subtopics are represented even if empty
            module.subTopics.forEach(st => {
                if (!titleBasedBank[module.title][st.title]) {
                    titleBasedBank[module.title][st.title] = [];
                }
                st.content.forEach(cp => {
                    const cpKey = `${st.title}::${cp}`;
                    if (!titleBasedBank[module.title][cpKey]) {
                        titleBasedBank[module.title][cpKey] = [];
                    }
                });
            });
        });

        const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
            JSON.stringify(titleBasedBank, null, 2)
        )}`;
        const link = document.createElement("a");
        link.href = jsonString;
        link.download = "cyber-security-question-bank.json";
        link.click();
    }, []); // Refs are stable

    const handleExportSourceCode = useCallback(() => {
        const currentExams = examsRef.current;
        const currentBank = questionBankRef.current;

        const fileContent = `
import type { Module, Exam, QuestionBank } from './types';

// This file was auto-generated by the Admin 'Export as Source Code' feature.
// It contains the complete snapshot of your Exams, Modules, and Question Bank.

export const INITIAL_EXAM_DATA: Exam[] = ${JSON.stringify(currentExams, null, 4)};

export const INITIAL_QUESTION_BANK: QuestionBank = ${JSON.stringify(currentBank, null, 4)};
      `.trim();

        const blob = new Blob([fileContent], { type: 'text/typescript' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'constants.ts';
        link.click();
        URL.revokeObjectURL(url);
    }, []);

    const handleDownloadProject = useCallback(async () => {
        const zip = new JSZip();
        const currentExams = examsRef.current;
        const currentBank = questionBankRef.current;

        // Create updated constants.ts from current state
        const constantsContent = `import type { Module, Exam, QuestionBank } from './types';\n\nexport const INITIAL_EXAM_DATA: Exam[] = ${JSON.stringify(currentExams, null, 4)};\n\nexport const INITIAL_QUESTION_BANK: QuestionBank = ${JSON.stringify(currentBank, null, 4)};`;
        zip.file('constants.ts', constantsContent);

        // Files to attempt to fetch and add to zip
        const files = [
            'index.html', 'index.tsx', 'App.tsx', 'types.ts',
            'services/geminiService.ts',
            'components/Dashboard.tsx',
            'components/Footer.tsx',
            'components/Home.tsx',
            'components/Icon.tsx',
            'components/LearningHub.tsx',
            'components/LoginView.tsx',
            'components/ModuleListItem.tsx',
            'components/ProgressCircle.tsx',
            'components/ProgressView.tsx',
            'components/QuestionForm.tsx',
            'components/QuestionManager.tsx',
            'components/QuizCompletedView.tsx',
            'components/QuizCustomizationModal.tsx',
            'components/QuizResultsView.tsx',
            'components/QuizView.tsx'
        ];

        for (const file of files) {
            try {
                const res = await fetch(`/${file}`);
                if (res.ok) {
                    const text = await res.text();
                    zip.file(file, text);
                }
            } catch (e) {
                console.warn(`Could not add ${file} to zip`, e);
            }
        }

        // Generate zip
        const content = await zip.generateAsync({ type: "blob" });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(content);
        link.download = "cybersecurity-platform-project.zip";
        link.click();
    }, []);

    const processImportedData = useCallback((importedData: any) => {
        if (typeof importedData !== 'object' || importedData === null || Array.isArray(importedData)) {
            throw new Error("Invalid JSON format.");
        }

        // Use refs to get latest state
        const currentExams = examsRef.current;
        const currentBank = questionBankRef.current;

        const updatedExams = JSON.parse(JSON.stringify(currentExams));
        const updatedBank = { ...currentBank };

        let modulesAdded = 0;
        let subTopicsAdded = 0;

        // Visibility updates
        let newModuleVis = JSON.parse(localStorage.getItem('moduleVisibility') || '{}');
        let newSubTopicVis = JSON.parse(localStorage.getItem('subTopicVisibility') || '{}');
        let newContentPointVis = JSON.parse(localStorage.getItem('contentPointVisibility') || '{}');

        const allModules = updatedExams.flatMap((e: Exam) => e.modules);
        let maxModuleId = allModules.reduce((max: number, m: Module) => Math.max(max, m.id), 0);

        Object.entries(importedData).forEach(([key, topics]) => {
            // key is Module Title (or legacy ID)

            let targetModule: Module | undefined;

            // 1. Try match by Title
            targetModule = updatedExams.flatMap((e: Exam) => e.modules).find((m: Module) => m.title === key);

            // 2. Try match by Legacy ID
            if (!targetModule && /^\d+$/.test(key)) {
                const id = parseInt(key, 10);
                targetModule = updatedExams.flatMap((e: Exam) => e.modules).find((m: Module) => m.id === id);
            }

            // 3. Create new module if not found (Default to first exam or active exam)
            if (!targetModule) {
                // Default to the first exam if we don't have an active one context here easily, 
                // or if we want to import generally.
                // For now, let's put unknown modules in the first exam available or create a new "Imported" exam?
                // Better to put in the currently active exam if possible, but this function might run from global context.
                // Let's assume we add to the first exam for simplicity or find a generic one.
                let targetExam = updatedExams[0];
                if (!targetExam) {
                    // Should not happen if initialized correctly
                    targetExam = { id: 1, title: "Imported Exams", description: "Imported", modules: [] };
                    updatedExams.push(targetExam);
                }

                maxModuleId++;
                const newModule: Module = {
                    id: maxModuleId,
                    title: key.startsWith('ID:') ? `Imported Module ${maxModuleId}` : key,
                    icon: 'folder',
                    color: 'bg-gray-100 text-gray-600',
                    subTopics: []
                };
                targetExam.modules.push(newModule);
                targetModule = newModule;
                modulesAdded++;

                newModuleVis[newModule.id] = true;
                newSubTopicVis[newModule.id] = {};
                newContentPointVis[newModule.id] = {};
            }

            if (targetModule) {
                // Merge Questions
                const existingQs = updatedBank[targetModule.id] || {};
                const importedQs = topics as any;

                // Smart merge: only add questions if they don't exist (by ID check if possible, or simplistic merge)
                // For now, simple overwrite/merge
                updatedBank[targetModule.id] = { ...existingQs, ...importedQs };

                // Sync Structure
                const importedTopics = topics as Record<string, any>;
                Object.keys(importedTopics).forEach(topicKey => {
                    const [subTopicTitle, contentPointTitle] = topicKey.split('::');

                    let subTopic = targetModule!.subTopics.find(st => st.title === subTopicTitle);
                    if (!subTopic) {
                        subTopic = { title: subTopicTitle, content: [] };
                        targetModule!.subTopics.push(subTopic);
                        subTopicsAdded++;

                        if (!newSubTopicVis[targetModule!.id]) newSubTopicVis[targetModule!.id] = {};
                        newSubTopicVis[targetModule!.id][subTopicTitle] = true;
                    }

                    if (contentPointTitle) {
                        if (!subTopic.content.includes(contentPointTitle)) {
                            subTopic.content.push(contentPointTitle);

                            if (!newContentPointVis[targetModule!.id]) newContentPointVis[targetModule!.id] = {};
                            if (!newContentPointVis[targetModule!.id][subTopicTitle]) newContentPointVis[targetModule!.id][subTopicTitle] = {};
                            newContentPointVis[targetModule!.id][subTopicTitle][contentPointTitle] = true;
                        }
                    }
                });
            }
        });

        setExams(updatedExams);
        updateQuestionBank(updatedBank);

        setModuleVisibility(newModuleVis);
        localStorage.setItem('moduleVisibility', JSON.stringify(newModuleVis));

        setSubTopicVisibility(newSubTopicVis);
        localStorage.setItem('subTopicVisibility', JSON.stringify(newSubTopicVis));

        setContentPointVisibility(newContentPointVis);
        localStorage.setItem('contentPointVisibility', JSON.stringify(newContentPointVis));

        return { modulesAdded, subTopicsAdded };
    }, [updateQuestionBank]);

    const handleImportQuestions = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const text = e.target?.result;
                if (typeof text !== 'string') throw new Error("Failed to read file.");

                const importedData = JSON.parse(text);
                const { modulesAdded, subTopicsAdded } = processImportedData(importedData);

                alert(`Import successful!\n\nModules Added: ${modulesAdded}\nSub-topics synced: ${subTopicsAdded}`);

            } catch (error) {
                console.error("Import failed", error);
                alert("Failed to import. Check console for details.");
            }
            event.target.value = '';
        };
        reader.readAsText(file);
    }, [processImportedData]);

    // Auto-sync data.json on load
    useEffect(() => {
        const syncData = async () => {
            setSyncStatus('syncing');
            try {
                // Use timestamp to bust cache
                const response = await fetch(`data.json?t=${new Date().getTime()}`, {
                    cache: 'no-store',
                    headers: {
                        'Cache-Control': 'no-cache, no-store, must-revalidate',
                        'Pragma': 'no-cache',
                        'Expires': '0'
                    }
                });

                if (response.status === 404) {
                    // File not found is expected if user hasn't uploaded it yet. 
                    // Don't error out, just stay idle.
                    console.log("data.json not found on server. Skipping auto-sync.");
                    setSyncStatus('idle');
                    return;
                }

                if (!response.ok) throw new Error(`Failed to fetch data.json: ${response.statusText}`);

                const data = await response.json();
                processImportedData(data);
                setSyncStatus('synced');
                console.log("Auto-sync complete.");
            } catch (error) {
                console.error("Auto-sync failed:", error);
                setSyncStatus('error');
            }
        };

        // Small delay to ensure local storage load finishes first
        const timer = setTimeout(() => {
            syncData();
        }, 500);

        return () => clearTimeout(timer);
    }, [processImportedData]);

    const handleManualSync = useCallback(() => {
        setSyncStatus('syncing');
        fetch(`data.json?t=${new Date().getTime()}`, { cache: 'no-store' })
            .then(res => {
                if (res.status === 404) {
                    throw new Error("data.json not found");
                }
                if (!res.ok) throw new Error("Fetch failed");
                return res.json();
            })
            .then(data => {
                processImportedData(data);
                setSyncStatus('synced');
                alert("Sync complete!");
            })
            .catch(err => {
                console.error(err);
                setSyncStatus('idle');
                if (err.message === "data.json not found") {
                    alert("No 'data.json' file found on the server to sync with.\n\nPlease export your questions and upload the file to your server root.");
                } else {
                    alert("Sync failed. Check console for details.");
                    setSyncStatus('error');
                }
            });
    }, [processImportedData]);


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
                    const newBank: QuestionBank = { ...questionBank };

                    // Fix: explicitly handle type to avoid TS thinking it might be an array and complaining about {}
                    let currentModuleQuestions: Record<string, Question[]> = {};
                    if (newBank[module.id]) {
                        currentModuleQuestions = newBank[module.id] as unknown as Record<string, Question[]>;
                    }
                    const moduleQuestions: Record<string, Question[]> = { ...currentModuleQuestions };

                    moduleQuestions[topicIdentifier] = importedQuestions as unknown as Question[];
                    newBank[module.id] = moduleQuestions;
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
                        onExportSourceCode={handleExportSourceCode}
                        onDownloadProject={handleDownloadProject}
                        moduleVisibility={moduleVisibility}
                        onToggleModuleVisibility={handleToggleModuleVisibility}
                        subTopicVisibility={subTopicVisibility}
                        onToggleSubTopicVisibility={handleToggleSubTopicVisibility}
                        contentPointVisibility={contentPointVisibility}
                        onToggleContentPointVisibility={handleToggleContentPointVisibility}
                        onAddModule={handleAddModule}
                        onEditModule={handleEditModule}
                        onDeleteModule={handleDeleteModule}
                        onAddSubTopic={handleAddSubTopic}
                        onEditSubTopic={handleEditSubTopic}
                        onDeleteSubTopic={handleDeleteSubTopic}
                        questionBank={questionBank}
                        onReturnToHome={handleReturnToHome}
                        onGenerateModuleAI={handleGenerateModuleQuestions}
                        generatingModuleId={generatingModuleId}
                        generatingStatus={generatingStatus}
                        unlockedModules={unlockedModules}
                        unlockedSubTopics={unlockedSubTopics}
                        onUnlockCode={handleUnlockAllContent}
                        syncStatus={syncStatus}
                        onManualSync={handleManualSync}
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
                    onEditExam={handleEditExam}
                    onDeleteExam={handleDeleteExam}
                    onAdminLoginClick={() => setLoginModalOpen(true)}
                    onLogout={handleLogout}
                    onViewLearningHub={handleViewLearningHub}
                />;
        }
    };

    const dockItems = [
        {
            icon: <Icon iconName="home" className="h-6 w-6" />,
            label: "Home",
            onClick: handleReturnToHome
        },
        {
            icon: <Icon iconName="book-open" className="h-6 w-6" />,
            label: "Learning Hub",
            onClick: handleViewLearningHub
        },
        {
            icon: <Icon iconName={isAdmin ? "lock-open" : "lock"} className="h-6 w-6" />,
            label: isAdmin ? "Admin Logout" : "Admin Login",
            onClick: isAdmin ? handleLogout : () => setLoginModalOpen(true)
        },
        {
            icon: <Icon iconName="github" className="h-6 w-6" />,
            label: "GitHub",
            onClick: () => window.open("https://github.com/xcode96/", "_blank")
        }
    ];

    return (
        <div className="min-h-screen flex flex-col justify-between relative">
            <div className="flex-grow w-full">
                {renderContent()}
            </div>

            <Footer
                isAdmin={isAdmin}
                onAdminLogin={() => setLoginModalOpen(true)}
                onLogout={handleLogout}
            />





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