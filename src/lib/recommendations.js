import {generateGeminiJson} from './gemini.js';
import {buildRecommendationQuery, buildRelatedVideosPrompt} from './prompt.js';
import {searchYouTubeVideos} from './youtube.js';

export async function buildRelatedVideosTab({
  apiKey,
  model,
  video,
  transcriptEntries,
  options,
  fetchFn = fetch,
}) {
  const query = buildRecommendationQuery(video);
  const searchResults = await searchYouTubeVideos(query, fetchFn, 12);
  const filteredResults = searchResults.filter((item) => item.videoId !== video.id);

  if (!filteredResults.length) {
    return {
      query,
      recommendations: [],
      fallbackMessage: '暂时没有抓到可用的 YouTube 搜索结果。',
    };
  }

  try {
    const result = await generateGeminiJson({
      apiKey,
      model,
      prompt: buildRelatedVideosPrompt({
        video,
        transcriptEntries,
        searchResults: filteredResults,
        options,
      }),
      fetchFn,
    });

    return {
      query,
      recommendations: (result?.recommendations || [])
        .map((item) => {
          const source = filteredResults.find((candidate) => candidate.videoId === item.videoId)
            || filteredResults.find((candidate) => candidate.url === item.url)
            || null;
          return {
            videoId: source?.videoId || item.videoId || '',
            title: source?.title || item.title || 'Untitled',
            channelTitle: source?.channelTitle || item.channelTitle || '',
            url: source?.url || item.url || '',
            thumbnailUrl: source?.thumbnailUrl || '',
            duration: source?.duration || '',
            reason: item.reason || '',
            likelihood: Number(item.likelihood || 0.5),
          };
        })
        .filter((item) => item.videoId),
    };
  } catch {
    return {
      query,
      fallbackMessage: '使用候选结果作为保底推荐，因为 AI 排序暂时不可用。',
      recommendations: filteredResults.slice(0, 6).map((item, index) => ({
        ...item,
        reason: index === 0
          ? '与当前视频标题和主题最接近。'
          : '基于标题匹配和频道相关性给出的保底推荐。',
        likelihood: Number((0.88 - index * 0.08).toFixed(2)),
      })),
    };
  }
}
