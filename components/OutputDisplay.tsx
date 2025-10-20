import React, { useState, useEffect, useMemo } from 'react';
import { Tool } from '../types';

interface OutputDisplayProps {
  output: string;
  isLoading: boolean;
  error: string | null;
  placeholder: {
    title: string;
    subtitle: string;
  };
  activeTool: Tool;
}

const CopyIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
);

const CheckIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
);

const SkeletonLoader: React.FC = () => (
    <div className="space-y-4 animate-pulse">
        <div className="h-6 bg-gray-700 rounded w-1/4"></div>
        <div className="h-4 bg-gray-700 rounded w-3/4"></div>
        <div className="space-y-2 pt-4">
            <div className="h-4 bg-gray-700 rounded"></div>
            <div className="h-4 bg-gray-700 rounded w-5/6"></div>
            <div className="h-4 bg-gray-700 rounded w-2/3"></div>
        </div>
        <div className="space-y-2 pt-4">
            <div className="h-4 bg-gray-700 rounded"></div>
            <div className="h-4 bg-gray-700 rounded w-5/6"></div>
        </div>
    </div>
);

const escapeHtml = (unsafe: string): string => {
    return unsafe
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;");
}

const parseMarkdown = (text: string) => {
    const lines = text.split('\n');
    const htmlLines = [];
    let inList = false;

    for (const line of lines) {
        let processedLine = line;

        // Headings
        if (processedLine.startsWith('### ')) {
            processedLine = `<h3 class="text-lg font-bold mt-4 mb-2 text-gray-200">${processedLine.substring(4)}</h3>`;
        } else if (processedLine.startsWith('## ')) {
            processedLine = `<h2 class="text-xl font-bold mt-6 mb-3 text-cyan-500 border-b border-gray-600 pb-1">${processedLine.substring(3)}</h2>`;
        } else if (processedLine.startsWith('# ')) {
            processedLine = `<h1 class="text-2xl font-bold mt-8 mb-4 text-cyan-400">${processedLine.substring(2)}</h1>`;
        }
        
        // Bold
        processedLine = processedLine.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

        // Unordered list
        if (processedLine.match(/^\s*[\*\-] /)) {
            const itemHtml = `<li>${processedLine.replace(/^\s*[\*\-] /, '')}</li>`;
            if (!inList) {
                inList = true;
                processedLine = `<ul class="list-disc list-inside space-y-2 pl-4">${itemHtml}`;
            } else {
                processedLine = itemHtml;
            }
        } else {
            if (inList) {
                inList = false;
                processedLine = `</ul>${processedLine ? `<p class="mt-4">${processedLine}</p>` : ''}`;
            } else if (processedLine.trim() !== '' && !processedLine.startsWith('<h')) {
                 processedLine = `<p>${processedLine}</p>`;
            }
        }
        htmlLines.push(processedLine);
    }

    if (inList) {
        htmlLines.push('</ul>');
    }

    return htmlLines.join('').replace(/<\/p><p>/g, '</p><p class="mt-4">');
};

export const OutputDisplay: React.FC<OutputDisplayProps> = ({ output, isLoading, error, placeholder, activeTool }) => {
    const [copied, setCopied] = useState(false);
    
    const renderedHtml = useMemo(() => {
        if (!output) return { __html: '' };
        
        const isCodeOutput = activeTool === Tool.AutomationCodeGenerator || 
                             (output.includes('Test Case Title:') && output.includes('Step ') && output.includes('Expected Result:'));

        if (isCodeOutput) {
            return { __html: `<pre class="whitespace-pre-wrap break-words text-gray-200 font-sans">${escapeHtml(output)}</pre>` };
        }
        
        return { __html: parseMarkdown(output) };
    }, [output, activeTool]);

    useEffect(() => {
        if (copied) {
            const timer = setTimeout(() => setCopied(false), 2000);
            return () => clearTimeout(timer);
        }
    }, [copied]);

    const handleCopy = () => {
        if(output) {
            navigator.clipboard.writeText(output);
            setCopied(true);
        }
    };

    const renderContent = () => {
        if (isLoading) {
            return <SkeletonLoader />;
        }
        if (error) {
            return (
                <div className="text-red-400 bg-red-900/50 p-4 rounded-md border border-red-700">
                    <h3 className="font-bold">Error</h3>
                    <p>{error}</p>
                </div>
            );
        }
        if (output) {
            return <div className="prose prose-invert max-w-none" dangerouslySetInnerHTML={renderedHtml} />;
        }
        return (
            <div className="text-center text-gray-500">
                <p>{placeholder.title}</p>
                <p className="text-sm mt-2">{placeholder.subtitle}</p>
            </div>
        );
    };

    return (
        <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700/50 shadow-lg relative min-h-[400px] flex flex-col">
            {(output && !isLoading && !error) && (
                 <button 
                    onClick={handleCopy}
                    className="absolute top-4 right-4 bg-gray-700 hover:bg-gray-600 text-gray-300 p-2 rounded-md transition-colors duration-200 flex items-center gap-2 z-10"
                    aria-label="Copy to clipboard"
                 >
                    {copied ? <CheckIcon/> : <CopyIcon/>}
                    {copied && <span className="text-sm">Copied!</span>}
                 </button>
            )}
            <div className={`flex-grow overflow-y-auto pr-4 -mr-4 ${!output && !isLoading && !error ? 'flex items-center justify-center' : ''}`}>
                {renderContent()}
            </div>
        </div>
    );
};