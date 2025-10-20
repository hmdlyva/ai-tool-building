import { GoogleGenAI } from '@google/genai';
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
            model: 'gemini-2.5-flash', // Using a pro model for better code generation
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