import React from 'react';
import Icon from './Icon';

const Footer: React.FC = () => {
  return (
    <footer className="w-full text-center py-4">
      <div className="flex items-center justify-center gap-4 text-gray-500">
        <span className="text-sm text-gray-700">Developed by XCODE96</span>
        <div className="flex items-center gap-3">
          <a
            href="https://github.com/xcode96/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="XCODE96's GitHub Profile"
            className="text-gray-600 hover:text-gray-900 transition-colors"
          >
            <Icon iconName="github" className="h-5 w-5" />
          </a>
          <a
            href="https://www.linkedin.com/in/manibharathi96"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="XCODE96's LinkedIn Profile"
            className="text-gray-600 hover:text-blue-600 transition-colors"
          >
            <Icon iconName="linkedin" className="h-5 w-5" />
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;