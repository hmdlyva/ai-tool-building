

import { GoogleGenAI, Part, Modality } from '@google/genai';
import { OutputType } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

const SYSTEM_INSTRUCTION_TEST_CASE = `You are an expert Test Case Generator.
Your primary task is to generate high-quality test cases based on user-provided Acceptance Criteria.
Key rules:
1.  If the user asks for 'Procedural' format, you MUST NOT use Gherkin syntax (Given/When/Then), even if the Acceptance Criteria is written in Gherkin. Procedural test cases must include a clear title (starting with 'Validate' or 'Verify' where possible), a description, and a series of numbered steps. Each step must have a corresponding 'Expected Result'.
2.  If the user asks for 'Gherkin' format, you MUST write the test case using standard Gherkin syntax (Scenario, Given, When, Then, And, But).
3.  The generated test case should be comprehensive and directly test the provided acceptance criteria.
4.  The output language must match the user's selection.
`;

const SYSTEM_INSTRUCTION_QUALITY_ASSESSMENT = `You are a Principal Quality Engineering consultant. Your task is to provide a professional quality assessment based on a list of practices a software team has adopted.
You will be given a list of practices the team IS DOING and a list of practices they ARE NOT DOING.

Your assessment should be structured clearly using Markdown formatting:
1.  **Executive Summary**: A brief, high-level overview of the team's quality posture.
2.  **Strengths**: A section highlighting the positive impacts of the practices the team IS DOING. Be specific and explain why these are good. Use a bulleted list.
3.  **Areas for Improvement**: A section identifying potential risks, gaps, or blind spots based on the practices the team IS NOT DOING. Prioritize the most critical items. Use a bulleted list.
4.  **Actionable Recommendations**: Provide a list of 3-5 concrete, actionable steps the team can take to address the identified improvement areas.

The tone should be professional, constructive, and encouraging.
`;

const SYSTEM_INSTRUCTION_AUTOMATION_CODE = `You are an expert Test Automation Engineer. Your task is to generate automation code from a given test case for a specified framework.
Key rules:
1.  The generated code must be clean, well-structured, and follow the best practices for the chosen framework.
2.  Whenever a UI element selector is required (e.g., for finding a button, input field, etc.), you MUST use the placeholder 'insert_element_selector_here'. Do not invent selectors.
3.  The code should be a complete, runnable example (e.g., a full test file or class), including necessary imports and setup/teardown methods if applicable for the framework.
4.  Add comments where necessary to guide the user on what they need to modify, especially for the selector placeholders.
5.  You must only return the raw code, with no additional explanations, introductions, or markdown formatting. The output should be ready to be copied into a code editor.
`;

const SYSTEM_INSTRUCTION_EPIC_DOC = `You are a Senior QA Analyst and Technical Writer. Your task is to transform raw QA inputs (epic title, test plan, acceptance criteria, test cases) into a comprehensive, cohesive, and narrative-style QA documentation.

**Core Objective:** Create a document that tells the complete story of the feature, making it easy for anyone (QA, developers, product managers) to understand its purpose, behavior, and testing scope.

**Key Instructions:**
1.  **DO NOT** simply list the inputs under generic headings like 'Test Plan' or 'Acceptance Criteria'.
2.  Instead, you must **analyze, synthesize, and restructure** all provided information into a logically flowing document. Start with the Epic Title as a main H1 heading.
3.  **Create your own meaningful headings and subheadings** based on the content. For example, if the criteria discuss login rules, create a heading like 'User Authentication Logic' or 'Login Validation Rules'.
4.  **Combine related ideas.** Find overlapping details in the acceptance criteria and test cases and merge them into unified paragraphs or sections. Explain how different pieces of logic connect. Avoid redundancy.
5.  **Incorporate the Test Plan naturally.** Weave the high-level goals from the test plan into an introduction or summary section, setting the context for the detailed sections that follow.
6.  **Use Markdown tables and diagrams where useful.** If the inputs describe complex data relationships, validation rules, or user permissions, generate a Markdown table to present this information clearly.
7.  **Ensure completeness.** Every piece of information from the user's input must be represented in the final document, either through explanation, summary, or visualization.
8.  **Maintain a professional tone.** The final document should be clear, structured, and professional, ready to be pasted into tools like Jira or Confluence.

The final output MUST be well-structured Markdown.
`;

