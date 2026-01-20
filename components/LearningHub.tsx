
import React, { useState } from 'react';
import Icon from './Icon';
import type { Exam, StudyResource } from '../types';

interface LearningHubProps {
    exams: Exam[];
    resources: StudyResource[];
    isAdmin: boolean;
    onAddResource: (resource: StudyResource) => void;
    onDeleteResource: (id: string) => void;
    onReturnToHome: () => void;
}

const LearningHub: React.FC<LearningHubProps> = ({
    exams,
    resources,
    isAdmin,
    onAddResource,
    onDeleteResource,
    onReturnToHome
}) => {
    const [isAdding, setIsAdding] = useState(false);
    const [newResource, setNewResource] = useState<Partial<StudyResource>>({
        type: 'article',
        category: 'General'
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (newResource.title && newResource.url && newResource.type && newResource.category) {
            const resource: StudyResource = {
                id: Date.now().toString(),
                title: newResource.title,
                description: newResource.description || '',
                url: newResource.url,
                type: newResource.type as any,
                category: newResource.category
            };
            onAddResource(resource);
            setIsAdding(false);
            setNewResource({ type: 'article', category: 'General' });
        }
    };

    const getIconForType = (type: string) => {
        switch (type) {
            case 'video': return 'laptop';
            case 'pdf': return 'book-open';
            case 'tool': return 'code-bracket';
            default: return 'folder';
        }
    };

    return (
        <div className="w-full max-w-7xl mx-auto glass-panel rounded-3xl overflow-hidden flex flex-col" style={{ minHeight: '90vh' }}>
            <header className="p-6 sm:p-8 border-b border-white/10 flex justify-between items-center bg-gray-900/50 backdrop-blur-md">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-3">
                        <span className="bg-indigo-500/20 p-2 rounded-lg text-indigo-400">
                            <Icon iconName="book-open" className="h-6 w-6 sm:h-7 sm:w-7" />
                        </span>
                        Learning Hub
                    </h1>
                    <p className="text-gray-400 text-xs sm:text-sm mt-2 ml-1">Curated resources to boost your cybersecurity knowledge.</p>
                </div>
                <button
                    onClick={onReturnToHome}
                    className="px-4 py-2 glass-button rounded-xl text-gray-300 hover:text-white transition-all flex items-center gap-2 text-sm sm:text-base group"
                >
                    <Icon iconName="chevron-down" className="h-4 w-4 rotate-90 group-hover:-translate-x-1 transition-transform" />
                    <span className="hidden sm:inline">Back to Home</span>
                </button>
            </header>

            <main className="p-4 sm:p-6 lg:p-8 overflow-y-auto flex-grow bg-gradient-to-br from-gray-900/50 to-black/50">

                {isAdmin && (
                    <div className="mb-8">
                        {!isAdding ? (
                            <button
                                onClick={() => setIsAdding(true)}
                                className="w-full py-4 border-2 border-dashed border-white/10 rounded-2xl text-gray-400 font-semibold hover:border-indigo-500/50 hover:text-indigo-400 hover:bg-indigo-500/10 transition-all flex items-center justify-center gap-2"
                            >
                                <Icon iconName="plus" className="h-5 w-5" />
                                Add New Resource
                            </button>
                        ) : (
                            <form onSubmit={handleSubmit} className="glass-card p-6 sm:p-8 rounded-2xl border border-white/10 animate-fade-in relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
                                <h3 className="font-bold text-white mb-6 text-lg">Add Resource</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6 relative z-10">
                                    <input
                                        type="text"
                                        placeholder="Title"
                                        className="glass-input p-3 rounded-lg text-white placeholder-gray-500"
                                        value={newResource.title || ''}
                                        onChange={e => setNewResource({ ...newResource, title: e.target.value })}
                                        required
                                    />
                                    <input
                                        type="url"
                                        placeholder="URL (https://...)"
                                        className="glass-input p-3 rounded-lg text-white placeholder-gray-500"
                                        value={newResource.url || ''}
                                        onChange={e => setNewResource({ ...newResource, url: e.target.value })}
                                        required
                                    />
                                    <select
                                        className="glass-input p-3 rounded-lg text-white bg-gray-900/80"
                                        value={newResource.type}
                                        onChange={e => setNewResource({ ...newResource, type: e.target.value as any })}
                                    >
                                        <option value="article">Article</option>
                                        <option value="video">Video</option>
                                        <option value="pdf">PDF</option>
                                        <option value="tool">Tool</option>
                                    </select>
                                    <input
                                        type="text"
                                        placeholder="Category (e.g. Network Security)"
                                        className="glass-input p-3 rounded-lg text-white placeholder-gray-500"
                                        value={newResource.category || ''}
                                        onChange={e => setNewResource({ ...newResource, category: e.target.value })}
                                        required
                                    />
                                    <textarea
                                        placeholder="Description (Optional)"
                                        className="glass-input p-3 rounded-lg md:col-span-2 text-white placeholder-gray-500 min-h-[100px]"
                                        value={newResource.description || ''}
                                        onChange={e => setNewResource({ ...newResource, description: e.target.value })}
                                    />
                                </div>
                                <div className="flex justify-end gap-3 relative z-10">
                                    <button type="button" onClick={() => setIsAdding(false)} className="px-5 py-2.5 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors">Cancel</button>
                                    <button type="submit" className="px-6 py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-500 shadow-lg shadow-indigo-900/30 transition-all">Save Resource</button>
                                </div>
                            </form>
                        )}
                    </div>
                )}

                {resources.length === 0 ? (
                    <div className="text-center py-20 text-gray-500">
                        <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/5">
                            <Icon iconName="folder-open" className="h-10 w-10 text-gray-600" />
                        </div>
                        <p className="text-lg font-medium text-gray-400">No resources added yet.</p>
                        {isAdmin && <p className="text-sm mt-2 text-gray-600">Click 'Add New Resource' to get started.</p>}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {resources.map(resource => (
                            <div key={resource.id} className="glass-card rounded-2xl p-6 flex flex-col group relative hover:-translate-y-1 transition-all duration-300">
                                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl pointer-events-none"></div>

                                {isAdmin && (
                                    <button
                                        onClick={() => onDeleteResource(resource.id)}
                                        className="absolute top-4 right-4 p-2 rounded-full text-gray-500 hover:bg-red-500/20 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all z-20"
                                        title="Delete resource"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                    </button>
                                )}

                                <div className="flex items-start justify-between mb-4 relative z-10">
                                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider border ${resource.type === 'video' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                                            resource.type === 'pdf' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' :
                                                resource.type === 'tool' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' :
                                                    'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                        }`}>
                                        {resource.type}
                                    </span>
                                    <span className="text-xs text-gray-500 font-medium">{resource.category}</span>
                                </div>

                                <h3 className="font-bold text-white text-lg mb-2 line-clamp-2 relative z-10 group-hover:text-indigo-300 transition-colors">{resource.title}</h3>
                                <p className="text-sm text-gray-400 mb-6 line-clamp-3 flex-grow relative z-10">{resource.description}</p>

                                <a
                                    href={resource.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="mt-auto inline-flex items-center justify-center w-full py-2.5 glass-button rounded-xl text-gray-300 font-medium hover:text-white hover:border-indigo-500/50 hover:bg-indigo-500/10 transition-all gap-2 relative z-10 group/btn"
                                >
                                    <span>Open Resource</span>
                                    <Icon iconName="upload" className="h-4 w-4 rotate-90" />
                                </a>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};

export default LearningHub;
