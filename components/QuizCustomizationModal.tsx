
import React, { useState, useEffect } from 'react';
import Icon from './Icon';

export interface QuizStartConfig {
  count: number;
  mode: 'study' | 'exam';
  shuffle: boolean;
  startIndex?: number;
}

interface QuizCustomizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  topicTitle: string;
  maxQuestions: number;
  onStart: (config: QuizStartConfig) => void;
}

const QUESTIONS_PER_DAY = 10;

const QuizCustomizationModal: React.FC<QuizCustomizationModalProps> = ({
  isOpen,
  onClose,
  topicTitle,
  maxQuestions,
  onStart,
}) => {
  const [numQuestions, setNumQuestions] = useState(maxQuestions);
  const [mode, setMode] = useState<'study' | 'exam'>('study');
  const [quizType, setQuizType] = useState<'custom' | 'daily'>('custom');
  const [selectedDay, setSelectedDay] = useState<number>(1);
  const [error, setError] = useState('');

  const totalDays = Math.ceil(maxQuestions / QUESTIONS_PER_DAY);

  useEffect(() => {
    if (isOpen) {
      setNumQuestions(Math.min(maxQuestions, 10)); // Default to 10 or max
      setMode('study');
      setQuizType('custom');
      setSelectedDay(1);
      setError('');
    }
  }, [isOpen, maxQuestions]);

  // Enforce strict rules for Exam Mode
  useEffect(() => {
    if (mode === 'exam') {
      setNumQuestions(maxQuestions);
      setQuizType('custom');
      setError('');
    }
  }, [mode, maxQuestions]);

  const handleNumChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val === '') {
      setNumQuestions(0);
      setError('Please enter a number.');
      return;
    }

    const num = parseInt(val, 10);
    if (isNaN(num) || num < 1 || num > maxQuestions) {
      setError(`Please enter a number between 1 and ${maxQuestions}.`);
    } else {
      setError('');
    }
    setNumQuestions(num);
  };

  const handleSetMax = () => {
    setNumQuestions(maxQuestions);
    setError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (quizType === 'custom') {
      if (!error && numQuestions > 0) {
        onStart({ count: numQuestions, mode, shuffle: true });
      }
    } else {
      // Daily Challenge logic
      const startIndex = (selectedDay - 1) * QUESTIONS_PER_DAY;
      const remaining = maxQuestions - startIndex;
      const count = Math.min(QUESTIONS_PER_DAY, remaining);

      if (count > 0) {
        onStart({ count, mode, shuffle: false, startIndex });
      }
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="glass-panel w-full max-w-lg p-6 sm:p-8 rounded-2xl relative shadow-2xl border border-white/10">
        {/* Background Glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>

        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors z-10 p-1">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>

        <h2 className="text-xl sm:text-2xl font-bold text-center text-white mb-2 relative z-10">Start Quiz</h2>
        <p className="text-center text-gray-400 mb-8 text-sm sm:text-base relative z-10">Topic: <span className="font-semibold text-indigo-400">{topicTitle}</span></p>

        {/* Tab Switcher */}
        <div className="flex p-1 bg-black/30 rounded-xl mb-8 relative z-10 border border-white/5">
          <button
            onClick={() => setQuizType('custom')}
            disabled={mode === 'exam'}
            className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${quizType === 'custom' ? 'bg-indigo-600/20 text-indigo-300 shadow-sm border border-indigo-500/30' : 'text-gray-500 hover:text-gray-300'} ${mode === 'exam' ? 'opacity-100 cursor-not-allowed' : ''}`}
          >
            Custom Quiz
          </button>
          <button
            onClick={() => setQuizType('daily')}
            disabled={mode === 'exam'}
            className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${quizType === 'daily' ? 'bg-indigo-600/20 text-indigo-300 shadow-sm border border-indigo-500/30' : 'text-gray-500 hover:text-gray-300'} ${mode === 'exam' ? 'opacity-50 cursor-not-allowed' : ''}`}
            title={mode === 'exam' ? "Daily Challenge not available in Exam Mode" : ""}
          >
            Daily Challenge
          </button>
        </div>

        <form onSubmit={handleSubmit} className="relative z-10">
          <div className="space-y-6">

            {quizType === 'custom' ? (
              /* Custom Quiz Content */
              <div>
                <label htmlFor="numQuestions" className="block text-sm font-medium text-gray-300 mb-1.5">
                  Number of Questions
                </label>
                <p className="text-xs text-gray-500 mb-3">
                  Total available: <span className="text-gray-300 font-mono">{maxQuestions}</span>
                </p>
                <div className="flex gap-3">
                  <input
                    type="number"
                    id="numQuestions"
                    value={numQuestions}
                    onChange={handleNumChange}
                    min="1"
                    max={maxQuestions}
                    disabled={mode === 'exam'}
                    className={`flex-grow block w-full px-4 py-2.5 glass-input bg-gray-900/50 border border-gray-700/50 rounded-xl shadow-inner focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-white placeholder-gray-600 transition-all ${mode === 'exam' ? 'opacity-50 cursor-not-allowed' : ''}`}
                  />
                  <button
                    type="button"
                    onClick={handleSetMax}
                    disabled={mode === 'exam'}
                    className={`px-4 py-2.5 text-indigo-300 text-sm font-medium rounded-xl transition-all border border-indigo-500/30 hover:bg-indigo-500/10 ${mode === 'exam' ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    Max ({maxQuestions})
                  </button>
                </div>
                {mode === 'exam' && (
                  <p className="text-xs text-indigo-400 mt-2 font-medium flex items-center gap-1">
                    <Icon iconName="info" className="h-3 w-3" />
                    Exam Mode requires taking all questions.
                  </p>
                )}
                {error && <p className="text-red-400 text-xs mt-2 flex items-center gap-1"><Icon iconName="info" className="h-3 w-3" /> {error}</p>}
              </div>
            ) : (
              /* Daily Challenge Content */
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">
                  Select Day (10 Questions/Day)
                </label>
                <p className="text-xs text-gray-500 mb-4">
                  Systematically work through all {maxQuestions} questions without repeating.
                </p>

                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
                  {Array.from({ length: totalDays }, (_, i) => i + 1).map(day => {
                    const startIndex = (day - 1) * QUESTIONS_PER_DAY;
                    const remaining = maxQuestions - startIndex;
                    const qCount = Math.min(QUESTIONS_PER_DAY, remaining);

                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() => setSelectedDay(day)}
                        className={`py-2 px-1 rounded-lg text-sm font-medium border transition-all flex flex-col items-center justify-center ${selectedDay === day
                            ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500/50 shadow-[0_0_10px_rgba(99,102,241,0.2)]'
                            : 'bg-white/5 text-gray-400 border-white/5 hover:bg-white/10 hover:border-white/10'
                          }`}
                      >
                        <span>Day {day}</span>
                        <span className={`text-[10px] ${selectedDay === day ? 'text-indigo-200' : 'text-gray-500'}`}>
                          {qCount} Qs
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">Quiz Mode</label>
              <div className="grid grid-cols-2 gap-4">
                <label className={`border rounded-xl p-4 flex flex-col items-center cursor-pointer transition-all ${mode === 'study' ? 'border-indigo-500/50 bg-indigo-500/10 shadow-[0_0_15px_rgba(99,102,241,0.15)]' : 'border-white/5 bg-white/5 hover:bg-white/10'}`}>
                  <input
                    type="radio"
                    name="quizMode"
                    value="study"
                    checked={mode === 'study'}
                    onChange={() => setMode('study')}
                    className="hidden"
                  />
                  <div className={`p-2 rounded-lg mb-2 ${mode === 'study' ? 'bg-indigo-500/20 text-indigo-300' : 'bg-gray-800 text-gray-500'}`}>
                    <Icon iconName="book-open" className="h-6 w-6" />
                  </div>
                  <span className={`font-bold mb-1 ${mode === 'study' ? 'text-white' : 'text-gray-400'}`}>Study Mode</span>
                  <span className="text-xs text-center text-gray-500">Reveal answers instantly</span>
                </label>

                <label className={`border rounded-xl p-4 flex flex-col items-center cursor-pointer transition-all ${mode === 'exam' ? 'border-indigo-500/50 bg-indigo-500/10 shadow-[0_0_15px_rgba(99,102,241,0.15)]' : 'border-white/5 bg-white/5 hover:bg-white/10'}`}>
                  <input
                    type="radio"
                    name="quizMode"
                    value="exam"
                    checked={mode === 'exam'}
                    onChange={() => setMode('exam')}
                    className="hidden"
                  />
                  <div className={`p-2 rounded-lg mb-2 ${mode === 'exam' ? 'bg-indigo-500/20 text-indigo-300' : 'bg-gray-800 text-gray-500'}`}>
                    <Icon iconName="shield-check" className="h-6 w-6 " />
                  </div>
                  <span className={`font-bold mb-1 ${mode === 'exam' ? 'text-white' : 'text-gray-400'}`}>Exam Mode</span>
                  <span className="text-xs text-center text-gray-500">Results at the end</span>
                </label>
              </div>
            </div>
          </div>

          <div className="flex gap-3 mt-8">
            <button type="button" onClick={onClose} className="w-full py-3.5 rounded-xl text-gray-400 font-semibold hover:text-white hover:bg-white/5 transition-colors border border-transparent hover:border-white/10">
              Cancel
            </button>
            <button
              type="submit"
              disabled={quizType === 'custom' && (!!error || numQuestions === 0 || isNaN(numQuestions))}
              className="w-full py-3.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-500 shadow-[0_0_20px_rgba(79,70,229,0.3)] transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-0.5">
              Start {mode === 'exam' ? 'Exam' : (quizType === 'daily' ? `Day ${selectedDay}` : 'Quiz')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default QuizCustomizationModal;
