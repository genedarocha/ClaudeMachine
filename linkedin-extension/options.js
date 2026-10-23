(async () => {
  const cfg = await chrome.storage.local.get(['keys', 'settings', 'brands', 'voice', 'tone', 'syncedAt']);
  const provider = cfg.settings?.provider;
  const hasKey = provider && provider !== 'mock' && cfg.keys?.[provider];
  const brands = (cfg.brands || []).filter(b => b.enabled !== false);
  const rows = [
    ['Last sync', cfg.syncedAt ? new Date(cfg.syncedAt).toLocaleString() : null],
    ['AI model', provider && provider !== 'mock' ? `${provider} · ${cfg.settings.model}` : null],
    ['API key', hasKey ? 'present' : null],
    ['Brands', brands.length ? brands.map(b => b.name).join(', ') : 'defaults (5 Voxstar brands)'],
    ['Voice samples', cfg.voice?.trim() ? `${cfg.voice.trim().split(/\s+/).length} words` : 'none yet (recommended)']
  ];
  const status = document.getElementById('status');
  for (const [k, v] of rows) {
    const row = document.createElement('div');
    row.className = 'row';
    const kEl = document.createElement('span');
    kEl.className = 'k';
    kEl.textContent = k;
    const vEl = document.createElement('span');
    vEl.className = v ? 'ok' : 'bad';
    vEl.textContent = v || 'missing — open Claude Machine';
    row.append(kEl, vEl);
    status.appendChild(row);
  }
  const tone = document.getElementById('tone');
  tone.value = cfg.tone || 'insight';
  tone.addEventListener('change', () => chrome.storage.local.set({ tone: tone.value }));
})();
