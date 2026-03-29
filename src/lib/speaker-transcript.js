import instructionData from './speaker-transcript-instruction.json' with {type: 'json'};

/**
 * Builds the user prompt for baoyu-style speaker + chapter transcript processing.
 * Instruction text is bundled from `.cursor/skills/baoyu-youtube-transcript/prompts/speaker-transcript.md`
 * (see `npm run speakers:sync-prompt`).
 *
 * @param {string} rawMarkdown Full raw markdown from `bun .../main.ts '<url>' --speakers`
 * @returns {string}
 */
export function buildSpeakerTranscriptPrompt(rawMarkdown) {
  const instruction = instructionData.text.trim();
  const raw = String(rawMarkdown || '').trim();
  if (!raw) {
    throw new Error('Raw speaker transcript markdown is required.');
  }
  return `${instruction}

---

Below is the raw transcript file to process. Output only the final markdown document.

${raw}`;
}
