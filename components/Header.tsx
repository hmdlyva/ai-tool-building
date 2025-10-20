import React from 'react';
import { Tool } from '../types';

interface HeaderProps {
  activeTool: Tool;
}

const subtitles: Record<Tool, string> = {
  [Tool.TestCaseGenerator]: 'Instantly generate procedural or Gherkin test cases from acceptance criteria.',
  [Tool.QualityAssessment]: 'Get a tailored assessment of your team\'s software quality practices.',
  [Tool.AutomationCodeGenerator]: 'Create test automation code from a test case for your chosen framework.'
}

export const Header: React.FC<HeaderProps> = ({ activeTool }) => {
  return (
    <header className="bg-gray-900/80 backdrop-blur-sm border-b border-gray-700/50 sticky top-0 z-10">
      <div className="container mx-auto px-4 md:px-8 py-4">
        <h1 className="text-2xl md:text-3xl font-bold text-cyan-400 tracking-tight">
          AI Quality Platform
        </h1>
        <p className="text-gray-400 mt-1">
          {subtitles[activeTool]}
        </p>
      </div>
    </header>
  );
};