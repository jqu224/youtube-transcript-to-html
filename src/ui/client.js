export const CLIENT_APP_SOURCE = String.raw`
const TAB_IDS = {
  summary: 'summary',
  mindmap: 'mindmap',
  related: 'related',
  people: 'people',
};

const state = {
  workspace: null,
  activeTab: TAB_IDS.summary,
  summaryHtml: '',
  summaryStreaming: false,
  tabData: {
    mindmap: null,
    related: null,
    people: null,
  },
  selectedPerson: null,
  currentCueId: null,
  player: null,
  youtubeReady: false,
  pollTimer: null,
  styleOptions: {
    theme: 'light',
    fontScale: 1,
    contentWidth: 880,
    panelRatio: 38,
    paragraphSpacing: 1,
    emphasisDensity: 'balanced',
  },
  generationOptions: readGenerationOptions(),
  requests: {
    workspace: null,
    summary: null,
    tab: null,
    person: null,
  },
};

const refs = {
  loadButton: document.getElementById('load-workspace'),
  regenerateButton: document.getElementById('regenerate-summary'),
  videoUrl: document.getElementById('video-url'),
  statusLine: document.getElementById('status-line'),
  transcriptList: document.getElementById('transcript-list'),
  transcriptSubtitle: document.getElementById('transcript-subtitle'),
  videoSubtitle: document.getElementById('video-subtitle'),
  videoBadges: document.getElementById('video-badges'),
  videoMeta: document.getElementById('video-meta'),
  playerPlaceholder: document.getElementById('player-placeholder'),
  playerStage: document.getElementById('youtube-player'),
  analysisMain: document.getElementById('analysis-main'),
  detailPane: document.getElementById('detail-pane'),
  autoFollow: document.getElementById('auto-follow'),
  transcriptWindow: document.getElementById('transcript-window'),
  tabButtons: Array.from(document.querySelectorAll('[data-tab-button]')),
  themeSelect: document.getElementById('theme-select'),
  fontScale: document.getElementById('font-scale'),
  contentWidth: document.getElementById('content-width'),
  panelRatio: document.getElementById('panel-ratio'),
  paragraphSpacing: document.getElementById('paragraph-spacing'),
  emphasisDensity: document.getElementById('emphasis-density'),
  tone: document.getElementById('tone'),
  length: document.getElementById('length'),
  sectionDensity: document.getElementById('section-density'),
  titleStyle: document.getElementById('title-style'),
  quoteEmphasis: document.getElementById('quote-emphasis'),
  relatedFocus: document.getElementById('related-focus'),
  mindmapDepth: document.getElementById('mindmap-depth'),
  peopleDepth: document.getElementById('people-depth'),
};

init();

function init() {
  refs.loadButton.addEventListener('click', loadWorkspace);
  refs.regenerateButton.addEventListener('click', function() {
    if (!state.workspace) {
      return;
    }
    runSummaryStream();
  });
  refs.tabButtons.forEach(function(button) {
    button.addEventListener('click', function() {
      activateTab(button.dataset.tabButton);
    });
  });
  refs.transcriptWindow.addEventListener('change', renderTranscriptList);
  bindStyleControl(refs.themeSelect, 'theme');
  bindStyleControl(refs.fontScale, 'fontScale', parseFloat);
  bindStyleControl(refs.contentWidth, 'contentWidth', parseFloat);
  bindStyleControl(refs.panelRatio, 'panelRatio', parseFloat);
  bindStyleControl(refs.paragraphSpacing, 'paragraphSpacing', parseFloat);
  bindStyleControl(refs.emphasisDensity, 'emphasisDensity');
  [
    refs.tone,
    refs.length,
    refs.sectionDensity,
    refs.titleStyle,
    refs.quoteEmphasis,
    refs.relatedFocus,
    refs.mindmapDepth,
    refs.peopleDepth,
  ].forEach(function(input) {
    input.addEventListener('change', function() {
      state.generationOptions = readGenerationOptions();
    });
  });

  refs.videoUrl.value = 'https://www.youtube.com/watch?v=xRh2sVcNXQ8';
  applyStyleState();
}

window.onYouTubeIframeAPIReady = function() {
  state.youtubeReady = true;
  if (state.workspace) {
    mountPlayer(state.workspace.video.id);
  }
};

async function loadWorkspace() {
  const url = refs.videoUrl.value.trim();
  if (!url) {
    setStatus('Please paste a YouTube URL first.', 'error');
    return;
  }

  abortRequest('workspace');
  abortRequest('summary');
  abortRequest('tab');
  abortRequest('person');

  const controller = new AbortController();
  state.requests.workspace = controller;
  refs.loadButton.disabled = true;
  refs.regenerateButton.disabled = true;
  setStatus('Loading video metadata and transcript...', 'loading');

  try {
    const response = await fetch('/api/workspace', {
      method: 'POST',
      headers: {'content-type': 'application/json'},
      body: JSON.stringify({url: url}),
      signal: controller.signal,
    });
    const payload = await response.json();
    if (!response.ok) {
      throw new Error(payload.error || 'Workspace load failed.');
    }

    state.workspace = payload;
    state.summaryHtml = '';
    state.tabData.mindmap = null;
    state.tabData.related = null;
    state.tabData.people = null;
    state.selectedPerson = null;
    activateTab(TAB_IDS.summary, true);
    renderWorkspaceMeta();
    renderTranscriptList();
    renderDetailPaneNotice();
    mountPlayer(payload.video.id);
    refs.regenerateButton.disabled = false;
    await runSummaryStream();
  } catch (error) {
    if (error.name !== 'AbortError') {
      setStatus(error.message || 'Workspace load failed.', 'error');
      refs.analysisMain.innerHTML = '<div class="error-state">' + escapeHtml(error.message || 'Workspace load failed.') + '</div>';
    }
  } finally {
    refs.loadButton.disabled = false;
    state.requests.workspace = null;
  }
}

async function runSummaryStream() {
  if (!state.workspace) {
    return;
  }

  abortRequest('summary');
  const controller = new AbortController();
  state.requests.summary = controller;
  state.summaryStreaming = true;
  state.summaryHtml = '';
  activateTab(TAB_IDS.summary, true);
  refs.analysisMain.innerHTML = '<div class="loading-state">Streaming AI summary...</div>';
  setStatus('Streaming editorial AI summary...', 'loading');

  try {
    const response = await fetch('/api/summary/stream', {
      method: 'POST',
      headers: {'content-type': 'application/json'},
      body: JSON.stringify({
        video: state.workspace.video,
        transcript: state.workspace.transcript,
        options: state.generationOptions,
      }),
      signal: controller.signal,
    });

    if (!response.ok || !response.body) {
      const payload = await response.json().catch(function() {
        return {};
      });
      throw new Error(payload.error || 'Summary stream failed.');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const next = await reader.read();
      if (next.done) {
        break;
      }
      buffer += decoder.decode(next.value, {stream: true});
      let boundary = buffer.indexOf('\n\n');
      while (boundary !== -1) {
        const block = buffer.slice(0, boundary);
        buffer = buffer.slice(boundary + 2);
        handleSummaryEvent(block);
        boundary = buffer.indexOf('\n\n');
      }
    }

    setStatus('Summary ready. Switch tabs to load more derived views.', 'success');
  } catch (error) {
    if (error.name !== 'AbortError') {
      setStatus(error.message || 'Summary stream failed.', 'error');
      refs.analysisMain.innerHTML = '<div class="error-state">' + escapeHtml(error.message || 'Summary stream failed.') + '</div>';
    }
  } finally {
    state.summaryStreaming = false;
    state.requests.summary = null;
  }
}

function handleSummaryEvent(block) {
  const eventName = readEventName(block);
  const data = readEventData(block);
  if (!eventName || !data) {
    return;
  }

  if (eventName === 'status') {
    if (data.message) {
      setStatus(data.message, data.kind || 'loading');
    }
    return;
  }

  if (eventName === 'summary_chunk') {
    state.summaryHtml += data.chunk || '';
    if (state.activeTab === TAB_IDS.summary) {
      renderSummary();
    }
    return;
  }

  if (eventName === 'error') {
    setStatus(data.message || 'Summary stream failed.', 'error');
    refs.analysisMain.innerHTML = '<div class="error-state">' + escapeHtml(data.message || 'Summary stream failed.') + '</div>';
  }
}

async function activateTab(tabId, skipFetch) {
  state.activeTab = tabId;
  refs.tabButtons.forEach(function(button) {
    button.classList.toggle('is-active', button.dataset.tabButton === tabId);
  });

  if (tabId === TAB_IDS.summary) {
    renderSummary();
    return;
  }

  if (!state.workspace) {
    refs.analysisMain.innerHTML = '<div class="empty-state">Load a workspace before switching tabs.</div>';
    return;
  }

  if (state.tabData[tabId] && !skipFetch) {
    renderActiveTab();
    return;
  }

  renderTabLoading(tabId);
  if (skipFetch) {
    return;
  }
  await loadTabData(tabId);
}

async function loadTabData(tabId) {
  abortRequest('tab');
  const controller = new AbortController();
  state.requests.tab = controller;
  setStatus('Loading ' + tabId + ' tab...', 'loading');

  try {
    const response = await fetch('/api/tab/' + tabId, {
      method: 'POST',
      headers: {'content-type': 'application/json'},
      body: JSON.stringify({
        video: state.workspace.video,
        transcript: state.workspace.transcript,
        options: state.generationOptions,
      }),
      signal: controller.signal,
    });
    const payload = await response.json();
    if (!response.ok) {
      throw new Error(payload.error || 'Tab load failed.');
    }

    state.tabData[tabId] = payload;
    renderActiveTab();

    if (tabId === TAB_IDS.people && payload.people && payload.people.length) {
      state.selectedPerson = payload.people[0].name;
      renderActiveTab();
      await loadPersonDetail(state.selectedPerson);
    } else {
      setStatus('Loaded ' + tabId + ' tab.', 'success');
    }
  } catch (error) {
    if (error.name !== 'AbortError') {
      setStatus(error.message || 'Tab load failed.', 'error');
      refs.analysisMain.innerHTML = '<div class="error-state">' + escapeHtml(error.message || 'Tab load failed.') + '</div>';
    }
  } finally {
    state.requests.tab = null;
  }
}

async function loadPersonDetail(personName) {
  abortRequest('person');
  const controller = new AbortController();
  state.requests.person = controller;
  refs.detailPane.innerHTML = '<div class="loading-state">Loading person detail...</div>';

  try {
    const response = await fetch('/api/person/detail', {
      method: 'POST',
      headers: {'content-type': 'application/json'},
      body: JSON.stringify({
        personName: personName,
        video: state.workspace.video,
        transcript: state.workspace.transcript,
      }),
      signal: controller.signal,
    });
    const payload = await response.json();
    if (!response.ok) {
      throw new Error(payload.error || 'Person detail failed.');
    }
    renderPersonDetail(payload);
    setStatus('Loaded people detail.', 'success');
  } catch (error) {
    if (error.name !== 'AbortError') {
      refs.detailPane.innerHTML = '<div class="error-state">' + escapeHtml(error.message || 'Person detail failed.') + '</div>';
    }
  } finally {
    state.requests.person = null;
  }
}

function renderWorkspaceMeta() {
  const video = state.workspace.video;
  refs.videoSubtitle.textContent = video.title;
  refs.transcriptSubtitle.textContent = state.workspace.transcript.entries.length + ' transcript cues loaded.';
  refs.videoBadges.innerHTML = [
    createPill(video.channelTitle || 'Unknown channel'),
    createPill(formatLength(video.lengthSeconds)),
    createPill(state.workspace.transcript.language || 'auto'),
  ].join('');
  refs.videoMeta.innerHTML =
    '<div class="notice-card"><strong>' + escapeHtml(video.title) + '</strong><div class="panel-subtitle">' +
    escapeHtml(video.channelTitle || '') +
    '</div><div class="person-links"><a class="inline-link" target="_blank" rel="noreferrer" href="' +
    escapeHtml(video.watchUrl) +
    '">Open on YouTube</a></div></div>';
}

function renderTranscriptList() {
  if (!state.workspace) {
    refs.transcriptList.innerHTML = '<div class="empty-state">Transcript cues will become clickable once the workspace is loaded.</div>';
    return;
  }

  const entries = getVisibleTranscriptEntries();
  if (!entries.length) {
    refs.transcriptList.innerHTML = '<div class="empty-state">No transcript entries available.</div>';
    return;
  }

  refs.transcriptList.innerHTML = entries.map(function(entry) {
    const isActive = entry.id === state.currentCueId;
    return (
      '<button class="transcript-item' + (isActive ? ' is-active' : '') + '" type="button" data-cue-id="' + escapeHtml(entry.id) + '">' +
        '<time>' + escapeHtml(formatTimestamp(entry.startMs)) + '</time>' +
        '<p>' + escapeHtml(entry.text) + '</p>' +
      '</button>'
    );
  }).join('');

  Array.from(refs.transcriptList.querySelectorAll('[data-cue-id]')).forEach(function(button) {
    button.addEventListener('click', function() {
      const cue = state.workspace.transcript.entries.find(function(entry) {
        return entry.id === button.dataset.cueId;
      });
      if (cue) {
        seekToTimestamp(cue.startMs);
      }
    });
  });
}

function getVisibleTranscriptEntries() {
  const entries = state.workspace.transcript.entries || [];
  if (refs.transcriptWindow.value !== 'short' || !state.currentCueId) {
    return entries;
  }

  const currentIndex = entries.findIndex(function(entry) {
    return entry.id === state.currentCueId;
  });
  if (currentIndex === -1) {
    return entries.slice(0, 22);
  }

  const start = Math.max(0, currentIndex - 10);
  const end = Math.min(entries.length, currentIndex + 12);
  return entries.slice(start, end);
}

function renderSummary() {
  if (!state.workspace) {
    refs.analysisMain.innerHTML = '<div class="empty-state">The summary tab will stream HTML here as soon as you load a workspace.</div>';
    return;
  }

  if (!state.summaryHtml) {
    refs.analysisMain.innerHTML = '<div class="loading-state">Streaming AI summary...</div>';
    return;
  }

  refs.analysisMain.innerHTML = '<div class="summary-frame">' + sanitizeSummaryHtml(state.summaryHtml) + '</div>';
}

function renderActiveTab() {
  if (state.activeTab === TAB_IDS.summary) {
    renderSummary();
    return;
  }
  if (state.activeTab === TAB_IDS.mindmap) {
    renderMindmap();
    return;
  }
  if (state.activeTab === TAB_IDS.related) {
    renderRelated();
    return;
  }
  if (state.activeTab === TAB_IDS.people) {
    renderPeople();
  }
}

function renderMindmap() {
  const data = state.tabData.mindmap;
  if (!data || !data.nodes || !data.nodes.length) {
    refs.analysisMain.innerHTML = '<div class="empty-state">No mindmap data yet.</div>';
    return;
  }
  refs.analysisMain.innerHTML =
    '<div class="mindmap-root">' +
      '<div class="notice-card"><strong>' + escapeHtml(data.title || 'Mindmap') + '</strong></div>' +
      data.nodes.map(renderMindmapNode).join('') +
    '</div>';
}

function renderMindmapNode(node) {
  const children = Array.isArray(node.children) ? node.children : [];
  return (
    '<div class="mindmap-node">' +
      '<div class="mindmap-card">' +
        '<h4>' + escapeHtml(node.label || 'Node') + '</h4>' +
        '<p>' + escapeHtml(node.summary || '') + '</p>' +
      '</div>' +
      children.map(renderMindmapNode).join('') +
    '</div>'
  );
}

function renderRelated() {
  const data = state.tabData.related;
  if (!data || !data.recommendations || !data.recommendations.length) {
    refs.analysisMain.innerHTML = '<div class="empty-state">No related videos yet.</div>';
    return;
  }

  const notice = data.fallbackMessage
    ? '<div class="notice-card">' + escapeHtml(data.fallbackMessage) + '</div>'
    : '';
  refs.analysisMain.innerHTML =
    notice +
    '<div class="recommendation-grid">' +
      data.recommendations.map(function(item) {
        return (
          '<article class="recommendation-card">' +
            '<h4>' + escapeHtml(item.title) + '</h4>' +
            '<div class="recommendation-meta">' + escapeHtml(item.channelTitle || '') + '</div>' +
            '<div class="confidence-bar"><span style="width:' + Math.max(10, Math.round((item.likelihood || 0) * 100)) + '%"></span></div>' +
            '<div class="card-meta">' + escapeHtml(item.reason || '') + '</div>' +
            '<div class="person-links">' +
              '<a target="_blank" rel="noreferrer" href="' + escapeHtml(item.url) + '">Open video</a>' +
            '</div>' +
          '</article>'
        );
      }).join('') +
    '</div>';
}

function renderPeople() {
  const data = state.tabData.people;
  if (!data || !data.people || !data.people.length) {
    refs.analysisMain.innerHTML = '<div class="empty-state">No people data yet.</div>';
    return;
  }

  refs.analysisMain.innerHTML =
    '<div class="people-grid">' +
      data.people.map(function(person) {
        const selected = state.selectedPerson === person.name;
        return (
          '<button class="person-card' + (selected ? ' is-selected' : '') + '" type="button" data-person-name="' + escapeHtml(person.name) + '">' +
            '<h4>' + escapeHtml(person.name) + '</h4>' +
            '<div class="card-meta">' + escapeHtml(person.role || '') + '</div>' +
            '<div class="confidence-bar"><span style="width:' + Math.max(12, Math.round((person.confidence || 0) * 100)) + '%"></span></div>' +
            '<p>' + escapeHtml(person.whyRelevant || '') + '</p>' +
          '</button>'
        );
      }).join('') +
    '</div>';

  Array.from(refs.analysisMain.querySelectorAll('[data-person-name]')).forEach(function(button) {
    button.addEventListener('click', function() {
      state.selectedPerson = button.dataset.personName;
      renderPeople();
      loadPersonDetail(state.selectedPerson);
    });
  });
}

function renderPersonDetail(data) {
  const profileText = data.profile && data.profile.extract
    ? '<p>' + escapeHtml(data.profile.extract) + '</p>'
    : '<p>Wikipedia summary not available, so the AI context summary is shown instead.</p>';

  refs.detailPane.innerHTML =
    '<div class="detail-card">' +
      '<div>' +
        '<h3>' + escapeHtml(data.headline || data.personName) + '</h3>' +
        '<div class="panel-subtitle">' + escapeHtml(data.personName || '') + '</div>' +
      '</div>' +
      '<div class="detail-badge-row">' +
        (data.searchKeywords || []).slice(0, 4).map(function(keyword) {
          return createPill(keyword);
        }).join('') +
      '</div>' +
      '<p>' + escapeHtml(data.summary || '') + '</p>' +
      '<p>' + escapeHtml(data.connectionToVideo || '') + '</p>' +
      '<div class="person-links">' +
        '<a target="_blank" rel="noreferrer" href="' + escapeHtml(data.links.wikipedia) + '">Wikipedia</a>' +
        '<a target="_blank" rel="noreferrer" href="' + escapeHtml(data.links.google) + '">Google</a>' +
      '</div>' +
      profileText +
      '<h4>Related videos</h4>' +
      '<div class="person-video-grid">' +
        (data.relatedVideos || []).map(function(video) {
          return (
            '<article class="person-video-card">' +
              '<h4>' + escapeHtml(video.title) + '</h4>' +
              '<div class="card-meta">' + escapeHtml(video.channelTitle || '') + '</div>' +
              '<div class="person-links"><a target="_blank" rel="noreferrer" href="' + escapeHtml(video.url) + '">Open on YouTube</a></div>' +
            '</article>'
          );
        }).join('') +
      '</div>' +
    '</div>';
}

function renderDetailPaneNotice() {
  refs.detailPane.innerHTML = '<div class="notice-card">Click a person in the People tab to load wiki-style details and related videos.</div>';
}

function renderTabLoading(tabId) {
  refs.analysisMain.innerHTML = '<div class="loading-state">Loading ' + escapeHtml(tabId) + '...</div>';
}

function mountPlayer(videoId) {
  refs.playerPlaceholder.hidden = true;
  refs.playerStage.hidden = false;

  if (!state.youtubeReady || !window.YT || !window.YT.Player) {
    refs.playerStage.innerHTML =
      '<iframe title="YouTube player" src="https://www.youtube.com/embed/' + encodeURIComponent(videoId) + '?autoplay=0&playsinline=1" allowfullscreen></iframe>';
    return;
  }

  if (state.player && typeof state.player.loadVideoById === 'function') {
    state.player.loadVideoById(videoId);
    return;
  }

  state.player = new window.YT.Player('youtube-player', {
    videoId: videoId,
    playerVars: {
      playsinline: 1,
      rel: 0,
    },
    events: {
      onReady: startCuePolling,
      onStateChange: startCuePolling,
    },
  });
}

function startCuePolling() {
  if (state.pollTimer) {
    window.clearInterval(state.pollTimer);
  }

  state.pollTimer = window.setInterval(function() {
    if (!state.player || typeof state.player.getCurrentTime !== 'function' || !state.workspace) {
      return;
    }
    const currentMs = Math.floor(state.player.getCurrentTime() * 1000);
    const entries = state.workspace.transcript.entries;
    const active = entries.find(function(entry) {
      return currentMs >= entry.startMs && currentMs < entry.startMs + Math.max(entry.durationMs, 5000);
    });
    const nextCueId = active ? active.id : null;
    if (nextCueId && nextCueId !== state.currentCueId) {
      state.currentCueId = nextCueId;
      renderTranscriptList();
      if (refs.autoFollow.value === 'on') {
        const target = refs.transcriptList.querySelector('[data-cue-id="' + CSS.escape(nextCueId) + '"]');
        if (target) {
          target.scrollIntoView({block: 'nearest', behavior: 'smooth'});
        }
      }
    }
  }, 800);
}

function seekToTimestamp(startMs) {
  if (state.player && typeof state.player.seekTo === 'function') {
    state.player.seekTo(startMs / 1000, true);
  }
}

function bindStyleControl(element, key, parser) {
  element.addEventListener('input', function() {
    const nextValue = parser ? parser(element.value) : element.value;
    state.styleOptions[key] = nextValue;
    applyStyleState();
  });
  element.addEventListener('change', function() {
    const nextValue = parser ? parser(element.value) : element.value;
    state.styleOptions[key] = nextValue;
    applyStyleState();
  });
}

function applyStyleState() {
  document.body.dataset.theme = state.styleOptions.theme;
  document.documentElement.style.setProperty('--font-scale', String(state.styleOptions.fontScale));
  document.documentElement.style.setProperty('--content-width', String(state.styleOptions.contentWidth) + 'px');
  document.documentElement.style.setProperty('--panel-ratio', String(state.styleOptions.panelRatio) + '%');
  document.documentElement.style.setProperty('--paragraph-spacing', String(state.styleOptions.paragraphSpacing));
  document.body.dataset.emphasisDensity = state.styleOptions.emphasisDensity;
}

function readGenerationOptions() {
  return {
    tone: refs.tone.value,
    length: refs.length.value,
    sectionDensity: refs.sectionDensity.value,
    titleStyle: refs.titleStyle.value,
    quoteEmphasis: refs.quoteEmphasis.value,
    relatedFocus: refs.relatedFocus.value,
    mindmapDepth: refs.mindmapDepth.value,
    peopleDepth: refs.peopleDepth.value,
  };
}

function setStatus(message, kind) {
  const prefix = kind === 'error'
    ? '<strong>Error.</strong> '
    : kind === 'success'
      ? '<strong>Ready.</strong> '
      : '<strong>Working.</strong> ';
  refs.statusLine.innerHTML = prefix + escapeHtml(message);
}

function readEventName(block) {
  const line = block.split('\n').find(function(item) {
    return item.startsWith('event:');
  });
  return line ? line.slice(6).trim() : '';
}

function readEventData(block) {
  const dataLines = block
    .split('\n')
    .filter(function(line) {
      return line.startsWith('data:');
    })
    .map(function(line) {
      return line.slice(5).trim();
    });
  if (!dataLines.length) {
    return null;
  }
  try {
    return JSON.parse(dataLines.join('\n'));
  } catch {
    return null;
  }
}

function sanitizeSummaryHtml(input) {
  const parser = new DOMParser();
  const documentFragment = parser.parseFromString('<body>' + input + '</body>', 'text/html');
  const allowedTags = new Set([
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

  cleanseNode(documentFragment.body, allowedTags);
  return documentFragment.body.innerHTML;
}

function cleanseNode(node, allowedTags) {
  Array.from(node.children).forEach(function(child) {
    const tag = child.tagName.toLowerCase();
    if (!allowedTags.has(tag)) {
      child.replaceWith(...Array.from(child.childNodes));
      return;
    }

    Array.from(child.attributes).forEach(function(attribute) {
      child.removeAttribute(attribute.name);
    });

    cleanseNode(child, allowedTags);
  });
}

function createPill(text) {
  return '<span class="pill">' + escapeHtml(text) + '</span>';
}

function escapeHtml(value) {
  return String(value == null ? '' : value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatLength(totalSeconds) {
  if (!totalSeconds) {
    return 'unknown length';
  }
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (hours > 0) {
    return hours + ':' + String(minutes).padStart(2, '0') + ':' + String(seconds).padStart(2, '0');
  }
  return minutes + ':' + String(seconds).padStart(2, '0');
}

function formatTimestamp(startMs) {
  const totalSeconds = Math.max(0, Math.floor(Number(startMs || 0) / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return String(minutes).padStart(2, '0') + ':' + String(seconds).padStart(2, '0');
}

function abortRequest(key) {
  const current = state.requests[key];
  if (current) {
    current.abort();
    state.requests[key] = null;
  }
}
`;
