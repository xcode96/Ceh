
import React, { useState } from 'react';

interface LoginViewProps {
  onLogin: (success: boolean) => void;
  onClose: () => void;
}

const LoginView: React.FC<LoginViewProps> = ({ onLogin, onClose }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Hardcoded credentials for simplicity
    const isAdmin = username === 'admin' && password === 'password';
    onLogin(isAdmin);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="glass-panel w-full max-w-sm p-8 rounded-2xl relative shadow-2xl animate-fade-in border border-white/10">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full blur-2xl -mr-16 -mt-16 pointer-events-none"></div>

        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors z-10 p-1">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>

        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg shadow-indigo-600/30">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white">Admin Login</h2>
          <p className="text-gray-400 text-sm mt-1">Enter your credentials to manage content.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 glass-input bg-gray-900/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
              placeholder="e.g. admin"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 glass-input bg-gray-900/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
              placeholder="••••••••"
            />
          </div>

          <button type="submit" className="w-full py-3.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-500 shadow-lg shadow-indigo-600/30 transition-all mt-4 hover:-translate-y-0.5">
            Login to Dashboard
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginView;