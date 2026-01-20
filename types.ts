
export interface SubTopic {
  title: string;
  content: string[];
}

export interface Module {
  id: number;
  title: string;
  icon: IconName;
  color: string;
  subTopics: SubTopic[];
}

export interface Exam {
  id: number;
  title: string;
  description: string;
  icon?: IconName;
  modules: Module[];
}

export type DifficultyLevel = 'Low' | 'Medium' | 'Advanced';

export interface Question {
  id: string; // Unique identifier for each question
  question: string;
  options: string[];
  correctAnswer: string;
  explanation?: string;
  difficulty?: DifficultyLevel;
}

export type QuestionBank = {
  [moduleId: number]: {
    [topicIdentifier: string]: Question[];
  };
};

export interface UserAnswer {
  questionId: string;
  questionText: string;
  selectedAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  explanation?: string;
}

export interface QuizResult {
  score: number;
  correctCount: number;
  totalQuestions: number;
  avgTimePerQuestion: number; // in seconds
  totalTime: number; // in seconds
  userAnswers: UserAnswer[];
}

export interface QuizAttempt extends QuizResult {
  moduleId: number;
  moduleTitle: string;
  topicTitle: string;
  timestamp: string;
}

export interface StudyResource {
  id: string;
  title: string;
  description: string;
  url: string;
  type: 'video' | 'article' | 'pdf' | 'tool';
  category: string;
}

export type IconName =
  'key' | 'shield' | 'mail' | 'smartphone' |
  'lock' | 'alert' | 'users' | 'shield-check' |
  'laptop' | 'database' | 'footprint' | 'scan' |
  'bug' | 'wifi' | 'ban' | 'server' | 'code-bracket' |
  'iot' | 'cloud' | 'chevron-down' | 'sparkles' |
  'upload' | 'download' | 'eye' | 'eye-slash' | 'edit' |
  'book-open' | 'folder' | 'folder-open' | 'github' | 'linkedin' | 'home' | 'lock-open' | 'ceh' | 'cissp' | 'cysa' | 'collection';

export type ModuleStatus = 'completed' | 'in-progress' | 'not-started';