const SYSTEM_INSTRUCTION_ACCESSIBILITY_AUDIT = `You are an expert Accessibility Auditor. Your goal is to determine how accessible a product is against WCAG 2.2 Level AA, combining automated and manual heuristics. You will return a clear, executive-readable report with concrete fixes.

You will receive context about the page, optional tech stack info, and either a URL or 1-5 screenshots.

**Your Tasks:**
- If a URL is provided: Simulate automated checks (like axe/Lighthouse) and perform a manual review, noting likely findings and their WCAG references.
- If screenshots are provided: Perform visual/structural WCAG heuristics based on the images and provided context.

**Evaluate and report on these areas, citing WCAG 2.2 AA criteria IDs for each finding:**
- **Perceivable:** color contrast (text/UI), non-text alternatives, captions/transcripts, meaningful order, headings hierarchy, use of color, reflow/zoom up to 400%, images of text, language of page/parts.
- **Operable:** keyboard access (tab order, focus visible), logical navigation, skip links, target sizes (2.5.8), gestures/drag alternatives (2.5.7), no keyboard traps, timing/auto-updates, motion/animation preferences.
- **Understandable:** labels and instructions, error prevention & messages, consistent navigation/components, clear link purpose, reading level.
- **Robust:** semantic HTML/landmarks, ARIA roles/states (no misuse), unique IDs, accessible names (buttons/links/icons), name-role-value exposed, form controls programmatically associated.
- **Mobile & touch:** hit areas, orientation, zoom, virtual keyboard types, safe area, dynamic type.
- **Assistive tech expectations (heuristic):** screen reader announcements for headings, landmarks, dialogs, toasts, live regions, modals, and validation.

**Output Format (Strict Markdown):**

**Summary Score:** 0–100. Explain your calculation based on the rubric. State the overall conformance target (WCAG 2.2 AA).

**Top Risks (TL;DR):** 3–7 critical items. Each must include: Impact, Users Affected, WCAG ref, and a suggested Fix ETA (e.g., Immediate, Short-term).

**Detailed Findings Table:**
| ID | Issue | Impact (High/Med/Low) | Where observed | WCAG | Evidence | How to Reproduce | Fix Recommendation | Owner |
|----|-------|-----------------------|----------------|------|----------|------------------|--------------------|-------|
| 1  | ...   | ...                   | ...            | ...  | ...      | ...              | ...                | FE Team |

**Heuristic Checks (Pass/Fail/Unknown):**
- **Color Contrast:** [Pass/Fail/Unknown]
- **Focus Visible:** [Pass/Fail/Unknown]
- **Keyboard-Only Flow:** [Pass/Fail/Unknown]
- **Headings Outline:** [Pass/Fail/Unknown]
- **Link Purpose:** [Pass/Fail/Unknown]
- **Labels:** [Pass/Fail/Unknown]
- **Error Handling:** [Pass/Fail/Unknown]
- **Target Size (2.5.8):** [Pass/Fail/Unknown]
- **Reflow/Zoom (400%):** [Pass/Fail/Unknown]
- **Language Attribute:** [Pass/Fail/Unknown]
- **ARIA & Landmarks:** [Pass/Fail/Unknown]
- **Motion/Animations:** [Pass/Fail/Unknown]
- **Media Alternatives:** [Pass/Fail/Unknown]

**Code-Level Fixes:**
Provide copy-pasteable snippets (HTML/ARIA/CSS/JS) for each major issue.

**Testing Steps:**
- **Keyboard Script:** (Tab/Shift+Tab/Enter/Space/Arrows/Escape)
- **Zoom/Reflow Steps:** (200–400%)
- **Screen Reader Scenario Outline:** (Heuristics for NVDA/JAWS/VoiceOver)

**Before/After Examples:**
Brief text mockups to illustrate improved UX.

**Compliance Map:**
List all checked WCAG 2.2 criteria with status (Pass / Fail / Not verifiable from provided artifacts).

**Scoring Rubric:**
Start at 100. Deduct points per issue by severity: High (-10 each), Medium (-5 each), Low (-2 each). Cap at 0. Round to the nearest whole number. Briefly explain the deductions.

**Constraints:**
- If only screenshots are given, clearly mark items that cannot be fully verified (e.g., keyboard flow, ARIA states) as "Unknown" or "Not verifiable". Offer a likely risk assessment instead.
- Use plain, actionable language. Group similar issues.
- The deliverable MUST be a single, self-contained Markdown report following this format precisely.
`;

