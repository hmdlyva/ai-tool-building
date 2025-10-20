// Fix: Create QualityAssessmentForm component for the second tool.
import React, { useState } from 'react';
import { QUALITY_PRACTICES_BY_SECTION, ALL_QUALITY_PRACTICES } from '../constants';

interface QualityAssessmentFormProps {
  selectedPractices: string[];
  setSelectedPractices: (practices: string[]) => void;
  onGenerate: () => void;
  isLoading: boolean;
}

const GenerateIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
        <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v1h-2V4H7v1H5V4zM5 7h10v9a2 2 0 01-2 2H7a2 2 0 01-2-2V7zm5-4a1 1 0 00-1 1v1a1 1 0 102 0V4a1 1 0 00-1-1z" />
        <path d="M12.293 8.293a1 1 0 011.414 0l2 2a1 1 0 01-1.414 1.414L13 10.414V14a1 1 0 11-2 0v-3.586l-1.293 1.293a1 1 0 01-1.414-1.414l2-2z" />
    </svg>
);

const Section: React.FC<{
  title: string;
  items: string[];
  selectedPractices: string[];
  onCheckboxChange: (item: string) => void;
  isLoading: boolean;
}> = ({ title, items, selectedPractices, onCheckboxChange, isLoading }) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="bg-gray-900/50 rounded-md border border-gray-700">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center p-3 text-left font-semibold text-gray-200 hover:bg-gray-800/50"
        aria-expanded={isOpen}
      >
        <span>{title}</span>
        <svg
          className={`w-5 h-5 transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
        </svg>
      </button>
      {isOpen && (
        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {items.map((practice) => (
            <div key={practice} className="flex items-center">
              <input
                id={practice}
                name={practice}
                type="checkbox"
                checked={selectedPractices.includes(practice)}
                onChange={() => onCheckboxChange(practice)}
                disabled={isLoading}
                className="h-4 w-4 rounded border-gray-500 bg-gray-700 text-cyan-600 focus:ring-cyan-500 focus:ring-offset-gray-900"
              />
              <label htmlFor={practice} className="ml-3 text-sm text-gray-300">
                {practice}
              </label>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};


export const QualityAssessmentForm: React.FC<QualityAssessmentFormProps> = ({
  selectedPractices,
  setSelectedPractices,
  onGenerate,
  isLoading,
}) => {

  const handleCheckboxChange = (practice: string) => {
    setSelectedPractices(
      selectedPractices.includes(practice)
        ? selectedPractices.filter((p) => p !== practice)
        : [...selectedPractices, practice]
    );
  };
  
  const totalPractices = ALL_QUALITY_PRACTICES.length;
  const selectedCount = selectedPractices.length;
  const progressPercentage = totalPractices > 0 ? (selectedCount / totalPractices) * 100 : 0;

  return (
    <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700/50 shadow-lg flex flex-col gap-6">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Select Quality Practices in Use
        </label>
        <p className="text-sm text-gray-400 mb-4">
          Check all the practices your team currently follows. The AI will assess strengths based on these and suggest improvements for the ones you don't.
        </p>

        <div className="my-6">
            <div className="flex justify-between items-center mb-1">
                 <span className="text-sm font-medium text-gray-400">
                    Selection Progress
                </span>
                <span className="text-sm font-medium text-cyan-400">
                    {selectedCount} / {totalPractices} selected
                </span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2.5 shadow-inner">
                <div 
                    className="bg-cyan-500 h-2.5 rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${progressPercentage}%` }}
                    role="progressbar"
                    aria-valuenow={selectedCount}
                    aria-valuemin={0}
                    aria-valuemax={totalPractices}
                ></div>
            </div>
        </div>

        <div className="space-y-4">
          {QUALITY_PRACTICES_BY_SECTION.map((section) => (
            <Section
              key={section.title}
              title={section.title}
              items={section.items}
              selectedPractices={selectedPractices}
              onCheckboxChange={handleCheckboxChange}
              isLoading={isLoading}
            />
          ))}
        </div>
      </div>
      <div>
        <button
          onClick={onGenerate}
          disabled={isLoading || selectedPractices.length === 0}
          className="w-full flex items-center justify-center bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 px-4 rounded-lg transition-all duration-200 disabled:bg-gray-600 disabled:cursor-not-allowed transform hover:scale-105 disabled:scale-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-cyan-500"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Generating Assessment...
            </>
          ) : (
             <>
               <GenerateIcon />
               Generate Quality Assessment
             </>
          )}
        </button>
      </div>
    </div>
  );
};