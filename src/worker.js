import {generateLlmJson, pingLlm, streamLlmText} from './lib/llm.js';
import {buildMindmapPrompt, buildSummaryPrompt} from './lib/prompt.js';
import {buildSpeakerTranscriptPrompt} from './lib/speaker-transcript.js';
import {
  makeTranscriptApiPayload,
  makeWorkspacePayload,
  normalizeGenerationOptions,
  normalizeTranscriptEntries,
  TRANSCRIPT_NDJSON_CHUNK_SIZE,
} from './lib/render-model.js';
import {buildRelatedVideosTab} from './lib/recommendations.js';
import {buildPeopleTab, buildPersonDetail} from './lib/people.js';
import {createRuntimeFetch} from './lib/runtime-fetch.js';
import {translateTranscript} from './lib/transcript.js';
import {fetchTranscriptPayload, fetchWorkspaceData, fetchWorkspaceMetadata} from './lib/youtube.js';
import {LOGO_ASSET_PATH, LOGO_PNG_BYTES} from './ui/brand.js';
import {SIMPLIFIED_VERSION_CLIENT_SOURCE} from './ui/simplified-version-client.js';
import {renderSimplifiedVersionTranscriptPage} from './ui/simplified-version-page.js';
import {CLIENT_APP_SOURCE} from './ui/client.js';
import {renderAppPage} from './ui/page.js';
import {APP_STYLES} from './ui/styles.js';

/** Browser/DevTools probe; avoids noisy 404s in wrangler logs */
const CHROME_DEVTOOLS_WELL_KNOWN_PATH = '/.well-known/appspecific/com.chrome.devtools.json';

const STATIC_ASSET_CACHE_CONTROL = 'public, max-age=3600';

export default {
  async fetch(request, env) {
    try {
      const url = new URL(request.url);
      const runtimeFetch = createRuntimeFetch({requestUrl: request.url});

      if (request.method === 'GET' && url.pathname === CHROME_DEVTOOLS_WELL_KNOWN_PATH) {
        return new Response('{}', {
          status: 200,
          headers: {
            'content-type': 'application/json; charset=utf-8',
            'cache-control': 'public, max-age=86400',
          },
        });
      }

      if (request.method === 'GET' && url.pathname === '/') {
        return htmlResponse(renderAppPage());
      }

      if (request.method === 'GET' && url.pathname === '/simplified-version') {
        return htmlResponse(renderSimplifiedVersionTranscriptPage());
      }

      if (request.method === 'GET' && url.pathname === '/assets/simplified-version.js') {
        return javascriptResponse(SIMPLIFIED_VERSION_CLIENT_SOURCE);
      }

      if (request.method === 'GET' && url.pathname === '/assets/app.js') {
        return javascriptResponse(CLIENT_APP_SOURCE);
      }

      if (request.method === 'GET' && url.pathname === '/assets/styles.css') {
        return cssResponse(APP_STYLES);
      }

      if (request.method === 'GET' && url.pathname === LOGO_ASSET_PATH) {
        return pngResponse(LOGO_PNG_BYTES);
      }

      if (request.method === 'POST' && url.pathname === '/api/gemini/ping') {
        return handleGeminiPing(request, env, runtimeFetch);
      }

      if (request.method === 'POST' && url.pathname === '/api/workspace') {
        return handleWorkspaceRequest(request, runtimeFetch, env);
      }

      if (request.method === 'POST' && url.pathname === '/api/transcript') {
        return handleTranscriptRequest(request, runtimeFetch, env);
      }

      if (request.method === 'POST' && url.pathname === '/api/summary/stream') {
        return handleSummaryStream(request, env, runtimeFetch);
      }

      if (request.method === 'POST' && url.pathname === '/api/speaker-transcript/stream') {
        return handleSpeakerTranscriptStream(request, env, runtimeFetch);
      }

      if (request.method === 'POST' && url.pathname === '/api/tab/mindmap') {
        return handleMindmapTab(request, env, runtimeFetch);
      }

      if (request.method === 'POST' && url.pathname === '/api/tab/related') {
        return handleRelatedTab(request, env, runtimeFetch);
      }

      if (request.method === 'POST' && url.pathname === '/api/tab/people') {
        return handlePeopleTab(request, env, runtimeFetch);
      }

      if (request.method === 'POST' && url.pathname === '/api/person/detail') {
        return handlePersonDetailRequest(request, env, runtimeFetch);
      }

      if (request.method === 'POST' && url.pathname === '/api/transcript/translate') {
        return handleTranscriptTranslationRequest(request, env, runtimeFetch);
      }

      return jsonResponse({error: 'Not found.'}, 404);
    } catch (error) {
      return jsonResponse({error: error.message || 'Unexpected server error.'}, 500);
    }
  },
};