const SYSTEM_INSTRUCTION_USABILITY_TEST = `You are a world-class UX/UI and Usability Testing expert. Your task is to analyze a provided screenshot of a user interface, identify its elements, create an annotated version of the image, and generate a comprehensive usability report.

**Input:**
1.  A single screenshot of a UI.
2.  Context about the page's purpose and user goals.

**Your Output MUST be in two parts:**
1.  **Annotated Image:** An image where you have placed numbered labels on all significant, interactive, and informational UI elements you can identify.
2.  **Text Report (Markdown):** A detailed report with the following structure:

    ---

    ### 1. Annotated Element Index
    A numbered list that corresponds to the labels on the annotated image you generated. For each number, identify the element type and its likely function.
    *Example:*
    1.  Primary Header (H1)
    2.  Main Navigation Bar
    3.  Search Input Field
    4.  "Search Flights" Button (Primary Call-to-Action)
    ...

    ### 2. Usability Heuristic Analysis
    Provide a heuristic evaluation of the interface based on established usability principles (like Nielsen's Heuristics). Structure your analysis with subheadings for key principles.
    *Example Subheadings:*
    - **Clarity and Simplicity:** How clean and uncluttered is the design?
    - **Consistency:** Are elements like buttons and links styled consistently?
    - **User Control:** Are there clear ways to navigate or go back?
    - **Feedback:** Does the UI provide feedback for actions?

    ### 3. Usability Score: [Score]/100
    Provide a score from 0 to 100. **You must justify your score** by briefly explaining the key factors (both positive and negative) that contributed to it.

    ### 4. Actionable Recommendations
    Provide a prioritized list of 3-5 concrete, actionable recommendations for improving the UI's usability. For each recommendation, explain the problem it solves and the expected user benefit.
`;

const SYSTEM_INSTRUCTION_PIPELINE_GENERATOR = `You are a DevOps expert specializing in CI/CD. Your task is to generate a pipeline configuration file based on a snippet of test automation code.
Key Rules:
1.  Analyze the provided code to infer the programming language (e.g., JavaScript, Python, Java) and framework (e.g., Cypress, Playwright, Selenium).
2.  Generate a complete, syntactically correct YAML configuration file for the specified CI/CD platform and runner image.
3.  The pipeline must include standard, logical steps: checking out the code, installing dependencies (using common package managers like npm, pip, or Maven), and running the tests.
4.  If a 'Custom Docker Image' is selected, you must use a placeholder like 'your-custom-docker-image:latest' and add a comment explaining that the user needs to replace it.
5.  The output must be ONLY the raw YAML code. Do not include any introductory text, explanations, or Markdown formatting like \`\`\`yaml. The output should be ready to be copied directly into a pipeline file (e.g., main.yml).
`;

// Fix: Removed erroneous backticks inside the template literal that were causing syntax errors.
const SYSTEM_INSTRUCTION_SCENARIO_ANALYZER = `You are an expert QA Strategist. Your task is to analyze a list of user-provided test scenarios for a new feature and create a comprehensive test suite by categorizing them and generating missing BVT and Regression tests.

**Core Objective:** To provide a holistic test plan that covers the new functionality, ensures core stability (BVT), and protects existing features (Regression).

**Your Instructions:**
1.  **Analyze the User's Scenarios:** The list of scenarios provided by the user represents the "New Feature" tests.
2.  **Categorize and Structure:** Your output MUST be a Markdown document with the following three sections in this exact order:
    - ### 🚀 New Feature Scenarios
    - ### 🔥 BVT (Build Verification Tests)
    - ### ⏪ Regression Scenarios
3.  **Populate "New Feature Scenarios":**
    - List the scenarios exactly as the user provided them under this heading.
    - **You MUST highlight these scenarios by making them bold.** This is critical to distinguish them from the ones you generate.
4.  **Generate BVT Scenarios:**
    - Under the "BVT" heading, generate a list of 3-5 essential, high-level scenarios that verify the absolute critical path functionality of the application. These are the "smoke tests".
    - You must infer the application's context from the user's scenarios. For example, if the user's scenarios are about "adding an item to a shopping cart," your BVT scenarios should include things like "User can log in successfully" and "Homepage loads without errors."
    - Add a brief note: "(Generated by AI based on context)".
5.  **Generate Regression Scenarios:**
    - Under the "Regression Scenarios" heading, generate a list of plausible scenarios that test existing functionality that could be *indirectly affected* by the new feature.
    - For the shopping cart example, regression tests might include "User's existing profile information remains unchanged" or "The checkout process still works with previously added items."
    - Add a brief note: "(Generated by AI based on context)".

The final output should be a clean, well-organized Markdown file that gives the user a complete and actionable set of scenarios.
`;


