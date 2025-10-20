// Fix: Create the main App component to structure the application.
import React, { useState, useMemo } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { InputForm } from './components/InputForm';
import { OutputDisplay } from './components/OutputDisplay';
import { ToolSelector } from './components/ToolSelector';
import { QualityAssessmentForm } from './components/QualityAssessmentForm';
import { AutomationCodeForm } from './components/AutomationCodeForm';
import { EpicDocForm } from './components/EpicDocForm';
import { AccessibilityAuditorForm } from './components/AccessibilityAuditorForm';
import { OutputType, Tool } from './types';
import { generateTestCase, generateQualityAssessment, generateAutomationCode, generateEpicDocumentation, generateAccessibilityAudit } from './services/geminiService';
import { ALL_QUALITY_PRACTICES, LANGUAGES, AUTOMATION_FRAMEWORKS } from './constants';
import { Part } from '@google/genai';

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

  // State for QA Epic Doc Generator
  const [epicTitle, setEpicTitle] = useState('');
  const [testPlan, setTestPlan] = useState('');
  const [acceptanceCriteriaList, setAcceptanceCriteriaList] = useState<string[]>(['']);
  const [testCases, setTestCases] = useState('');

  // State for Accessibility Auditor
  const [auditContext, setAuditContext] = useState('');
  const [techStack, setTechStack] = useState('');
  const [artifactType, setArtifactType] = useState<'url' | 'screenshots'>('url');
  const [auditUrl, setAuditUrl] = useState('');
  const [screenshots, setScreenshots] = useState<File[]>([]);

  // Common state
  const [output, setOutput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileToGenerativePart = async (file: File): Promise<Part> => {
    const base64EncodedDataPromise = new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
      reader.readAsDataURL(file);
    });
    return {
      inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
    };
  }

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

  const handleGenerateEpicDoc = async () => {
    setIsLoading(true);
    setError(null);
    setOutput('');
    try {
      const result = await generateEpicDocumentation(epicTitle, testPlan, acceptanceCriteriaList, testCases);
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

  const handleGenerateAccessibilityAudit = async () => {
    setIsLoading(true);
    setError(null);
    setOutput('');
    try {
      let artifacts: { type: 'url'; value: string } | { type: 'screenshots'; value: Part[] };
      if (artifactType === 'url') {
        artifacts = { type: 'url', value: auditUrl };
      } else {
        const imageParts = await Promise.all(screenshots.map(fileToGenerativePart));
        artifacts = { type: 'screenshots', value: imageParts };
      }
      const result = await generateAccessibilityAudit(auditContext, techStack, artifacts);
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
    setEpicTitle('');
    setTestPlan('');
    setAcceptanceCriteriaList(['']);
    setTestCases('');
    setAuditContext('');
    setTechStack('');
    setAuditUrl('');
    setScreenshots([]);
  };

  const placeholder = useMemo(() => {
    switch(activeTool) {
      case Tool.TestCaseGenerator:
        return {
          title: 'Your generated test case will appear here.',
          subtitle: 'Enter your acceptance criteria above and click "Generate".'
        };
      case Tool.QualityAssessment:
        return {
          title: 'Your quality assessment report will appear here.',
          subtitle: 'Select your team\'s practices and click "Generate".'
        };
      case Tool.AutomationCodeGenerator:
          return {
              title: 'Your generated automation code will appear here.',
              subtitle: 'Provide a test case, select a framework, and click "Generate".'
          };
      case Tool.QAEpicDocGenerator:
          return {
              title: 'Your QA Epic Documentation will appear here.',
              subtitle: 'Fill in the details for your epic and click "Generate".'
          };
      case Tool.AccessibilityAuditor:
            return {
                title: 'Your accessibility audit report will appear here.',
                subtitle: 'Provide a URL or screenshots and click "Generate Audit".'
            };
      default:
        return { title: 'Output will appear here.', subtitle: '' };
    }
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
      case Tool.QAEpicDocGenerator:
        return (
            <EpicDocForm
                epicTitle={epicTitle}
                setEpicTitle={setEpicTitle}
                testPlan={testPlan}
                setTestPlan={setTestPlan}
                acceptanceCriteriaList={acceptanceCriteriaList}
                setAcceptanceCriteriaList={setAcceptanceCriteriaList}
                testCases={testCases}
                setTestCases={setTestCases}
                onGenerate={handleGenerateEpicDoc}
                isLoading={isLoading}
            />
        );
      case Tool.AccessibilityAuditor:
        return (
            <AccessibilityAuditorForm
                context={auditContext}
                setContext={setAuditContext}
                techStack={techStack}
                setTechStack={setTechStack}
                artifactType={artifactType}
                setArtifactType={setArtifactType}
                url={auditUrl}
                setUrl={setAuditUrl}
                screenshots={screenshots}
                setScreenshots={setScreenshots}
                onGenerate={handleGenerateAccessibilityAudit}
                isLoading={isLoading}
            />
        )
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
