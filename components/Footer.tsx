import React from 'react';
import Icon from './Icon';

interface FooterProps {
  isAdmin: boolean;
  onAdminLogin: () => void;
  onLogout: () => void;
}

const Footer: React.FC<FooterProps> = ({ isAdmin, onAdminLogin, onLogout }) => {
  return (
    <footer className="w-full text-center py-6 border-t border-white/5 mt-auto bg-gray-900/50 backdrop-blur-sm">
      <div className="flex items-center justify-center gap-6 text-gray-500">
        <span className="text-sm font-medium">Developed by <span className="text-gray-400">XCODE96</span></span>

        <div className="h-4 w-px bg-gray-800"></div>

        <button
          onClick={isAdmin ? onLogout : onAdminLogin}
          className="text-xs font-semibold uppercase tracking-wider hover:text-white transition-colors flex items-center gap-2"
        >
          <Icon iconName={isAdmin ? 'lock-open' : 'lock'} className="h-3 w-3" />
          {isAdmin ? 'Logout' : 'Admin'}
        </button>

        <div className="h-4 w-px bg-gray-800"></div>

        <div className="flex items-center gap-3">
          <a
            href="https://github.com/xcode96/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="XCODE96's GitHub Profile"
            className="text-gray-500 hover:text-white transition-colors"
          >
            <Icon iconName="github" className="h-5 w-5" />
          </a>
          <a
            href="https://www.linkedin.com/in/manibharathi96"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="XCODE96's LinkedIn Profile"
            className="text-gray-500 hover:text-blue-400 transition-colors"
          >
            <Icon iconName="linkedin" className="h-5 w-5" />
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;