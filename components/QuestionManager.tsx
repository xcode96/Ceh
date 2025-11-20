import React, { useState } from 'react';
import type { Module, Question, DifficultyLevel } from '../types';
import QuestionForm from './QuestionForm';
import Icon from './Icon';

interface QuestionManagerProps {
  module: Module;
  subTopic: string;
  contentPoint?: string | null;
  initialQuestions: Question[];
  onSave: (questions: Question[]) => void;
  onClose: () => void;
  onGenerateAI: (count: number, difficulty: DifficultyLevel) => Promise<Question[]>;
}

const QuestionManager: React.FC<QuestionManagerProps> = ({ module, subTopic, contentPoint, initialQuestions, onSave, onClose, onGenerateAI }) => {
  const [questions, setQuestions] = useState<Question[]>(initialQuestions);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [aiGenCount, setAiGenCount] = useState(10);
  const [aiDifficulty, setAiDifficulty] = useState<DifficultyLevel>('Medium');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleAddOrUpdateQuestion = (question: Question) => {
    let updatedQuestions;
    const existingIndex = questions.findIndex(q => q.id === question.id);
    if (existingIndex > -1) {
      updatedQuestions = [...questions];
      updatedQuestions[existingIndex] = question;
    } else {
      updatedQuestions = [...questions, question];
    }
    setQuestions(updatedQuestions);
    setEditingQuestion(null);
    setIsAdding(false);
  };
  
  const handleDeleteQuestion = (questionId: string) => {
    if (window.confirm("Are you sure you want to delete this question?")) {
        setQuestions(questions.filter(q => q.id !== questionId));
    }
  };
  
  const handleSaveChanges = () => {
    onSave(questions);
    onClose();
  };
  
  const handleAiGenerate = async () => {
      if (aiGenCount < 1 || aiGenCount > 20) {
          alert("Please enter a number between 1 and 20.");
          return;
      }
      setIsGenerating(true);
      try {
          const newQuestions = await onGenerateAI(aiGenCount, aiDifficulty);
          setQuestions(prev => [...prev, ...newQuestions]);
          alert(`Successfully generated ${newQuestions.length} ${aiDifficulty} questions! Don't forget to click 'Save & Close'.`);
      } catch (error) {
          alert("Failed to generate questions. Please check your API key or try again later.");
      } finally {
          setIsGenerating(false);
      }
  };

  const handleBulkGenerate = async () => {
    setIsGenerating(true);
    try {
        const p1 = onGenerateAI(10, 'Low');
        const p2 = onGenerateAI(10, 'Medium');
        const p3 = onGenerateAI(10, 'Advanced');
        
        const [r1, r2, r3] = await Promise.all([p1, p2, p3]);
        const newQs = [...r1, ...r2, ...r3];
        
        setQuestions(prev => [...prev, ...newQs]);
        alert(`Successfully generated 30 questions (10 Low, 10 Medium, 10 Advanced)!`);
    } catch (error) {
        console.error("Bulk generation error", error);
        alert("Error generating bulk questions. Ensure your API key is valid and try again.");
    } finally {
        setIsGenerating(false);
    }
  };

  const renderContent = () => {
    if (isAdding || editingQuestion) {
      return <QuestionForm 
        initialQuestion={editingQuestion}
        onSubmit={handleAddOrUpdateQuestion}
        onCancel={() => { setIsAdding(false); setEditingQuestion(null); }}
      />
    }
    return (
      <>
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-xl border border-indigo-100 mb-6">
            <h3 className="text-lg font-bold text-indigo-900 mb-2 flex items-center gap-2">
                <Icon iconName="sparkles" className="h-5 w-5 text-indigo-600" />
                AI Question Generator
            </h3>
            <p className="text-sm text-indigo-700 mb-4">Automatically generate unique, high-quality questions for this topic using AI.</p>
            
            <div className="flex flex-col sm:flex-row items-end gap-4">
                <div className="flex-1 max-w-xs w-full">
                    <label className="block text-xs font-bold text-indigo-800 uppercase tracking-wider mb-1">How many?</label>
                    <input 
                        type="number" 
                        min="1" 
                        max="20" 
                        value={aiGenCount}
                        onChange={(e) => setAiGenCount(parseInt(e.target.value) || 0)}
                        className="w-full px-4 py-2 border border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                </div>
                <div className="flex-1 max-w-xs w-full">
                    <label className="block text-xs font-bold text-indigo-800 uppercase tracking-wider mb-1">Difficulty</label>
                    <select
                        value={aiDifficulty}
                        onChange={(e) => setAiDifficulty(e.target.value as DifficultyLevel)}
                        className="w-full px-4 py-2 border border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
                    >
                        <option value="Low">Low (Easy)</option>
                        <option value="Medium">Medium (Intermediate)</option>
                        <option value="Advanced">Advanced (Hard)</option>
                    </select>
                </div>
                <button 
                    onClick={handleAiGenerate}
                    disabled={isGenerating}
                    className="w-full sm:w-auto px-6 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-indigo-300 flex items-center justify-center gap-2"
                >
                    {isGenerating ? (
                        <>
                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Generating...
                        </>
                    ) : (
                        <>
                            <Icon iconName="sparkles" className="h-5 w-5" />
                            Generate
                        </>
                    )}
                </button>
            </div>
            
            {/* Bulk Generation Section */}
            <div className="mt-4 pt-4 border-t border-indigo-200/50">
                <button 
                    onClick={handleBulkGenerate}
                    disabled={isGenerating}
                    className="w-full py-2.5 bg-white border border-indigo-200 text-indigo-700 font-semibold rounded-lg hover:bg-indigo-50 hover:border-indigo-300 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
                >
                    {isGenerating ? (
                         <span className="flex items-center gap-2">
                            <svg className="animate-spin h-4 w-4 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Generating Balanced Set...
                         </span>
                    ) : (
                        <>
                            <Icon iconName="sparkles" className="h-4 w-4" />
                            Auto-Generate 30 Questions (10 Low, 10 Med, 10 Adv)
                        </>
                    )}
                </button>
            </div>
        </div>

        <div className="space-y-3">
            {questions.map((q, index) => (
            <div key={q.id} className="p-4 bg-gray-50 rounded-lg flex justify-between items-center border border-gray-200">
                <div className="flex-1 pr-4">
                    <p className="text-gray-700"><span className="font-bold text-gray-500 mr-2">{index + 1}.</span> {q.question}</p>
                    {q.difficulty && (
                         <span className={`text-xs px-2 py-0.5 rounded-full mt-1 inline-block ${
                             q.difficulty === 'Advanced' ? 'bg-red-100 text-red-700' : 
                             q.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' : 
                             'bg-green-100 text-green-800'
                         }`}>
                             {q.difficulty}
                         </span>
                    )}
                </div>
                <div className="flex gap-2 flex-shrink-0">
                <button onClick={() => setEditingQuestion(q)} className="px-3 py-1 text-sm font-semibold text-blue-700 bg-blue-100 rounded-full hover:bg-blue-200 transition-colors">Edit</button>
                <button onClick={() => handleDeleteQuestion(q.id)} className="px-3 py-1 text-sm font-semibold text-red-700 bg-red-100 rounded-full hover:bg-red-200 transition-colors">Delete</button>
                </div>
            </div>
            ))}
        </div>
        
        {questions.length === 0 && <p className="text-center text-gray-500 py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">No questions defined for this sub-topic yet. Use the AI Generator above or add one manually.</p>}
        
        <button onClick={() => setIsAdding(true)} className="w-full mt-6 py-3 border-2 border-dashed border-gray-300 text-gray-600 font-semibold rounded-lg hover:bg-gray-50 hover:text-indigo-600 hover:border-indigo-300 transition-all">
          + Add New Question Manually
        </button>
      </>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto bg-white rounded-2xl shadow-xl flex flex-col overflow-hidden" style={{ minHeight: '90vh' }}>
      <header className="p-6 border-b border-gray-200 bg-gray-50">
        <h1 className="text-2xl font-bold text-gray-800">Manage Questions</h1>
        <p className="text-gray-500">{module.title}: <span className="font-semibold text-gray-700">{contentPoint ? `${subTopic} > ${contentPoint}` : subTopic}</span></p>
      </header>
      <main className="flex-1 p-6 overflow-y-auto">
        {renderContent()}
      </main>
      <footer className="p-6 border-t border-gray-200 flex justify-end gap-4 bg-gray-50">
        <button onClick={onClose} className="px-6 py-2 bg-white border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors">Cancel</button>
        <button onClick={handleSaveChanges} className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors shadow-md">Save & Close</button>
      </footer>
    </div>
  );
};

export default QuestionManager;