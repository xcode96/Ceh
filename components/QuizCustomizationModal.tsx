import React, { useState, useEffect } from 'react';

interface QuizCustomizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  topicTitle: string;
  maxQuestions: number;
  onStart: (numberOfQuestions: number, mode: 'study' | 'exam') => void;
}

const QuizCustomizationModal: React.FC<QuizCustomizationModalProps> = ({
  isOpen,
  onClose,
  topicTitle,
  maxQuestions,
  onStart,
}) => {
  const [numQuestions, setNumQuestions] = useState(maxQuestions);
  const [mode, setMode] = useState<'study' | 'exam'>('study');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setNumQuestions(maxQuestions);
      setMode('study');
      setError('');
    }
  }, [isOpen, maxQuestions]);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!error && numQuestions > 0) {
      onStart(numQuestions, mode);
    }
  };
  
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md relative">
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-gray-600">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">Customize Your Quiz</h2>
        <p className="text-center text-gray-500 mb-6">Topic: <span className="font-semibold text-gray-700">{topicTitle}</span></p>
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            <div>
              <label htmlFor="numQuestions" className="block text-sm font-medium text-gray-700">
                Number of Questions
              </label>
              <p className="text-xs text-gray-500 mb-2">
                There are {maxQuestions} question{maxQuestions !== 1 ? 's' : ''} available.
              </p>
              <input
                type="number"
                id="numQuestions"
                value={numQuestions}
                onChange={handleNumChange}
                min="1"
                max={maxQuestions}
                className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                autoFocus
              />
              {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Quiz Mode</label>
                <div className="grid grid-cols-2 gap-4">
                    <label className={`border rounded-lg p-3 flex flex-col items-center cursor-pointer transition-all ${mode === 'study' ? 'border-indigo-500 bg-indigo-50 ring-1 ring-indigo-500' : 'border-gray-200 hover:bg-gray-50'}`}>
                        <input 
                            type="radio" 
                            name="quizMode" 
                            value="study" 
                            checked={mode === 'study'} 
                            onChange={() => setMode('study')}
                            className="hidden"
                        />
                        <span className="font-bold text-gray-800 mb-1">Study Mode</span>
                        <span className="text-xs text-center text-gray-500">Reveal answers after each question</span>
                    </label>

                    <label className={`border rounded-lg p-3 flex flex-col items-center cursor-pointer transition-all ${mode === 'exam' ? 'border-indigo-500 bg-indigo-50 ring-1 ring-indigo-500' : 'border-gray-200 hover:bg-gray-50'}`}>
                        <input 
                            type="radio" 
                            name="quizMode" 
                            value="exam" 
                            checked={mode === 'exam'} 
                            onChange={() => setMode('exam')}
                            className="hidden"
                        />
                        <span className="font-bold text-gray-800 mb-1">Exam Mode</span>
                        <span className="text-xs text-center text-gray-500">See results only at the end</span>
                    </label>
                </div>
            </div>
          </div>

          <div className="flex gap-3 mt-8">
            <button type="button" onClick={onClose} className="w-full py-3 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors">
              Cancel
            </button>
            <button 
                type="submit" 
                disabled={!!error || numQuestions === 0 || isNaN(numQuestions)}
                className="w-full py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed">
              Start Quiz
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default QuizCustomizationModal;