import {describe, expect, it} from 'vitest';

import {
  isYoutubeDataApiConfigured,
  normalizeCaptionListItems,
  parseIso8601DurationSeconds,
  parseWebVttToEntries,
  pickCaptionListItem,
} from '../src/lib/youtube-data-api.js';

describe('parseIso8601DurationSeconds', () => {
  it('parses PT1H2M3S', () => {
    expect(parseIso8601DurationSeconds('PT1H2M3S')).toBe(3723);
  });

  it('returns 0 for empty', () => {
    expect(parseIso8601DurationSeconds('')).toBe(0);
  });
});

describe('parseWebVttToEntries', () => {
  it('parses simple WEBVTT cues', () => {
    const vtt = 'WEBVTT\n\n00:00:00.000 --> 00:00:02.000\nHello world\n';
    const entries = parseWebVttToEntries(vtt);
    expect(entries).toHaveLength(1);
    expect(entries[0].text).toBe('Hello world');
    expect(entries[0].startMs).toBe(0);
    expect(entries[0].durationMs).toBe(2000);
  });
});

describe('pickCaptionListItem', () => {
  it('prefers zh-Hans when listed', () => {
    const picked = pickCaptionListItem([
      {id: 'a', snippet: {language: 'en', trackKind: 'standard'}},
      {id: 'b', snippet: {language: 'zh-Hans', trackKind: 'standard'}},
    ]);
    expect(picked.id).toBe('b');
  });

  it('ignores items without top-level id', () => {
    const picked = pickCaptionListItem([
      {snippet: {language: 'en'}},
      {id: 'x', snippet: {language: 'de'}},
    ]);
    expect(picked.id).toBe('x');
  });
});

describe('normalizeCaptionListItems', () => {
  it('filters to caption resources with id', () => {
    const items = normalizeCaptionListItems({
      kind: 'youtube#captionListResponse',
      items: [
        {kind: 'youtube#caption', id: 'cid1', snippet: {language: 'en'}},
        {kind: 'youtube#caption', snippet: {language: 'fr'}},
        null,
      ],
    });
    expect(items).toHaveLength(1);
    expect(items[0].id).toBe('cid1');
  });

  it('returns empty for non-array items', () => {
    expect(normalizeCaptionListItems({items: null})).toEqual([]);
    expect(normalizeCaptionListItems({})).toEqual([]);
  });
});

describe('isYoutubeDataApiConfigured', () => {
  it('requires key and token', () => {
    expect(isYoutubeDataApiConfigured(undefined)).toBe(false);
    expect(isYoutubeDataApiConfigured({})).toBe(false);
    expect(isYoutubeDataApiConfigured({YOUTUBE_KEY: 'k'})).toBe(false);
    expect(isYoutubeDataApiConfigured({YOUTUBE_KEY: 'k', YOUTUBE_ACCESS_TOKEN: 't'})).toBe(true);
  });
});
