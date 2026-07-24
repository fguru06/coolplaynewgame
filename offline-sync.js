(function () {
  const READ_CACHE_KEY = 'coolplay-read-cache-v1';
  const MUTATION_QUEUE_KEY = 'coolplay-mutation-queue-v1';
  const SYNC_TAG = 'coolplay-offline-sync';

  const state = {
    online: navigator.onLine,
    syncing: false,
    queueSize: 0,
    lastSyncAt: null,
    syncError: '',
    registration: null,
  };

  let ui = null;
  let flushPromise = null;

  function readJsonStorage(key, fallback) {
    try {
      const rawValue = window.localStorage.getItem(key);
      return rawValue ? JSON.parse(rawValue) : fallback;
    } catch (error) {
      console.warn('Could not read offline storage:', error);
      return fallback;
    }
  }

  function writeJsonStorage(key, value) {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.warn('Could not persist offline storage:', error);
      return false;
    }
  }

  function getReadCache() {
    return readJsonStorage(READ_CACHE_KEY, {});
  }

  function setReadCache(cache) {
    writeJsonStorage(READ_CACHE_KEY, cache);
  }

  function getQueue() {
    return readJsonStorage(MUTATION_QUEUE_KEY, []);
  }

  function setQueue(queue) {
    state.queueSize = queue.length;
    writeJsonStorage(MUTATION_QUEUE_KEY, queue);
    renderStatus();
  }

  function queueLabel(count) {
    return count === 1 ? '1 queued action' : count + ' queued actions';
  }

  function formatTime(value) {
    if (!value) {
      return '';
    }

    return new Date(value).toLocaleTimeString([], {
      hour: 'numeric',
      minute: '2-digit',
    });
  }

  function buildConnectionMessage() {
    if (state.syncing) {
      return 'Syncing ' + queueLabel(state.queueSize) + '...';
    }

    if (!state.online) {
      return 'Offline mode is active. ' + queueLabel(state.queueSize) + ' will sync automatically.';
    }

    if (state.syncError) {
      return 'Online, but ' + queueLabel(state.queueSize) + ' still need attention.';
    }

    if (state.queueSize > 0) {
      return 'Online. ' + queueLabel(state.queueSize) + ' waiting to sync.';
    }

    if (state.lastSyncAt) {
      return 'Online. All changes synced at ' + formatTime(state.lastSyncAt) + '.';
    }

    return 'Online. Offline support is ready.';
  }

  function buildBannerMessage() {
    if (state.syncing) {
      return 'Syncing queued changes...';
    }

    if (!state.online) {
      return 'You are offline. Changes will be saved and replayed automatically.';
    }

    if (state.syncError) {
      return state.syncError;
    }

    if (state.queueSize > 0) {
      return queueLabel(state.queueSize) + ' will sync automatically.';
    }

    return 'All offline changes are synced.';
  }

  function getBannerVariant() {
    if (state.syncing) {
      return 'network-banner--syncing';
    }

    if (!state.online || state.syncError) {
      return 'network-banner--offline';
    }

    return 'network-banner--online';
  }

  function shouldShowBanner() {
    return !state.online || state.syncing || state.queueSize > 0 || Boolean(state.syncError);
  }

  function renderStatus() {
    if (!ui) {
      return;
    }

    ui.syncStateText.textContent = buildConnectionMessage();
    ui.badge.textContent = queueLabel(state.queueSize);
    ui.badge.hidden = state.queueSize === 0;

    ui.bannerText.textContent = buildBannerMessage();
    ui.banner.classList.remove('network-banner--offline', 'network-banner--online', 'network-banner--syncing', 'network-banner--hidden');
    ui.banner.classList.add(getBannerVariant());

    if (!shouldShowBanner()) {
      ui.banner.classList.add('network-banner--hidden');
    }
  }

  function bindUi() {
    ui = {
      banner: document.getElementById('network-banner'),
      bannerText: document.getElementById('network-banner-text'),
      badge: document.getElementById('network-banner-badge'),
      syncStateText: document.getElementById('sync-state-text'),
      appStateText: document.getElementById('app-state-text'),
    };

    if (!ui.banner || !ui.bannerText || !ui.badge || !ui.syncStateText || !ui.appStateText) {
      ui = null;
      return;
    }

    renderStatus();
  }

  function updateAppStateText(text) {
    if (ui && ui.appStateText) {
      ui.appStateText.textContent = text;
    }
  }

  async function parseResponse(response) {
    const contentType = response.headers.get('content-type') || '';

    if (contentType.indexOf('application/json') !== -1) {
      return response.json();
    }

    return response.text();
  }

  async function executeMutation(entry) {
    const requestOptions = {
      method: entry.method,
      headers: Object.assign({}, entry.headers),
    };

    if (entry.body !== undefined && entry.body !== null) {
      if (!requestOptions.headers['Content-Type']) {
        requestOptions.headers['Content-Type'] = 'application/json';
      }

      requestOptions.body = requestOptions.headers['Content-Type'].indexOf('application/json') !== -1
        ? JSON.stringify(entry.body)
        : entry.body;
    }

    const response = await fetch(entry.url, requestOptions);
    const data = await parseResponse(response);
    const payloadError = typeof data === 'object' && data && data.ok === false;

    if (!response.ok || payloadError) {
      const message = typeof data === 'string'
        ? data
        : (data && data.message) || 'Request failed.';
      const error = new Error(message);
      error.isHttpError = true;
      error.status = response.status;
      throw error;
    }

    return {
      data: data,
      response: response,
    };
  }

  function isQueueableError(error) {
    return !error || !error.isHttpError;
  }

  async function registerBackgroundSync() {
    if (!('serviceWorker' in navigator)) {
      return;
    }

    try {
      const registration = state.registration || await navigator.serviceWorker.ready;
      state.registration = registration;

      if (registration.sync) {
        await registration.sync.register(SYNC_TAG);
      }
    } catch (error) {
      console.warn('Background sync registration failed:', error);
    }
  }

  async function queueMutation(entry) {
    const queue = getQueue();
    queue.push(entry);
    setQueue(queue);
    state.syncError = '';
    await registerBackgroundSync();
  }

  async function cachedFetchJson(url, init) {
    const cache = getReadCache();

    try {
      const response = await fetch(url, init);
      if (!response.ok) {
        throw new Error('Could not load data from the server.');
      }

      const data = await response.json();
      cache[url] = {
        data: data,
        cachedAt: new Date().toISOString(),
      };
      setReadCache(cache);

      return {
        data: data,
        source: 'network',
        cachedAt: cache[url].cachedAt,
      };
    } catch (error) {
      if (cache[url]) {
        return {
          data: cache[url].data,
          source: 'cache',
          cachedAt: cache[url].cachedAt,
        };
      }

      throw error;
    }
  }

  async function sendQueuedMutation(options) {
    const entry = {
      id: (window.crypto && window.crypto.randomUUID ? window.crypto.randomUUID() : String(Date.now())) + '-' + Math.random().toString(36).slice(2, 8),
      url: options.url,
      method: options.method || 'POST',
      headers: Object.assign({}, options.headers),
      body: options.body,
      createdAt: new Date().toISOString(),
      description: options.description || 'Offline action',
    };

    if (!navigator.onLine) {
      await queueMutation(entry);
      return {
        queued: true,
        message: options.queuedMessage || 'Action saved offline and ready to sync.',
      };
    }

    try {
      const result = await executeMutation(entry);
      state.syncError = '';
      state.lastSyncAt = new Date().toISOString();
      renderStatus();
      return {
        queued: false,
        data: result.data,
      };
    } catch (error) {
      if (!isQueueableError(error)) {
        throw error;
      }

      await queueMutation(entry);
      return {
        queued: true,
        message: options.queuedMessage || 'Action saved offline and ready to sync.',
      };
    }
  }

  async function flushQueue() {
    if (flushPromise) {
      return flushPromise;
    }

    flushPromise = (async function () {
      if (!navigator.onLine) {
        state.online = false;
        renderStatus();
        return;
      }

      let queue = getQueue();
      if (queue.length === 0) {
        state.online = true;
        state.syncing = false;
        state.syncError = '';
        renderStatus();
        return;
      }

      state.online = true;
      state.syncing = true;
      state.syncError = '';
      state.queueSize = queue.length;
      renderStatus();

      for (let index = 0; index < queue.length; index += 1) {
        const entry = queue[index];

        try {
          await executeMutation(entry);
          const remainingQueue = getQueue().filter(function (queuedEntry) {
            return queuedEntry.id !== entry.id;
          });
          setQueue(remainingQueue);
        } catch (error) {
          if (isQueueableError(error)) {
            state.syncing = false;
            renderStatus();
            return;
          }

          state.syncError = error.message || 'A queued action needs attention before it can sync.';
          state.syncing = false;
          renderStatus();
          return;
        }
      }

      state.syncing = false;
      state.syncError = '';
      state.lastSyncAt = new Date().toISOString();
      renderStatus();
    })().finally(function () {
      flushPromise = null;
    });

    return flushPromise;
  }

  function setServiceWorkerRegistration(registration) {
    state.registration = registration;
  }

  function handleConnectivityChange(online) {
    state.online = online;

    if (online) {
      flushQueue();
    } else {
      state.syncing = false;
      renderStatus();
    }
  }

  function initialise() {
    state.queueSize = getQueue().length;
    bindUi();
    renderStatus();

    window.addEventListener('online', function () {
      handleConnectivityChange(true);
    });

    window.addEventListener('offline', function () {
      handleConnectivityChange(false);
    });

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', function (event) {
        if (event.data && event.data.type === 'flush-offline-queue') {
          flushQueue();
        }
      });
    }

    if (navigator.onLine) {
      flushQueue();
    }
  }

  window.CoolplayOffline = {
    cachedFetchJson: cachedFetchJson,
    flushQueue: flushQueue,
    sendQueuedMutation: sendQueuedMutation,
    setAppStateText: updateAppStateText,
    setServiceWorkerRegistration: setServiceWorkerRegistration,
    state: state,
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialise, { once: true });
  } else {
    initialise();
  }
})();