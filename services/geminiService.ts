import { GoogleGenAI, Type, GenerateContentResponse } from '@google/genai';
import type { Question, SubTopic, DifficultyLevel } from '../types';

const fetchWithTimeout = <T>(promise: Promise<T>, ms: number): Promise<T> => {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new Error("API call timed out"));
    }, ms);

    promise.then(
      (res) => {
        clearTimeout(timeoutId);
        resolve(res);
      },
      (err) => {
        clearTimeout(timeoutId);
        reject(err);
      }
    );
  });
}


export const generateQuestionsForModule = async (
    moduleTitle: string, 
    subTopics: SubTopic[], 
    specificSubTopic?: string | null, 
    contentPoint?: string | null, 
    count: number = 5,
    difficulty: DifficultyLevel = 'Medium'
): Promise<Omit<Question, 'id'>[]> => {
  if (!process.env.API_KEY) {
    console.error("API_KEY environment variable not set.");
    const topic = contentPoint || specificSubTopic || moduleTitle;
    // Return mock data if API key is not available
    return Promise.resolve([
        {
            question: `[Mock ${difficulty}] What is the primary purpose of Multi-Factor Authentication (MFA) in the context of ${topic}?`,
            options: [
                "To make passwords longer",
                "To add an extra layer of security beyond just a password",
                "To share your account with a colleague safely",
                "To automatically change your password every month"
            ],
            correctAnswer: "To add an extra layer of security beyond just a password",
            explanation: "MFA requires users to provide two or more verification factors to gain access to a resource, significantly increasing security over passwords alone.",
            difficulty: difficulty
        },
        {
            question: `[Mock ${difficulty}] Which of these is the strongest password, based on the principles of ${topic}?`,
            options: [
                "Password123",
                "MyDogFido!2024",
                "!@#$%",
                "th1s-Is-a-V3ry-L0ng-&-C0mpl3x-P@ssphr@se!"
            ],
            correctAnswer: "th1s-Is-a-V3ry-L0ng-&-C0mpl3x-P@ssphr@se!",
            explanation: "Length and complexity are key factors in password strength. The correct option is a long passphrase with mixed characters, making it much harder to crack.",
            difficulty: difficulty
        }
    ]);
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    let difficultyInstruction = "";
    switch (difficulty) {
        case 'Low':
            difficultyInstruction = "The questions should be Introductory/Easy. Focus on basic definitions, recognizing terms, and fundamental concepts. Avoid complex scenarios.";
            break;
        case 'Medium':
            difficultyInstruction = "The questions should be Intermediate. Focus on application of concepts, understanding 'how' and 'why', and distinguishing between similar terms.";
            break;
        case 'Advanced':
            difficultyInstruction = "The questions should be Advanced/Expert. Focus on complex scenarios, analyzing logs/outputs, strategic decision making, and deep technical details.";
            break;
        default:
            difficultyInstruction = "The questions should be of intermediate difficulty.";
    }

    const prompt = contentPoint && specificSubTopic
      ? `
        Generate ${count} highly specific multiple-choice quiz questions for the cybersecurity topic: "${contentPoint}".
        This topic is part of the sub-topic "${specificSubTopic}" within the training module "${moduleTitle}".
        ${difficultyInstruction}
        Ensure the questions are laser-focused on "${contentPoint}".
        For each question:
        1. Provide 4 options.
        2. Clearly indicate the single correct answer.
        3. Provide a **detailed explanation** (2-3 sentences) of why the answer is correct and/or why the others are incorrect.
        Return the result as a JSON array.
      `
      : specificSubTopic
      ? (() => {
          const subTopicData = subTopics.find(st => st.title === specificSubTopic);
          const contentPoints = subTopicData?.content && subTopicData.content.length > 0
            ? `The questions should cover these specific points: ${subTopicData.content.join(', ')}.`
            : '';
          return `
            Generate ${count} multiple-choice quiz questions for the specific cybersecurity sub-topic: "${specificSubTopic}".
            This sub-topic is part of the broader training module titled "${moduleTitle}".
            ${difficultyInstruction}
            Ensure the questions are highly relevant to the sub-topic.
            ${contentPoints}
            For each question:
            1. Provide 4 options.
            2. Clearly indicate the single correct answer.
            3. Provide a **detailed explanation** (2-3 sentences) of why the answer is correct and/or why the others are incorrect.
            Return the result as a JSON array.
          `;
        })()
      : `
        Generate ${count} multiple-choice quiz questions for a cybersecurity training module titled "${moduleTitle}".
        The questions should provide a broad overview, with one question dedicated to each of the following sub-topics: ${subTopics.map(st => st.title).join(', ')}.
        ${difficultyInstruction}
        For each question:
        1. Provide 4 options.
        2. Clearly indicate the single correct answer.
        3. Provide a **detailed explanation** (2-3 sentences) of why the answer is correct and/or why the others are incorrect.
        Return the result as a JSON array.
      `;

    const responsePromise = ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              question: { type: Type.STRING },
              options: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              correctAnswer: { type: Type.STRING },
              explanation: { type: Type.STRING },
            },
            required: ['question', 'options', 'correctAnswer', 'explanation'],
          },
        },
      },
    });

    // Increased timeout to 120 seconds to accommodate larger batches (up to 20 questions) with detailed explanations
    const response: GenerateContentResponse = await fetchWithTimeout(responsePromise, 120000); 
    const jsonText = response.text.trim();
    const questions: Omit<Question, 'id'>[] = JSON.parse(jsonText);
    
    if (!Array.isArray(questions) || questions.length === 0 || !questions[0].question) {
        throw new Error("Invalid format received from API");
    }

    // Inject the difficulty level into the returned objects for reference
    return questions.map(q => ({ ...q, difficulty }));

  } catch (error) {
    console.error('Error generating questions with Gemini:', error);
    throw error;
  }
};

