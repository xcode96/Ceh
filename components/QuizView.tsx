
import React, { useState, useEffect } from 'react';
import type { Module, Question, QuizResult, UserAnswer } from '../types';
import Icon from './Icon';

interface QuizViewProps {
  module: Module;
  subTopic?: string | null;
  contentPoint?: string | null;
  questions: Question[];
  onCompleteQuiz: (result: QuizResult) => void;
}

const MarkdownRenderer: React.FC<{ text: string | null }> = ({ text }) => {
  if (!text) {
    return null;
  }

  const elements = text.split('\n').map((line, index) => {
    if (line.startsWith('* ') || line.startsWith('- ')) {
      const content = line.substring(2);
      const parts = content.split(/(\*\*.*?\*\*)/g);
      return (
        <li key={index} className="ml-5 list-disc">
          {parts.map((part, i) =>
            part.startsWith('**') && part.endsWith('**') ? (
              <strong key={i}>{part.slice(2, -2)}</strong>
            ) : (
              part
            )
          )}
        </li>
      );
    }
    if (line.match(/^(🔐|💡|✅|❌)\s/)) {
        return <p key={index} className="font-semibold text-gray-800 flex items-center gap-2">{line}</p>;
    }
    if (line.trim() === '') {
      return null;
    }
    const parts = line.split(/(\*\*.*?\*\*)/g);
    return (
      <p key={index}>
        {parts.map((part, i) =>
          part.startsWith('**') && part.endsWith('**') ? (
            <strong key={i}>{part.slice(2, -2)}</strong>
          ) : (
            part
          )
        )}
      </p>
    );
  }).filter(Boolean);

  const groupedElements: React.JSX.Element[] = [];
  let currentList: React.JSX.Element[] = [];

  elements.forEach((el, i) => {
    if (el.type === 'li') {
      currentList.push(el);
    } else {
      if (currentList.length > 0) {
        groupedElements.push(<ul key={`ul-${i}`} className="space-y-1 mt-2">{currentList}</ul>);
        currentList = [];
      }
      groupedElements.push(el as React.JSX.Element);
    }
  });

  if (currentList.length > 0) {
    groupedElements.push(<ul key="ul-last" className="space-y-1 mt-2">{currentList}</ul>);
  }

  return <div className="text-gray-600 text-sm space-y-2">{groupedElements}</div>;
};

const QuizView: React.FC<QuizViewProps> = ({ module, subTopic, contentPoint, questions, onCompleteQuiz }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [answerChecked, setAnswerChecked] = useState<boolean>(false);
  const [explanation, setExplanation] = useState<string | null>(null);
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


  const handleCheckAnswer = () => {
    if (!selectedAnswer) return;
    setAnswerChecked(true);

    const currentQuestion = questions[currentQuestionIndex];
    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;

    setUserAnswers(prev => [...prev, {
      questionId: currentQuestion.id,
      questionText: currentQuestion.question,
      selectedAnswer: selectedAnswer,
      correctAnswer: currentQuestion.correctAnswer,
      isCorrect: isCorrect,
      explanation: currentQuestion.explanation
    }]);

    if (currentQuestion.explanation && currentQuestion.explanation.trim() !== '') {
      setExplanation(currentQuestion.explanation);
    }
  };

  const finishQuiz = () => {
      const endTime = Date.now();
      const totalTime = Math.round((endTime - startTime) / 1000); // in seconds
      const finalAnswers = [...userAnswers];
      
      // Handle the last question if it wasn't "checked"
       if (selectedAnswer && !answerChecked) {
            const currentQuestion = questions[currentQuestionIndex];
            finalAnswers.push({
                questionId: currentQuestion.id,
                questionText: currentQuestion.question,
                selectedAnswer: selectedAnswer,
                correctAnswer: currentQuestion.correctAnswer,
                isCorrect: selectedAnswer === currentQuestion.correctAnswer,
                explanation: currentQuestion.explanation
            });
      }

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

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setAnswerChecked(false);
      setExplanation(null);
    } else {
      finishQuiz();
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
  const progressPercentage = ((currentQuestionIndex + 1) / questions.length) * 100;
  
  const getOptionClassName = (option: string) => {
    if (!answerChecked) {
      return selectedAnswer === option
        ? 'bg-indigo-100 border-indigo-500 shadow-md'
        : 'bg-white border-gray-200 hover:border-indigo-300 hover:bg-indigo-50';
    }

    if (option === currentQuestion.correctAnswer) {
      return 'bg-green-100 border-green-500';
    }
    
    if (option === selectedAnswer) {
      return 'bg-red-100 border-red-500';
    }

    return 'bg-gray-100 border-gray-200 text-gray-500';
  };

  return (
    <div className="w-full max-w-2xl bg-white p-8 rounded-2xl shadow-xl">
      <div className="text-center mb-6">
        <h2 className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">{quizTitle}</h2>
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
            onClick={() => setSelectedAnswer(option)}
            disabled={answerChecked}
            className={`w-full text-left p-4 rounded-lg border-2 transition-all duration-200 ${getOptionClassName(option)}`}
          >
            {option}
          </button>
        ))}
      </div>
      
      {answerChecked && explanation && (
         <div className="mt-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
           <h4 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
             <Icon iconName={'book-open'} className={`h-5 w-5 text-green-500`} />
             Explanation
           </h4>
            <MarkdownRenderer text={explanation} />
         </div>
      )}

      {!answerChecked ? (
        <div className="flex flex-col sm:flex-row items-center gap-4 mt-8">
          <button
            onClick={handleCheckAnswer}
            disabled={!selectedAnswer}
            className="w-full py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            Check Answer
          </button>
        </div>
      ) : (
        <button
          onClick={handleNextQuestion}
          className="w-full mt-8 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors"
        >
          {currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'Finish Quiz'}
        </button>
      )}
    </div>
  );
};

export default QuizView;
