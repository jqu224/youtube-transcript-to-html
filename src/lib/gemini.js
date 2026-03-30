import {GoogleGenAI} from '@google/genai';

const DEFAULT_MODEL = 'gemini-2.5-flash';

export function buildSummaryPrompt(transcriptText) {
  return [
    'You are an expert note-taker.',
    'Generate structured learning notes from this YouTube transcript.',
    'Include a concise overview, key bullet points, and major conclusions.',
    'Use semantic HTML tags (<h2>, <h3>, <ul>, <li>, <p>, <strong>).',
    'Keep wording clear and practical.',
    '',
    'Transcript:',
    transcriptText,
  ].join('\n');
}

export async function generateSummary(transcriptText, env) {
  const apiKey = env?.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured');
  }

  const model = env?.GEMINI_MODEL || DEFAULT_MODEL;
  const ai = new GoogleGenAI({apiKey});
  const response = await ai.models.generateContent({
    model,
    contents: buildSummaryPrompt(transcriptText),
  });

  if (!response.text) {
    throw new Error('Gemini returned an empty summary');
  }

  return response.text;
}
