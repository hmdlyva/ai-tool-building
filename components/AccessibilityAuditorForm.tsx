import React from 'react';

interface AccessibilityAuditorFormProps {
    context: string;
    setContext: (value: string) => void;
    techStack: string;
    setTechStack: (value: string) => void;
    artifactType: 'url' | 'screenshots';
    setArtifactType: (value: 'url' | 'screenshots') => void;
    url: string;
    setUrl: (value: string) => void;
    screenshots: File[];
    setScreenshots: (files: File[]) => void;
    onGenerate: () => void;
    isLoading: boolean;
}

const GenerateIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
        <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v1h-2V4H7v1H5V4zM5 7h10v9a2 2 0 01-2 2H7a2 2 0 01-2-2V7zm5-4a1 1 0 00-1 1v1a1 1 0 102 0V4a1 1 0 00-1-1z" />
        <path d="M12.293 8.293a1 1 0 011.414 0l2 2a1 1 0 01-1.414 1.414L13 10.414V14a1 1 0 11-2 0v-3.586l-1.293 1.293a1 1 0 01-1.414-1.414l2-2z" />
    </svg>
);

const MAX_SCREENSHOTS = 5;

export const AccessibilityAuditorForm: React.FC<AccessibilityAuditorFormProps> = ({
    context,
    setContext,
    techStack,
    setTechStack,
    artifactType,
    setArtifactType,
    url,
    setUrl,
    screenshots,
    setScreenshots,
    onGenerate,
    isLoading,
}) => {

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files).slice(0, MAX_SCREENSHOTS);
            setScreenshots(files);
        }
    };
    
    const isGenerateDisabled = isLoading || !context.trim() || (artifactType === 'url' && !url.trim()) || (artifactType === 'screenshots' && screenshots.length === 0);

    return (
        <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700/50 shadow-lg flex flex-col gap-6">
            <div>
                <label htmlFor="context" className="block text-sm font-medium text-gray-300 mb-2">
                    Context
                </label>
                <textarea
                    id="context"
                    rows={4}
                    className="w-full bg-gray-900 border border-gray-600 rounded-md shadow-sm focus:ring-cyan-500 focus:border-cyan-500 text-gray-200 p-3 transition duration-150"
                    placeholder="Describe the page's purpose and primary user tasks. E.g., 'This is the checkout page for an e-commerce site. The user's goal is to enter payment info and complete the purchase.'"
                    value={context}
                    onChange={(e) => setContext(e.target.value)}
                    disabled={isLoading}
                />
            </div>

            <div>
                 <label className="block text-sm font-medium text-gray-300 mb-2">
                    Artifact Type
                 </label>
                 <div className="flex space-x-2 rounded-md bg-gray-900 p-1 border border-gray-600">
                    <button
                        onClick={() => setArtifactType('url')}
                        className={`w-full py-2 px-3 text-sm font-semibold rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-cyan-500 ${
                            artifactType === 'url' ? 'bg-cyan-600 text-white' : 'text-gray-300 hover:bg-gray-700'
                        }`}
                        disabled={isLoading}
                    >
                        URL
                    </button>
                    <button
                        onClick={() => setArtifactType('screenshots')}
                        className={`w-full py-2 px-3 text-sm font-semibold rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-cyan-500 ${
                            artifactType === 'screenshots' ? 'bg-cyan-600 text-white' : 'text-gray-300 hover:bg-gray-700'
                        }`}
                        disabled={isLoading}
                    >
                        Screenshots
                    </button>
                 </div>
            </div>

            {artifactType === 'url' ? (
                 <div>
                    <label htmlFor="url" className="block text-sm font-medium text-gray-300 mb-2">
                        Public URL
                    </label>
                    <input
                        id="url"
                        type="url"
                        className="w-full bg-gray-900 border border-gray-600 rounded-md shadow-sm focus:ring-cyan-500 focus:border-cyan-500 text-gray-200 p-3 transition duration-150"
                        placeholder="https://example.com/page-to-audit"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        disabled={isLoading}
                    />
                </div>
            ) : (
                <div>
                     <label htmlFor="screenshots" className="block text-sm font-medium text-gray-300 mb-2">
                        Upload Screenshots (max {MAX_SCREENSHOTS})
                    </label>
                    <input
                        id="screenshots"
                        type="file"
                        multiple
                        accept="image/png, image/jpeg"
                        onChange={handleFileChange}
                        disabled={isLoading}
                        className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-cyan-800/50 file:text-cyan-300 hover:file:bg-cyan-700/50"
                    />
                    {screenshots.length > 0 && (
                        <ul className="mt-2 text-xs text-gray-400 list-disc list-inside">
                            {screenshots.map(file => <li key={file.name}>{file.name}</li>)}
                        </ul>
                    )}
                </div>
            )}
            
            <div>
                <label htmlFor="tech-stack" className="block text-sm font-medium text-gray-300 mb-2">
                    Tech Stack (Optional)
                </label>
                <input
                    id="tech-stack"
                    type="text"
                    className="w-full bg-gray-900 border border-gray-600 rounded-md shadow-sm focus:ring-cyan-500 focus:border-cyan-500 text-gray-200 p-3 transition duration-150"
                    placeholder="e.g., React, Tailwind CSS, running on Chrome/iOS"
                    value={techStack}
                    onChange={(e) => setTechStack(e.target.value)}
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
                            Generating Audit...
                        </>
                    ) : (
                        <>
                            <GenerateIcon />
                            Generate Audit
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};
