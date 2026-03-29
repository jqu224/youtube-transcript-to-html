export const CLIENT_APP_SOURCE = String.raw`
const TAB_IDS = {
  summary: 'summary',
  mindmap: 'mindmap',
  related: 'related',
  people: 'people',
};

const LOCALE_DATA = {
  en: {
    htmlLang: 'en',
    metaTitle: 'YouTube Transcript To HTML',
    metaDescription: 'Live YouTube transcript workspace with bilingual AI summary, mindmap, related videos, people tabs, and transcript switching.',
    heroTitle: 'YouTube Caption → AI workspace',
    heroDescription: 'Paste a URL. Stream a live summary, mindmap, related videos, and people intel',
    videoUrlLabel: 'YouTube URL',
    videoUrlPlaceholder: 'https://www.youtube.com/watch?v=xRh2sVcNXQ8',
    toneLabel: 'Tone',
    lengthLabel: 'Length',
    sectionDensityLabel: 'Section Density',
    relatedFocusLabel: 'Related Focus',
    loadWorkspace: 'Load Workspace',
    regenerate: 'Regenerate',
    liveVideo: 'Live Video',
    videoSubtitleInitial: 'Load a video to start the workspace',
    playerPlaceholderTitle: 'Paste a captioned YouTube video',
    playerPlaceholderCopy: 'The player, transcript, and AI tabs will populate together',
    liveTranscript: 'Live Transcript',
    transcriptSubtitleInitial: 'Transcript cues will appear here',
    autoFollow: 'Auto Follow',
    transcriptWindow: 'Transcript Window',
    aiWorkspace: 'AI Workspace',
    workspaceSubtitle: 'Summary is the default tab. Mindmap, related videos, and people load on demand',
    realtimeStyle: 'Realtime Style',
    theme: 'Theme',
    fontScale: 'Font Scale',
    contentWidth: 'Content Width',
    panelRatio: 'Panel Ratio',
    paragraphSpacing: 'Paragraph Space',
    emphasisDensity: 'Emphasis',
    generationControls: 'Generation Controls',
    titleStyle: 'Title Style',
    quoteEmphasis: 'Quote Emphasis',
    mindmapDepth: 'Mindmap Depth',
    peopleDepth: 'People Depth',
    detailPane: 'Detail Pane',
    localeToggleAria: 'Switch language',
    localeToggleText: 'EN / 中文',
    tabLabels: {
      summary: 'AI Summary',
      mindmap: 'Mindmap',
      related: 'Related Videos',
      people: 'People',
    },
    selectOptions: {
      tone: {insightful: 'Insightful', analytical: 'Analytical', concise: 'Concise', dramatic: 'Dramatic'},
      length: {detailed: 'Detailed', balanced: 'Balanced', compact: 'Compact'},
      sectionDensity: {balanced: 'Balanced', dense: 'Dense', spacious: 'Spacious'},
      relatedFocus: {adjacent: 'Adjacent topics', 'same-speakers': 'Same speakers', 'deeper-dive': 'Deeper dive'},
      autoFollow: {on: 'On', off: 'Off'},
      transcriptWindow: {all: 'All cues', short: 'Compact'},
      theme: {light: 'Light', dark: 'Dark'},
      emphasisDensity: {balanced: 'Balanced', quiet: 'Quiet', high: 'High'},
      titleStyle: {editorial: 'Editorial', plain: 'Plain', bold: 'Bold'},
      quoteEmphasis: {high: 'High', balanced: 'Balanced', low: 'Low'},
      mindmapDepth: {balanced: 'Balanced', deep: 'Deep', overview: 'Overview'},
      peopleDepth: {balanced: 'Balanced', deep: 'Deep', light: 'Light'},
    },
    statusErrorPrefix: 'Error',
    statusReadyPrefix: 'Ready',
    statusWorkingPrefix: 'Working',
    statusReadyInitial: 'Load a video to begin',
    statusPasteUrl: 'Please paste a YouTube URL first',
    statusLoadingWorkspace: 'Loading video metadata and transcript...',
    statusWorkspaceReady: 'Workspace ready. Streaming summary...',
    statusLoadingSummary: 'Streaming editorial AI summary...',
    statusSummaryReady: 'Summary ready. Switch tabs to load more derived views',
    statusLoadingTab: 'Loading {tab} tab...',
    statusLoadedTab: '{tab} tab loaded',
    statusLoadingTranscriptTranslation: 'Translating transcript...',
    statusTranscriptReady: 'Transcript language updated',
    statusLoadingPersonDetail: 'Loading person detail...',
    statusPersonDetailReady: 'People detail loaded',
    loadWorkspaceBeforeTabs: 'Load a workspace before switching tabs',
    summaryEmpty: 'The summary tab will stream HTML here as soon as you load a workspace',
    transcriptEmptyInitial: 'Transcript cues will become clickable once the workspace is loaded',
    transcriptEmpty: 'No transcript entries available',
    transcriptLoading: 'Translating transcript cues...',
    transcriptLoadedCount: '{count} transcript cues loaded',
    transcriptLoadedCountPending: 'Translating transcript cues for this language...',
    noMindmap: 'No mindmap data yet',
    noRelated: 'No related videos yet',
    noPeople: 'No people data yet',
    detailNotice: 'Click a person in the People tab to load wiki-style details and related videos',
    detailLoading: 'Loading person detail...',
    detailProfileFallback: 'Wikipedia summary not available, so the AI context summary is shown instead',
    relatedVideosHeading: 'Related videos',
    openOnYouTube: 'Open on YouTube',
    openVideo: 'Open video',
    wikipedia: 'Wikipedia',
    google: 'Google',
    unknownChannel: 'Unknown channel',
    unknownLength: 'unknown length',
    autoLanguage: 'auto',
    transcriptTranslatedTag: 'translated',
    transcriptOriginalTag: 'original',
  },
  zh: {
    htmlLang: 'zh-Hans',
    metaTitle: 'YouTube Transcript To HTML',
    metaDescription: '支持中英切换的 YouTube 字幕工作台，可联动切换 AI 摘要、思维导图、相关视频、人物卡与字幕内容。',
    heroTitle: 'YouTube 字幕 → AI 工作台',
    heroDescription: '粘贴一个链接，实时生成摘要、思维导图、相关视频和人物信息',
    videoUrlLabel: 'YouTube 链接',
    videoUrlPlaceholder: 'https://www.youtube.com/watch?v=xRh2sVcNXQ8',
    toneLabel: '语气风格',
    lengthLabel: '篇幅长度',
    sectionDensityLabel: '分段密度',
    relatedFocusLabel: '推荐方向',
    loadWorkspace: '加载工作台',
    regenerate: '重新生成',
    liveVideo: '视频播放器',
    videoSubtitleInitial: '加载视频后即可开始',
    playerPlaceholderTitle: '请粘贴带字幕的 YouTube 视频',
    playerPlaceholderCopy: '播放器、字幕和 AI 标签页会一起加载',
    liveTranscript: '实时字幕',
    transcriptSubtitleInitial: '字幕内容会显示在这里',
    autoFollow: '自动跟随',
    transcriptWindow: '字幕窗口',
    aiWorkspace: 'AI 工作区',
    workspaceSubtitle: '默认显示摘要标签页，思维导图、相关视频和人物信息按需加载',
    realtimeStyle: '实时样式',
    theme: '主题',
    fontScale: '字体缩放',
    contentWidth: '内容宽度',
    panelRatio: '面板比例',
    paragraphSpacing: '段落间距',
    emphasisDensity: '强调程度',
    generationControls: '生成控制',
    titleStyle: '标题风格',
    quoteEmphasis: '引用强调',
    mindmapDepth: '导图深度',
    peopleDepth: '人物深度',
    detailPane: '详情面板',
    localeToggleAria: '切换语言',
    localeToggleText: 'EN / 中文',
    tabLabels: {
      summary: 'AI 摘要',
      mindmap: '思维导图',
      related: '相关视频',
      people: '人物',
    },
    selectOptions: {
      tone: {insightful: '有洞察', analytical: '偏分析', concise: '精简', dramatic: '更有张力'},
      length: {detailed: '详细', balanced: '平衡', compact: '紧凑'},
      sectionDensity: {balanced: '平衡', dense: '紧密', spacious: '舒展'},
      relatedFocus: {adjacent: '相近主题', 'same-speakers': '同一讲者', 'deeper-dive': '更深挖'},
      autoFollow: {on: '开启', off: '关闭'},
      transcriptWindow: {all: '全部字幕', short: '紧凑'},
      theme: {light: '浅色', dark: '深色'},
      emphasisDensity: {balanced: '平衡', quiet: '克制', high: '高'},
      titleStyle: {editorial: '编辑感', plain: '朴素', bold: '强烈'},
      quoteEmphasis: {high: '高', balanced: '平衡', low: '低'},
      mindmapDepth: {balanced: '平衡', deep: '深入', overview: '总览'},
      peopleDepth: {balanced: '平衡', deep: '深入', light: '轻量'},
    },
    statusErrorPrefix: '错误',
    statusReadyPrefix: '就绪',
    statusWorkingPrefix: '处理中',
    statusReadyInitial: '加载视频即可开始',
    statusPasteUrl: '请先粘贴 YouTube 链接',
    statusLoadingWorkspace: '正在加载视频信息和字幕...',
    statusWorkspaceReady: '工作台已加载，正在生成摘要...',
    statusLoadingSummary: '正在流式生成 AI 摘要...',
    statusSummaryReady: '摘要已准备好，可切换其他标签页继续加载',
    statusLoadingTab: '正在加载 {tab}...',
    statusLoadedTab: '{tab} 已加载',
    statusLoadingTranscriptTranslation: '正在翻译字幕...',
    statusTranscriptReady: '字幕语言已切换',
    statusLoadingPersonDetail: '正在加载人物详情...',
    statusPersonDetailReady: '人物详情已加载',
    loadWorkspaceBeforeTabs: '请先加载工作台再切换标签页',
    summaryEmpty: '加载工作台后，这里会流式显示摘要 HTML',
    transcriptEmptyInitial: '加载工作台后，字幕会显示为可点击时间点',
    transcriptEmpty: '暂无可用字幕',
    transcriptLoading: '正在翻译字幕内容...',
    transcriptLoadedCount: '已加载 {count} 条字幕',
    transcriptLoadedCountPending: '正在为当前语言准备字幕...',
    noMindmap: '暂时没有思维导图数据',
    noRelated: '暂时没有相关视频',
    noPeople: '暂时没有人物数据',
    detailNotice: '点击人物标签页中的人物卡片，可加载百科式详情和相关视频',
    detailLoading: '正在加载人物详情...',
    detailProfileFallback: '暂无可用的 Wikipedia 摘要，因此显示 AI 生成的上下文说明',
    relatedVideosHeading: '相关视频',
    openOnYouTube: '在 YouTube 打开',
    openVideo: '打开视频',
    wikipedia: 'Wikipedia',
    google: 'Google',
    unknownChannel: '未知频道',
    unknownLength: '时长未知',
    autoLanguage: '自动',
    transcriptTranslatedTag: '已翻译',
    transcriptOriginalTag: '原始',
  },
};

const state = {
  workspace: null,
  activeTab: TAB_IDS.summary,
  locale: 'en',
  localized: {
    en: createLocaleCache(),
    zh: createLocaleCache(),
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
  generationOptions: null,
  summaryStreaming: false,
  requests: {
    workspace: null,
    summary: null,
    tab: null,
    person: null,
    transcript: null,
  },
};

const refs = {
  appDescription: document.getElementById('app-description'),
  localeToggle: document.getElementById('locale-toggle'),
  localeToggleText: document.getElementById('locale-toggle-text'),
  heroTitle: document.getElementById('hero-title'),
  heroDescription: document.getElementById('hero-description'),
  labelVideoUrl: document.getElementById('label-video-url'),
  labelTone: document.getElementById('label-tone'),
  labelLength: document.getElementById('label-length'),
  labelSectionDensity: document.getElementById('label-section-density'),
  labelRelatedFocus: document.getElementById('label-related-focus'),
  loadButton: document.getElementById('load-workspace'),
  regenerateButton: document.getElementById('regenerate-summary'),
  videoUrl: document.getElementById('video-url'),
  playerTitle: document.getElementById('player-title'),
  playerPlaceholderTitle: document.getElementById('player-placeholder-title'),
  playerPlaceholderCopy: document.getElementById('player-placeholder-copy'),
  transcriptTitle: document.getElementById('transcript-title'),
  labelAutoFollow: document.getElementById('label-auto-follow'),
  labelTranscriptWindow: document.getElementById('label-transcript-window'),
  workspaceTitle: document.getElementById('workspace-title'),
  workspaceSubtitle: document.getElementById('workspace-subtitle'),
  styleSectionTitle: document.getElementById('style-section-title'),
  generationSectionTitle: document.getElementById('generation-section-title'),
  detailPaneTitle: document.getElementById('detail-pane-title'),
  labelTheme: document.getElementById('label-theme'),
  labelFontScale: document.getElementById('label-font-scale'),
  labelContentWidth: document.getElementById('label-content-width'),
  labelPanelRatio: document.getElementById('label-panel-ratio'),
  labelParagraphSpacing: document.getElementById('label-paragraph-spacing'),
  labelEmphasisDensity: document.getElementById('label-emphasis-density'),
  labelTitleStyle: document.getElementById('label-title-style'),
  labelQuoteEmphasis: document.getElementById('label-quote-emphasis'),
  labelMindmapDepth: document.getElementById('label-mindmap-depth'),
  labelPeopleDepth: document.getElementById('label-people-depth'),
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
    if (state.workspace) {
      runSummaryStream();
    }
  });
  refs.localeToggle.addEventListener('click', toggleLocale);
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
  state.generationOptions = readGenerationOptions();
  applyStyleState();
  applyLocale();
}

window.onYouTubeIframeAPIReady = function() {
  state.youtubeReady = true;
  if (state.workspace) {
    mountPlayer(state.workspace.video.id);
  }
};

async function toggleLocale() {
  const nextLocale = state.locale === 'en' ? 'zh' : 'en';
  state.locale = nextLocale;
  state.generationOptions = readGenerationOptions();
  abortRequest('summary');
  abortRequest('tab');
  abortRequest('person');
  abortRequest('transcript');
  state.summaryStreaming = false;
  applyLocale();

  if (!state.workspace) {
    setStatus(t('statusReadyInitial'), 'success');
    return;
  }

  renderWorkspaceMeta();
  await ensureTranscriptForCurrentLocale();
  renderTranscriptList();
  renderDetailPane();

  if (state.activeTab === TAB_IDS.summary) {
    if (getLocaleState().summaryHtml) {
      renderSummary();
      setStatus(t('statusSummaryReady'), 'success');
    } else {
      await runSummaryStream();
    }
    return;
  }

  if (getLocaleState().tabData[state.activeTab]) {
    renderActiveTab();
    if (state.activeTab === TAB_IDS.people) {
      await ensurePersonDetail();
    }
    return;
  }

  renderTabLoading(state.activeTab);
  await loadTabData(state.activeTab);
}

async function loadWorkspace() {
  const url = refs.videoUrl.value.trim();
  if (!url) {
    setStatus(t('statusPasteUrl'), 'error');
    return;
  }

  abortRequest('workspace');
  abortRequest('summary');
  abortRequest('tab');
  abortRequest('person');
  abortRequest('transcript');

  const controller = new AbortController();
  state.requests.workspace = controller;
  refs.loadButton.disabled = true;
  refs.regenerateButton.disabled = true;
  setStatus(t('statusLoadingWorkspace'), 'loading');

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
    state.localized = {
      en: createLocaleCache(),
      zh: createLocaleCache(),
    };
    state.selectedPerson = null;
    state.currentCueId = null;
    primeSourceTranscriptCache(payload.transcript);
    activateTab(TAB_IDS.summary, true);
    renderWorkspaceMeta();
    renderDetailPaneNotice();
    mountPlayer(payload.video.id);
    refs.regenerateButton.disabled = false;
    setStatus(t('statusWorkspaceReady'), 'loading');
    await ensureTranscriptForCurrentLocale();
    renderTranscriptList();
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
  const requestLocale = state.locale;
  const localeState = getLocaleState(requestLocale);
  state.requests.summary = controller;
  state.summaryStreaming = true;
  localeState.summaryHtml = '';
  activateTab(TAB_IDS.summary, true);
  refs.analysisMain.innerHTML = '<div class="loading-state">' + escapeHtml(t('statusLoadingSummary')) + '</div>';
  setStatus(t('statusLoadingSummary'), 'loading');

  try {
    await ensureTranscriptForLocale(requestLocale);
    const response = await fetch('/api/summary/stream', {
      method: 'POST',
      headers: {'content-type': 'application/json'},
      body: JSON.stringify({
        video: state.workspace.video,
        transcript: {entries: getPromptTranscriptEntries()},
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
        handleSummaryEvent(block, requestLocale);
        boundary = buffer.indexOf('\n\n');
      }
    }

    if (state.locale === requestLocale) {
      setStatus(t('statusSummaryReady'), 'success');
    }
  } catch (error) {
    if (error.name !== 'AbortError') {
      if (state.locale === requestLocale) {
        setStatus(error.message || 'Summary stream failed.', 'error');
        refs.analysisMain.innerHTML = '<div class="error-state">' + escapeHtml(error.message || 'Summary stream failed.') + '</div>';
      }
    }
  } finally {
    if (state.requests.summary === controller) {
      state.summaryStreaming = false;
      state.requests.summary = null;
    }
  }
}

function handleSummaryEvent(block, requestLocale) {
  const eventName = readEventName(block);
  const data = readEventData(block);
  if (!eventName || !data) {
    return;
  }

  if (eventName === 'summary_chunk') {
    getLocaleState(requestLocale).summaryHtml += data.chunk || '';
    if (state.activeTab === TAB_IDS.summary && state.locale === requestLocale) {
      renderSummary();
    }
    return;
  }

  if (eventName === 'error' && state.locale === requestLocale) {
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
    refs.analysisMain.innerHTML = '<div class="empty-state">' + escapeHtml(t('loadWorkspaceBeforeTabs')) + '</div>';
    return;
  }

  const localeState = getLocaleState();
  if (localeState.tabData[tabId] && !skipFetch) {
    renderActiveTab();
    if (tabId === TAB_IDS.people) {
      await ensurePersonDetail();
    }
    return;
  }

  renderTabLoading(tabId);
  if (!skipFetch) {
    await loadTabData(tabId);
  }
}

async function loadTabData(tabId) {
  abortRequest('tab');
  const controller = new AbortController();
  const requestLocale = state.locale;
  state.requests.tab = controller;
  setStatus(formatMessage(t('statusLoadingTab'), {tab: getTabLabel(tabId)}), 'loading');

  try {
    await ensureTranscriptForLocale(requestLocale);
    const response = await fetch('/api/tab/' + tabId, {
      method: 'POST',
      headers: {'content-type': 'application/json'},
      body: JSON.stringify({
        video: state.workspace.video,
        transcript: {entries: getPromptTranscriptEntries(requestLocale)},
        options: getGenerationOptions(requestLocale),
      }),
      signal: controller.signal,
    });
    const payload = await response.json();
    if (!response.ok) {
      throw new Error(payload.error || 'Tab load failed.');
    }

    const localeState = getLocaleState(requestLocale);
    localeState.tabData[tabId] = payload;

    if (tabId === TAB_IDS.people && payload.people && payload.people.length && !state.selectedPerson) {
      state.selectedPerson = payload.people[0].name;
    }

    if (state.locale === requestLocale) {
      renderActiveTab();
      if (tabId === TAB_IDS.people) {
        await ensurePersonDetail();
      } else {
        setStatus(formatMessage(t('statusLoadedTab'), {tab: getTabLabel(tabId)}), 'success');
      }
    }
  } catch (error) {
    if (error.name !== 'AbortError' && state.locale === requestLocale) {
      setStatus(error.message || 'Tab load failed.', 'error');
      refs.analysisMain.innerHTML = '<div class="error-state">' + escapeHtml(error.message || 'Tab load failed.') + '</div>';
    }
  } finally {
    if (state.requests.tab === controller) {
      state.requests.tab = null;
    }
  }
}

async function ensurePersonDetail() {
  ensureSelectedPerson();
  if (!state.selectedPerson) {
    renderDetailPaneNotice();
    return;
  }

  const localeState = getLocaleState();
  if (localeState.personDetails[state.selectedPerson]) {
    renderDetailPane();
    return;
  }
  await loadPersonDetail(state.selectedPerson);
}

async function loadPersonDetail(personName) {
  abortRequest('person');
  const controller = new AbortController();
  const requestLocale = state.locale;
  state.requests.person = controller;
  refs.detailPane.innerHTML = '<div class="loading-state">' + escapeHtml(t('detailLoading')) + '</div>';
  setStatus(t('statusLoadingPersonDetail'), 'loading');

  try {
    await ensureTranscriptForLocale(requestLocale);
    const response = await fetch('/api/person/detail', {
      method: 'POST',
      headers: {'content-type': 'application/json'},
      body: JSON.stringify({
        personName: personName,
        video: state.workspace.video,
        transcript: {entries: getPromptTranscriptEntries(requestLocale)},
        options: getGenerationOptions(requestLocale),
      }),
      signal: controller.signal,
    });
    const payload = await response.json();
    if (!response.ok) {
      throw new Error(payload.error || 'Person detail failed.');
    }
    getLocaleState(requestLocale).personDetails[personName] = payload;
    if (state.locale === requestLocale) {
      renderDetailPane();
      setStatus(t('statusPersonDetailReady'), 'success');
    }
  } catch (error) {
    if (error.name !== 'AbortError' && state.locale === requestLocale) {
      refs.detailPane.innerHTML = '<div class="error-state">' + escapeHtml(error.message || 'Person detail failed.') + '</div>';
    }
  } finally {
    if (state.requests.person === controller) {
      state.requests.person = null;
    }
  }
}

async function ensureTranscriptForCurrentLocale() {
  await ensureTranscriptForLocale(state.locale);
}

async function ensureTranscriptForLocale(locale) {
  if (!state.workspace) {
    return;
  }

  const localeState = getLocaleState(locale);
  if (localeState.transcriptEntries) {
    return;
  }

  if (localeState.transcriptPromise) {
    await localeState.transcriptPromise;
    return;
  }

  if (getSourceTranscriptLocale() === locale) {
    localeState.transcriptEntries = state.workspace.transcript.entries;
    return;
  }

  const requestPromise = requestTranscriptTranslation(locale, localeState);
  localeState.transcriptPromise = requestPromise;
  await requestPromise;
}

function renderWorkspaceMeta() {
  if (!state.workspace) {
    refs.videoSubtitle.textContent = t('videoSubtitleInitial');
    refs.transcriptSubtitle.textContent = t('transcriptSubtitleInitial');
    refs.videoBadges.innerHTML = '';
    refs.videoMeta.innerHTML = '';
    return;
  }

  const video = state.workspace.video;
  const localeState = getLocaleState();
  const transcriptEntries = getCurrentTranscriptEntries();
  const transcriptTag = getSourceTranscriptLocale() === state.locale
    ? t('transcriptOriginalTag')
    : t('transcriptTranslatedTag');

  refs.videoSubtitle.textContent = video.title;
  refs.transcriptSubtitle.textContent = localeState.transcriptLoading
    ? t('transcriptLoadedCountPending')
    : formatMessage(t('transcriptLoadedCount'), {count: transcriptEntries.length});
  refs.videoBadges.innerHTML = [
    createPill(video.channelTitle || t('unknownChannel')),
    createPill(formatLength(video.lengthSeconds)),
    createPill((state.workspace.transcript.language || t('autoLanguage')) + ' · ' + transcriptTag),
  ].join('');
  refs.videoMeta.innerHTML =
    '<div class="notice-card"><strong>' + escapeHtml(video.title) + '</strong><div class="panel-subtitle">' +
    escapeHtml(video.channelTitle || '') +
    '</div><div class="person-links"><a class="inline-link" target="_blank" rel="noreferrer" href="' +
    escapeHtml(video.watchUrl) +
    '">' + escapeHtml(t('openOnYouTube')) + '</a></div></div>';
}

function renderTranscriptList() {
  if (!state.workspace) {
    refs.transcriptList.innerHTML = '<div class="empty-state">' + escapeHtml(t('transcriptEmptyInitial')) + '</div>';
    return;
  }

  if (getLocaleState().transcriptLoading) {
    refs.transcriptList.innerHTML = '<div class="loading-state">' + escapeHtml(t('transcriptLoading')) + '</div>';
    return;
  }

  const entries = getVisibleTranscriptEntries();
  if (!entries.length) {
    refs.transcriptList.innerHTML = '<div class="empty-state">' + escapeHtml(t('transcriptEmpty')) + '</div>';
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
  const entries = getCurrentTranscriptEntries();
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
    refs.analysisMain.innerHTML = '<div class="empty-state">' + escapeHtml(t('summaryEmpty')) + '</div>';
    return;
  }

  const summaryHtml = getLocaleState().summaryHtml;
  if (!summaryHtml) {
    refs.analysisMain.innerHTML = '<div class="loading-state">' + escapeHtml(t('statusLoadingSummary')) + '</div>';
    return;
  }

  refs.analysisMain.innerHTML = '<div class="summary-frame">' + sanitizeSummaryHtml(summaryHtml) + '</div>';
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
  const data = getLocaleState().tabData.mindmap;
  if (!data || !data.nodes || !data.nodes.length) {
    refs.analysisMain.innerHTML = '<div class="empty-state">' + escapeHtml(t('noMindmap')) + '</div>';
    return;
  }
  refs.analysisMain.innerHTML =
    '<div class="mindmap-root">' +
      '<div class="notice-card"><strong>' + escapeHtml(data.title || getTabLabel(TAB_IDS.mindmap)) + '</strong></div>' +
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
  const data = getLocaleState().tabData.related;
  if (!data || !data.recommendations || !data.recommendations.length) {
    refs.analysisMain.innerHTML = '<div class="empty-state">' + escapeHtml(t('noRelated')) + '</div>';
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
              '<a target="_blank" rel="noreferrer" href="' + escapeHtml(item.url) + '">' + escapeHtml(t('openVideo')) + '</a>' +
            '</div>' +
          '</article>'
        );
      }).join('') +
    '</div>';
}

function renderPeople() {
  const data = getLocaleState().tabData.people;
  if (!data || !data.people || !data.people.length) {
    refs.analysisMain.innerHTML = '<div class="empty-state">' + escapeHtml(t('noPeople')) + '</div>';
    return;
  }

  ensureSelectedPerson();

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
      renderDetailPane();
      loadPersonDetail(state.selectedPerson);
    });
  });
}

function renderDetailPane() {
  if (!state.workspace) {
    renderDetailPaneNotice();
    return;
  }
  if (!state.selectedPerson) {
    renderDetailPaneNotice();
    return;
  }

  const data = getLocaleState().personDetails[state.selectedPerson];
  if (!data) {
    renderDetailPaneNotice();
    return;
  }

  const profileText = data.profile && data.profile.extract
    ? '<p>' + escapeHtml(data.profile.extract) + '</p>'
    : '<p>' + escapeHtml(t('detailProfileFallback')) + '</p>';

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
        '<a target="_blank" rel="noreferrer" href="' + escapeHtml(data.links.wikipedia) + '">' + escapeHtml(t('wikipedia')) + '</a>' +
        '<a target="_blank" rel="noreferrer" href="' + escapeHtml(data.links.google) + '">' + escapeHtml(t('google')) + '</a>' +
      '</div>' +
      profileText +
      '<h4>' + escapeHtml(t('relatedVideosHeading')) + '</h4>' +
      '<div class="person-video-grid">' +
        (data.relatedVideos || []).map(function(video) {
          return (
            '<article class="person-video-card">' +
              '<h4>' + escapeHtml(video.title) + '</h4>' +
              '<div class="card-meta">' + escapeHtml(video.channelTitle || '') + '</div>' +
              '<div class="person-links"><a target="_blank" rel="noreferrer" href="' + escapeHtml(video.url) + '">' + escapeHtml(t('openOnYouTube')) + '</a></div>' +
            '</article>'
          );
        }).join('') +
      '</div>' +
    '</div>';
}

function renderDetailPaneNotice() {
  refs.detailPane.innerHTML = '<div class="notice-card">' + escapeHtml(t('detailNotice')) + '</div>';
}

function renderTabLoading(tabId) {
  refs.analysisMain.innerHTML = '<div class="loading-state">' + escapeHtml(formatMessage(t('statusLoadingTab'), {tab: getTabLabel(tabId)})) + '</div>';
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

function applyLocale() {
  const copy = getCopy();
  document.documentElement.lang = copy.htmlLang;
  document.title = copy.metaTitle;
  refs.appDescription.setAttribute('content', copy.metaDescription);
  refs.localeToggle.setAttribute('aria-label', copy.localeToggleAria);
  refs.localeToggleText.textContent = copy.localeToggleText;
  refs.heroTitle.textContent = copy.heroTitle;
  refs.heroDescription.textContent = copy.heroDescription;
  refs.labelVideoUrl.textContent = copy.videoUrlLabel;
  refs.videoUrl.placeholder = copy.videoUrlPlaceholder;
  refs.labelTone.textContent = copy.toneLabel;
  refs.labelLength.textContent = copy.lengthLabel;
  refs.labelSectionDensity.textContent = copy.sectionDensityLabel;
  refs.labelRelatedFocus.textContent = copy.relatedFocusLabel;
  refs.loadButton.textContent = copy.loadWorkspace;
  refs.regenerateButton.textContent = copy.regenerate;
  refs.playerTitle.textContent = copy.liveVideo;
  refs.playerPlaceholderTitle.textContent = copy.playerPlaceholderTitle;
  refs.playerPlaceholderCopy.textContent = copy.playerPlaceholderCopy;
  refs.transcriptTitle.textContent = copy.liveTranscript;
  setLabelText(refs.labelAutoFollow, copy.autoFollow);
  setLabelText(refs.labelTranscriptWindow, copy.transcriptWindow);
  refs.workspaceTitle.textContent = copy.aiWorkspace;
  refs.workspaceSubtitle.textContent = copy.workspaceSubtitle;
  refs.styleSectionTitle.textContent = copy.realtimeStyle;
  refs.generationSectionTitle.textContent = copy.generationControls;
  refs.detailPaneTitle.textContent = copy.detailPane;
  setLabelText(refs.labelTheme, copy.theme);
  setLabelText(refs.labelFontScale, copy.fontScale);
  setLabelText(refs.labelContentWidth, copy.contentWidth);
  setLabelText(refs.labelPanelRatio, copy.panelRatio);
  setLabelText(refs.labelParagraphSpacing, copy.paragraphSpacing);
  setLabelText(refs.labelEmphasisDensity, copy.emphasisDensity);
  setLabelText(refs.labelTitleStyle, copy.titleStyle);
  setLabelText(refs.labelQuoteEmphasis, copy.quoteEmphasis);
  setLabelText(refs.labelMindmapDepth, copy.mindmapDepth);
  setLabelText(refs.labelPeopleDepth, copy.peopleDepth);
  refs.tabButtons.forEach(function(button) {
    button.textContent = copy.tabLabels[button.dataset.tabButton] || button.textContent;
  });
  setSelectOptionLabels(refs.tone, copy.selectOptions.tone);
  setSelectOptionLabels(refs.length, copy.selectOptions.length);
  setSelectOptionLabels(refs.sectionDensity, copy.selectOptions.sectionDensity);
  setSelectOptionLabels(refs.relatedFocus, copy.selectOptions.relatedFocus);
  setSelectOptionLabels(refs.autoFollow, copy.selectOptions.autoFollow);
  setSelectOptionLabels(refs.transcriptWindow, copy.selectOptions.transcriptWindow);
  setSelectOptionLabels(refs.themeSelect, copy.selectOptions.theme);
  setSelectOptionLabels(refs.emphasisDensity, copy.selectOptions.emphasisDensity);
  setSelectOptionLabels(refs.titleStyle, copy.selectOptions.titleStyle);
  setSelectOptionLabels(refs.quoteEmphasis, copy.selectOptions.quoteEmphasis);
  setSelectOptionLabels(refs.mindmapDepth, copy.selectOptions.mindmapDepth);
  setSelectOptionLabels(refs.peopleDepth, copy.selectOptions.peopleDepth);
  renderWorkspaceMeta();
  renderTranscriptList();
  renderActiveTab();
  renderDetailPane();
}

function readGenerationOptions() {
  return {
    language: state.locale,
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
    ? '<strong>' + escapeHtml(t('statusErrorPrefix')) + '</strong> '
    : kind === 'success'
      ? '<strong>' + escapeHtml(t('statusReadyPrefix')) + '</strong> '
      : '<strong>' + escapeHtml(t('statusWorkingPrefix')) + '</strong> ';
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

function createLocaleCache() {
  return {
    summaryHtml: '',
    tabData: {
      mindmap: null,
      related: null,
      people: null,
    },
    transcriptEntries: null,
    transcriptLoading: false,
    transcriptPromise: null,
    personDetails: {},
  };
}

function getLocaleState(locale) {
  return state.localized[locale || state.locale];
}

function getCurrentTranscriptEntries() {
  if (!state.workspace) {
    return [];
  }
  const localeState = getLocaleState();
  if (localeState.transcriptEntries) {
    return localeState.transcriptEntries;
  }
  if (getSourceTranscriptLocale() === state.locale) {
    return state.workspace.transcript.entries || [];
  }
  return [];
}

function getPromptTranscriptEntries(locale) {
  if (!state.workspace) {
    return [];
  }
  const localeState = getLocaleState(locale);
  if (localeState.transcriptEntries && localeState.transcriptEntries.length) {
    return localeState.transcriptEntries;
  }
  return state.workspace.transcript.entries || [];
}

function getSourceTranscriptLocale() {
  if (!state.workspace || !state.workspace.transcript) {
    return null;
  }
  const language = String(state.workspace.transcript.language || '').toLowerCase();
  if (language.startsWith('zh')) {
    return 'zh';
  }
  if (language.startsWith('en')) {
    return 'en';
  }
  return null;
}

function primeSourceTranscriptCache(transcript) {
  const sourceLocale = detectLanguageFamily(transcript?.language);
  if (sourceLocale && state.localized[sourceLocale]) {
    state.localized[sourceLocale].transcriptEntries = transcript.entries || [];
  }
}

function detectLanguageFamily(value) {
  const language = String(value || '').toLowerCase();
  if (language.startsWith('zh')) {
    return 'zh';
  }
  if (language.startsWith('en')) {
    return 'en';
  }
  return null;
}

function getGenerationOptions(locale) {
  return {
    ...readGenerationOptions(),
    language: locale || state.locale,
  };
}

async function requestTranscriptTranslation(locale, localeState) {
  abortRequest('transcript');
  const controller = new AbortController();
  state.requests.transcript = controller;
  localeState.transcriptLoading = true;
  if (state.locale === locale) {
    renderWorkspaceMeta();
    renderTranscriptList();
    setStatus(t('statusLoadingTranscriptTranslation'), 'loading');
  }

  try {
    const response = await fetch('/api/transcript/translate', {
      method: 'POST',
      headers: {'content-type': 'application/json'},
      body: JSON.stringify({
        transcript: state.workspace.transcript,
        options: getGenerationOptions(locale),
      }),
      signal: controller.signal,
    });
    const payload = await response.json();
    if (!response.ok) {
      throw new Error(payload.error || 'Transcript translation failed.');
    }
    localeState.transcriptEntries = Array.isArray(payload.entries) && payload.entries.length
      ? payload.entries
      : state.workspace.transcript.entries;
    if (state.locale === locale) {
      setStatus(t('statusTranscriptReady'), 'success');
    }
  } catch (error) {
    if (error.name !== 'AbortError') {
      localeState.transcriptEntries = state.workspace.transcript.entries;
      if (state.locale === locale) {
        setStatus(error.message || 'Transcript translation failed.', 'error');
      }
    }
  } finally {
    localeState.transcriptLoading = false;
    localeState.transcriptPromise = null;
    if (state.locale === locale) {
      renderWorkspaceMeta();
      renderTranscriptList();
    }
    if (state.requests.transcript === controller) {
      state.requests.transcript = null;
    }
  }
}

function getCopy() {
  return LOCALE_DATA[state.locale] || LOCALE_DATA.en;
}

function t(key) {
  return getCopy()[key];
}

function getTabLabel(tabId) {
  return getCopy().tabLabels[tabId] || tabId;
}

function ensureSelectedPerson() {
  const people = getLocaleState().tabData.people?.people || [];
  if (!people.length) {
    state.selectedPerson = null;
    return;
  }
  const exists = people.some(function(person) {
    return person.name === state.selectedPerson;
  });
  if (!exists) {
    state.selectedPerson = people[0].name;
  }
}

function setSelectOptionLabels(select, labels) {
  const currentValue = select.value;
  const options = Array.from(select.options).map(function(option) {
    return {
      value: option.value,
      text: labels[option.value] || option.textContent,
    };
  });
  select.innerHTML = options.map(function(option) {
    return '<option value="' + escapeHtml(option.value) + '">' + escapeHtml(option.text) + '</option>';
  }).join('');
  select.value = currentValue;
}

function setLabelText(label, text) {
  const textNode = Array.from(label.childNodes).find(function(node) {
    return node.nodeType === Node.TEXT_NODE;
  });
  if (textNode) {
    textNode.textContent = text + '\n                    ';
    return;
  }
  label.prepend(document.createTextNode(text + ' '));
}

function formatMessage(template, values) {
  return String(template || '').replace(/\{(\w+)\}/g, function(match, key) {
    return values[key] == null ? match : String(values[key]);
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
    return t('unknownLength');
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
