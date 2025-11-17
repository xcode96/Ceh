import React, { useState, useEffect, useCallback } from 'react';
import type { Module, Question, QuestionBank } from '../types';
import { generateQuestionsForModule, generateExplanationForAnswer, generateExplanationForQuestion, generateTagsForQuestion } from '../services/geminiService';
import Icon from './Icon';

interface QuizViewProps {
  module: Module;
  subTopic?: string | null;
  contentPoint?: string | null;
  questionBank: QuestionBank;
  onCompleteQuiz: (moduleId: number) => void;
}

const CategoryTag: React.FC<{ children: React.ReactNode, color: string }> = ({ children, color }) => (
    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${color}`}>
        {children}
    </span>
);

const tagColors = [
    "bg-blue-100 text-blue-800",
    "bg-green-100 text-green-800",
    "bg-yellow-100 text-yellow-800",
    "bg-purple-100 text-purple-800",
    "bg-pink-100 text-pink-800",
    "bg-red-100 text-red-800",
    "bg-indigo-100 text-indigo-800",
];

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

  // FIX: Replace `JSX.Element` with `React.ReactElement` to resolve "Cannot find namespace 'JSX'" error.
  const groupedElements: React.ReactElement[] = [];
  // FIX: Replace `JSX.Element` with `React.ReactElement` to resolve "Cannot find namespace 'JSX'" error.
  let currentList: React.ReactElement[] = [];

  elements.forEach((el, i) => {
    if (el.type === 'li') {
      currentList.push(el);
    } else {
      if (currentList.length > 0) {
        groupedElements.push(<ul key={`ul-${i}`} className="space-y-1 mt-2">{currentList}</ul>);
        currentList = [];
      }
      // FIX: Replace `JSX.Element` with `React.ReactElement` to resolve "Cannot find namespace 'JSX'" error.
      groupedElements.push(el as React.ReactElement);
    }
  });

  if (currentList.length > 0) {
    groupedElements.push(<ul key="ul-last" className="space-y-1 mt-2">{currentList}</ul>);
  }

  return <div className="text-gray-600 text-sm space-y-2">{groupedElements}</div>;
};

const QuizView: React.FC<QuizViewProps> = ({ module, subTopic, contentPoint, questionBank, onCompleteQuiz }) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [answerChecked, setAnswerChecked] = useState<boolean>(false);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [isExplanationLoading, setIsExplanationLoading] = useState<boolean>(false);
  const [questionExplanation, setQuestionExplanation] = useState<string | null>(null);
  const [isQuestionExplanationLoading, setIsQuestionExplanationLoading] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [isTagsLoading, setIsTagsLoading] = useState(false);

  const fetchQuestions = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // For module-level quizzes, always generate
      if (!subTopic) {
        const generatedQuestions = await generateQuestionsForModule(module.title, module.subTopics);
        setQuestions(generatedQuestions.map(q => ({ ...q, id: new Date().toISOString() + Math.random() })));
        setIsLoading(false);
        return;
      }
      
      // For sub-topic or content-point quizzes, check bank first
      const topicIdentifier = contentPoint ? `${subTopic}::${contentPoint}` : subTopic;
      const bankQuestions = questionBank[module.id]?.[topicIdentifier];

      if (bankQuestions && bankQuestions.length > 0) {
        setQuestions(bankQuestions);
      } else {
        const generatedQuestions = await generateQuestionsForModule(module.title, module.subTopics, subTopic, contentPoint);
        if (generatedQuestions.length === 0) {
          throw new Error("No questions were generated. Please try again.");
        }
        setQuestions(generatedQuestions.map(q => ({ ...q, id: new Date().toISOString() + Math.random() })));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, [module.id, module.title, module.subTopics, subTopic, contentPoint, questionBank]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);
  
  const quizTitle = contentPoint 
    ? `${subTopic}: ${contentPoint}` 
    : subTopic 
    ? `${module.title}: ${subTopic}` 
    : module.title;

  useEffect(() => {
    if (questions.length > 0 && currentQuestionIndex < questions.length) {
        const currentQuestion = questions[currentQuestionIndex];
        const fetchTags = async () => {
            setIsTagsLoading(true);
            setTags([]);
            try {
                const generatedTags = await generateTagsForQuestion(currentQuestion.question, quizTitle);
                setTags(generatedTags);
            } catch (e) {
                console.error("Failed to fetch tags", e);
                setTags([]); // set empty on error
            } finally {
                setIsTagsLoading(false);
            }
        };
        fetchTags();
    }
  }, [currentQuestionIndex, questions, quizTitle]);

  const handleCheckAnswer = async () => {
    if (!selectedAnswer) return;

    setAnswerChecked(true);
    const currentQuestion = questions[currentQuestionIndex];

    // Use manual explanation if available
    if (currentQuestion.explanation && currentQuestion.explanation.trim() !== '') {
      setExplanation(currentQuestion.explanation);
      return; // Done. No loading, no API call.
    }
    
    // Otherwise, fetch from API
    setIsExplanationLoading(true);
    setExplanation(null);
    try {
        const { question, correctAnswer } = currentQuestion;
        const generatedExplanation = await generateExplanationForAnswer(question, correctAnswer, selectedAnswer);
        setExplanation(generatedExplanation);
    } catch (err) {
        setExplanation("Sorry, we couldn't generate an explanation at this time.");
    } finally {
        setIsExplanationLoading(false);
    }
  };
  
  const handleExplainQuestion = async () => {
    setIsQuestionExplanationLoading(true);
    setQuestionExplanation(null);

    try {
        const { question, options } = questions[currentQuestionIndex];
        const generatedExplanation = await generateExplanationForQuestion(question, options);
        setQuestionExplanation(generatedExplanation);
    } catch (err) {
        setQuestionExplanation("Sorry, we couldn't generate an explanation for this question at this time.");
    } finally {
        setIsQuestionExplanationLoading(false);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setAnswerChecked(false);
      setExplanation(null);
      setQuestionExplanation(null);
    } else {
      onCompleteQuiz(module.id);
    }
  };

  if (isLoading) {
    return <div className="text-center p-10 bg-white rounded-xl shadow-lg">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
      <p className="text-gray-600">Preparing your quiz...</p>
    </div>;
  }

  if (error) {
    return <div className="text-center p-10 bg-white rounded-xl shadow-lg">
      <p className="text-red-500 font-semibold mb-4">Error: {error}</p>
      <button onClick={fetchQuestions} className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
        Retry
      </button>
    </div>;
  }
  
  if(questions.length === 0) {
    return <div className="text-center p-10 bg-white rounded-xl shadow-lg"><p className="text-gray-600">No questions available for this topic.</p></div>;
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

      <div className="mb-4 flex flex-wrap justify-center gap-2 min-h-[30px]">
        {isTagsLoading ? (
            <span className="text-sm text-gray-400 animate-pulse">Generating tags...</span>
        ) : (
            tags.map((tag, index) => (
                <CategoryTag key={index} color={tagColors[index % tagColors.length]}>{tag}</CategoryTag>
            ))
        )}
      </div>

      <h3 className="text-xl font-bold text-gray-800 my-8 text-center">{currentQuestion.question}</h3>
      
      { (isQuestionExplanationLoading || questionExplanation) && (
         <div className="mb-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
           <h4 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
             <Icon iconName="sparkles" className="h-5 w-5 text-indigo-500" />
             Hint
           </h4>
           {isQuestionExplanationLoading ? (
             <p className="text-gray-600 animate-pulse">Gemini is thinking...</p>
           ) : (
             <MarkdownRenderer text={questionExplanation} />
           )}
         </div>
      )}

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
      
      {answerChecked && (
         <div className="mt-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
           <h4 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
             <Icon iconName={currentQuestion.explanation ? 'book-open' : 'sparkles'} className={`h-5 w-5 ${currentQuestion.explanation ? 'text-green-500' : 'text-indigo-500'}`} />
             Explanation
           </h4>
           {isExplanationLoading ? (
             <p className="text-gray-600 animate-pulse">Gemini is thinking...</p>
           ) : (
             <MarkdownRenderer text={explanation} />
           )}
         </div>
      )}

      {!answerChecked ? (
        <div className="flex flex-col sm:flex-row items-center gap-4 mt-8">
          <button
            onClick={handleExplainQuestion}
            disabled={isQuestionExplanationLoading || !!questionExplanation}
            className="w-full sm:w-1/2 py-3 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 disabled:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isQuestionExplanationLoading ? 'Thinking...' : 'Explain Question'}
          </button>
          <button
            onClick={handleCheckAnswer}
            disabled={!selectedAnswer}
            className="w-full sm:w-1/2 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            Check Answer
          </button>
        </div>
      ) : (
        <button
          onClick={handleNextQuestion}
          className="w-full mt-8 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors"
        >
          {currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'Finish Module'}
        </button>
      )}
    </div>
  );
};

export default QuizView;