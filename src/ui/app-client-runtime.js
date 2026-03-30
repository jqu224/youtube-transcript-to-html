export function bootstrapAppClient() {
  var themeToggle = document.getElementById('theme-toggle');
  var localeToggle = document.getElementById('locale-toggle');
  var localeToggleText = document.getElementById('locale-toggle-text');
  var authorizeYouTubeButton = document.getElementById('authorize-youtube');
  var loadButton = document.getElementById('load-workspace');
  var videoUrl = document.getElementById('video-url');
  var statusLine = document.getElementById('status-line');
  var analysisMain = document.getElementById('analysis-main');
  var analysisEmpty = document.getElementById('analysis-empty');
  var playerPlaceholder = document.getElementById('player-placeholder');
  var youtubePlayer = document.getElementById('youtube-player');
  var playerTitle = document.getElementById('player-title');
  var videoSubtitle = document.getElementById('video-subtitle');
  var videoMeta = document.getElementById('video-meta');
  var controlSection = document.getElementById('control-section');
  var controlCollapseToggle = document.getElementById('control-collapse-toggle');
  var transcriptList = document.getElementById('transcript-list');
  var transcriptSubtitle = document.getElementById('transcript-subtitle');
  var transcriptWindow = document.getElementById('transcript-window');
  var autoFollow = document.getElementById('auto-follow');
  var tabButtons = Array.prototype.slice.call(document.querySelectorAll('[data-tab-button]'));

  var theme = 'light';
  var locale = 'en';
  var currentVideoId = '';
  var currentVideoUrl = '';
  var transcriptEntries = [];
  var transcriptRows = [];
  var activeRowId = '';
  var hasLoadedWorkspace = false;
  var ytPlayer = null;
  var ytApiReadyPromise = null;
  var autoFollowTimerId = 0;
  var activeWorkspaceTab = 'smartnote';
  var summaryHtml = '';
  var smartnoteHtml = '';
  var pendingCaptchaOpenUrl = '';
  var youtubeOAuthToken = '';
  var youtubeOAuthTokenExpiresAt = 0;
  var youtubeTokenClient = null;
  var I18N = {
    en: {
      localeToggleText: 'EN / 中文',
      appTitle: 'YouTube AI Workspace',
      ariaToggleTheme: 'Toggle color theme',
      ariaSwitchLanguage: 'Switch language',
      ariaToggleUrlControls: 'Toggle URL controls',
      ariaWorkspaceTabs: 'Workspace tabs',
      metaDescription: 'Live YouTube transcript workspace with streamed Chinese AI summary, mindmap, related videos, and people tabs',
      heroWordmark: '/ YouTube Transcript To AI Notes /',
      labelVideoUrl: 'YouTube URL',
      placeholderVideoUrl: 'https://www.youtube.com/watch?v=xRh2sVcNXQ8',
      buttonAuthorizeYouTube: 'Authorize YouTube',
      buttonLoadWorkspace: 'Load Workspace',
      titleLiveVideo: 'Live Video',
      subtitleLoadVideoStartWorkspace: 'Load a video to start the workspace',
      placeholderPasteCaptionedVideo: 'Paste a captioned YouTube video',
      placeholderPlayerTranscriptTabsPopulate: 'The player, transcript, and AI tabs will populate together',
      titleLiveTranscript: 'Live Transcript',
      subtitleTranscriptCuesAppear: 'Transcript cues will appear here',
      labelAutoFollow: 'Auto Follow',
      optionOn: 'On',
      optionOff: 'Off',
      labelTranscriptWindow: 'Transcript Window',
      optionAllCues: 'All cues',
      optionSecBlocks: '15 sec blocks',
      optionSmartSlices: 'Smart slices',
      emptyTranscriptClickableAfterLoad: 'Transcript cues will become clickable once the workspace is loaded',
      titleAiWorkspace: 'AI Workspace',
      subtitleSmartnoteDefaultAiSummaryAvailable: 'Smartnote is the default tab and AI Summary is also available',
      tabSmartnote: 'Smartnote',
      tabSummary: 'AI Summary',
      tabMindmap: 'Mindmap',
      tabRelated: 'Related Videos',
      tabPeople: 'People',
      statusPrefixError: '<strong>Error</strong> ',
      statusPrefixReady: '<strong>Ready</strong> ',
      statusPrefixWorking: '<strong>Working</strong> ',
      statusYouTubeAuthReady: 'YouTube authorization ready',
      statusYouTubeAuthFailed: 'YouTube authorization failed',
      statusPasteUrlFirst: 'Paste a YouTube URL first',
      statusInvalidVideoId: 'Could not extract a valid YouTube video ID',
      statusFetchingTranscript: 'Fetching transcript',
      statusLoadedCuesViaSource: 'Loaded {cueCount} cues via {sourceLabel}',
      statusLoadedCuesGeneratedNotes: 'Loaded {cueCount} cues and generated notes',
      statusYouTubeVerificationRequired: 'YouTube verification required before retry',
      statusFailedLoadWorkspace: 'Failed to load workspace',
      statusAuthorizePopupReturnTranscript: 'Authorize in popup and return transcript to workspace',
      statusPopupReturnedEmpty: 'Popup returned empty transcript',
      statusLoadedCuesViaPopup: 'Loaded {cueCount} cues via browser OAuth popup',
      statusLoadVideoBegin: 'Load a video to begin',
      statusRequestFailed: 'Request failed',
      statusOAuthNotConfigured: 'YouTube OAuth is not configured',
      statusOAuthFailed: 'YouTube OAuth failed',
      statusYouTubeApiTimeout: 'YouTube API load timeout',
      cardYouTubeVerificationNeeded: 'YouTube verification needed',
      cardCaptchaIpCheck: 'YouTube asked for a captcha or anti-bot check for this IP',
      cardUsePopupFlow: 'Use browser OAuth popup to fetch transcript on local network and return here',
      linkOpenBrowserOAuthPopup: 'Open Browser OAuth Popup',
      buttonRetryLoadWorkspace: 'Retry Load Workspace',
      cardLocalFallbackStatus: 'Local fallback status: {error}',
      cardSmartnoteAfterLoad: 'Smartnote will appear after the workspace loads',
      cardSummaryAfterLoad: 'AI Summary will appear after the workspace loads',
      cardDeferredTab: 'This tab is not part of the current minimal refactor yet',
      videoSubtitleId: 'YouTube ID: {videoId}',
      videoNowPlaying: 'Now playing',
      linkOpenOnYouTube: 'Open on YouTube',
      emptyTranscriptIsEmpty: 'Transcript is empty',
      subtitleSlicesFromCues: '{sliceCount} slices from {cueCount} cues',
      labelTone: 'Tone',
      labelLength: 'Length',
      labelSectionDensity: 'Section Density',
      labelRelatedFocus: 'Related Focus',
      optionInsightful: 'Insightful',
      optionAnalytical: 'Analytical',
      optionConcise: 'Concise',
      optionDramatic: 'Dramatic',
      optionDetailed: 'Detailed',
      optionBalanced: 'Balanced',
      optionCompact: 'Compact',
      optionDense: 'Dense',
      optionSpacious: 'Spacious',
      optionAdjacentTopics: 'Adjacent topics',
      optionSameSpeakers: 'Same speakers',
      optionDeeperDive: 'Deeper dive',
      sectionGenerationControls: 'Generation Controls',
      sectionDetailPane: 'Detail Pane',
      detailPaneNotice: 'Click a person in the People tab to load wiki-style details and related videos',
    },
    zh: {
      localeToggleText: 'EN / 中文',
      appTitle: 'YouTube AI 工作区',
      ariaToggleTheme: '切换主题',
      ariaSwitchLanguage: '切换语言',
      ariaToggleUrlControls: '切换 URL 控件',
      ariaWorkspaceTabs: '工作区标签',
      metaDescription: '实时 YouTube 字幕工作区，支持中文 AI 摘要、思维导图、相关视频和人物标签',
      heroWordmark: '/ YouTube 字幕转 AI 笔记 /',
      labelVideoUrl: 'YouTube 链接',
      placeholderVideoUrl: 'https://www.youtube.com/watch?v=xRh2sVcNXQ8',
      buttonAuthorizeYouTube: '授权 YouTube',
      buttonLoadWorkspace: '加载工作区',
      titleLiveVideo: '实时视频',
      subtitleLoadVideoStartWorkspace: '加载一个视频即可启动工作区',
      placeholderPasteCaptionedVideo: '粘贴一个带字幕的 YouTube 视频',
      placeholderPlayerTranscriptTabsPopulate: '播放器、字幕和 AI 标签会一起加载',
      titleLiveTranscript: '实时字幕',
      subtitleTranscriptCuesAppear: '字幕片段会显示在这里',
      labelAutoFollow: '自动跟随',
      optionOn: '开',
      optionOff: '关',
      labelTranscriptWindow: '字幕窗口',
      optionAllCues: '全部片段',
      optionSecBlocks: '15 秒分块',
      optionSmartSlices: '智能切片',
      emptyTranscriptClickableAfterLoad: '工作区加载完成后，字幕片段即可点击',
      titleAiWorkspace: 'AI 工作区',
      subtitleSmartnoteDefaultAiSummaryAvailable: 'Smartnote 是默认标签，AI Summary 也可用',
      tabSmartnote: 'AI 笔记',
      tabSummary: 'AI 总结',
      tabMindmap: '思维导图',
      tabRelated: '相关视频',
      tabPeople: '人物',
      statusPrefixError: '<strong>错误</strong> ',
      statusPrefixReady: '<strong>就绪</strong> ',
      statusPrefixWorking: '<strong>处理中</strong> ',
      statusYouTubeAuthReady: 'YouTube 授权已就绪',
      statusYouTubeAuthFailed: 'YouTube 授权失败',
      statusPasteUrlFirst: '请先粘贴 YouTube 链接',
      statusInvalidVideoId: '无法提取有效的 YouTube 视频 ID',
      statusFetchingTranscript: '正在获取字幕',
      statusLoadedCuesViaSource: '已通过 {sourceLabel} 加载 {cueCount} 条片段',
      statusLoadedCuesGeneratedNotes: '已加载 {cueCount} 条片段并生成笔记',
      statusYouTubeVerificationRequired: '需要先完成 YouTube 验证再重试',
      statusFailedLoadWorkspace: '加载工作区失败',
      statusAuthorizePopupReturnTranscript: '请在弹窗完成授权并返回字幕到工作区',
      statusPopupReturnedEmpty: '弹窗返回的字幕为空',
      statusLoadedCuesViaPopup: '已通过浏览器 OAuth 弹窗加载 {cueCount} 条片段',
      statusLoadVideoBegin: '加载一个视频即可开始',
      statusRequestFailed: '请求失败',
      statusOAuthNotConfigured: '未配置 YouTube OAuth',
      statusOAuthFailed: 'YouTube OAuth 失败',
      statusYouTubeApiTimeout: 'YouTube API 加载超时',
      cardYouTubeVerificationNeeded: '需要 YouTube 验证',
      cardCaptchaIpCheck: 'YouTube 要求此 IP 完成验证码或反机器人校验',
      cardUsePopupFlow: '请使用浏览器 OAuth 弹窗在本地网络获取字幕并回传',
      linkOpenBrowserOAuthPopup: '打开浏览器 OAuth 弹窗',
      buttonRetryLoadWorkspace: '重试加载工作区',
      cardLocalFallbackStatus: '本地兜底状态: {error}',
      cardSmartnoteAfterLoad: '加载工作区后会在这里显示 Smartnote',
      cardSummaryAfterLoad: '加载工作区后会在这里显示 AI Summary',
      cardDeferredTab: '当前最小化重构尚未包含该标签',
      videoSubtitleId: 'YouTube ID: {videoId}',
      videoNowPlaying: '正在播放',
      linkOpenOnYouTube: '在 YouTube 打开',
      emptyTranscriptIsEmpty: '字幕为空',
      subtitleSlicesFromCues: '{cueCount} 条片段生成 {sliceCount} 个切片',
      labelTone: '语气',
      labelLength: '长度',
      labelSectionDensity: '段落密度',
      labelRelatedFocus: '相关推荐方向',
      optionInsightful: '有洞察',
      optionAnalytical: '偏分析',
      optionConcise: '简洁',
      optionDramatic: '戏剧化',
      optionDetailed: '详细',
      optionBalanced: '平衡',
      optionCompact: '紧凑',
      optionDense: '密集',
      optionSpacious: '宽松',
      optionAdjacentTopics: '相邻话题',
      optionSameSpeakers: '相同讲者',
      optionDeeperDive: '深入延展',
      sectionGenerationControls: '生成控制',
      sectionDetailPane: '详情面板',
      detailPaneNotice: '点击人物标签中的人物可加载 wiki 风格详情和相关视频',
    },
  };

  function t(key, params) {
    var dict = I18N[locale] || I18N.en;
    var template = dict[key] || I18N.en[key] || key;
    if (!params) return template;
    return String(template).replace(/\{([a-zA-Z0-9_]+)\}/g, function (_, token) {
      var value = params[token];
      return value == null ? '' : String(value);
    });
  }

  function localizeSelectOptions(select, labels) {
    if (!select) return;
    var currentValue = select.value;
    var options = [];
    for (var i = 0; i < select.options.length; i++) {
      options.push({
        value: select.options[i].value,
        text: labels[select.options[i].value] || select.options[i].textContent || '',
      });
    }
    select.innerHTML = options.map(function (option) {
      return '<option value="' + escapeHtml(option.value) + '">' + escapeHtml(option.text) + '</option>';
    }).join('');
    select.value = currentValue;
  }

  function setText(id, key) {
    var node = document.getElementById(id);
    if (!node) return;
    node.textContent = t(key);
  }

  function setLabelPrefix(id, key) {
    var label = document.getElementById(id);
    if (!label || !label.childNodes || !label.childNodes.length) return;
    label.childNodes[0].nodeValue = t(key) + '\n                    ';
  }

  function applyLocale() {
    document.documentElement.lang = locale === 'zh' ? 'zh-Hans' : 'en';
    document.title = t('appTitle');
    if (localeToggleText) localeToggleText.textContent = t('localeToggleText');
    if (themeToggle) themeToggle.setAttribute('aria-label', t('ariaToggleTheme'));
    if (localeToggle) localeToggle.setAttribute('aria-label', t('ariaSwitchLanguage'));
    if (controlCollapseToggle) controlCollapseToggle.setAttribute('aria-label', t('ariaToggleUrlControls'));
    var tabStrip = document.querySelector('.tab-strip');
    if (tabStrip) tabStrip.setAttribute('aria-label', t('ariaWorkspaceTabs'));
    var appDescription = document.getElementById('app-description');
    if (appDescription) appDescription.setAttribute('content', t('metaDescription'));
    var heroWordmark = document.querySelector('.hero-wordmark');
    if (heroWordmark) heroWordmark.textContent = t('heroWordmark');

    setText('label-video-url', 'labelVideoUrl');
    setText('authorize-youtube', 'buttonAuthorizeYouTube');
    setText('load-workspace', 'buttonLoadWorkspace');
    setText('player-title', 'titleLiveVideo');
    setText('video-subtitle', 'subtitleLoadVideoStartWorkspace');
    setText('player-placeholder-title', 'placeholderPasteCaptionedVideo');
    setText('player-placeholder-copy', 'placeholderPlayerTranscriptTabsPopulate');
    setText('transcript-title', 'titleLiveTranscript');
    setText('transcript-subtitle', 'subtitleTranscriptCuesAppear');
    setText('workspace-title', 'titleAiWorkspace');
    setText('workspace-subtitle', 'subtitleSmartnoteDefaultAiSummaryAvailable');
    setText('analysis-empty', 'cardSmartnoteAfterLoad');
    setText('generation-section-title', 'sectionGenerationControls');
    setText('detail-pane-title', 'sectionDetailPane');

    if (videoUrl) videoUrl.placeholder = t('placeholderVideoUrl');
    var detailPane = document.getElementById('detail-pane');
    if (detailPane) {
      detailPane.innerHTML = '<div class="notice-card">' + escapeHtml(t('detailPaneNotice')) + '</div>';
    }

    var tabLabelById = {
      smartnote: t('tabSmartnote'),
      summary: t('tabSummary'),
      mindmap: t('tabMindmap'),
      related: t('tabRelated'),
      people: t('tabPeople'),
    };
    tabButtons.forEach(function (button) {
      var tabId = String(button.getAttribute('data-tab-button') || '');
      if (tabLabelById[tabId]) {
        button.textContent = tabLabelById[tabId];
      }
    });

    setLabelPrefix('label-auto-follow', 'labelAutoFollow');
    setLabelPrefix('label-transcript-window', 'labelTranscriptWindow');
    setLabelPrefix('label-tone', 'labelTone');
    setLabelPrefix('label-length', 'labelLength');
    setLabelPrefix('label-section-density', 'labelSectionDensity');
    setLabelPrefix('label-related-focus', 'labelRelatedFocus');

    localizeSelectOptions(autoFollow, {on: t('optionOn'), off: t('optionOff')});
    localizeSelectOptions(transcriptWindow, {
      all: t('optionAllCues'),
      blocks: t('optionSecBlocks'),
      smart: t('optionSmartSlices'),
    });
    localizeSelectOptions(document.getElementById('tone'), {
      insightful: t('optionInsightful'),
      analytical: t('optionAnalytical'),
      concise: t('optionConcise'),
      dramatic: t('optionDramatic'),
    });
    localizeSelectOptions(document.getElementById('length'), {
      detailed: t('optionDetailed'),
      balanced: t('optionBalanced'),
      compact: t('optionCompact'),
    });
    localizeSelectOptions(document.getElementById('section-density'), {
      balanced: t('optionBalanced'),
      dense: t('optionDense'),
      spacious: t('optionSpacious'),
    });
    localizeSelectOptions(document.getElementById('related-focus'), {
      adjacent: t('optionAdjacentTopics'),
      'same-speakers': t('optionSameSpeakers'),
      'deeper-dive': t('optionDeeperDive'),
    });

    if (!transcriptEntries.length && transcriptList) {
      transcriptList.innerHTML = '<div class="empty-state">' + escapeHtml(t('emptyTranscriptClickableAfterLoad')) + '</div>';
    }
    renderTranscriptRows();
    renderActiveWorkspaceTab();
  }

  function setStatus(message, kind) {
    if (!statusLine) return;
    var prefix = kind === 'error' ? t('statusPrefixError')
      : kind === 'success' ? t('statusPrefixReady')
      : t('statusPrefixWorking');
    statusLine.innerHTML = prefix + escapeHtml(message);
  }

  function escapeHtml(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function quickExtractVideoId(input) {
    var trimmed = String(input || '').trim();
    if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) return trimmed;
    try {
      var url = new URL(trimmed);
      var v = url.searchParams.get('v');
      if (v && /^[a-zA-Z0-9_-]{11}$/.test(v)) return v;
      if (url.hostname === 'youtu.be') {
        var id = url.pathname.replace(/^\//, '').split('/')[0];
        if (/^[a-zA-Z0-9_-]{11}$/.test(id)) return id;
      }
      var m = url.pathname.match(/\/(?:embed|shorts|live)\/([a-zA-Z0-9_-]{11})/);
      if (m) return m[1];
    } catch (_) {}
    return null;
  }

  if (themeToggle) {
    themeToggle.addEventListener('click', function () {
      theme = theme === 'light' ? 'dark' : 'light';
      document.body.dataset.theme = theme;
    });
  }

  if (localeToggle) {
    localeToggle.addEventListener('click', function () {
      locale = locale === 'en' ? 'zh' : 'en';
      applyLocale();
    });
  }

  if (authorizeYouTubeButton) {
    authorizeYouTubeButton.addEventListener('click', function () {
      requestYouTubeOAuthToken(true).then(function () {
        setStatus(t('statusYouTubeAuthReady'), 'success');
      }).catch(function (error) {
        setStatus(error && error.message ? error.message : t('statusYouTubeAuthFailed'), 'error');
      });
    });
  }

  if (loadButton) {
    loadButton.addEventListener('click', async function () {
      var url = (videoUrl ? videoUrl.value : '').trim();
      if (!url) {
        setStatus(t('statusPasteUrlFirst'), 'error');
        return;
      }
      var videoId = quickExtractVideoId(url);
      if (!videoId) {
        setStatus(t('statusInvalidVideoId'), 'error');
        return;
      }

      try {
        loadButton.disabled = true;
        hasLoadedWorkspace = true;
        setControlSectionCollapsed(true);
        renderLiveVideo(videoId, url);

        setStatus(t('statusFetchingTranscript'), 'loading');
        var transcriptRequest = {url: url};
        if (hasValidYouTubeOAuthToken()) {
          transcriptRequest.oauthAccessToken = youtubeOAuthToken;
        }
        var transcriptPayload = await postJson('/api/transcript', transcriptRequest);
        transcriptEntries = normalizeTranscriptEntries(transcriptPayload.entries || []);
        renderTranscriptRows();
        startAutoFollowLoop();
        var cueCount = Number(transcriptPayload.cueCount || transcriptEntries.length || 0);
        var sourceLabel = describeTranscriptSource(transcriptPayload && transcriptPayload.source);
        setStatus(t('statusLoadedCuesViaSource', {cueCount: cueCount, sourceLabel: sourceLabel}), 'success');
        var generated = await Promise.all([
          postJson('/api/smartnote', {transcript: transcriptPayload.fullText}),
          postJson('/api/summary', {transcript: transcriptPayload.fullText}),
        ]);
        smartnoteHtml = generated[0] && generated[0].html ? generated[0].html : '';
        summaryHtml = generated[1] && generated[1].html ? generated[1].html : '';
        renderActiveWorkspaceTab();
        setStatus(t('statusLoadedCuesGeneratedNotes', {cueCount: cueCount}), 'success');
      } catch (error) {
        if (error && error.code === 'youtube_captcha_required') {
          renderCaptchaRecoveryNotice(error);
          setStatus(t('statusYouTubeVerificationRequired'), 'error');
          return;
        }
        setStatus(error && error.message ? error.message : t('statusFailedLoadWorkspace'), 'error');
      } finally {
        loadButton.disabled = false;
      }
    });
  }

  if (videoUrl) {
    videoUrl.addEventListener('keydown', function (ev) {
      if (ev.key === 'Enter' && loadButton) loadButton.click();
    });
  }

  if (transcriptWindow) {
    transcriptWindow.addEventListener('change', function () {
      renderTranscriptRows();
      syncTranscriptToPlayback();
    });
  }

  if (autoFollow) {
    autoFollow.addEventListener('change', function () {
      syncTranscriptToPlayback();
    });
  }

  if (transcriptList) {
    transcriptList.addEventListener('click', function (ev) {
      var target = ev.target && ev.target.closest ? ev.target.closest('[data-row-id]') : null;
      if (!target) return;
      var rowId = target.getAttribute('data-row-id') || '';
      var startSec = Number(target.getAttribute('data-start-sec') || 0);
      activeRowId = rowId;
      refreshActiveTranscriptRow();
      seekVideoTo(startSec);
      if (autoFollow && autoFollow.value === 'on') {
        target.scrollIntoView({block: 'center', behavior: 'smooth'});
      }
    });
  }

  if (controlCollapseToggle) {
    controlCollapseToggle.addEventListener('click', function () {
      var isCollapsed = controlSection && controlSection.classList.contains('is-collapsed');
      setControlSectionCollapsed(!isCollapsed);
    });
  }

  if (tabButtons.length) {
    tabButtons.forEach(function (button) {
      button.addEventListener('click', function () {
        var tabId = String(button.getAttribute('data-tab-button') || '');
        setActiveWorkspaceTab(tabId);
      });
    });
  }

  if (analysisMain) {
    analysisMain.addEventListener('click', function (ev) {
      var trigger = ev.target && ev.target.closest ? ev.target.closest('[data-recovery-action]') : null;
      if (!trigger) return;
      var action = String(trigger.getAttribute('data-recovery-action') || '');
      if (action === 'open-youtube-check') {
        var popupUrl = '/popup/youtube-transcript-auth?videoUrl=' + encodeURIComponent(String(currentVideoUrl || ''));
        var opened = window.open(String(popupUrl), '_blank', 'noopener,noreferrer');
        if (!opened) {
          window.location.href = String(popupUrl);
        }
        setStatus(t('statusAuthorizePopupReturnTranscript'), 'loading');
        return;
      }
      if (action === 'retry-load-workspace') {
        if (loadButton && !loadButton.disabled) {
          loadButton.click();
        }
      }
    });
  }

  window.addEventListener('message', function (event) {
    if (!event || event.origin !== window.location.origin) return;
    var data = event.data || {};
    if (data.type !== 'youtube-transcript-from-popup') return;
    var payload = data.payload || {};
    transcriptEntries = normalizeTranscriptEntries(payload.entries || []);
    if (!transcriptEntries.length) {
      setStatus(t('statusPopupReturnedEmpty'), 'error');
      return;
    }
    renderTranscriptRows();
    startAutoFollowLoop();
    var cueCount = Number(payload.cueCount || transcriptEntries.length || 0);
    setStatus(t('statusLoadedCuesViaPopup', {cueCount: cueCount}), 'success');
  });

  applyLocale();
  setStatus(t('statusLoadVideoBegin'), 'success');
  setupYouTubeOAuth();
  renderActiveWorkspaceTab();

  async function postJson(path, payload) {
    var response = await fetch(path, {
      method: 'POST',
      headers: {'content-type': 'application/json'},
      body: JSON.stringify(payload || {}),
    });

    var json = await response.json().catch(function () {
      return {};
    });

    if (!response.ok) {
      var error = new Error(json.error || t('statusRequestFailed'));
      error.status = response.status;
      if (json && typeof json.code === 'string') error.code = json.code;
      if (json && json.data && typeof json.data === 'object') error.data = json.data;
      throw error;
    }

    return json;
  }

  async function setupYouTubeOAuth() {
    if (!authorizeYouTubeButton) return;
    authorizeYouTubeButton.hidden = true;
    var config = await fetchJson('/api/config').catch(function () {
      return {};
    });
    var clientId = String(config && config.youtubeClientId ? config.youtubeClientId : '').trim();
    if (!clientId) return;
    if (!window.google || !window.google.accounts || !window.google.accounts.oauth2) return;
    youtubeTokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: 'https://www.googleapis.com/auth/youtube.force-ssl',
      callback: function () {},
    });
    authorizeYouTubeButton.hidden = false;
  }

  async function fetchJson(path) {
    var response = await fetch(path, {
      method: 'GET',
    });
    if (!response.ok) {
      throw new Error(t('statusRequestFailed'));
    }
    return response.json().catch(function () {
      return {};
    });
  }

  function hasValidYouTubeOAuthToken() {
    return Boolean(youtubeOAuthToken) && Date.now() < youtubeOAuthTokenExpiresAt;
  }

  function requestYouTubeOAuthToken(interactive) {
    return new Promise(function (resolve, reject) {
      if (!youtubeTokenClient) {
        reject(new Error(t('statusOAuthNotConfigured')));
        return;
      }
      youtubeTokenClient.callback = function (tokenResponse) {
        if (tokenResponse && tokenResponse.error) {
          reject(new Error(String(tokenResponse.error_description || tokenResponse.error || t('statusOAuthFailed'))));
          return;
        }
        youtubeOAuthToken = String(tokenResponse && tokenResponse.access_token ? tokenResponse.access_token : '');
        var expiresIn = Number(tokenResponse && tokenResponse.expires_in ? tokenResponse.expires_in : 0);
        youtubeOAuthTokenExpiresAt = Date.now() + (Number.isFinite(expiresIn) ? expiresIn * 1000 : 0) - 15000;
        resolve(tokenResponse);
      };
      youtubeTokenClient.requestAccessToken({
        prompt: interactive ? 'consent' : '',
      });
    });
  }

  function setActiveWorkspaceTab(tabId) {
    if (!tabId) return;
    activeWorkspaceTab = tabId;
    tabButtons.forEach(function (button) {
      var id = String(button.getAttribute('data-tab-button') || '');
      button.classList.toggle('is-active', id === activeWorkspaceTab);
    });
    renderActiveWorkspaceTab();
  }

  function describeTranscriptSource(source) {
    var key = String(source || '').trim();
    if (key === 'youtube_oauth_timedtext') return locale === 'zh' ? 'YouTube OAuth' : 'YouTube OAuth';
    if (key === 'youtube_data_api_key_timedtext') return locale === 'zh' ? 'YouTube API key' : 'YouTube API key';
    if (key === 'local_yt_dlp_fallback') return locale === 'zh' ? '本地 yt-dlp 兜底' : 'local yt-dlp fallback';
    if (key === 'youtube_transcript_library') return locale === 'zh' ? 'youtube-transcript 库' : 'youtube-transcript library';
    return locale === 'zh' ? '默认字幕路径' : 'default transcript path';
  }

  function renderCaptchaRecoveryNotice(error) {
    if (!analysisMain) return;
    if (analysisEmpty) analysisEmpty.remove();
    var recovery = error && error.data && error.data.recovery ? error.data.recovery : {};
    pendingCaptchaOpenUrl = String(recovery.openUrl || 'https://www.youtube.com/');
    var fallback = error && error.data && error.data.fallback ? error.data.fallback : {};
    var fallbackNote = '';
    if (fallback && fallback.error) {
      fallbackNote = '<p>' + escapeHtml(t('cardLocalFallbackStatus', {error: String(fallback.error)})) + '</p>';
    }
    analysisMain.innerHTML = ''
      + '<div class="notice-card">'
      + '<h3>' + escapeHtml(t('cardYouTubeVerificationNeeded')) + '</h3>'
      + '<p>' + escapeHtml(t('cardCaptchaIpCheck')) + '</p>'
      + '<p>' + escapeHtml(t('cardUsePopupFlow')) + '</p>'
      + '<p><a class="inline-link" href="/popup/youtube-transcript-auth?videoUrl=' + encodeURIComponent(String(currentVideoUrl || '')) + '" target="_blank" rel="noopener noreferrer">' + escapeHtml(t('linkOpenBrowserOAuthPopup')) + '</a></p>'
      + fallbackNote
      + '<div class="action-stack">'
      + '<button type="button" class="primary-button" data-recovery-action="open-youtube-check" data-open-url="' + escapeHtml(pendingCaptchaOpenUrl) + '">' + escapeHtml(t('linkOpenBrowserOAuthPopup')) + '</button>'
      + '<button type="button" class="primary-button" data-recovery-action="retry-load-workspace">' + escapeHtml(t('buttonRetryLoadWorkspace')) + '</button>'
      + '</div>'
      + '</div>';
  }

  function renderActiveWorkspaceTab() {
    if (!analysisMain) return;
    if (analysisEmpty) analysisEmpty.remove();
    if (activeWorkspaceTab === 'smartnote') {
      if (!smartnoteHtml) {
        analysisMain.innerHTML = '<div class="notice-card">' + escapeHtml(t('cardSmartnoteAfterLoad')) + '</div>';
        return;
      }
      analysisMain.innerHTML = '<div class="summary-frame smartnote-frame">' + String(smartnoteHtml) + '</div>';
      return;
    }
    if (activeWorkspaceTab === 'summary') {
      if (!summaryHtml) {
        analysisMain.innerHTML = '<div class="notice-card">' + escapeHtml(t('cardSummaryAfterLoad')) + '</div>';
        return;
      }
      analysisMain.innerHTML = '<div class="summary-frame">' + String(summaryHtml) + '</div>';
      return;
    }
    analysisMain.innerHTML = '<div class="notice-card">' + escapeHtml(t('cardDeferredTab')) + '</div>';
  }

  function renderLiveVideo(videoId, videoUrl) {
    if (!youtubePlayer) return;
    currentVideoId = String(videoId || '');
    currentVideoUrl = String(videoUrl || ('https://www.youtube.com/watch?v=' + videoId));
    mountYouTubePlayer(videoId);
    youtubePlayer.hidden = false;
    if (playerPlaceholder) playerPlaceholder.hidden = true;
    if (playerTitle) playerTitle.textContent = t('titleLiveVideo');
    if (videoSubtitle) videoSubtitle.textContent = t('videoSubtitleId', {videoId: videoId});
    if (videoMeta) {
      var safeVideoId = encodeURIComponent(String(videoId || ''));
      videoMeta.innerHTML = '<div class="video-meta-bar">'
        + '<span class="video-meta-channel">' + escapeHtml(t('videoNowPlaying')) + '<br>' + escapeHtml(videoId) + '</span>'
        + '<a class="inline-link" href="https://www.youtube.com/watch?v=' + safeVideoId + '" target="_blank" rel="noopener noreferrer">' + escapeHtml(t('linkOpenOnYouTube')) + '</a>'
        + '</div>';
      resolveVideoTitle(currentVideoUrl, videoId).then(function (title) {
        var channel = videoMeta.querySelector('.video-meta-channel');
        if (!channel) return;
        channel.innerHTML = escapeHtml(t('videoNowPlaying')) + '<br>' + escapeHtml(title);
      });
    }
  }

  function seekVideoTo(seconds) {
    if (!currentVideoId) return;
    var start = Math.max(0, Math.floor(Number(seconds || 0)));
    if (ytPlayer && typeof ytPlayer.seekTo === 'function') {
      try {
        ytPlayer.seekTo(start, true);
        if (typeof ytPlayer.playVideo === 'function') {
          ytPlayer.playVideo();
        }
        return;
      } catch (_) {}
    }
    mountIframeFallback(currentVideoId, start, 1);
  }

  function normalizeTranscriptEntries(entries) {
    var normalized = [];
    for (var i = 0; i < entries.length; i++) {
      var entry = entries[i] || {};
      var text = String(entry.text || '').trim();
      if (!text) continue;
      var startSec = toSeconds(entry.offset);
      var durationSec = Math.max(0.1, toSeconds(entry.duration));
      normalized.push({
        id: 'cue-' + i,
        startSec: startSec,
        endSec: startSec + durationSec,
        text: text,
      });
    }
    normalized.sort(function (a, b) { return a.startSec - b.startSec; });
    return normalized;
  }

  function toSeconds(value) {
    var n = Number(value);
    if (!Number.isFinite(n) || n < 0) return 0;
    return n > 1000 ? n / 1000 : n;
  }

  function renderTranscriptRows() {
    if (!transcriptList) return;
    if (!transcriptEntries.length) {
      transcriptRows = [];
      transcriptList.innerHTML = '<div class="empty-state">' + escapeHtml(t('emptyTranscriptClickableAfterLoad')) + '</div>';
      if (transcriptSubtitle) transcriptSubtitle.textContent = t('subtitleTranscriptCuesAppear');
      return;
    }

    var mode = transcriptWindow && transcriptWindow.value ? transcriptWindow.value : 'smart';
    if (mode === 'blocks') {
      transcriptRows = buildBlockRows(transcriptEntries, 15);
    } else if (mode === 'all') {
      transcriptRows = buildAllCueRows(transcriptEntries);
    } else {
      transcriptRows = buildSmartRows(transcriptEntries);
    }
    if (!transcriptRows.length) {
      transcriptList.innerHTML = '<div class="empty-state">' + escapeHtml(t('emptyTranscriptIsEmpty')) + '</div>';
      return;
    }
    if (!activeRowId) activeRowId = transcriptRows[0].id;
    var html = '';
    for (var i = 0; i < transcriptRows.length; i++) {
      var row = transcriptRows[i];
      var activeClass = row.id === activeRowId ? ' is-active' : '';
      html += '<button type="button" class="transcript-item' + activeClass + '" data-row-id="' + row.id + '" data-start-sec="' + row.startSec + '">';
      html += '<time>' + formatTime(row.startSec) + '</time>';
      html += '<p>' + escapeHtml(row.text) + '</p>';
      html += '</button>';
    }
    transcriptList.innerHTML = html;
    if (transcriptSubtitle) {
      transcriptSubtitle.textContent = t('subtitleSlicesFromCues', {
        sliceCount: transcriptRows.length,
        cueCount: transcriptEntries.length,
      });
    }
  }

  function refreshActiveTranscriptRow() {
    if (!transcriptList) return;
    var nodes = transcriptList.querySelectorAll('.transcript-item');
    for (var i = 0; i < nodes.length; i++) {
      var isActive = nodes[i].getAttribute('data-row-id') === activeRowId;
      nodes[i].classList.toggle('is-active', isActive);
    }
  }

  function buildAllCueRows(entries) {
    var rows = [];
    for (var i = 0; i < entries.length; i++) {
      rows.push({
        id: entries[i].id,
        startSec: entries[i].startSec,
        text: entries[i].text,
      });
    }
    return rows;
  }

  function buildBlockRows(entries, blockSizeSec) {
    var byBlock = new Map();
    for (var i = 0; i < entries.length; i++) {
      var cue = entries[i];
      var blockIndex = Math.floor(cue.startSec / blockSizeSec);
      var key = String(blockIndex);
      var existing = byBlock.get(key);
      if (!existing) {
        byBlock.set(key, {
          id: 'block-' + blockIndex,
          startSec: blockIndex * blockSizeSec,
          text: cue.text,
        });
      } else {
        existing.text += ' ' + cue.text;
      }
    }
    return Array.from(byBlock.values());
  }

  function buildSmartRows(entries) {
    var rows = [];
    var current = null;
    for (var i = 0; i < entries.length; i++) {
      var cue = entries[i];
      if (!current) {
        current = {
          id: 'smart-' + rows.length,
          startSec: cue.startSec,
          endSec: cue.endSec,
          text: cue.text,
          words: countWords(cue.text),
        };
      } else {
        current.endSec = Math.max(current.endSec, cue.endSec);
        current.text += ' ' + cue.text;
        current.words += countWords(cue.text);
      }
      var elapsed = current.endSec - current.startSec;
      var shouldClose = elapsed >= 25 || (elapsed >= 5 && current.words >= 18);
      if (shouldClose) {
        rows.push({
          id: current.id,
          startSec: current.startSec,
          text: current.text.trim(),
        });
        current = null;
      }
    }
    if (current) {
      rows.push({
        id: current.id,
        startSec: current.startSec,
        text: current.text.trim(),
      });
    }
    return rows;
  }

  function countWords(text) {
    var cleaned = String(text || '').trim();
    if (!cleaned) return 0;
    return cleaned.split(/\s+/).filter(Boolean).length;
  }

  function formatTime(totalSeconds) {
    var sec = Math.max(0, Math.floor(Number(totalSeconds || 0)));
    var m = Math.floor(sec / 60);
    var s = sec % 60;
    return m + ':' + String(s).padStart(2, '0');
  }

  function startAutoFollowLoop() {
    if (autoFollowTimerId) return;
    autoFollowTimerId = window.setInterval(syncTranscriptToPlayback, 200);
  }

  function syncTranscriptToPlayback() {
    if (!autoFollow || autoFollow.value !== 'on') return;
    if (!transcriptRows.length) return;
    if (!ytPlayer || typeof ytPlayer.getCurrentTime !== 'function') return;
    var currentTime = Number(ytPlayer.getCurrentTime());
    if (!Number.isFinite(currentTime)) return;
    var lookaheadTime = currentTime + 0.5;
    var row = findRowForTime(lookaheadTime);
    if (!row || row.id === activeRowId) return;
    activeRowId = row.id;
    refreshActiveTranscriptRow();
    if (!transcriptList) return;
    var target = transcriptList.querySelector('[data-row-id="' + row.id + '"]');
    if (target) {
      target.scrollIntoView({block: 'center', behavior: 'auto'});
    }
  }

  function findRowForTime(timeSec) {
    var chosen = transcriptRows[0];
    for (var i = 0; i < transcriptRows.length; i++) {
      if (transcriptRows[i].startSec <= timeSec) {
        chosen = transcriptRows[i];
      } else {
        break;
      }
    }
    return chosen;
  }

  function mountYouTubePlayer(videoId) {
    waitForYouTubeApi().then(function () {
      if (!youtubePlayer || !window.YT || typeof window.YT.Player !== 'function') {
        mountIframeFallback(videoId, 0, 0);
        return;
      }
      if (ytPlayer && typeof ytPlayer.loadVideoById === 'function') {
        ytPlayer.loadVideoById({
          videoId: videoId,
          startSeconds: 0,
        });
        return;
      }
      ytPlayer = new window.YT.Player('youtube-player', {
        videoId: videoId,
        playerVars: {
          autoplay: 0,
          rel: 0,
          modestbranding: 1,
          origin: window.location.origin,
        },
      });
    }).catch(function () {
      mountIframeFallback(videoId, 0, 0);
    });
  }

  function waitForYouTubeApi() {
    if (window.YT && typeof window.YT.Player === 'function') {
      return Promise.resolve();
    }
    if (ytApiReadyPromise) {
      return ytApiReadyPromise;
    }
    ytApiReadyPromise = new Promise(function (resolve, reject) {
      var started = Date.now();
      var timer = window.setInterval(function () {
        if (window.YT && typeof window.YT.Player === 'function') {
          window.clearInterval(timer);
          resolve();
          return;
        }
        if (Date.now() - started > 10000) {
          window.clearInterval(timer);
          reject(new Error(t('statusYouTubeApiTimeout')));
        }
      }, 80);
    });
    return ytApiReadyPromise;
  }

  function mountIframeFallback(videoId, startSec, autoplay) {
    if (!youtubePlayer) return;
    var safeVideoId = encodeURIComponent(String(videoId || ''));
    var start = Math.max(0, Math.floor(Number(startSec || 0)));
    var embedUrl = 'https://www.youtube.com/embed/' + safeVideoId
      + '?autoplay=' + (autoplay ? '1' : '0')
      + '&rel=0&modestbranding=1&start=' + start
      + '&origin=' + encodeURIComponent(window.location.origin);
    youtubePlayer.innerHTML = '<iframe'
      + ' src="' + embedUrl + '"'
      + ' title="' + escapeHtml(t('titleLiveVideo')) + '"'
      + ' frameborder="0"'
      + ' allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"'
      + ' allowfullscreen'
      + '></iframe>';
  }

  function setControlSectionCollapsed(collapsed) {
    if (!controlSection || !controlCollapseToggle) return;
    controlSection.classList.toggle('is-collapsed', collapsed);
    controlCollapseToggle.hidden = !hasLoadedWorkspace && !collapsed;
    controlCollapseToggle.textContent = collapsed ? '▼' : '▲';
    controlCollapseToggle.setAttribute('aria-expanded', collapsed ? 'false' : 'true');
  }

  async function resolveVideoTitle(videoUrl, fallbackTitle) {
    try {
      var endpoint = 'https://www.youtube.com/oembed?url=' + encodeURIComponent(videoUrl) + '&format=json';
      var response = await fetch(endpoint);
      if (!response.ok) return fallbackTitle;
      var payload = await response.json();
      if (payload && typeof payload.title === 'string' && payload.title.trim()) {
        return payload.title.trim();
      }
      return fallbackTitle;
    } catch (_) {
      return fallbackTitle;
    }
  }
}
