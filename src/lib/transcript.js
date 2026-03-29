import {generateGeminiJson} from './gemini.js';
import {buildTranscriptTranslationPrompt} from './prompt.js';
import {normalizeTranscriptEntries, normalizeOutputLanguage} from './render-model.js';

const MAX_TRANSLATION_CHARS = 6000;

export async function translateTranscript({
  apiKey,
  model,
  transcriptEntries,
  targetLanguage,
  fetchFn = fetch,
}) {
  const normalizedEntries = normalizeTranscriptEntries(transcriptEntries);
  const language = normalizeOutputLanguage(targetLanguage);
  if (!normalizedEntries.length) {
    return {entries: []};
  }

  const translatedEntries = [];
  const chunks = chunkTranscriptEntries(normalizedEntries, MAX_TRANSLATION_CHARS);

  for (const chunk of chunks) {
    const result = await generateGeminiJson({
      apiKey,
      model,
      prompt: buildTranscriptTranslationPrompt({
        transcriptEntries: chunk,
        targetLanguage: language,
      }),
      fetchFn,
    });
    translatedEntries.push(...mergeTranslatedChunk(chunk, result?.entries || []));
  }

  return {
    language,
    entries: translatedEntries,
  };
}

function chunkTranscriptEntries(entries, maxChars) {
  const chunks = [];
  let currentChunk = [];
  let currentChars = 0;

  entries.forEach((entry) => {
    const entryChars = entry.text.length + entry.id.length + 32;
    if (currentChunk.length && currentChars + entryChars > maxChars) {
      chunks.push(currentChunk);
      currentChunk = [];
      currentChars = 0;
    }
    currentChunk.push(entry);
    currentChars += entryChars;
  });

  if (currentChunk.length) {
    chunks.push(currentChunk);
  }
  return chunks;
}

function mergeTranslatedChunk(sourceEntries, translatedEntries) {
  const textById = new Map(
    translatedEntries.map((entry) => [entry.id, String(entry.text || '').trim()]),
  );

  return sourceEntries.map((entry) => ({
    ...entry,
    text: textById.get(entry.id) || entry.text,
  }));
}