async function handleGeminiPing(_request, env, fetchFn) {
  const wantsLocal = String(env.AI_ENV || '')
    .toLowerCase()
    .trim() === 'local';
  if (wantsLocal && !env.SILICONFLOW_API_KEY) {
    return jsonResponse({
      ok: false,
      error:
        'AI_ENV is local but SILICONFLOW_API_KEY is not set. Add it in config/gemini.local.json / .dev.vars.',
    });
  }
  if (wantsLocal === false && !env.GEMINI_API_KEY) {
    return jsonResponse({
      ok: false,
      error: 'GEMINI_API_KEY is not configured on this Worker. Add it in the Cloudflare dashboard or .dev.vars for local dev.',
    });
  }

  try {
    const out = await pingLlm(env, fetchFn);
    return jsonResponse({ok: true, model: out.model, provider: out.provider});
  } catch (error) {
    return jsonResponse({
      ok: false,
      error: error.message || 'LLM ping failed.',
    });
  }
}

async function handleWorkspaceRequest(request, fetchFn, env) {
  const requestUrl = new URL(request.url);
  const body = await readJsonBody(request);
  if (!body.url) {
    return jsonResponse({error: 'A YouTube URL is required.'}, 400);
  }

  if (requestUrl.searchParams.get('stream') === '1') {
    const wantWorkspaceDebug =
      request.headers.get('x-workspace-debug') === '1'
      || requestUrl.searchParams.get('workspaceDebug') === '1';
    return streamWorkspaceNdjson(body.url, fetchFn, env, {wantWorkspaceDebug});
  }

  const workspace = await fetchWorkspaceMetadata(body.url, fetchFn, env);
  return jsonResponse(makeWorkspacePayload(workspace));
}

async function handleTranscriptRequest(request, fetchFn, env) {
  const requestUrl = new URL(request.url);
  const stream = requestUrl.searchParams.get('stream') === '1';
  const body = await readJsonBody(request);
  if (!body.url) {
    return jsonResponse({error: 'A YouTube URL is required.'}, 400);
  }

  if (stream) {
    return streamTranscriptNdjson(body.url, fetchFn, env);
  }

  const transcript = await fetchTranscriptPayload(body.url, fetchFn, env);
  return jsonResponse(makeTranscriptApiPayload(transcript));
}

/**
 * One YouTube watch fetch, then NDJSON: head line with full workspace JSON, cue chunks, done.
 */
function streamWorkspaceNdjson(url, fetchFn, env, options = {}) {
  const encoder = new TextEncoder();
  const chunkSize = TRANSCRIPT_NDJSON_CHUNK_SIZE;
  const wantWorkspaceDebug = Boolean(options.wantWorkspaceDebug);

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const data = await fetchWorkspaceData(url, fetchFn, env);
        if (!data || !data.video || !data.transcript) {
          throw new Error('Workspace response missing video or transcript.');
        }
        const workspaceDebug = data._workspaceDebug;
        if (data._workspaceDebug) {
          delete data._workspaceDebug;
        }
        const entries = normalizeTranscriptEntries(data.transcript.entries || []);
        const workspacePayload = makeWorkspacePayload({
          video: data.video,
          transcript: {
            language: data.transcript.language || '',
            source: data.transcript.source || '',
            entries: [],
            pending: true,
          },
        });
        workspacePayload.transcript.expectedTotal = entries.length;
        workspacePayload.transcript.source = data.transcript.source || '';
        workspacePayload.transcript.language = data.transcript.language || '';

        const headLine = {
          type: 'head',
          workspace: workspacePayload,
        };
        if (wantWorkspaceDebug && workspaceDebug) {
          headLine.workspaceDebug = workspaceDebug;
        }

        controller.enqueue(encoder.encode(`${JSON.stringify(headLine)}\n`));

        await new Promise(function(resolve) {
          setTimeout(resolve, 0);
        });

        for (let i = 0; i < entries.length; i += chunkSize) {
          const slice = entries.slice(i, i + chunkSize);
          controller.enqueue(
            encoder.encode(`${JSON.stringify({type: 'chunk', entries: slice})}\n`),
          );
        }

        controller.enqueue(encoder.encode(`${JSON.stringify({type: 'done'})}\n`));
        controller.close();
      } catch (error) {
        controller.error(error);
      }
    },
  });

  return new Response(stream, {
    headers: {
      'content-type': 'application/x-ndjson; charset=utf-8',
      'cache-control': 'no-cache',
    },
  });
}

