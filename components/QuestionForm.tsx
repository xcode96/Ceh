import React, { useState, useEffect } from 'react';
import type { Question } from '../types';

interface QuestionFormProps {
  initialQuestion: Question | null;
  onSubmit: (question: Question) => void;
  onCancel: () => void;
}

const QuestionForm: React.FC<QuestionFormProps> = ({ initialQuestion, onSubmit, onCancel }) => {
  const [questionText, setQuestionText] = useState('');
  const [options, setOptions] = useState(['', '', '', '']);
  const [correctAnswerIndex, setCorrectAnswerIndex] = useState(0);
  const [explanation, setExplanation] = useState('');

  useEffect(() => {
    if (initialQuestion) {
      setQuestionText(initialQuestion.question);
      setOptions(initialQuestion.options);
      const correctIndex = initialQuestion.options.indexOf(initialQuestion.correctAnswer);
      setCorrectAnswerIndex(correctIndex > -1 ? correctIndex : 0);
      setExplanation(initialQuestion.explanation || '');
    }
  }, [initialQuestion]);

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (options.some(opt => opt.trim() === '')) {
      alert("All options must be filled out.");
      return;
    }
    const newQuestion: Question = {
      id: initialQuestion?.id || new Date().toISOString(),
      question: questionText,
      options: options,
      correctAnswer: options[correctAnswerIndex],
      explanation: explanation.trim() ? explanation.trim() : undefined,
    };
    onSubmit(newQuestion);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg border space-y-4">
        <h3 className="text-lg font-bold text-gray-800">{initialQuestion ? 'Edit Question' : 'Add New Question'}</h3>
        <div>
            <label className="block text-sm font-medium text-gray-700">Question Text</label>
            <textarea
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
                required
                className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                rows={3}
            />
        </div>
        <div>
            <label className="block text-sm font-medium text-gray-700">Options</label>
            {options.map((option, index) => (
                <div key={index} className="flex items-center mt-2">
                    <input
                        type="radio"
                        name="correctAnswer"
                        checked={index === correctAnswerIndex}
                        onChange={() => setCorrectAnswerIndex(index)}
                        className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                    />
                    <input
                        type="text"
                        value={option}
                        onChange={(e) => handleOptionChange(index, e.target.value)}
                        required
                        className="ml-3 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder={`Option ${index + 1}`}
                    />
                </div>
            ))}
        </div>
        <div>
            <label className="block text-sm font-medium text-gray-700">Manual Explanation (Optional)</label>
            <p className="text-xs text-gray-500 mb-1">If you provide an explanation here, it will be shown to the user instead of an AI-generated one.</p>
            <textarea
                value={explanation}
                onChange={(e) => setExplanation(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                rows={4}
                placeholder="Explain why the correct answer is right and the others are wrong..."
            />
        </div>
        <div className="flex justify-end gap-3">
            <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200">
                Cancel
            </button>
            <button type="submit" className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700">
                Save Question
            </button>
        </div>
    </form>
  );
};

export default QuestionForm;