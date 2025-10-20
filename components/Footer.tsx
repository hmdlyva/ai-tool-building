
import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 border-t border-gray-700/50 mt-auto">
      <div className="container mx-auto px-4 md:px-8 py-4 text-center text-gray-500 text-sm">
        <p>&copy; {new Date().getFullYear()} TestGen Platform. Powered by Gemini.</p>
      </div>
    </footer>
  );
};
