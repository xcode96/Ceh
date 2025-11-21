
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
      switch(type) {
          case 'video': return 'laptop';
          case 'pdf': return 'book-open';
          case 'tool': return 'code-bracket';
          default: return 'folder';
      }
  };

  return (
    <div className="w-full max-w-7xl mx-auto bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden flex flex-col" style={{ minHeight: '90vh' }}>
      <header className="bg-gray-50 p-6 border-b border-gray-200 flex justify-between items-center">
        <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Icon iconName="book-open" className="h-7 w-7 text-indigo-600" />
                Learning Hub
            </h1>
            <p className="text-gray-500 text-sm mt-1">Curated resources to boost your cybersecurity knowledge.</p>
        </div>
        <button 
            onClick={onReturnToHome}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors flex items-center gap-2"
        >
            <Icon iconName="chevron-down" className="h-4 w-4 rotate-90" />
            Back to Home
        </button>
      </header>

      <main className="p-6 lg:p-8 overflow-y-auto flex-grow">
        
        {isAdmin && (
            <div className="mb-8">
                {!isAdding ? (
                    <button 
                        onClick={() => setIsAdding(true)}
                        className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 font-semibold hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all"
                    >
                        + Add New Resource
                    </button>
                ) : (
                    <form onSubmit={handleSubmit} className="bg-gray-50 p-6 rounded-xl border border-gray-200 animate-fade-in">
                        <h3 className="font-bold text-gray-800 mb-4">Add Resource</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <input 
                                type="text" 
                                placeholder="Title" 
                                className="p-2 border rounded"
                                value={newResource.title || ''}
                                onChange={e => setNewResource({...newResource, title: e.target.value})}
                                required
                            />
                            <input 
                                type="url" 
                                placeholder="URL (https://...)" 
                                className="p-2 border rounded"
                                value={newResource.url || ''}
                                onChange={e => setNewResource({...newResource, url: e.target.value})}
                                required
                            />
                            <select 
                                className="p-2 border rounded"
                                value={newResource.type}
                                onChange={e => setNewResource({...newResource, type: e.target.value as any})}
                            >
                                <option value="article">Article</option>
                                <option value="video">Video</option>
                                <option value="pdf">PDF</option>
                                <option value="tool">Tool</option>
                            </select>
                            <input 
                                type="text" 
                                placeholder="Category (e.g. Network Security)" 
                                className="p-2 border rounded"
                                value={newResource.category || ''}
                                onChange={e => setNewResource({...newResource, category: e.target.value})}
                                required
                            />
                            <textarea 
                                placeholder="Description (Optional)" 
                                className="p-2 border rounded md:col-span-2"
                                value={newResource.description || ''}
                                onChange={e => setNewResource({...newResource, description: e.target.value})}
                            />
                        </div>
                        <div className="flex justify-end gap-3">
                            <button type="button" onClick={() => setIsAdding(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded">Cancel</button>
                            <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">Save Resource</button>
                        </div>
                    </form>
                )}
            </div>
        )}

        {resources.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
                <Icon iconName="folder-open" className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                <p>No resources added yet.</p>
                {isAdmin && <p className="text-sm">Click 'Add New Resource' to get started.</p>}
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {resources.map(resource => (
                    <div key={resource.id} className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow p-5 flex flex-col group relative">
                        {isAdmin && (
                            <button 
                                onClick={() => onDeleteResource(resource.id)}
                                className="absolute top-2 right-2 p-1.5 text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                                title="Delete resource"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        )}
                        <div className="flex items-start justify-between mb-3">
                            <span className={`text-xs font-semibold px-2 py-1 rounded-full uppercase tracking-wide ${
                                resource.type === 'video' ? 'bg-red-100 text-red-700' :
                                resource.type === 'pdf' ? 'bg-orange-100 text-orange-700' :
                                resource.type === 'tool' ? 'bg-purple-100 text-purple-700' :
                                'bg-blue-100 text-blue-700'
                            }`}>
                                {resource.type}
                            </span>
                            <span className="text-xs text-gray-500">{resource.category}</span>
                        </div>
                        <h3 className="font-bold text-gray-900 mb-2 line-clamp-2">{resource.title}</h3>
                        <p className="text-sm text-gray-600 mb-4 line-clamp-3 flex-grow">{resource.description}</p>
                        <a 
                            href={resource.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="mt-auto inline-flex items-center justify-center w-full py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 font-medium hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 transition-all gap-2"
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
