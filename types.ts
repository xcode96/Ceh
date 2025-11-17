export interface Module {
  id: number;
  title: string;
  icon: IconName;
  color: string;
  subTopics: string[];
}

export interface Exam {
  id: number;
  title: string;
  description: string;
  modules: Module[];
}

export interface Question {
  id: string; // Unique identifier for each question
  question: string;
  options: string[];
  correctAnswer: string;
}

export type QuestionBank = {
  [moduleId: number]: {
    [subTopic: string]: Question[];
  };
};

export type IconName = 
  'key' | 'shield' | 'mail' | 'smartphone' | 
  'lock' | 'alert' | 'users' | 'shield-check' | 
  'laptop' | 'database' | 'footprint' | 'scan' |
  'bug' | 'wifi' | 'ban' | 'server' | 'code-bracket' |
  'iot' | 'cloud' | 'chevron-down' | 'sparkles' |
  'upload' | 'download' | 'eye' | 'eye-slash' | 'edit' | 'book-open';

export type ModuleStatus = 'completed' | 'in-progress' | 'not-started';
