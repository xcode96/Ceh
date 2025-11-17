// FIX: Import GenerateContentResponse to correctly type the API response.
import { GoogleGenAI, Type, GenerateContentResponse } from '@google/genai';
import type { Question, SubTopic } from '../types';

// FIX: Corrected generic type parameter from <T,> to <T> to fix type inference.
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


export const generateQuestionsForModule = async (moduleTitle: string, subTopics: SubTopic[], specificSubTopic?: string | null, contentPoint?: string | null): Promise<Omit<Question, 'id'>[]> => {
  if (!process.env.API_KEY) {
    console.error("API_KEY environment variable not set.");
    const topic = contentPoint || specificSubTopic || moduleTitle;
    // Return mock data if API key is not available
    return Promise.resolve([
        {
            question: `What is the primary purpose of Multi-Factor Authentication (MFA) in the context of ${topic}?`,
            options: [
                "To make passwords longer",
                "To add an extra layer of security beyond just a password",
                "To share your account with a colleague safely",
                "To automatically change your password every month"
            ],
            correctAnswer: "To add an extra layer of security beyond just a password"
        },
        {
            question: `Which of these is the strongest password, based on the principles of ${topic}?`,
            options: [
                "Password123",
                "MyDogFido!2024",
                "!@#$%",
                "th1s-Is-a-V3ry-L0ng-&-C0mpl3x-P@ssphr@se!"
            ],
            correctAnswer: "th1s-Is-a-V3ry-L0ng-&-C0mpl3x-P@ssphr@se!"
        }
    ]);
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const prompt = contentPoint && specificSubTopic
      ? `
        Generate 5 highly specific multiple-choice quiz questions for the cybersecurity topic: "${contentPoint}".
        This topic is part of the sub-topic "${specificSubTopic}" within the training module "${moduleTitle}".
        Ensure the questions are laser-focused on "${contentPoint}".
        For each question, provide 4 options and clearly indicate the single correct answer.
        Return the result as a JSON array.
      `
      : specificSubTopic
      ? (() => {
          const subTopicData = subTopics.find(st => st.title === specificSubTopic);
          const contentPoints = subTopicData?.content && subTopicData.content.length > 0
            ? `The questions should cover these specific points: ${subTopicData.content.join(', ')}.`
            : '';
          return `
            Generate 10 multiple-choice quiz questions for the specific cybersecurity sub-topic: "${specificSubTopic}".
            This sub-topic is part of the broader training module titled "${moduleTitle}".
            Ensure the questions are highly relevant to the sub-topic.
            ${contentPoints}
            For each question, provide 4 options and clearly indicate the single correct answer.
            Return the result as a JSON array.
          `;
        })()
      : `
        Generate ${subTopics.length} multiple-choice quiz questions for a cybersecurity training module titled "${moduleTitle}".
        The questions should provide a broad overview, with one question dedicated to each of the following sub-topics: ${subTopics.map(st => st.title).join(', ')}.
        For each question, provide 4 options and clearly indicate the single correct answer.
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
            },
            required: ['question', 'options', 'correctAnswer'],
          },
        },
      },
    });

    const response: GenerateContentResponse = await fetchWithTimeout(responsePromise, 8000);
    const jsonText = response.text.trim();
    const questions: Omit<Question, 'id'>[] = JSON.parse(jsonText);
    
    if (!Array.isArray(questions) || questions.length === 0 || !questions[0].question) {
        throw new Error("Invalid format received from API");
    }

    return questions;

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
        For each question, provide 4 options and the correct answer.
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
            },
            required: ['question', 'options', 'correctAnswer'],
          },
        },
      },
    });

    const response: GenerateContentResponse = await fetchWithTimeout(responsePromise, 8000);
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
            IMPORTANT: DO NOT reveal which option is correct or even hint at it. Your goal is to help the student understand the question itself, not to give them the answer.
            Keep the tone helpful and educational. The explanation should be a single paragraph.
        `;

        const responsePromise = ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        const response: GenerateContentResponse = await fetchWithTimeout(responsePromise, 8000);
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
            Briefly elaborate on the concept to solidify their understanding.
            Keep the tone encouraging and educational. The explanation should be a single paragraph.
        `
        : `
            You are a cybersecurity expert tutor.
            A student answered a quiz question incorrectly.
            Question: "${question}"
            They chose: "${userAnswer}"
            The correct answer is: "${correctAnswer}"
            
            Please provide a clear and concise explanation. First, explain why their choice ("${userAnswer}") is incorrect. Then, explain why "${correctAnswer}" is the correct answer.
            This will help them learn from their mistake.
            Keep the tone helpful and educational, not critical. The explanation should be one to two paragraphs.
        `;

        const responsePromise = ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        const response: GenerateContentResponse = await fetchWithTimeout(responsePromise, 8000);
        return response.text;

    } catch (error) {
        console.error('Error generating explanation with Gemini:', error);
        throw new Error("Failed to generate explanation.");
    }
};