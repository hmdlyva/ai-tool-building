import React from 'react';

interface ScenarioAnalyzerFormProps {
  scenarios: string;
  setScenarios: (value: string) => void;
  onGenerate: () => void;
  isLoading: boolean;
}

const GenerateIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
        <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v1h-2V4H7v1H5V4zM5 7h10v9a2 2 0 01-2 2H7a2 2 0 01-2-2V7zm5-4a1 1 0 00-1 1v1a1 1 0 102 0V4a1 1 0 00-1-1z" />
        <path d="M12.293 8.293a1 1 0 011.414 0l2 2a1 1 0 01-1.414 1.414L13 10.414V14a1 1 0 11-2 0v-3.586l-1.293 1.293a1 1 0 01-1.414-1.414l2-2z" />
    </svg>
);


export const ScenarioAnalyzerForm: React.FC<ScenarioAnalyzerFormProps> = ({
  scenarios,
  setScenarios,
  onGenerate,
  isLoading,
}) => {
  return (
    <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700/50 shadow-lg flex flex-col gap-6">
      <div>
        <label htmlFor="scenarios" className="block text-sm font-medium text-gray-300 mb-2">
          New Feature Scenarios
        </label>
        <textarea
          id="scenarios"
          rows={15}
          className="w-full bg-gray-900 border border-gray-600 rounded-md shadow-sm focus:ring-cyan-500 focus:border-cyan-500 text-gray-200 p-3 transition duration-150"
          placeholder="Paste your list of test scenarios here, one per line. The AI will categorize them and generate missing BVT and Regression tests."
          value={scenarios}
          onChange={(e) => setScenarios(e.target.value)}
          disabled={isLoading}
        />
      </div>

      <div>
        <button
          onClick={onGenerate}
          disabled={isLoading || !scenarios.trim()}
          className="w-full flex items-center justify-center bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 px-4 rounded-lg transition-all duration-200 disabled:bg-gray-600 disabled:cursor-not-allowed transform hover:scale-105 disabled:scale-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-cyan-500"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Analyzing...
            </>
          ) : (
             <>
               <GenerateIcon/>
               Generate Analysis
             </>
          )}
        </button>
      </div>
    </div>
  );
};