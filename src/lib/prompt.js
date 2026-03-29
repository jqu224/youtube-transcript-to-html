import {normalizeGenerationOptions, serializeTranscriptForPrompt} from './render-model.js';

const SUMMARY_HTML_RULES = `
Only output HTML fragments for the main article body. Do not wrap the result in markdown fences.
Use semantic tags from this list only: article, section, header, h1, h2, h3, p, ul, ol, li, blockquote, strong, em, hr.
Preserve key claims, disagreements, speaker dynamics, and notable quotes.
Make the layout feel editorial and readable, similar to a premium AI summary page.
Prefer short sections with clear headings over giant text blocks.
When helpful, prefix direct speech with strong speaker labels such as <p><strong>Jen:</strong> ...</p>.
`;

export function buildSummaryPrompt({video, transcriptEntries, options}) {
  const generation = normalizeGenerationOptions(options);
  const transcript = serializeTranscriptForPrompt(transcriptEntries, 22000);
  const language = getOutputLanguageConfig(generation.language);
  return `
You are writing the default "AI Summary" tab for a YouTube transcript analysis workspace.

Video title: ${video.title}
Channel: ${video.channelTitle}
Audience: ${generation.audience}
Tone: ${generation.tone}
Length target: ${generation.length}
Section density: ${generation.sectionDensity}
Title style: ${generation.titleStyle}
Quote emphasis: ${generation.quoteEmphasis}

${language.writingRule}
${SUMMARY_HTML_RULES}

Output structure requirements:
1. Start with one strong <h1> title in ${language.articleLabel}.
2. Follow with 4-8 <section> blocks with <h2> headings.
3. Use paragraphs with crisp topic transitions.
4. Surface the most interesting arguments, numbers, disagreements, and future-looking statements.
5. Keep the article polished enough that a user could read it directly as the final rendered page.

Transcript:
${transcript}
`.trim();
}

export function buildMindmapPrompt({video, transcriptEntries, options}) {
  const generation = normalizeGenerationOptions(options);
  const transcript = serializeTranscriptForPrompt(transcriptEntries, 16000);
  const language = getOutputLanguageConfig(generation.language);
  return `
Return valid JSON only. No markdown fences.

Build a ${language.proseLabel} mind map from this transcript.
Video title: ${video.title}
Mindmap depth: ${generation.mindmapDepth}

JSON shape:
{
  "title": "string",
  "nodes": [
    {
      "label": "string",
      "summary": "string",
      "children": [
        {
          "label": "string",
          "summary": "string",
          "children": []
        }
      ]
    }
  ]
}

Rules:
- 4-7 top-level nodes.
- Each node summary must be one concise ${language.proseLabel} sentence.
- Reflect the actual argument structure of the transcript, not generic categories.

Transcript:
${transcript}
`.trim();
}

export function buildPeoplePrompt({video, transcriptEntries, options}) {
  const generation = normalizeGenerationOptions(options);
  const transcript = serializeTranscriptForPrompt(transcriptEntries, 16000);
  const language = getOutputLanguageConfig(generation.language);
  return `
Return valid JSON only. No markdown fences.

Identify important people in or around this video. These may be speakers, hosts, guests, organizations treated as key actors, or frequently referenced public figures.
Video title: ${video.title}
People depth: ${generation.peopleDepth}

JSON shape:
{
  "people": [
    {
      "name": "string",
      "role": "string",
      "whyRelevant": "string",
      "confidence": 0.0,
      "keywords": ["string"]
    }
  ]
}

Rules:
- Return 3-8 people.
- Use concise ${language.proseLabel} for role and relevance.
- Confidence must be between 0 and 1.
- Prefer real names over vague labels.

Transcript:
${transcript}
`.trim();
}

export function buildRelatedVideosPrompt({video, transcriptEntries, searchResults, options}) {
  const generation = normalizeGenerationOptions(options);
  const transcript = serializeTranscriptForPrompt(transcriptEntries, 12000);
  const language = getOutputLanguageConfig(generation.language);
  const candidates = searchResults
    .map((item, index) => {
      return `${index + 1}. ${item.title} | ${item.channelTitle} | ${item.url}`;
    })
    .join('\n');

  return `
Return valid JSON only. No markdown fences.

You are ranking "watch next" candidates for a user who just watched this video.
Video title: ${video.title}
Related focus: ${generation.relatedFocus}

Choose the best candidates from the list below and explain why they are relevant.

JSON shape:
{
  "recommendations": [
    {
      "videoId": "string",
      "title": "string",
      "channelTitle": "string",
      "url": "string",
      "reason": "string",
      "likelihood": 0.0
    }
  ]
}

Rules:
- Return 4-6 recommendations.
- Use only candidates from the provided list.
- likelihood must be between 0 and 1.
- Reasons should be concise ${language.proseLabel} sentences.

Original transcript context:
${transcript}

Candidates:
${candidates}
`.trim();
}

export function buildTranscriptTranslationPrompt({transcriptEntries, targetLanguage}) {
  const language = getOutputLanguageConfig(targetLanguage);
  const transcript = serializeTranscriptForPrompt(transcriptEntries, 10000);
  return `
Return valid JSON only. No markdown fences.

Translate each transcript cue into ${language.proseLabel}.

JSON shape:
{
  "entries": [
    {
      "id": "cue-1",
      "text": "translated text"
    }
  ]
}

Rules:
- Preserve the meaning and tone of each cue.
- Keep cue ids exactly the same.
- Translate cue text only. Do not summarize or merge cues.
- Return one entry for every cue in the same order.
- If a cue is already in ${language.proseLabel}, keep it natural and concise.

Transcript:
${transcript}
`.trim();
}

export function buildPersonDetailPrompt({personName, video, transcriptEntries, options}) {
  const generation = normalizeGenerationOptions(options);
  const language = getOutputLanguageConfig(generation.language);
  const transcript = serializeTranscriptForPrompt(transcriptEntries, 10000);
  return buildLocalizedPersonDetailPrompt({
    personName,
    video,
    transcript,
    language,
  });
}

function buildLocalizedPersonDetailPrompt({personName, video, transcript, language}) {
  return `
Return valid JSON only. No markdown fences.

Create a short ${language.proseLabel} detail card for the person below in the context of this video.

Person: ${personName}
Video title: ${video.title}

JSON shape:
{
  "headline": "string",
  "summary": "string",
  "connectionToVideo": "string",
  "searchKeywords": ["string"]
}

Rules:
- Use concise ${language.proseLabel}.
- If the transcript context is weak, say so honestly.
- searchKeywords should help find more videos about this person.

Transcript:
${transcript}
`.trim();
}

export function buildRecommendationQuery(video) {
  return `${video.title} ${video.channelTitle}`.trim();
}

function getOutputLanguageConfig(language) {
  if (language === 'zh') {
    return {
      proseLabel: 'Simplified Chinese',
      articleLabel: 'Simplified Chinese',
      writingRule: 'Write in fluent Simplified Chinese.',
    };
  }

  return {
    proseLabel: 'English',
    articleLabel: 'English',
    writingRule: 'Write in fluent English.',
  };
}