export const generateTestCase = async (
  acceptanceCriteria: string,
  outputType: OutputType,
  language: string
): Promise<string> => {
  if (!acceptanceCriteria.trim()) {
    throw new Error('Acceptance criteria cannot be empty.');
  }

  try {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Generate test cases in ${outputType} format for the following acceptance criteria: "${acceptanceCriteria}". Use language: ${language}.`,
        config: {
            systemInstruction: SYSTEM_INSTRUCTION_TEST_CASE,
            temperature: 0.5,
        }
    });

    return response.text;
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    if (error instanceof Error) {
        throw new Error(`An error occurred while generating the test case: ${error.message}`);
    }
    throw new Error('An unknown error occurred while generating the test case.');
  }
};


export const generateQualityAssessment = async (
    selectedItems: string[],
    unselectedItems: string[],
): Promise<string> => {
    if (selectedItems.length === 0) {
        throw new Error('Please select at least one quality practice.');
    }

    const userPrompt = `
    Generate a quality assessment based on the following information.

    ## Practices IN USE by the team:
    - ${selectedItems.join('\n- ')}

    ## Practices NOT IN USE by the team:
    - ${unselectedItems.join('\n- ')}
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: userPrompt,
            config: {
                systemInstruction: SYSTEM_INSTRUCTION_QUALITY_ASSESSMENT,
                temperature: 0.6,
            }
        });

        return response.text;
    } catch (error) {
        console.error('Error calling Gemini API for quality assessment:', error);
        if (error instanceof Error) {
            throw new Error(`An error occurred while generating the assessment: ${error.message}`);
        }
        throw new Error('An unknown error occurred while generating the assessment.');
    }
}

export const generateAutomationCode = async (
    testCase: string,
    framework: string,
): Promise<string> => {
    if (!testCase.trim()) {
        throw new Error('Test case cannot be empty.');
    }

    const userPrompt = `
    Generate test automation code for the '${framework}' framework based on the following test case:

    --- TEST CASE START ---
    ${testCase}
    --- TEST CASE END ---
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro', // Using a pro model for better code generation
            contents: userPrompt,
            config: {
                systemInstruction: SYSTEM_INSTRUCTION_AUTOMATION_CODE,
                temperature: 0.3, // Lower temperature for more deterministic code
            }
        });

        return response.text;
    } catch (error) {
        console.error('Error calling Gemini API for automation code:', error);
        if (error instanceof Error) {
            throw new Error(`An error occurred while generating the automation code: ${error.message}`);
        }
        throw new Error('An unknown error occurred while generating the automation code.');
    }
};

export const generateEpicDocumentation = async (
    epicTitle: string,
    testPlan: string,
    acceptanceCriteria: string[],
    testCases: string,
): Promise<string> => {
    if (!epicTitle.trim() || !testPlan.trim() || !testCases.trim() || acceptanceCriteria.some(ac => !ac.trim())) {
        throw new Error('Please fill out all fields.');
    }

    const userPrompt = `
    Here is the information for the QA Epic Documentation:

    **Epic Title:**
    ${epicTitle}

    **Test Plan:**
    ${testPlan}

    **Acceptance Criteria:**
    ${acceptanceCriteria.map((ac, index) => `${index + 1}. ${ac}`).join('\n')}

    **Raw Test Cases Input:**
    ${testCases}
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: userPrompt,
            config: {
                systemInstruction: SYSTEM_INSTRUCTION_EPIC_DOC,
                temperature: 0.5,
            }
        });

        return response.text;
    } catch (error) {
        console.error('Error calling Gemini API for epic documentation:', error);
        if (error instanceof Error) {
            throw new Error(`An error occurred while generating the documentation: ${error.message}`);
        }
        throw new Error('An unknown error occurred while generating the documentation.');
    }
};