/**
 * Legacy NDJSON for POST /api/transcript?stream=1 — same single watch fetch as workspace stream.
 */
function streamTranscriptNdjson(url, fetchFn, env) {
  const encoder = new TextEncoder();
  const chunkSize = TRANSCRIPT_NDJSON_CHUNK_SIZE;

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const data = await fetchWorkspaceData(url, fetchFn, env);
        if (!data || !data.video || !data.transcript) {
          throw new Error('Workspace response missing video or transcript.');
        }
        const entries = normalizeTranscriptEntries(data.transcript.entries || []);

        controller.enqueue(
          encoder.encode(
            `${JSON.stringify({
              type: 'head',
              language: data.transcript.language || '',
              source: data.transcript.source || '',
              total: entries.length,
            })}\n`,
          ),
        );

        await new Promise(function(resolve) {
          setTimeout(resolve, 0);
        });

        for (let i = 0; i < entries.length; i += chunkSize) {
          const slice = entries.slice(i, i + chunkSize);
          controller.enqueue(
            encoder.encode(`${JSON.stringify({type: 'chunk', entries: slice})}\n`),
          );
        }

        controller.enqueue(encoder.encode(`${JSON.stringify({type: 'done'})}\n`));
        controller.close();
      } catch (error) {
        controller.error(error);
      }
    },
  });

  return new Response(stream, {
    headers: {
      'content-type': 'application/x-ndjson; charset=utf-8',
      'cache-control': 'no-cache',
    },
  });
}

const SPEAKER_RAW_MARKDOWN_MAX_CHARS = 1_000_000;

