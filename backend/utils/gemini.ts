import { GoogleGenAI } from '@google/genai';

let geminiInstance: GoogleGenAI | null = null;

export function getGemini(): GoogleGenAI {
  if (!geminiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is required');
    }
    geminiInstance = new GoogleGenAI({ apiKey });
  }
  return geminiInstance;
}
