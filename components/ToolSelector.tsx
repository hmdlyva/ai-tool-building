import React from 'react';
import { Tool } from '../types';

interface ToolSelectorProps {
  activeTool: Tool;
  onToolChange: (tool: Tool) => void;
}

export const ToolSelector: React.FC<ToolSelectorProps> = ({ activeTool, onToolChange }) => {
  return (
    <div className="flex space-x-2 rounded-lg bg-gray-800/50 p-1 border border-gray-700/50 self-center">
      {(Object.values(Tool) as Array<Tool>).map((tool) => (
        <button
          key={tool}
          onClick={() => onToolChange(tool)}
          className={`w-full py-2 px-6 text-sm font-semibold rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-cyan-500 ${
            activeTool === tool ? 'bg-cyan-600 text-white shadow-md' : 'text-gray-300 hover:bg-gray-700/50'
          }`}
        >
          {tool}
        </button>
      ))}
    </div>
  );
};