export const generateAccessibilityAudit = async (
    context: string,
    techStack: string,
    artifacts: { type: 'url'; value: string } | { type: 'screenshots'; value: Part[] }
): Promise<string> => {
    if (!context.trim()) {
        throw new Error('Please provide context for the audit.');
    }
    if (artifacts.type === 'url' && !artifacts.value.trim()) {
        throw new Error('Please provide a URL.');
    }
    if (artifacts.type === 'screenshots' && artifacts.value.length === 0) {
        throw new Error('Please upload at least one screenshot.');
    }

    const textParts = [
        `**Context:** ${context}`,
        `**Tech Stack (Optional):** ${techStack || 'Not provided'}`
    ];
    
    // Fix: The 'parts' array for generateContent must be of type Part[], not (string | Part)[].
    // Strings must be wrapped in a text part object, e.g., { text: "..." }.
    const parts: Part[] = [];

    if (artifacts.type === 'url') {
        textParts.push(`**Artifact URL:** ${artifacts.value}`);
        parts.push({ text: textParts.join('\n\n') });
    } else {
        parts.push({ text: textParts.join('\n\n') });
        parts.push(...artifacts.value);
    }
    
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts },
            config: {
                systemInstruction: SYSTEM_INSTRUCTION_ACCESSIBILITY_AUDIT,
                temperature: 0.4,
            }
        });

        return response.text;
    } catch (error) {
        console.error('Error calling Gemini API for accessibility audit:', error);
        if (error instanceof Error) {
            throw new Error(`An error occurred while generating the audit: ${error.message}`);
        }
        throw new Error('An unknown error occurred while generating the audit.');
    }
};

export interface UsabilityTestResult {
    textReport: string;
    annotatedImagePart: Part | undefined;
}

export const generateUsabilityTest = async (
    context: string,
    screenshot: Part
): Promise<UsabilityTestResult> => {
    if (!context.trim()) {
        throw new Error('Please provide context for the usability test.');
    }

    const userPrompt = `Context: ${context}`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: { parts: [{ text: userPrompt }, screenshot] },
            config: {
                systemInstruction: SYSTEM_INSTRUCTION_USABILITY_TEST,
                // @ts-ignore - The type definitions might not include Modality yet
                responseModalities: [Modality.TEXT, Modality.IMAGE],
                temperature: 0.5,
            }
        });

        let textReport = '';
        let annotatedImagePart: Part | undefined = undefined;

        if (response.candidates && response.candidates[0].content.parts) {
            for (const part of response.candidates[0].content.parts) {
                if (part.text) {
                    textReport += part.text;
                } else if (part.inlineData) {
                    annotatedImagePart = part;
                }
            }
        }
        
        if (!textReport) {
            throw new Error("The AI did not return a text report.");
        }

        return { textReport, annotatedImagePart };

    } catch (error) {
        console.error('Error calling Gemini API for usability test:', error);
        if (error instanceof Error) {
            throw new Error(`An error occurred while generating the usability test: ${error.message}`);
        }
        throw new Error('An unknown error occurred while generating the usability test.');
    }
};

export const generatePipelineConfig = async (
    code: string,
    ciTool: string,
    runnerImage: string,
): Promise<string> => {
    if (!code.trim()) {
        throw new Error('Test automation code cannot be empty.');
    }

    const userPrompt = `
    CI/CD Platform: ${ciTool}
    Runner Image: ${runnerImage}
    
    Test Automation Code:
    ---
    ${code}
    ---
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: userPrompt,
            config: {
                systemInstruction: SYSTEM_INSTRUCTION_PIPELINE_GENERATOR,
                temperature: 0.3,
            }
        });

        return response.text;
    } catch (error) {
        console.error('Error calling Gemini API for pipeline generation:', error);
        if (error instanceof Error) {
            throw new Error(`An error occurred while generating the pipeline config: ${error.message}`);
        }
        throw new Error('An unknown error occurred while generating the pipeline config.');
    }
};

export const generateScenarioAnalysis = async (
    scenarios: string
): Promise<string> => {
    if (!scenarios.trim()) {
        throw new Error('Please provide at least one scenario.');
    }

    const userPrompt = `Here is the list of new feature scenarios:\n\n${scenarios}`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: userPrompt,
            config: {
                systemInstruction: SYSTEM_INSTRUCTION_SCENARIO_ANALYZER,
                temperature: 0.6,
            }
        });

        return response.text;
    } catch (error) {
        console.error('Error calling Gemini API for scenario analysis:', error);
        if (error instanceof Error) {
            throw new Error(`An error occurred while generating the analysis: ${error.message}`);
        }
        throw new Error('An unknown error occurred while generating the analysis.');
    }
};