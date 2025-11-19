
import React, { useState, useEffect } from 'react';
import type { Module, Question, QuizResult, UserAnswer } from '../types';
import Icon from './Icon';

interface QuizViewProps {
  module: Module;
  subTopic?: string | null;
  contentPoint?: string | null;
  questions: Question[];
  mode: 'study' | 'exam';
  onCompleteQuiz: (result: QuizResult) => void;
}

const QuizView: React.FC<QuizViewProps> = ({ module, subTopic, contentPoint, questions, onCompleteQuiz, mode }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswerRevealed, setIsAnswerRevealed] = useState(false);
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
  const [startTime, setStartTime] = useState<number>(0);

  useEffect(() => {
    setStartTime(Date.now());
  }, []);
  
  const quizTitle = contentPoint 
    ? `${subTopic}: ${contentPoint}` 
    : subTopic 
    ? `${module.title}: ${subTopic}` 
    : module.title;

  const finishQuiz = (finalAnswers: UserAnswer[]) => {
      const endTime = Date.now();
      const totalTime = Math.round((endTime - startTime) / 1000); // in seconds

      const correctCount = finalAnswers.filter(a => a.isCorrect).length;
      const totalQuestions = questions.length;
      const score = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;

      const result: QuizResult = {
        score,
        correctCount,
        totalQuestions,
        totalTime,
        avgTimePerQuestion: totalQuestions > 0 ? parseFloat((totalTime / totalQuestions).toFixed(1)) : 0,
        userAnswers: finalAnswers
      };
      onCompleteQuiz(result);
  };

  const handleOptionClick = (option: string) => {
      if (mode === 'study' && isAnswerRevealed) return;
      setSelectedAnswer(option);
  };

  const handleRevealAnswer = () => {
      if (!selectedAnswer) return;
      setIsAnswerRevealed(true);
  };

  const handlePreviousQuestion = () => {
      if (currentQuestionIndex > 0) {
          const newIndex = currentQuestionIndex - 1;
          const prevQuestion = questions[newIndex];
          
          // Restore state for previous question
          const existingAnswer = userAnswers.find(a => a.questionId === prevQuestion.id);
          
          setCurrentQuestionIndex(newIndex);
          setSelectedAnswer(existingAnswer?.selectedAnswer || null);
          
          // In study mode, if they answered it, it's likely revealed
          // Or we can reset it. Let's assume if they answered, we show the state.
          if (mode === 'study' && existingAnswer) {
              setIsAnswerRevealed(true);
          } else {
              setIsAnswerRevealed(false);
          }
      }
  };

  const handleNextQuestion = () => {
    if (!selectedAnswer) return;

    const currentQuestion = questions[currentQuestionIndex];
    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;

    const newAnswer: UserAnswer = {
        questionId: currentQuestion.id,
        questionText: currentQuestion.question,
        selectedAnswer: selectedAnswer,
        correctAnswer: currentQuestion.correctAnswer,
        isCorrect: isCorrect,
        explanation: currentQuestion.explanation
    };

    // Update existing answer or add new one
    let updatedAnswers = [...userAnswers];
    const existingIndex = updatedAnswers.findIndex(a => a.questionId === currentQuestion.id);
    
    if (existingIndex >= 0) {
        updatedAnswers[existingIndex] = newAnswer;
    } else {
        updatedAnswers.push(newAnswer);
    }
    
    setUserAnswers(updatedAnswers);

    if (currentQuestionIndex < questions.length - 1) {
      const nextIndex = currentQuestionIndex + 1;
      const nextQuestion = questions[nextIndex];
      
      // Check if next question was already answered (if we went back then forward)
      const nextExistingAnswer = updatedAnswers.find(a => a.questionId === nextQuestion.id);

      setCurrentQuestionIndex(nextIndex);
      setSelectedAnswer(nextExistingAnswer?.selectedAnswer || null);
      
      if (mode === 'study' && nextExistingAnswer) {
          setIsAnswerRevealed(true);
      } else {
          setIsAnswerRevealed(false);
      }
    } else {
      finishQuiz(updatedAnswers);
    }
  };
  
  if(!questions || questions.length === 0) {
    return (
        <div className="text-center p-10 bg-white rounded-xl shadow-lg">
            <p className="text-gray-600 mb-4">No questions available for this topic. An admin may need to add them.</p>
            <button onClick={() => onCompleteQuiz({
                score: 0, correctCount: 0, totalQuestions: 0, avgTimePerQuestion: 0, totalTime: 0, userAnswers: []
            })} className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                Return to Dashboard
            </button>
        </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progressPercentage = ((currentQuestionIndex) / questions.length) * 100;
  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  const getOptionClassName = (option: string) => {
    if (mode === 'exam') {
        if (selectedAnswer === option) {
            return 'bg-indigo-100 border-indigo-500 shadow-md ring-1 ring-indigo-500 text-indigo-900';
        }
        return 'bg-white border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 text-gray-700';
    }

    if (!isAnswerRevealed) {
        if (selectedAnswer === option) {
            return 'bg-indigo-100 border-indigo-500 shadow-md ring-1 ring-indigo-500 text-indigo-900';
        }
        return 'bg-white border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 text-gray-700';
    } else {
        // Reveal state for Study Mode
        if (option === currentQuestion.correctAnswer) {
            return 'bg-green-100 border-green-500 text-green-900 ring-1 ring-green-500';
        }
        if (selectedAnswer === option && option !== currentQuestion.correctAnswer) {
            return 'bg-red-100 border-red-500 text-red-900 ring-1 ring-red-500';
        }
        return 'bg-gray-50 border-gray-200 text-gray-400 opacity-60';
    }
  };

  return (
    <div className="w-full max-w-2xl bg-white p-8 rounded-2xl shadow-xl border border-gray-200">
      <div className="text-center mb-6">
        <h2 className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">{quizTitle}</h2>
        {mode === 'exam' && <span className="text-xs font-bold text-gray-400 ml-2 border border-gray-300 px-1.5 py-0.5 rounded">EXAM MODE</span>}
        <div className="w-full bg-gray-200 rounded-full h-2 my-3">
            <div className="bg-gradient-to-r from-pink-500 to-purple-600 h-2 rounded-full" style={{ width: `${progressPercentage}%`, transition: 'width 0.3s' }}></div>
        </div>
        <p className="text-sm text-gray-500">Question {currentQuestionIndex + 1} of {questions.length}</p>
      </div>

      <h3 className="text-xl font-bold text-gray-800 my-8 text-center">{currentQuestion.question}</h3>
      
      <div className="space-y-4">
        {currentQuestion.options.map((option, index) => (
          <button
            key={index}
            onClick={() => handleOptionClick(option)}
            disabled={mode === 'study' && isAnswerRevealed}
            className={`w-full text-left p-4 rounded-lg border-2 transition-all duration-200 ${getOptionClassName(option)}`}
          >
             <div className="flex items-center justify-between">
                <span>{option}</span>
                {mode === 'study' && isAnswerRevealed && option === currentQuestion.correctAnswer && (
                    <Icon iconName="shield-check" className="h-5 w-5 text-green-600" />
                )}
                 {mode === 'study' && isAnswerRevealed && selectedAnswer === option && option !== currentQuestion.correctAnswer && (
                    <Icon iconName="alert" className="h-5 w-5 text-red-600" />
                )}
             </div>
          </button>
        ))}
      </div>

      {mode === 'study' && isAnswerRevealed && currentQuestion.explanation && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100 text-sm text-blue-800">
              <div className="flex items-start gap-2">
                  <span className="text-lg">💡</span>
                  <div>
                      <span className="font-bold block mb-1">Explanation:</span>
                      {currentQuestion.explanation}
                  </div>
              </div>
          </div>
      )}

      <div className="mt-8 flex gap-3">
          {currentQuestionIndex > 0 && (
             <button
                onClick={handlePreviousQuestion}
                className="w-1/3 py-3 bg-white border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors shadow-sm flex items-center justify-center gap-2"
             >
                <Icon iconName="chevron-down" className="h-4 w-4 rotate-90" />
                <span>Previous</span>
             </button>
          )}
          
          {mode === 'study' ? (
              !isAnswerRevealed ? (
                  <button
                    onClick={handleRevealAnswer}
                    disabled={!selectedAnswer}
                    className="flex-1 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed shadow-md"
                  >
                    Reveal Answer
                  </button>
              ) : (
                  <button
                    onClick={handleNextQuestion}
                    className="flex-1 py-3 bg-gray-900 text-white font-semibold rounded-lg hover:bg-gray-800 transition-colors shadow-md flex items-center justify-center gap-2"
                  >
                    <span>{isLastQuestion ? 'Finish Exam' : 'Next Question'}</span>
                    {!isLastQuestion && <Icon iconName="chevron-down" className="h-4 w-4 rotate-270" />}
                  </button>
              )
          ) : (
              <button
                onClick={handleNextQuestion}
                disabled={!selectedAnswer}
                className="flex-1 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors shadow-md flex items-center justify-center gap-2 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                <span>{isLastQuestion ? 'Finish Exam' : 'Next Question'}</span>
                {!isLastQuestion && <Icon iconName="chevron-down" className="h-4 w-4 rotate-270" />}
              </button>
          )}
      </div>
    </div>
  );
};

export default QuizView;
