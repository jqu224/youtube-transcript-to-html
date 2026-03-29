export const DEFAULT_GEMINI_MODEL = 'gemini-2.5-flash';
export const SUPPORTED_OUTPUT_LANGUAGES = new Set(['en', 'zh']);

export const TAB_IDS = {
  SUMMARY: 'summary',
  MINDMAP: 'mindmap',
  RELATED: 'related',
  PEOPLE: 'people',
};

export const TAB_CONFIG = [
  {
    id: TAB_IDS.SUMMARY,
    label: 'AI Summary',
    description: 'Streamed Chinese editorial article output.',
  },
  {
    id: TAB_IDS.MINDMAP,
    label: 'Mindmap',
    description: 'Hierarchical topic breakdown from the transcript.',
  },
  {
    id: TAB_IDS.RELATED,
    label: 'Related Videos',
    description: 'Likely next-watch recommendations.',
  },
  {
    id: TAB_IDS.PEOPLE,
    label: 'People',
    description: 'Person cards, wiki-style details, and related videos.',
  },
];

export const DEFAULT_STYLE_OPTIONS = {
  theme: 'light',
  fontScale: 1,
  contentWidth: 880,
  panelRatio: 38,
  paragraphSpacing: 1,
  emphasisDensity: 'balanced',
};

export const DEFAULT_GENERATION_OPTIONS = {
  language: 'en',
  tone: 'insightful',
  length: 'detailed',
  sectionDensity: 'balanced',
  titleStyle: 'editorial',
  quoteEmphasis: 'high',
  audience: 'general',
  mindmapDepth: 'balanced',
  relatedFocus: 'adjacent',
  peopleDepth: 'balanced',
};

export const SUMMARY_ALLOWED_TAGS = new Set([
  'article',
  'section',
  'header',
  'footer',
  'h1',
  'h2',
  'h3',
  'h4',
  'p',
  'ul',
  'ol',
  'li',
  'blockquote',
  'strong',
  'em',
  'code',
  'pre',
  'hr',
  'br',
  'span',
  'div',
]);

export function normalizeGenerationOptions(options = {}) {
  const merged = {
    ...DEFAULT_GENERATION_OPTIONS,
    ...stripUndefined(options),
  };
  return {
    ...merged,
    language: normalizeOutputLanguage(merged.language),
  };
}

export function normalizeStyleOptions(options = {}) {
  const merged = {
    ...DEFAULT_STYLE_OPTIONS,
    ...stripUndefined(options),
  };
  return {
    ...merged,
    fontScale: clampNumber(merged.fontScale, 0.85, 1.45),
    contentWidth: clampNumber(merged.contentWidth, 680, 1120),
    panelRatio: clampNumber(merged.panelRatio, 30, 55),
    paragraphSpacing: clampNumber(merged.paragraphSpacing, 0.8, 1.5),
  };
}

export function normalizeTranscriptEntries(entries = []) {
  return entries
    .filter((entry) => entry && entry.text)
    .map((entry, index) => ({
      id: entry.id || `cue-${index + 1}`,
      startMs: Number(entry.startMs || 0),
      durationMs: Number(entry.durationMs || 0),
      text: String(entry.text).replace(/\s+/g, ' ').trim(),
    }))
    .filter((entry) => entry.text);
}

export function serializeTranscriptForPrompt(entries, maxChars = 18000) {
  const lines = normalizeTranscriptEntries(entries).map((entry) => {
    return `[${formatTimestamp(entry.startMs)}] ${entry.text}`;
  });
  return trimToMaxChars(lines.join('\n'), maxChars);
}

export function summarizeTranscript(entries, maxItems = 24) {
  return normalizeTranscriptEntries(entries).slice(0, maxItems).map((entry) => ({
    id: entry.id,
    startLabel: formatTimestamp(entry.startMs),
    text: entry.text,
  }));
}

export function makeWorkspacePayload({ video, transcript }) {
  return {
    video,
    transcript: {
      entries: normalizeTranscriptEntries(transcript?.entries || []),
      language: transcript?.language || '',
      source: transcript?.source || '',
    },
    tabConfig: TAB_CONFIG,
    defaults: {
      style: DEFAULT_STYLE_OPTIONS,
      generation: DEFAULT_GENERATION_OPTIONS,
      model: DEFAULT_GEMINI_MODEL,
    },
  };
}

export function formatTimestamp(startMs) {
  const totalSeconds = Math.max(0, Math.floor(Number(startMs || 0) / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export function trimToMaxChars(value, maxChars) {
  if (value.length <= maxChars) {
    return value;
  }
  return `${value.slice(0, Math.max(0, maxChars - 48)).trim()}\n...[truncated for prompt budget]`;
}

export function normalizeOutputLanguage(value) {
  return SUPPORTED_OUTPUT_LANGUAGES.has(value) ? value : 'en';
}

function clampNumber(value, min, max) {
  return Math.min(max, Math.max(min, Number(value || 0)));
}

function stripUndefined(obj) {
  return Object.fromEntries(
    Object.entries(obj).filter(([, value]) => value !== undefined && value !== null && value !== ''),
  );
}
