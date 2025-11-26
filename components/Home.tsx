import React from 'react';
import type { Exam } from '../types';
import Icon from './Icon';

interface HomeProps {
  exams: Exam[];
  onSelectExam: (examId: number) => void;
  isAdmin: boolean;
  onAddExam: (title: string, description: string) => void;
  onDeleteExam: (examId: number) => void;
  onAdminLoginClick: () => void;
  onLogout: () => void;
  onViewLearningHub: () => void;
}

const ExamCard: React.FC<{exam: Exam, onSelect: () => void, isAdmin: boolean, onDelete: (e: React.MouseEvent) => void}> = ({ exam, onSelect, isAdmin, onDelete }) => (
    <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 p-6 flex flex-col border border-gray-200 hover:border-gray-300 relative group">
        {isAdmin && (
            <button 
                onClick={onDelete} 
                className="absolute top-4 right-4 p-2 rounded-full bg-gray-100 text-gray-400 hover:bg-red-100 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                title="Delete Exam Folder"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            </button>
        )}
        <h3 className="text-xl font-bold text-gray-900 pr-8">{exam.title}</h3>
        <p className="text-gray-600 mt-2 flex-grow">{exam.description}</p>
        <p className="text-sm text-gray-500 mt-4">{exam.modules.length} modules</p>
        <button onClick={onSelect} className="mt-4 w-full py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors">
            View Modules
        </button>
    </div>
);


const Home: React.FC<HomeProps> = ({ exams, onSelectExam, isAdmin, onAddExam, onDeleteExam, onAdminLoginClick, onLogout, onViewLearningHub }) => {
    
    const handleAddExamClick = () => {
        const title = window.prompt("Enter the title for the new exam folder:");
        if (title && title.trim()) {
            const description = window.prompt("Enter the description for the new exam folder:", "");
            if (description && description.trim()) {
                onAddExam(title, description);
            }
        }
    };
    
    return (
        <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 bg-white rounded-2xl shadow-xl border border-gray-200">
            <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Cyber Security Training Platform</h1>
                    <p className="text-gray-600 text-sm sm:text-base">Select an exam to begin your training.</p>
                </div>
                <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                     <button onClick={onViewLearningHub} className="flex-1 sm:flex-none py-2 px-4 bg-indigo-50 text-indigo-700 font-semibold rounded-lg hover:bg-indigo-100 transition-colors duration-300 flex items-center justify-center gap-2 text-sm sm:text-base whitespace-nowrap">
                        <Icon iconName="book-open" className="h-5 w-5"/>
                        <span>Learning Hub</span>
                    </button>
                     <button onClick={isAdmin ? onLogout : onAdminLoginClick} className="flex-1 sm:flex-none py-2 px-4 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors duration-300 flex items-center justify-center gap-2 text-sm sm:text-base whitespace-nowrap">
                        <Icon iconName={isAdmin ? 'lock' : 'users'} className="h-5 w-5"/>
                        <span>{isAdmin ? 'Logout' : 'Admin Login'}</span>
                    </button>
                </div>
            </header>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {exams.map(exam => (
                    <ExamCard 
                        key={exam.id} 
                        exam={exam} 
                        onSelect={() => onSelectExam(exam.id)} 
                        isAdmin={isAdmin}
                        onDelete={(e) => { e.stopPropagation(); onDeleteExam(exam.id); }}
                    />
                ))}
                 {isAdmin && (
                    <button onClick={handleAddExamClick} className="w-full h-full p-6 border-2 border-dashed border-gray-300 text-gray-500 font-semibold rounded-xl hover:bg-gray-50 transition-colors duration-300 flex flex-col justify-center items-center min-h-[200px]">
                        <span className="text-2xl mb-2">+</span>
                        <span>Add New Exam Folder</span>
                    </button>
                 )}
            </div>
        </div>
    );
}

export default Home;