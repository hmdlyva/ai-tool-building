// Fix: Create the main App component to structure the application.
import React, { useState, useMemo } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { InputForm } from './components/InputForm';
import { OutputDisplay } from './components/OutputDisplay';
import { ToolSelector } from './components/ToolSelector';
import { QualityAssessmentForm } from './components/QualityAssessmentForm';
import { AutomationCodeForm } from './components/AutomationCodeForm';
import { OutputType, Tool } from './types';
import { generateTestCase, generateQualityAssessment, generateAutomationCode } from './services/geminiService';
import { ALL_QUALITY_PRACTICES, LANGUAGES, AUTOMATION_FRAMEWORKS } from './constants';

function App() {
  const [activeTool, setActiveTool] = useState<Tool>(Tool.TestCaseGenerator);
  
  // State for Test Case Generator
  const [acceptanceCriteria, setAcceptanceCriteria] = useState('');
  const [outputType, setOutputType] = useState<OutputType>(OutputType.Procedural);
  const [language, setLanguage] = useState(LANGUAGES[0].value);

  // State for Quality Assessment
  const [selectedPractices, setSelectedPractices] = useState<string[]>([]);
  
  // State for Automation Code Generator
  const [testCase, setTestCase] = useState('');
  const [framework, setFramework] = useState(AUTOMATION_FRAMEWORKS[0]);

  // Common state
  const [output, setOutput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateTestCase = async () => {
    setIsLoading(true);
    setError(null);
    setOutput('');
    try {
      const result = await generateTestCase(acceptanceCriteria, outputType, language);
      setOutput(result);
    } catch (e: unknown) {
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError('An unknown error occurred.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateQualityAssessment = async () => {
    setIsLoading(true);
    setError(null);
    setOutput('');
    try {
      const unselectedPractices = ALL_QUALITY_PRACTICES.filter(p => !selectedPractices.includes(p));
      const result = await generateQualityAssessment(selectedPractices, unselectedPractices);
      setOutput(result);
    } catch (e: unknown) {
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError('An unknown error occurred.');
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleGenerateAutomationCode = async () => {
    setIsLoading(true);
    setError(null);
    setOutput('');
    try {
      const result = await generateAutomationCode(testCase, framework);
      setOutput(result);
    } catch (e: unknown) {
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError('An unknown error occurred.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleToolChange = (tool: Tool) => {
    setActiveTool(tool);
    // Reset state when switching tools
    setOutput('');
    setError(null);
    setAcceptanceCriteria('');
    setSelectedPractices([]);
    setTestCase('');
  };

  const placeholder = useMemo(() => {
    if (activeTool === Tool.TestCaseGenerator) {
      return {
        title: 'Your generated test case will appear here.',
        subtitle: 'Enter your acceptance criteria above and click "Generate".'
      };
    }
    if (activeTool === Tool.QualityAssessment) {
      return {
        title: 'Your quality assessment report will appear here.',
        subtitle: 'Select your team\'s practices and click "Generate".'
      };
    }
    return {
        title: 'Your generated automation code will appear here.',
        subtitle: 'Provide a test case, select a framework, and click "Generate".'
    };
  }, [activeTool]);
  
  const renderActiveForm = () => {
    switch(activeTool) {
      case Tool.TestCaseGenerator:
        return (
          <InputForm
            acceptanceCriteria={acceptanceCriteria}
            setAcceptanceCriteria={setAcceptanceCriteria}
            outputType={outputType}
            setOutputType={setOutputType}
            language={language}
            setLanguage={setLanguage}
            onGenerate={handleGenerateTestCase}
            isLoading={isLoading}
          />
        );
      case Tool.QualityAssessment:
        return (
          <QualityAssessmentForm
            selectedPractices={selectedPractices}
            setSelectedPractices={setSelectedPractices}
            onGenerate={handleGenerateQualityAssessment}
            isLoading={isLoading}
          />
        );
      case Tool.AutomationCodeGenerator:
        return (
          <AutomationCodeForm
            testCase={testCase}
            setTestCase={setTestCase}
            framework={framework}
            setFramework={setFramework}
            onGenerate={handleGenerateAutomationCode}
            isLoading={isLoading}
          />
        );
      default:
        return null;
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 font-sans flex flex-col">
      <Header activeTool={activeTool} />
      <main className="container mx-auto px-4 md:px-8 py-8 flex-grow">
        <div className="max-w-7xl mx-auto flex flex-col gap-8">
          <ToolSelector activeTool={activeTool} onToolChange={handleToolChange} />
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            {renderActiveForm()}
            
            <OutputDisplay
              output={output}
              isLoading={isLoading}
              error={error}
              placeholder={placeholder}
              activeTool={activeTool}
            />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default App;