export const generateQuestionSuggestions = async (moduleTitle: string, subTopic: string): Promise<Omit<Question, 'id'>[]> => {
   if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set.");
  }
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `
        Generate 3 distinct multiple-choice quiz questions for the cybersecurity sub-topic: "${subTopic}", which is part of the module "${moduleTitle}".
        These questions are suggestions for an admin creating a quiz. They should be clear, relevant, and challenging.
        For each question, provide 4 options, the correct answer, and a brief explanation.
        Return the result as a JSON array.
      `;
    
    const responsePromise = ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              question: { type: Type.STRING },
              options: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              correctAnswer: { type: Type.STRING },
              explanation: { type: Type.STRING },
            },
            required: ['question', 'options', 'correctAnswer', 'explanation'],
          },
        },
      },
    });

    const response: GenerateContentResponse = await fetchWithTimeout(responsePromise, 30000);
    const jsonText = response.text.trim();
    return JSON.parse(jsonText);
  } catch(error) {
    console.error('Error generating suggestions with Gemini:', error);
    throw new Error("Failed to generate suggestions.");
  }
};


export const generateExplanationForQuestion = async (question: string, options: string[]): Promise<string> => {
    if (!process.env.API_KEY) {
        return "Gemini API key not configured. Cannot provide explanation.";
    }
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const prompt = `
            You are a cybersecurity expert tutor.
            A student is looking at the following quiz question and needs help understanding the concept behind it without getting the answer.
            Question: "${question}"
            The options are: ${options.join(', ')}.

            Please provide a clear and concise explanation of the core concept or topic this question is testing. Explain any key terms if necessary.
            Start with a 💡 emoji.

            **Use markdown for formatting.**
            - Use bullet points with a '-' or '*' for lists (e.g., for examples or key points).
            - Use bold text with '**' for emphasis.

            For example:
            💡 **Understanding the CIA Triad**
            This question is about the three core principles of information security, known as the CIA Triad. Let's break them down:
            *   **Confidentiality**: Keeping data secret.
            *   **Integrity**: Ensuring data is accurate and trustworthy.
            *   **Availability**: Making sure data is accessible when needed.
            Think about which of these principles is most related to preventing unauthorized *disclosure*.

            IMPORTANT: DO NOT reveal which option is correct or even hint at it. Your goal is to help the student understand the question itself, not to give them the answer.
            Keep the tone helpful and educational.
        `;

        const responsePromise = ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        const response: GenerateContentResponse = await fetchWithTimeout(responsePromise, 20000);
        return response.text;

    } catch (error) {
        console.error('Error generating question explanation with Gemini:', error);
        throw new Error("Failed to generate question explanation.");
    }
};


