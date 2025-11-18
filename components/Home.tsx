import React from 'react';
import type { Exam } from '../types';
import Icon from './Icon';

interface HomeProps {
  exams: Exam[];
  onSelectExam: (examId: number) => void;
  isAdmin: boolean;
  onAddExam: (title: string, description: string) => void;
  onAdminLoginClick: () => void;
  onLogout: () => void;
}

const ExamCard: React.FC<{exam: Exam, onSelect: () => void}> = ({ exam, onSelect }) => (
    <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 p-6 flex flex-col border border-gray-200 hover:border-gray-300">
        <h3 className="text-xl font-bold text-gray-900">{exam.title}</h3>
        <p className="text-gray-600 mt-2 flex-grow">{exam.description}</p>
        <p className="text-sm text-gray-500 mt-4">{exam.modules.length} modules</p>
        <button onClick={onSelect} className="mt-4 w-full py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors">
            View Modules
        </button>
    </div>
);


const Home: React.FC<HomeProps> = ({ exams, onSelectExam, isAdmin, onAddExam, onAdminLoginClick, onLogout }) => {
    
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
            <header className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Cyber Security Training Platform</h1>
                    <p className="text-gray-600">Select an exam to begin your training.</p>
                </div>
                 <button onClick={isAdmin ? onLogout : onAdminLoginClick} className="py-2 px-4 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors duration-300">
                    {isAdmin ? 'Logout' : 'Admin Login'}
                </button>
            </header>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {exams.map(exam => (
                    <ExamCard key={exam.id} exam={exam} onSelect={() => onSelectExam(exam.id)} />
                ))}
                 {isAdmin && (
                    <button onClick={handleAddExamClick} className="w-full h-full p-6 border-2 border-dashed border-gray-300 text-gray-500 font-semibold rounded-xl hover:bg-gray-50 transition-colors duration-300 flex flex-col justify-center items-center">
                        <span className="text-2xl mb-2">+</span>
                        <span>Add New Exam Folder</span>
                    </button>
                 )}
            </div>
        </div>
    );
}

export default Home;