import React from 'react';
import { Tool } from '../types';

interface ToolSelectorProps {
  activeTool: Tool;
  onToolChange: (tool: Tool) => void;
}

const toolDisplayNames: Record<Tool, string> = {
    [Tool.TestCaseGenerator]: 'Test Case Generator',
    [Tool.QualityAssessment]: 'Quality Assessment',
    [Tool.AutomationCodeGenerator]: 'Automation Code Gen',
    [Tool.QAEpicDocGenerator]: 'Epic Doc Generator',
    [Tool.AccessibilityAuditor]: 'A11y Auditor',
};

export const ToolSelector: React.FC<ToolSelectorProps> = ({ activeTool, onToolChange }) => {
  return (
    <div className="flex flex-wrap justify-center gap-2 rounded-lg bg-gray-800/50 p-1 border border-gray-700/50 self-center">
      {(Object.values(Tool) as Array<Tool>).map((tool) => (
        <button
          key={tool}
          onClick={() => onToolChange(tool)}
          className={`w-full sm:w-auto flex-grow py-2 px-4 text-xs sm:text-sm font-semibold rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-cyan-500 ${
            activeTool === tool ? 'bg-cyan-600 text-white shadow-md' : 'text-gray-300 hover:bg-gray-700/50'
          }`}
        >
          {toolDisplayNames[tool]}
        </button>
      ))}
    </div>
  );
};
