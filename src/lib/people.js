import {generateGeminiJson} from './gemini.js';
import {buildPeoplePrompt, buildPersonDetailPrompt} from './prompt.js';
import {searchYouTubeVideos} from './youtube.js';

export async function buildPeopleTab({
  apiKey,
  model,
  video,
  transcriptEntries,
  options,
  fetchFn = fetch,
}) {
  const result = await generateGeminiJson({
    apiKey,
    model,
    prompt: buildPeoplePrompt({
      video,
      transcriptEntries,
      options,
    }),
    fetchFn,
  });

  const people = (result?.people || []).map((person, index) => ({
    id: slugify(person.name || `person-${index + 1}`),
    name: person.name || `人物 ${index + 1}`,
    role: person.role || '相关人物',
    whyRelevant: person.whyRelevant || '',
    confidence: Number(person.confidence || 0.5),
    keywords: Array.isArray(person.keywords) ? person.keywords : [],
    wikipediaUrl: `https://en.wikipedia.org/wiki/${encodeURIComponent((person.name || '').replace(/\s+/g, '_'))}`,
    googleUrl: `https://www.google.com/search?q=${encodeURIComponent(person.name || '')}`,
  }));

  return {people};
}

export async function buildPersonDetail({
  apiKey,
  model,
  personName,
  video,
  transcriptEntries,
  fetchFn = fetch,
}) {
  const [aiDetail, wikiProfile, relatedVideos] = await Promise.all([
    generateGeminiJson({
      apiKey,
      model,
      prompt: buildPersonDetailPrompt({
        personName,
        video,
        transcriptEntries,
      }),
      fetchFn,
    }).catch(() => null),
    fetchWikipediaProfile(personName, fetchFn).catch(() => null),
    searchYouTubeVideos(personName, fetchFn, 8).catch(() => []),
  ]);

  return {
    personName,
    headline: aiDetail?.headline || wikiProfile?.title || personName,
    summary: aiDetail?.summary || wikiProfile?.extract || `${personName} 的补充资料暂时有限。`,
    connectionToVideo: aiDetail?.connectionToVideo || '该人物与当前视频主题存在一定关联。',
    searchKeywords: aiDetail?.searchKeywords || [personName],
    profile: wikiProfile,
    links: {
      wikipedia: wikiProfile?.contentUrls?.desktop?.page
        || `https://en.wikipedia.org/wiki/${encodeURIComponent(personName.replace(/\s+/g, '_'))}`,
      google: `https://www.google.com/search?q=${encodeURIComponent(personName)}`,
    },
    relatedVideos: relatedVideos.slice(0, 6),
  };
}

export async function fetchWikipediaProfile(name, fetchFn = fetch) {
  const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(name)}&format=json&origin=*`;
  const searchResponse = await fetchFn(searchUrl);
  if (!searchResponse.ok) {
    throw new Error(`Wikipedia search failed (${searchResponse.status}).`);
  }

  const searchData = await searchResponse.json();
  const pageTitle = searchData?.query?.search?.[0]?.title;
  if (!pageTitle) {
    throw new Error('No Wikipedia page found.');
  }

  const summaryUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(pageTitle)}`;
  const summaryResponse = await fetchFn(summaryUrl);
  if (!summaryResponse.ok) {
    throw new Error(`Wikipedia summary failed (${summaryResponse.status}).`);
  }
  return summaryResponse.json();
}

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 64);
}
