// Runs on linkedin.com. Adds a "Draft reply" button to each post, shows the draft in an approval
// card, and on Approve types it into that post's comment box. It NEVER clicks LinkedIn's Post button —
// the user reviews the text in the comment box and posts it themselves.
//
// LinkedIn changes its markup often, so every lookup below tries several selectors. If the per-post
// button stops appearing, the right-click "Draft Voxstar reply for selected text" menu still works.
(() => {
  const POST_SELECTORS = [
    'div.feed-shared-update-v2',
    'div[data-urn^="urn:li:activity"]',
    'div[data-id^="urn:li:activity"]',
    'div[data-urn^="urn:li:ugcPost"]',
    'div[data-id^="urn:li:ugcPost"]'
  ];
  const TEXT_SELECTORS = [
    '.update-components-text',
    '.feed-shared-inline-show-more-text',
    '.feed-shared-update-v2__description',
    '.feed-shared-text',
    '[data-test-id="main-feed-activity-card__commentary"]'
  ];
  const AUTHOR_SELECTORS = [
    '.update-components-actor__title span[aria-hidden="true"]',
    '.update-components-actor__name span[aria-hidden="true"]',
    '.update-components-actor__name',
    '.feed-shared-actor__name'
  ];
  const ACTION_BAR_SELECTORS = [
    '.feed-shared-social-action-bar',
    '.social-details-social-actions',
    '.update-v2-social-activity'
  ];
  const EDITOR_SELECTORS = [
    '.comments-comment-box__form .ql-editor[contenteditable="true"]',
    '.comments-comment-texteditor [contenteditable="true"]',
    '.ql-editor[contenteditable="true"]',
    'div[contenteditable="true"][role="textbox"]'
  ];
  const MARK = 'data-voxstar-reply';

  const first = (root, selectors) => {
    for (const sel of selectors) {
      const el = root.querySelector(sel);
      if (el) return el;
    }
    return null;
  };

  const sleep = ms => new Promise(r => setTimeout(r, ms));

  const waitFor = async (fn, timeout = 5000) => {
    const end = Date.now() + timeout;
    while (Date.now() < end) {
      const v = fn();
      if (v) return v;
      await sleep(150);
    }
    return null;
  };

  // Track the last comment box the user clicked into (used by the right-click fallback).
  let lastEditor = null;
  document.addEventListener('focusin', e => {
    const t = e.target;
    if (t instanceof HTMLElement && t.isContentEditable) lastEditor = t;
  }, true);

  const readPost = container => {
    const seeMore = container.querySelector('button[class*="see-more"], .feed-shared-inline-show-more-text__see-more-less-toggle');
    if (seeMore && /more/i.test(seeMore.textContent || '')) seeMore.click();
    const textEl = first(container, TEXT_SELECTORS);
    const authorEl = first(container, AUTHOR_SELECTORS);
    return {
      author: (authorEl?.textContent || '').trim().replace(/\s+/g, ' '),
      text: (textEl?.innerText || container.innerText || '').trim().slice(0, 4000)
    };
  };

  const findEditor = container => {
    const visible = el => el && el.offsetParent !== null;
    const inPost = EDITOR_SELECTORS.map(s => container.querySelector(s)).find(visible);
    return inPost || null;
  };

  const openCommentBox = async container => {
    let editor = findEditor(container);
    if (editor) return editor;
    const commentBtn = [...container.querySelectorAll('button')].find(b =>
      /comment/i.test(b.getAttribute('aria-label') || '') || /^\s*comment\s*$/i.test(b.textContent || '')
    );
    if (commentBtn) commentBtn.click();
    editor = await waitFor(() => findEditor(container), 5000);
    return editor;
  };

  const insertIntoEditor = (editor, text) => {
    editor.focus();
    // Replace whatever is in the box, then insert as if typed so LinkedIn's editor state updates.
    document.execCommand('selectAll', false);
    const ok = document.execCommand('insertText', false, text);
    if (!ok || !editor.innerText.trim()) {
      editor.innerHTML = '';
      const p = document.createElement('p');
      p.textContent = text;
      editor.appendChild(p);
      editor.dispatchEvent(new InputEvent('input', { bubbles: true }));
    }
  };

  const send = msg => new Promise(resolve => {
    try {
      chrome.runtime.sendMessage(msg, res => {
        if (chrome.runtime.lastError) resolve({ ok: false, error: chrome.runtime.lastError.message });
        else resolve(res || { ok: false, error: 'No response from extension' });
      });
    } catch {
      resolve({ ok: false, error: 'Extension was reloaded. Refresh this LinkedIn tab.' });
    }
  });

  // ---------- Approval card (shadow DOM so LinkedIn's CSS can't touch it) ----------
  const CARD_CSS = `
    :host { all: initial; }
    .card { font: 14px/1.45 -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: #1d2226;
      background: #fff; border: 1px solid #c9d3dd; border-left: 4px solid #0a66c2; border-radius: 10px;
      padding: 12px 14px; margin: 8px 12px; box-shadow: 0 4px 14px rgba(0,0,0,.08); }
    .card.floating { position: fixed; right: 20px; bottom: 20px; width: 420px; max-width: calc(100vw - 40px); z-index: 2147483647; margin: 0; }
    .top { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; }
    .title { font-weight: 700; flex: 1; }
    .score { font-weight: 700; padding: 2px 8px; border-radius: 6px; background: #eef3f8; }
    .score.good { background: #dff3e4; color: #057642; }
    .score.weak { background: #fdecea; color: #b24020; }
    .brand { font-size: 12px; padding: 2px 8px; border-radius: 999px; background: #e8f0fe; color: #0a66c2; }
    .reason { color: #56687a; font-size: 12px; font-style: italic; margin: 0 0 6px; }
    textarea { width: 100%; box-sizing: border-box; min-height: 96px; font: inherit; padding: 8px; border: 1px solid #c9d3dd; border-radius: 8px; resize: vertical; }
    .check { font-size: 12px; margin: 6px 0; }
    .check.ok { color: #057642; } .check.warn { color: #b24020; }
    .row { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px; align-items: center; }
    button { font: inherit; font-weight: 600; border-radius: 999px; padding: 6px 14px; cursor: pointer; border: 1px solid #0a66c2; background: #fff; color: #0a66c2; }
    button.primary { background: #0a66c2; color: #fff; }
    button.ghost { border-color: transparent; color: #56687a; }
    button:disabled { opacity: .5; cursor: default; }
    .msg { font-size: 12px; color: #56687a; }
    .err { color: #b24020; font-size: 13px; white-space: pre-wrap; }
    .close { margin-left: auto; border: none; padding: 2px 6px; color: #56687a; }
  `;

  const createCard = ({ post, container, floating }) => {
    const host = document.createElement('div');
    host.setAttribute(MARK, 'card');
    const root = host.attachShadow({ mode: 'open' });
    root.innerHTML = `<style>${CARD_CSS}</style><div class="card ${floating ? 'floating' : ''}"></div>`;
    const card = root.querySelector('.card');
    let current = null;

    const close = () => host.remove();

    const renderLoading = label => {
      card.innerHTML = `<div class="top"><span class="title">Voxstar reply</span><button class="close" title="Close">✕</button></div>
        <div class="msg">${label}</div>`;
      card.querySelector('.close').onclick = close;
    };

    const renderError = error => {
      card.innerHTML = `<div class="top"><span class="title">Voxstar reply</span><button class="close" title="Close">✕</button></div>
        <div class="err"></div><div class="row"><button class="primary retry">Try again</button></div>`;
      card.querySelector('.err').textContent = error;
      card.querySelector('.close').onclick = close;
      card.querySelector('.retry').onclick = run;
    };

    const renderCheck = issues => {
      const el = card.querySelector('.check');
      el.className = `check ${issues.length ? 'warn' : 'ok'}`;
      el.textContent = issues.length ? `⚠ ${issues.join(' · ')}` : '✓ Humanizer check passed';
    };

    const renderDraft = () => {
      const good = current.fitScore >= 60;
      card.innerHTML = `
        <div class="top">
          <span class="title">Voxstar reply — approve?</span>
          <span class="score ${good ? 'good' : 'weak'}" title="Brand fit">${current.fitScore}</span>
          <span class="brand"></span>
          <button class="close" title="Close">✕</button>
        </div>
        <p class="reason"></p>
        <textarea></textarea>
        <div class="check"></div>
        <div class="row">
          <button class="primary approve">Approve → put in comment box</button>
          <button class="humanize">Humanize again</button>
          <button class="regen">Regenerate</button>
          <button class="ghost reject">Reject</button>
        </div>
        <div class="msg status"></div>`;
      card.querySelector('.brand').textContent = current.bestBrand;
      card.querySelector('.reason').textContent = current.reason + (good ? '' : ' (low fit — consider skipping)');
      const ta = card.querySelector('textarea');
      ta.value = current.reply;
      renderCheck(current.issues);
      ta.addEventListener('input', async () => {
        current.reply = ta.value;
        const res = await send({ type: 'check', reply: ta.value });
        if (res.ok) renderCheck(res.issues);
      });
      card.querySelector('.close').onclick = close;
      card.querySelector('.reject').onclick = close;
      card.querySelector('.regen').onclick = run;
      card.querySelector('.humanize').onclick = async e => {
        const btn = e.currentTarget;
        btn.disabled = true;
        btn.textContent = 'Humanizing…';
        const res = await send({ type: 'humanize', post, reply: ta.value });
        if (!res.ok) { card.querySelector('.status').textContent = res.error; btn.disabled = false; btn.textContent = 'Humanize again'; return; }
        current.reply = res.reply;
        current.issues = res.issues;
        renderDraft();
      };
      card.querySelector('.approve').onclick = async () => {
        const status = card.querySelector('.status');
        const text = ta.value.trim();
        if (!text) return;
        const editor = container ? await openCommentBox(container) : (lastEditor && document.contains(lastEditor) ? lastEditor : null);
        if (!editor) {
          await navigator.clipboard.writeText(text).catch(() => {});
          status.textContent = container
            ? "Couldn't find this post's comment box, so the reply is copied — click Comment and paste it (⌘V)."
            : 'Reply copied. Click into the comment box and paste it (⌘V).';
          return;
        }
        insertIntoEditor(editor, text);
        editor.scrollIntoView({ block: 'center', behavior: 'smooth' });
        status.textContent = 'In the comment box. Check it, then press LinkedIn\'s Post button yourself.';
        setTimeout(close, 2500);
      };
    };

    async function run() {
      renderLoading('Reading the post and drafting a humanized reply…');
      const res = await send({ type: 'draft', post });
      if (!res.ok) return renderError(res.error);
      current = res;
      renderDraft();
    }

    return { host, run };
  };

  // ---------- Per-post button ----------
  const BUTTON_CSS = `
    :host { all: initial; }
    button { font: 600 13px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: #0a66c2;
      background: #fff; border: 1px solid #0a66c2; border-radius: 999px; padding: 4px 12px; cursor: pointer; margin: 4px 12px; }
    button:hover { background: #e8f0fe; }
  `;

  const addButton = container => {
    if (container.hasAttribute(MARK)) return;
    // Skip nested matches (a reshare inside a post): only the outermost post gets a button.
    if (container.parentElement && container.parentElement.closest(`[${MARK}="post"]`)) return;
    if (container.querySelector(`[${MARK}="post"]`)) return;
    container.setAttribute(MARK, 'post');

    const host = document.createElement('div');
    host.setAttribute(MARK, 'button');
    const root = host.attachShadow({ mode: 'open' });
    root.innerHTML = `<style>${BUTTON_CSS}</style><button title="Draft a humanized reply for Voxstar brands">✨ Draft reply</button>`;
    root.querySelector('button').addEventListener('click', e => {
      e.preventDefault();
      e.stopPropagation();
      container.querySelectorAll(`[${MARK}="card"]`).forEach(c => c.remove());
      const post = readPost(container);
      if (!post.text) return;
      const { host: cardHost, run } = createCard({ post, container, floating: false });
      host.after(cardHost);
      run();
    });

    const bar = first(container, ACTION_BAR_SELECTORS);
    if (bar) bar.before(host);
    else container.appendChild(host);
  };

  const scan = () => {
    for (const sel of POST_SELECTORS) document.querySelectorAll(sel).forEach(addButton);
  };

  let scheduled = false;
  new MutationObserver(() => {
    if (scheduled) return;
    scheduled = true;
    setTimeout(() => { scheduled = false; scan(); }, 400);
  }).observe(document.body, { childList: true, subtree: true });
  scan();

  // ---------- Right-click fallback ----------
  chrome.runtime.onMessage.addListener(msg => {
    if (msg.type !== 'draft-selection' || !msg.text) return;
    document.querySelectorAll(`[${MARK}="card"]`).forEach(c => { if (c.shadowRoot?.querySelector('.floating')) c.remove(); });
    const selection = window.getSelection();
    const anchor = selection && selection.anchorNode ? selection.anchorNode.parentElement : null;
    const container = anchor ? POST_SELECTORS.map(s => anchor.closest(s)).find(Boolean) || null : null;
    const author = container ? (first(container, AUTHOR_SELECTORS)?.textContent || '').trim() : '';
    const { host, run } = createCard({ post: { author, text: msg.text.slice(0, 4000) }, container, floating: true });
    document.body.appendChild(host);
    run();
  });
})();
