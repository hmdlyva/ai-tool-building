
import { GoogleGenAI, Part } from '@google/genai';
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