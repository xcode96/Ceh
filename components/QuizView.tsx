
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

  if (!questions || questions.length === 0) {
    return (
      <div className="text-center p-10 glass-panel rounded-xl shadow-lg border border-white/10">
        <p className="text-gray-300 mb-4">No questions available for this topic. An admin may need to add them.</p>
        <button onClick={() => onCompleteQuiz({
          score: 0, correctCount: 0, totalQuestions: 0, avgTimePerQuestion: 0, totalTime: 0, userAnswers: []
        })} className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 transition-colors">
          Return to Dashboard
        </button>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progressPercentage = ((currentQuestionIndex) / questions.length) * 100;
  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  const getOptionClassName = (option: string) => {
    const baseClass = "w-full text-left p-4 rounded-xl border-2 transition-all duration-300 relative overflow-hidden group ";

    if (mode === 'exam') {
      if (selectedAnswer === option) {
        return baseClass + 'bg-indigo-500/20 border-indigo-500 text-white shadow-[0_0_15px_rgba(99,102,241,0.3)] scale-[1.01]';
      }
      return baseClass + 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-indigo-500/30 text-gray-300 hover:text-white';
    }

    if (!isAnswerRevealed) {
      if (selectedAnswer === option) {
        return baseClass + 'bg-indigo-500/20 border-indigo-500 text-white shadow-[0_0_15px_rgba(99,102,241,0.3)] scale-[1.01]';
      }
      return baseClass + 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-indigo-500/30 text-gray-300 hover:text-white';
    } else {
      // Reveal state for Study Mode
      if (option === currentQuestion.correctAnswer) {
        return baseClass + 'bg-green-500/20 border-green-500 text-green-100 shadow-[0_0_15px_rgba(34,197,94,0.3)]';
      }
      if (selectedAnswer === option && option !== currentQuestion.correctAnswer) {
        return baseClass + 'bg-red-500/20 border-red-500 text-red-100 shadow-[0_0_15px_rgba(239,68,68,0.3)]';
      }
      return baseClass + 'bg-gray-900/50 border-gray-800 text-gray-600 opacity-50';
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto glass-card p-6 sm:p-10 rounded-3xl border border-white/10 relative overflow-hidden my-6">
      {/* Ambient Glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl -ml-10 -mb-10 pointer-events-none"></div>

      <div className="text-center mb-8 relative z-10">
        <h2 className="text-xs font-bold text-indigo-400 uppercase tracking-[0.2em] truncate mb-2">{quizTitle}</h2>
        {mode === 'exam' && <span className="text-[10px] font-bold text-red-400 border border-red-500/30 px-2 py-0.5 rounded ml-2 bg-red-500/10">EXAM MODE</span>}

        <div className="w-full bg-gray-800/50 rounded-full h-2 my-4 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer"></div>
          <div className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full shadow-[0_0_10px_rgba(99,102,241,0.5)]" style={{ width: `${progressPercentage}%`, transition: 'width 0.4s ease-out' }}></div>
        </div>
        <p className="text-sm text-gray-400">Question <span className="text-white font-bold">{currentQuestionIndex + 1}</span> of {questions.length}</p>
      </div>

      <h3 className="text-xl sm:text-2xl font-bold text-white my-8 text-center leading-relaxed drop-shadow-sm px-4">{currentQuestion.question}</h3>

      <div className="space-y-4 mb-8">
        {currentQuestion.options.map((option, index) => (
          <button
            key={index}
            onClick={() => handleOptionClick(option)}
            disabled={mode === 'study' && isAnswerRevealed}
            className={getOptionClassName(option)}
          >
            <div className="flex items-center justify-between relative z-10">
              <span className="text-base font-medium">{option}</span>
              {mode === 'study' && isAnswerRevealed && option === currentQuestion.correctAnswer && (
                <Icon iconName="shield-check" className="h-6 w-6 text-green-400 flex-shrink-0 ml-2 drop-shadow-[0_0_5px_rgba(74,222,128,0.5)]" />
              )}
              {mode === 'study' && isAnswerRevealed && selectedAnswer === option && option !== currentQuestion.correctAnswer && (
                <Icon iconName="alert" className="h-5 w-5 text-red-400 flex-shrink-0 ml-2 drop-shadow-[0_0_5px_rgba(248,113,113,0.5)]" />
              )}
            </div>
          </button>
        ))}
      </div>

      {mode === 'study' && isAnswerRevealed && currentQuestion.explanation && (
        <div className="mt-8 p-6 bg-indigo-500/10 rounded-xl border border-indigo-500/20 text-indigo-100 relative overflow-hidden animate-fade-in">
          <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-indigo-400 to-purple-500"></div>
          <div className="flex items-start gap-4">
            <span className="text-2xl">💡</span>
            <div>
              <span className="font-bold block mb-2 text-white tracking-wide">EXPLANATION</span>
              <p className="text-indigo-100/90 leading-relaxed font-light">{currentQuestion.explanation}</p>
            </div>
          </div>
        </div>
      )}

      <div className="mt-10 flex gap-4 relative z-10">
        {currentQuestionIndex > 0 && (
          <button
            onClick={handlePreviousQuestion}
            className="w-1/3 py-3.5 bg-white/5 border border-white/10 text-gray-300 font-semibold rounded-xl hover:bg-white/10 hover:text-white transition-all shadow-lg flex items-center justify-center gap-2 text-sm sm:text-base group"
          >
            <Icon iconName="chevron-down" className="h-4 w-4 rotate-90 group-hover:-translate-x-1 transition-transform" />
            <span className="hidden sm:inline">Previous</span>
          </button>
        )}

        {mode === 'study' ? (
          !isAnswerRevealed ? (
            <button
              onClick={handleRevealAnswer}
              disabled={!selectedAnswer}
              className="flex-1 py-3.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-500 transition-all shadow-[0_0_20px_rgba(79,70,229,0.4)] hover:shadow-[0_0_25px_rgba(79,70,229,0.6)] hover:-translate-y-0.5 disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed disabled:shadow-none disabled:transform-none text-sm sm:text-base tracking-wide"
            >
              REVEAL ANSWER
            </button>
          ) : (
            <button
              onClick={handleNextQuestion}
              className="flex-1 py-3.5 bg-white text-gray-900 font-bold rounded-xl hover:bg-gray-100 transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:shadow-[0_0_25px_rgba(255,255,255,0.3)] hover:-translate-y-0.5 flex items-center justify-center gap-2 text-sm sm:text-base tracking-wide group"
            >
              <span>{isLastQuestion ? 'FINISH EXAM' : 'NEXT QUESTION'}</span>
              {!isLastQuestion && <Icon iconName="chevron-down" className="h-4 w-4 rotate-270 group-hover:translate-x-1 transition-transform" />}
            </button>
          )
        ) : (
          <button
            onClick={handleNextQuestion}
            disabled={!selectedAnswer}
            className="flex-1 py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl hover:from-indigo-500 hover:to-purple-500 transition-all shadow-[0_0_20px_rgba(79,70,229,0.4)] hover:shadow-[0_0_25px_rgba(79,70,229,0.6)] hover:-translate-y-0.5 flex items-center justify-center gap-2 disabled:from-gray-700 disabled:to-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed disabled:shadow-none disabled:transform-none text-sm sm:text-base tracking-wide group"
          >
            <span>{isLastQuestion ? 'FINISH EXAM' : 'NEXT QUESTION'}</span>
            {!isLastQuestion && <Icon iconName="chevron-down" className="h-4 w-4 rotate-270 group-hover:translate-x-1 transition-transform" />}
          </button>
        )}
      </div>
    </div>
  );
};

export default QuizView;
