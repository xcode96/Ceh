
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
    } catch (error) {
      alert("Failed to generate questions. Please check your API key or try again later.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleBulkGenerate = async () => {
    setIsGenerating(true);
    try {
      // Run sequentially to avoid hitting API rate limits
      const r1 = await onGenerateAI(10, 'Low');
      const r2 = await onGenerateAI(10, 'Medium');
      const r3 = await onGenerateAI(10, 'Advanced');

      const newQs = [...r1, ...r2, ...r3];

      setQuestions(prev => [...prev, ...newQs]);
    } catch (error) {
      console.error("Bulk generation error", error);
      alert("Error generating bulk questions. The API rate limit may have been reached. Please try generating fewer questions manually.");
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
        <div className="glass-card bg-indigo-500/10 p-5 sm:p-6 rounded-2xl border border-indigo-500/20 mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>

          <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
            <Icon iconName="sparkles" className="h-5 w-5 text-indigo-400" />
            AI Question Generator
          </h3>
          <p className="text-sm text-gray-400 mb-6">Automatically generate unique, high-quality questions for this topic using AI.</p>

          <div className="flex flex-col sm:flex-row items-end gap-4 relative z-10">
            <div className="flex-1 max-w-xs w-full">
              <label className="block text-xs font-bold text-indigo-300 uppercase tracking-wider mb-1.5 ">How many?</label>
              <input
                type="number"
                min="1"
                max="20"
                value={aiGenCount}
                onChange={(e) => setAiGenCount(parseInt(e.target.value) || 0)}
                className="w-full px-4 py-2.5 glass-input bg-gray-900/50 border border-indigo-500/30 rounded-lg text-white focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-400 focus:outline-none transition-all placeholder-gray-600"
              />
            </div>
            <div className="flex-1 max-w-xs w-full">
              <label className="block text-xs font-bold text-indigo-300 uppercase tracking-wider mb-1.5">Difficulty</label>
              <select
                value={aiDifficulty}
                onChange={(e) => setAiDifficulty(e.target.value as DifficultyLevel)}
                className="w-full px-4 py-2.5 glass-input bg-gray-900/50 border border-indigo-500/30 rounded-lg text-white focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-400 focus:outline-none transition-all appearance-none cursor-pointer"
              >
                <option value="Low" className="bg-gray-900">Low (Easy)</option>
                <option value="Medium" className="bg-gray-900">Medium (Intermediate)</option>
                <option value="Advanced" className="bg-gray-900">Advanced (Hard)</option>
              </select>
            </div>
            <button
              onClick={handleAiGenerate}
              disabled={isGenerating}
              className="w-full sm:w-auto px-6 py-2.5 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-500 transition-all shadow-[0_0_15px_rgba(79,70,229,0.3)] disabled:bg-indigo-800/50 disabled:text-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isGenerating ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-indigo-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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
          <div className="mt-5 pt-5 border-t border-white/10 relative z-10">
            <button
              onClick={handleBulkGenerate}
              disabled={isGenerating}
              className="w-full py-3 glass-button text-indigo-300 font-semibold rounded-lg hover:bg-indigo-500/10 hover:text-white hover:border-indigo-500/40 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm text-sm sm:text-base"
            >
              {isGenerating ? (
                <span className="flex items-center gap-2">
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

        <div className="space-y-3 mb-6">
          {questions.map((q, index) => (
            <div key={q.id} className="p-4 glass-card rounded-xl flex justify-between items-center bg-white/5 border border-white/5 hover:bg-white/10 transition-colors group">
              <div className="flex-1 pr-4">
                <p className="text-gray-300 text-sm sm:text-base"><span className="font-bold text-indigo-400 mr-2">{index + 1}.</span> {q.question}</p>
                {q.difficulty && (
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full mt-2 inline-block uppercase tracking-wider border ${q.difficulty === 'Advanced' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                      q.difficulty === 'Medium' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
                        'bg-green-500/10 text-green-400 border-green-500/20'
                    }`}>
                    {q.difficulty}
                  </span>
                )}
              </div>
              <div className="flex flex-col sm:flex-row gap-2 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => setEditingQuestion(q)} className="p-2 rounded-full text-blue-400 hover:bg-blue-500/20 hover:text-blue-300 transition-colors" title="Edit">
                  <Icon iconName="edit" className="h-4 w-4" />
                </button>
                <button onClick={() => handleDeleteQuestion(q.id)} className="p-2 rounded-full text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-colors" title="Delete">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
              </div>
            </div>
          ))}
        </div>

        {questions.length === 0 && (
          <div className="text-center py-10 px-6 rounded-xl border border-dashed border-gray-700 bg-gray-900/30">
            <p className="text-gray-500 mb-2">No questions defined for this sub-topic yet.</p>
            <p className="text-xs text-gray-600">Use the AI Generator or add one manually.</p>
          </div>
        )}

        <button onClick={() => setIsAdding(true)} className="w-full mt-4 py-3.5 border-2 border-dashed border-gray-700 text-gray-500 font-semibold rounded-xl hover:bg-indigo-500/10 hover:text-indigo-400 hover:border-indigo-500/40 transition-all flex items-center justify-center gap-2">
          <Icon iconName="plus" className="h-5 w-5" />
          Add New Question Manually
        </button>
      </>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto glass-panel rounded-3xl flex flex-col overflow-hidden text-gray-200" style={{ minHeight: '85vh' }}>
      <header className="p-6 sm:p-8 border-b border-white/10 bg-gray-900/50 backdrop-blur-md">
        <h1 className="text-xl sm:text-2xl font-bold text-white mb-1">Manage Questions</h1>
        <p className="text-gray-400 text-sm sm:text-base">{module.title}: <span className="font-semibold text-indigo-400">{contentPoint ? `${subTopic} > ${contentPoint}` : subTopic}</span></p>
      </header>
      <main className="flex-1 p-6 sm:p-8 overflow-y-auto custom-scrollbar">
        {renderContent()}
      </main>
      <footer className="p-6 sm:p-8 border-t border-white/10 flex justify-end gap-3 bg-gray-900/50 backdrop-blur-md">
        <button onClick={onClose} className="px-5 py-2.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-colors font-medium">Cancel</button>
        <button onClick={handleSaveChanges} className="px-6 py-2.5 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-500 shadow-[0_0_15px_rgba(79,70,229,0.3)] transition-all">Save & Close</button>
      </footer>
    </div>
  );
};

export default QuestionManager;