export const generateExplanationForAnswer = async (question: string, correctAnswer: string, userAnswer: string): Promise<string> => {
    if (!process.env.API_KEY) {
        return "Gemini API key not configured. Cannot provide explanation.";
    }
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const isCorrect = correctAnswer === userAnswer;

        const prompt = isCorrect 
        ? `
            You are a cybersecurity expert tutor.
            A student correctly answered a quiz question.
            Question: "${question}"
            Their correct answer was: "${userAnswer}"
            
            Please provide a positive and concise explanation that reinforces why their answer is correct. 
            Start with a ✅ emoji. Briefly elaborate on the concept to solidify their understanding.

            **Use markdown for formatting.**
            - Use bullet points with a '-' or '*' for lists (e.g., for examples or key points).
            - Use bold text with '**' for emphasis.

            For example:
            ✅ **Correct!**
            You're right, the answer is **Principle of Least Privilege**. This is a key security concept:
            *   Users should only have access to the information and resources they absolutely need to perform their jobs.
            *   This minimizes the damage from a compromised account.

            Keep the tone encouraging and educational.
        `
        : `
            You are a cybersecurity expert tutor.
            A student answered a quiz question incorrectly.
            Question: "${question}"
            They chose: "${userAnswer}"
            The correct answer is: "${correctAnswer}"
            
            Please provide a clear and concise explanation. Start with a ❌ emoji. 
            1.  Explain why their choice ("${userAnswer}") is incorrect.
            2.  Explain why "${correctAnswer}" is the correct answer.
            This will help them learn from their mistake.

            **Use markdown for formatting.**
            - Use bullet points with a '-' or '*' for lists (e.g., for examples or key points).
            - Use bold text with '**' for emphasis.

            For example:
            ❌ **Incorrect**
            Your answer, **Phishing**, is incorrect because it typically involves fraudulent emails.
            The correct answer is **Vishing**. Here's why:
            *   Vishing stands for 'voice phishing'.
            *   It uses phone calls or voice messages.
            *   The goal is to trick people into giving up personal information.

            Keep the tone helpful and educational, not critical.
        `;

        const responsePromise = ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        const response: GenerateContentResponse = await fetchWithTimeout(responsePromise, 20000);
        return response.text;

    } catch (error) {
        console.error('Error generating explanation with Gemini:', error);
        throw new Error("Failed to generate explanation.");
    }
};

export const generateTagsForQuestion = async (question: string, topic: string): Promise<string[]> => {
    if (!process.env.API_KEY) {
        // Return some default tags if API key is not configured
        return ["#cybersecurity", "#infosec", "#quiz"];
    }
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const prompt = `
            Based on the following cybersecurity quiz question and its general topic, generate 3 to 5 relevant and concise hashtags.
            The hashtags should start with '#'.
            These tags will be used for categorization and search.
            Topic: "${topic}"
            Question: "${question}"
            
            Return the result as a JSON array of strings. For example: ["#RiskManagement", "#CIA_Triad", "#SecurityPolicy"].
        `;

        const responsePromise = ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.STRING
                    }
                }
            }
        });

        const response: GenerateContentResponse = await fetchWithTimeout(responsePromise, 15000);
        const jsonText = response.text.trim();
        const tags: string[] = JSON.parse(jsonText);
        
        if (!Array.isArray(tags) || (tags.length > 0 && typeof tags[0] !== 'string')) {
            throw new Error("Invalid format received from API for tags");
        }
        
        return tags;

    } catch (error) {
        console.error('Error generating tags with Gemini:', error);
        // Fallback to generic tags on error
        return ["#cybersecurity", `#${topic.replace(/\s+/g, '')}`];
    }
};
