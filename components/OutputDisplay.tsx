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
  annotatedImage: string | null;
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

const PdfIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 11-2 0V4H6v12a1 1 0 11-2 0V4zm4 11a1 1 0 100 2h4a1 1 0 100-2H8z" clipRule="evenodd" />
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
    let html = '';
    let inList = false;
    let inTable = false;

    for (let i = 0; i < lines.length; i++) {
        let line = lines[i];

        // Close table if the line is not a table row
        if (inTable && !line.trim().startsWith('|')) {
            html += '</tbody></table>\n';
            inTable = false;
        }

        // Headings
        if (line.startsWith('### ')) {
            html += `<h3 class="text-lg font-bold mt-4 mb-2 text-gray-200">${line.substring(4)}</h3>\n`;
        } else if (line.startsWith('## ')) {
            html += `<h2 class="text-xl font-bold mt-6 mb-3 text-cyan-500 border-b border-gray-600 pb-1">${line.substring(3)}</h2>\n`;
        } else if (line.startsWith('# ')) {
            html += `<h1 class="text-2xl font-bold mt-8 mb-4 text-cyan-400">${line.substring(2)}</h1>\n`;
        }
        // Tables
        else if (line.trim().startsWith('|') && lines[i + 1]?.trim().match(/^\|(?:\s*:?-+:-?\s*\|)+$/)) {
            if (!inTable) {
                html += '<table class="w-full text-left border-collapse mt-4">\n';
                inTable = true;
            }
            const headers = line.trim().split('|').slice(1, -1).map(h => `<th class="p-2 border border-gray-600 bg-gray-700">${h.trim()}</th>`).join('');
            html += `<thead><tr>${headers}</tr></thead>\n<tbody>\n`;
            i++; // Skip separator line
        } else if (inTable && line.trim().startsWith('|')) {
            const cells = line.trim().split('|').slice(1, -1).map(c => `<td class="p-2 border border-gray-600">${c.trim()}</td>`).join('');
            html += `<tr>${cells}</tr>\n`;
        }
        // Bold
        else {
             line = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
             // Lists
             if (line.match(/^\s*[\*\-]\s/) || line.match(/^\s*\d+\.\s/)) {
                 const itemHtml = `<li>${line.replace(/^\s*([\*\-]|\d+\.)\s/, '')}</li>\n`;
                 if (!inList) {
                     inList = true;
                     const listType = line.match(/^\s*\d+\./) ? 'ol' : 'ul';
                     html += `<${listType} class="${listType === 'ul' ? 'list-disc' : 'list-decimal'} list-inside space-y-2 pl-4">${itemHtml}`;
                 } else {
                     html += itemHtml;
                 }
             } else {
                 if (inList) {
                     inList = false;
                     html += `</ul>\n`;
                 }
                 if (line.trim() !== '') {
                     html += `<p class="mt-4">${line}</p>\n`;
                 }
             }
        }
    }

    if (inList) html += '</ul>\n';
    if (inTable) html += '</tbody></table>\n';

    return html;
};

export const OutputDisplay: React.FC<OutputDisplayProps> = ({ output, isLoading, error, placeholder, activeTool, annotatedImage }) => {
    const [copied, setCopied] = useState(false);
    
    const renderedHtml = useMemo(() => {
        if (!output) return { __html: '' };
        
        const isCodeOutput = activeTool === Tool.AutomationCodeGenerator || activeTool === Tool.PipelineGenerator;

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

    const handleExport = () => {
        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write('<html><head><title>QA Epic Documentation</title>');
            printWindow.document.write(`
              <style>
                body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #111827; padding: 1rem; }
                h1, h2, h3 { color: #000; border-bottom: 1px solid #e5e7eb; padding-bottom: 0.3em; margin-top: 1.5em; }
                h1 { font-size: 2em; } h2 { font-size: 1.5em; } h3 { font-size: 1.2em; }
                table { border-collapse: collapse; width: 100%; margin-top: 1em; }
                th, td { border: 1px solid #d1d5db; padding: 8px; text-align: left; }
                th { background-color: #f3f4f6; }
                pre { background-color: #f3f4f6; padding: 10px; border-radius: 5px; white-space: pre-wrap; font-family: monospace; }
                ul, ol { padding-left: 20px; }
                strong { font-weight: 600; }
                @media print {
                    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                }
              </style>
            `);
            printWindow.document.write('</head><body>');
            const outputContent = document.getElementById('output-content')?.innerHTML;
            if (outputContent) {
                printWindow.document.write(outputContent);
            }
            printWindow.document.write('</body></html>');
            printWindow.document.close();
            printWindow.focus();
            printWindow.print();
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
            return (
                <>
                    {annotatedImage && (
                        <div className="mb-6 border border-gray-600 rounded-lg overflow-hidden shadow-lg">
                            <img src={annotatedImage} alt="Annotated user interface" className="w-full h-auto" />
                        </div>
                    )}
                    <div id="output-content" className="prose prose-invert max-w-none" dangerouslySetInnerHTML={renderedHtml} />
                </>
            );
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
                <div className="absolute top-4 right-4 flex gap-2 z-10">
                    {activeTool === Tool.QAEpicDocGenerator && (
                        <button
                            onClick={handleExport}
                            className="bg-gray-700 hover:bg-gray-600 text-gray-300 p-2 rounded-md transition-colors duration-200 flex items-center gap-2"
                            aria-label="Export as PDF"
                            title="Export as PDF"
                        >
                            <PdfIcon />
                        </button>
                    )}
                    <button 
                        onClick={handleCopy}
                        className="bg-gray-700 hover:bg-gray-600 text-gray-300 p-2 rounded-md transition-colors duration-200 flex items-center gap-2"
                        aria-label="Copy to clipboard"
                        title="Copy to clipboard"
                    >
                        {copied ? <CheckIcon/> : <CopyIcon/>}
                        {copied && <span className="text-sm">Copied!</span>}
                    </button>
                 </div>
            )}
            <div className={`flex-grow overflow-y-auto pr-4 -mr-4 ${!output && !isLoading && !error ? 'flex items-center justify-center' : ''}`}>
                {renderContent()}
            </div>
        </div>
    );
};