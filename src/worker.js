import {streamGeminiText, generateGeminiJson} from './lib/gemini.js';
import {buildMindmapPrompt, buildSummaryPrompt} from './lib/prompt.js';
import {
  DEFAULT_GEMINI_MODEL,
  makeWorkspacePayload,
  normalizeGenerationOptions,
} from './lib/render-model.js';
import {buildRelatedVideosTab} from './lib/recommendations.js';
import {buildPeopleTab, buildPersonDetail} from './lib/people.js';
import {translateTranscript} from './lib/transcript.js';
import {fetchWorkspaceData} from './lib/youtube.js';
import {CLIENT_APP_SOURCE} from './ui/client.js';
import {renderAppPage} from './ui/page.js';
import {APP_STYLES} from './ui/styles.js';

export default {
  async fetch(request, env) {
    try {
      const url = new URL(request.url);

      if (request.method === 'GET' && url.pathname === '/') {
        return htmlResponse(renderAppPage());
      }

      if (request.method === 'GET' && url.pathname === '/assets/app.js') {
        return javascriptResponse(CLIENT_APP_SOURCE);
      }

      if (request.method === 'GET' && url.pathname === '/assets/styles.css') {
        return cssResponse(APP_STYLES);
      }

      if (request.method === 'POST' && url.pathname === '/api/workspace') {
        return handleWorkspaceRequest(request);
      }

      if (request.method === 'POST' && url.pathname === '/api/summary/stream') {
        return handleSummaryStream(request, env);
      }

      if (request.method === 'POST' && url.pathname === '/api/tab/mindmap') {
        return handleMindmapTab(request, env);
      }

      if (request.method === 'POST' && url.pathname === '/api/tab/related') {
        return handleRelatedTab(request, env);
      }

      if (request.method === 'POST' && url.pathname === '/api/tab/people') {
        return handlePeopleTab(request, env);
      }

      if (request.method === 'POST' && url.pathname === '/api/person/detail') {
        return handlePersonDetailRequest(request, env);
      }

      if (request.method === 'POST' && url.pathname === '/api/transcript/translate') {
        return handleTranscriptTranslationRequest(request, env);
      }

      return jsonResponse({error: 'Not found.'}, 404);
    } catch (error) {
      return jsonResponse({error: error.message || 'Unexpected server error.'}, 500);
    }
  },
};

async function handleWorkspaceRequest(request) {
  const body = await readJsonBody(request);
  if (!body.url) {
    return jsonResponse({error: 'A YouTube URL is required.'}, 400);
  }

  const workspace = await fetchWorkspaceData(body.url);
  return jsonResponse(makeWorkspacePayload(workspace));
}

async function handleSummaryStream(request, env) {
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
        await streamGeminiText({
          apiKey: env.GEMINI_API_KEY,
          model: env.GEMINI_MODEL || DEFAULT_GEMINI_MODEL,
          prompt,
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

async function handleMindmapTab(request, env) {
  const body = await readJsonBody(request);
  const result = await generateGeminiJson({
    apiKey: env.GEMINI_API_KEY,
    model: env.GEMINI_MODEL || DEFAULT_GEMINI_MODEL,
    prompt: buildMindmapPrompt({
      video: body.video,
      transcriptEntries: body.transcript?.entries || [],
      options: normalizeGenerationOptions(body.options),
    }),
  });
  return jsonResponse(result);
}

async function handleRelatedTab(request, env) {
  const body = await readJsonBody(request);
  const result = await buildRelatedVideosTab({
    apiKey: env.GEMINI_API_KEY,
    model: env.GEMINI_MODEL || DEFAULT_GEMINI_MODEL,
    video: body.video,
    transcriptEntries: body.transcript?.entries || [],
    options: normalizeGenerationOptions(body.options),
  });
  return jsonResponse(result);
}

async function handlePeopleTab(request, env) {
  const body = await readJsonBody(request);
  const result = await buildPeopleTab({
    apiKey: env.GEMINI_API_KEY,
    model: env.GEMINI_MODEL || DEFAULT_GEMINI_MODEL,
    video: body.video,
    transcriptEntries: body.transcript?.entries || [],
    options: normalizeGenerationOptions(body.options),
  });
  return jsonResponse(result);
}

async function handlePersonDetailRequest(request, env) {
  const body = await readJsonBody(request);
  if (!body.personName || !body.video) {
    return jsonResponse({error: 'Person name and video metadata are required.'}, 400);
  }
  const result = await buildPersonDetail({
    apiKey: env.GEMINI_API_KEY,
    model: env.GEMINI_MODEL || DEFAULT_GEMINI_MODEL,
    personName: body.personName,
    video: body.video,
    transcriptEntries: body.transcript?.entries || [],
    options: normalizeGenerationOptions(body.options),
  });
  return jsonResponse(result);
}

async function handleTranscriptTranslationRequest(request, env) {
  const body = await readJsonBody(request);
  if (!body.transcript?.entries?.length) {
    return jsonResponse({error: 'Transcript entries are required.'}, 400);
  }

  const options = normalizeGenerationOptions(body.options);
  const result = await translateTranscript({
    apiKey: env.GEMINI_API_KEY,
    model: env.GEMINI_MODEL || DEFAULT_GEMINI_MODEL,
    transcriptEntries: body.transcript.entries,
    targetLanguage: options.language,
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
    },
  });
}

function cssResponse(payload) {
  return new Response(payload, {
    headers: {
      'content-type': 'text/css; charset=utf-8',
    },
  });
}
