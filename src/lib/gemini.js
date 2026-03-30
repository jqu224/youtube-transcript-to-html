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

export function buildSmartnotePrompt(transcriptText) {
  return [
    'You are an expert editor creating lightweight smartnotes from a YouTube transcript.',
    'Return semantic HTML only.',
    'Structure requirements:',
    '- Start each major theme with <h2>',
    '- Add a concise subsection title with <h3>',
    '- Under each subsection, write short bullet lines as <ul><li>...</li></ul>',
    '- Include speaker-led lines when possible using format: <strong>Speaker:</strong> sentence',
    '- Keep each bullet concise and readable (1-2 sentences)',
    '- Preserve the original language of the transcript',
    '',
    'The style should feel like section-by-section smartnotes, not a dense essay.',
    '',
    'Transcript:',
    transcriptText,
  ].join('\n');
}

export async function generateSummary(transcriptText, env) {
  return generateFromPrompt(buildSummaryPrompt(transcriptText), env, 'summary');
}

export async function generateSmartnote(transcriptText, env) {
  return generateFromPrompt(buildSmartnotePrompt(transcriptText), env, 'smartnote');
}

async function generateFromPrompt(prompt, env, label) {
  const apiKey = env?.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured');
  }

  const model = env?.GEMINI_MODEL || DEFAULT_MODEL;
  const ai = new GoogleGenAI({apiKey});
  const response = await ai.models.generateContent({
    model,
    contents: prompt,
  });

  if (!response.text) {
    throw new Error(`Gemini returned an empty ${label}`);
  }

  return response.text;
}
