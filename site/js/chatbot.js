(function () {
  // ─── Styles ───────────────────────────────────────────────
  const style = document.createElement('style');
  style.textContent = `
    #chat-fab {
      position: fixed; bottom: 28px; right: 28px; width: 52px; height: 52px;
      border-radius: 50%; background: #fb923c; border: none; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      box-shadow: 0 4px 20px rgba(251,146,60,0.4); z-index: 9999;
      transition: transform 0.2s;
    }
    #chat-fab:hover { transform: scale(1.08); background: #f97316; }
    #chat-window {
      position: fixed; bottom: 90px; right: 28px; width: 360px; max-height: 520px;
      background: rgba(10,12,22,0.92); border: 1px solid rgba(251,146,60,0.25);
      border-radius: 16px; display: none; flex-direction: column; z-index: 9998;
      backdrop-filter: blur(16px); overflow: hidden;
      box-shadow: 0 8px 40px rgba(0,0,0,0.5);
    }
    #chat-window.open { display: flex; }
    #chat-header {
      padding: 14px 16px; border-bottom: 1px solid rgba(251,146,60,0.15);
      display: flex; align-items: center; justify-content: space-between;
    }
    .chat-header-left { display: flex; align-items: center; gap: 10px; }
    .chat-dot { width: 8px; height: 8px; border-radius: 50%; background: #fb923c; }
    .chat-title { color: #f1f0ee; font-size: 14px; font-weight: 500; }
    .chat-sub { color: rgba(241,240,238,0.4); font-size: 11px; }
    #chat-close { background: none; border: none; cursor: pointer; color: rgba(241,240,238,0.4); font-size: 18px; }
    #chat-close:hover { color: #fb923c; }
    #chat-messages {
      flex: 1; overflow-y: auto; padding: 14px;
      display: flex; flex-direction: column; gap: 10px; max-height: 360px;
    }
    .msg { max-width: 88%; padding: 9px 12px; border-radius: 12px; font-size: 13px; line-height: 1.5; }
    .msg.bot { background: rgba(251,146,60,0.12); color: #f1e8d8; align-self: flex-start; border: 1px solid rgba(251,146,60,0.18); border-bottom-left-radius: 4px; }
    .msg.user { background: rgba(251,146,60,0.22); color: #fff8f0; align-self: flex-end; border-bottom-right-radius: 4px; }
    #chat-input-row { padding: 10px 12px; border-top: 1px solid rgba(251,146,60,0.15); display: flex; gap: 8px; }
    #chat-input { flex: 1; background: rgba(255,255,255,0.05); border: 1px solid rgba(251,146,60,0.2); border-radius: 8px; padding: 8px 12px; color: #f1f0ee; font-size: 13px; outline: none; }
    #chat-input:focus { border-color: rgba(251,146,60,0.45); }
    #chat-send { background: #fb923c; border: none; border-radius: 8px; width: 34px; height: 34px; cursor: pointer; display: flex; align-items: center; justify-content: center; }
    #chat-send:hover { background: #f97316; }
    #chat-send:disabled { background: rgba(251,146,60,0.3); cursor: not-allowed; }
  `;
  document.head.appendChild(style);

  // ─── HTML ─────────────────────────────────────────────────
  document.body.insertAdjacentHTML('beforeend', `
    <button id="chat-fab" title="Спросить об экологии">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
    </button>
    <div id="chat-window">
      <div id="chat-header">
        <div class="chat-header-left">
          <div class="chat-dot"></div>
          <div>
            <div class="chat-title">Чистый Воздух</div>
            <div class="chat-sub">Ассистент по качеству воздуха</div>
          </div>
        </div>
        <button id="chat-close">✕</button>
      </div>
      <div id="chat-messages">
        <div class="msg bot">Привет! Я могу рассказать о качестве воздуха в Алматы, объяснить показатели AQI, PM2.5, NO₂ и дать рекомендации. Спрашивайте!</div>
      </div>
      <div id="chat-input-row">
        <input id="chat-input" placeholder="Спросите о воздухе в Алматы..." />
        <button id="chat-send">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
          </svg>
        </button>
      </div>
    </div>
  `);

  // ─── Logic ────────────────────────────────────────────────
  const fab = document.getElementById('chat-fab');
  const win = document.getElementById('chat-window');
  const closeBtn = document.getElementById('chat-close');
  const input = document.getElementById('chat-input');
  const sendBtn = document.getElementById('chat-send');
  const msgList = document.getElementById('chat-messages');
  const history = [];

  fab.addEventListener('click', () => { win.classList.toggle('open'); if (win.classList.contains('open')) input.focus(); });
  closeBtn.addEventListener('click', () => win.classList.remove('open'));
  input.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); send(); } });
  sendBtn.addEventListener('click', send);

  function addMsg(text, role) {
    const el = document.createElement('div');
    el.className = 'msg ' + (role === 'user' ? 'user' : 'bot');
    el.textContent = text;
    msgList.appendChild(el);
    msgList.scrollTop = msgList.scrollHeight;
    return el;
  }

  async function send() {
    const text = input.value.trim();
    if (!text) return;
    input.value = '';
    sendBtn.disabled = true;
    addMsg(text, 'user');
    history.push({ role: 'user', content: text });
    const typing = addMsg('...', 'bot');

    try {
        const res = await fetch('https://api.cohere.com/v2/chat', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer EJawcjMYSHzOeMumAPLsOVWRNyj5b423yYG0zm8B'
        },
        body: JSON.stringify({
            model: 'command-r_plus',
            messages: [
            { role: 'system', content: `Ты — ассистент сайта "Чистый Воздух" о мониторинге качества воздуха в Алматы. Отвечай кратко на русском языке.` },
            ...history
            ]
        })
        });
        const data = await res.json();
        console.log('Cohere response:', JSON.stringify(data));
        const reply = data.message?.content?.[0]?.text || 'Нет ответа.';
        typing.remove();
        addMsg(reply, 'bot');
        history.push({ role: 'assistant', content: reply });
    } catch {
      typing.remove();
      addMsg('Ошибка соединения. Попробуйте позже.', 'bot');
    }
    sendBtn.disabled = false;
  }
})();