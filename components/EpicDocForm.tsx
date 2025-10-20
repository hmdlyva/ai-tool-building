import React from 'react';

interface EpicDocFormProps {
    epicTitle: string;
    setEpicTitle: (value: string) => void;
    testPlan: string;
    setTestPlan: (value: string) => void;
    acceptanceCriteriaList: string[];
    setAcceptanceCriteriaList: (value: string[]) => void;
    testCases: string;
    setTestCases: (value: string) => void;
    onGenerate: () => void;
    isLoading: boolean;
}

const GenerateIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
        <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v1h-2V4H7v1H5V4zM5 7h10v9a2 2 0 01-2 2H7a2 2 0 01-2-2V7zm5-4a1 1 0 00-1 1v1a1 1 0 102 0V4a1 1 0 00-1-1z" />
        <path d="M12.293 8.293a1 1 0 011.414 0l2 2a1 1 0 01-1.414 1.414L13 10.414V14a1 1 0 11-2 0v-3.586l-1.293 1.293a1 1 0 01-1.414-1.414l2-2z" />
    </svg>
);

export const EpicDocForm: React.FC<EpicDocFormProps> = ({
    epicTitle,
    setEpicTitle,
    testPlan,
    setTestPlan,
    acceptanceCriteriaList,
    setAcceptanceCriteriaList,
    testCases,
    setTestCases,
    onGenerate,
    isLoading,
}) => {
    const handleCriteriaCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let count = parseInt(e.target.value, 10);
        if (isNaN(count) || count < 1) count = 1;
        if (count > 20) count = 20; // Set a reasonable limit

        const newList = Array.from({ length: count }, (_, i) => acceptanceCriteriaList[i] || '');
        setAcceptanceCriteriaList(newList);
    };

    const handleCriteriaChange = (index: number, value: string) => {
        const newList = [...acceptanceCriteriaList];
        newList[index] = value;
        setAcceptanceCriteriaList(newList);
    };

    const isGenerateDisabled = isLoading || !epicTitle.trim() || !testPlan.trim() || !testCases.trim() || acceptanceCriteriaList.some(ac => !ac.trim());

    return (
        <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700/50 shadow-lg flex flex-col gap-6">
            <div>
                <label htmlFor="epic-title" className="block text-sm font-medium text-gray-300 mb-2">
                    Epic Title
                </label>
                <input
                    id="epic-title"
                    type="text"
                    className="w-full bg-gray-900 border border-gray-600 rounded-md shadow-sm focus:ring-cyan-500 focus:border-cyan-500 text-gray-200 p-3 transition duration-150"
                    placeholder="e.g., User Authentication and Profile Management"
                    value={epicTitle}
                    onChange={(e) => setEpicTitle(e.target.value)}
                    disabled={isLoading}
                />
            </div>
            
            <div>
                <label htmlFor="test-plan" className="block text-sm font-medium text-gray-300 mb-2">
                    Test Plan
                </label>
                <textarea
                    id="test-plan"
                    rows={4}
                    className="w-full bg-gray-900 border border-gray-600 rounded-md shadow-sm focus:ring-cyan-500 focus:border-cyan-500 text-gray-200 p-3 transition duration-150"
                    placeholder="Describe the scope, objectives, and strategy for testing this epic."
                    value={testPlan}
                    onChange={(e) => setTestPlan(e.target.value)}
                    disabled={isLoading}
                />
            </div>

            <div>
                <label htmlFor="ac-count" className="block text-sm font-medium text-gray-300 mb-2">
                    Number of Acceptance Criteria
                </label>
                <input
                    id="ac-count"
                    type="number"
                    min="1"
                    max="20"
                    className="w-24 bg-gray-900 border border-gray-600 rounded-md shadow-sm focus:ring-cyan-500 focus:border-cyan-500 text-gray-200 p-3 transition duration-150"
                    value={acceptanceCriteriaList.length}
                    onChange={handleCriteriaCountChange}
                    disabled={isLoading}
                />
            </div>

            <div className="flex flex-col gap-4">
                {acceptanceCriteriaList.map((ac, index) => (
                    <div key={index}>
                        <label htmlFor={`ac-${index}`} className="block text-sm font-medium text-gray-300 mb-2">
                            Acceptance Criterion #{index + 1}
                        </label>
                        <textarea
                            id={`ac-${index}`}
                            rows={2}
                            className="w-full bg-gray-900 border border-gray-600 rounded-md shadow-sm focus:ring-cyan-500 focus:border-cyan-500 text-gray-200 p-3 transition duration-150"
                            placeholder={`e.g., Given I am a new user, when I register with valid credentials, then I should be logged in.`}
                            value={ac}
                            onChange={(e) => handleCriteriaChange(index, e.target.value)}
                            disabled={isLoading}
                        />
                    </div>
                ))}
            </div>
            
            <div>
                <label htmlFor="test-cases" className="block text-sm font-medium text-gray-300 mb-2">
                    Test Cases
                </label>
                <textarea
                    id="test-cases"
                    rows={8}
                    className="w-full bg-gray-900 border border-gray-600 rounded-md shadow-sm focus:ring-cyan-500 focus:border-cyan-500 text-gray-200 p-3 transition duration-150"
                    placeholder="Paste your raw test cases here. The AI will format them into a table."
                    value={testCases}
                    onChange={(e) => setTestCases(e.target.value)}
                    disabled={isLoading}
                />
            </div>

            <div>
                <button
                    onClick={onGenerate}
                    disabled={isGenerateDisabled}
                    className="w-full flex items-center justify-center bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 px-4 rounded-lg transition-all duration-200 disabled:bg-gray-600 disabled:cursor-not-allowed transform hover:scale-105 disabled:scale-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-cyan-500"
                >
                    {isLoading ? (
                        <>
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Generating Documentation...
                        </>
                    ) : (
                        <>
                            <GenerateIcon />
                            Generate Documentation
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};