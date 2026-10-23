// Runs on the Claude Machine web app. Copies the AI settings, brands and voice samples the user saved
// there into the extension, so nothing has to be entered twice. Read-only on the app side.
// (The reply angle is chosen in the extension popup, so it is deliberately not synced.)
(() => {
  const read = (key, fallback) => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  };

  const sync = () => {
    const payload = {
      keys: read('claude_machine_api_keys', {}),
      settings: read('claude_machine_settings', { provider: 'mock', model: '' }),
      brands: read('claude_machine_li_reply_brands', null),
      voice: read('claude_machine_li_reply_voice', ''),
      syncedAt: new Date().toISOString()
    };
    if (!payload.brands) delete payload.brands;
    chrome.storage.local.set(payload);
  };

  sync();
  window.addEventListener('focus', sync);
  setInterval(sync, 10000);
})();