async function handleSpeakerTranscriptStream(request, env, fetchFn) {
  const body = await readJsonBody(request);
  const rawMarkdown = typeof body.rawMarkdown === 'string' ? body.rawMarkdown : '';
  if (!rawMarkdown.trim()) {
    return jsonResponse({error: 'Field rawMarkdown is required (baoyu --speakers markdown).'}, 400);
  }
  if (rawMarkdown.length > SPEAKER_RAW_MARKDOWN_MAX_CHARS) {
    return jsonResponse(
      {error: `rawMarkdown exceeds ${SPEAKER_RAW_MARKDOWN_MAX_CHARS} characters.`},
      400,
    );
  }

  let prompt;
  try {
    prompt = buildSpeakerTranscriptPrompt(rawMarkdown);
  } catch (error) {
    return jsonResponse({error: error.message || 'Invalid speaker transcript request.'}, 400);
  }

  const stream = new ReadableStream({
    async start(controller) {
      const send = createSseSender(controller);
      try {
        send('status', {message: 'Connected to Gemini speaker transcript stream.', kind: 'loading'});
        await streamLlmText(env, {
          prompt,
          fetchFn,
          onTextChunk(text) {
            send('speaker_chunk', {chunk: text});
          },
        });
        send('status', {message: 'Speaker transcript stream completed.', kind: 'success'});
      } catch (error) {
        send('error', {message: error.message || 'Speaker transcript stream failed.'});
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'content-type': 'text/event-stream; charset=utf-8',
      'cache-control': 'no-cache, no-transform',
      connection: 'keep-alive',
    },
  });
}

async function handleSummaryStream(request, env, fetchFn) {
  const body = await readJsonBody(request);
  if (!body.video || !body.transcript?.entries?.length) {
    return jsonResponse({error: 'Video metadata and transcript entries are required.'}, 400);
  }

  const prompt = buildSummaryPrompt({
    video: body.video,
    transcriptEntries: body.transcript.entries,
    options: normalizeGenerationOptions(body.options),
  });

  const stream = new ReadableStream({
    async start(controller) {
      const send = createSseSender(controller);
      try {
        send('status', {message: 'Connected to Gemini summary stream.', kind: 'loading'});
        await streamLlmText(env, {
          prompt,
          fetchFn,
          onTextChunk(text) {
            send('summary_chunk', {chunk: text});
          },
        });
        send('status', {message: 'Summary stream completed.', kind: 'success'});
      } catch (error) {
        send('error', {message: error.message || 'Summary stream failed.'});
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'content-type': 'text/event-stream; charset=utf-8',
      'cache-control': 'no-cache, no-transform',
      connection: 'keep-alive',
    },
  });
}

async function handleMindmapTab(request, env, fetchFn) {
  const body = await readJsonBody(request);
  const result = await generateLlmJson(env, {
    prompt: buildMindmapPrompt({
      video: body.video,
      transcriptEntries: body.transcript?.entries || [],
      options: normalizeGenerationOptions(body.options),
    }),
    fetchFn,
  });
  return jsonResponse(result);
}

async function handleRelatedTab(request, env, fetchFn) {
  const body = await readJsonBody(request);
  const result = await buildRelatedVideosTab({
    env,
    video: body.video,
    transcriptEntries: body.transcript?.entries || [],
    options: normalizeGenerationOptions(body.options),
    fetchFn,
  });
  return jsonResponse(result);
}

async function handlePeopleTab(request, env, fetchFn) {
  const body = await readJsonBody(request);
  const result = await buildPeopleTab({
    env,
    video: body.video,
    transcriptEntries: body.transcript?.entries || [],
    options: normalizeGenerationOptions(body.options),
    fetchFn,
  });
  return jsonResponse(result);
}

async function handlePersonDetailRequest(request, env, fetchFn) {
  const body = await readJsonBody(request);
  if (!body.personName || !body.video) {
    return jsonResponse({error: 'Person name and video metadata are required.'}, 400);
  }
  const result = await buildPersonDetail({
    env,
    personName: body.personName,
    video: body.video,
    transcriptEntries: body.transcript?.entries || [],
    options: normalizeGenerationOptions(body.options),
    fetchFn,
  });
  return jsonResponse(result);
}

async function handleTranscriptTranslationRequest(request, env, fetchFn) {
  const body = await readJsonBody(request);
  if (!body.transcript?.entries?.length) {
    return jsonResponse({error: 'Transcript entries are required.'}, 400);
  }

  const options = normalizeGenerationOptions(body.options);
  const result = await translateTranscript({
    env,
    transcriptEntries: body.transcript.entries,
    targetLanguage: options.language,
    fetchFn,
  });
  return jsonResponse(result);
}

async function readJsonBody(request) {
  try {
    return await request.json();
  } catch {
    throw new Error('Expected a valid JSON request body.');
  }
}

function createSseSender(controller) {
  const encoder = new TextEncoder();
  return function send(eventName, payload) {
    controller.enqueue(encoder.encode(`event: ${eventName}\ndata: ${JSON.stringify(payload)}\n\n`));
  };
}

function jsonResponse(payload, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
    },
  });
}

function htmlResponse(payload) {
  return new Response(payload, {
    headers: {
      'content-type': 'text/html; charset=utf-8',
    },
  });
}

function javascriptResponse(payload) {
  return new Response(payload, {
    headers: {
      'content-type': 'text/javascript; charset=utf-8',
      'cache-control': STATIC_ASSET_CACHE_CONTROL,
    },
  });
}

function cssResponse(payload) {
  return new Response(payload, {
    headers: {
      'content-type': 'text/css; charset=utf-8',
      'cache-control': STATIC_ASSET_CACHE_CONTROL,
    },
  });
}

function pngResponse(payload) {
  return new Response(payload, {
    headers: {
      'content-type': 'image/png',
      'cache-control': 'public, max-age=86400',
    },
  });
}
