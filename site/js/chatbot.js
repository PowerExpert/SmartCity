(function () {
  const style = document.createElement('style');
  style.textContent = `
    #chat-fab {
      position: fixed; bottom: 28px; right: 28px; width: 64px; height: 64px;
      border-radius: 50%; background: #0ea5e9; border: none; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      z-index: 9999; transition: transform 0.2s;
      animation: pulse-glow 2s ease-in-out infinite;
    }
    #chat-fab:hover { transform: scale(1.08); background: #0284c7; }
    @keyframes pulse-glow {
      0%, 100% { box-shadow: 0 4px 28px rgba(14,165,233,0.6); }
      50% { box-shadow: 0 0 40px 8px rgba(14,165,233,0.95); }
    }
    #chat-window {
      position: fixed; bottom: 100px; right: 28px; width: 420px; max-height: 600px;
      background: rgba(2,13,26,0.92); border: 1px solid rgba(14,165,233,0.25);
      border-radius: 16px; display: none; flex-direction: column; z-index: 9998;
      backdrop-filter: blur(16px); overflow: hidden;
      box-shadow: 0 8px 40px rgba(0,0,0,0.5);
    }
    #chat-window.open { display: flex; }
    #chat-header {
      padding: 14px 16px; border-bottom: 1px solid rgba(14,165,233,0.15);
      display: flex; align-items: center; justify-content: space-between;
    }
    .chat-header-left { display: flex; align-items: center; gap: 10px; }
    .chat-dot { width: 8px; height: 8px; border-radius: 50%; background: #38bdf8; }
    .chat-title { color: #f1f0ee; font-size: 14px; font-weight: 500; }
    .chat-sub { color: rgba(241,240,238,0.4); font-size: 11px; }
    #chat-close { background: none; border: none; cursor: pointer; color: rgba(241,240,238,0.4); font-size: 18px; }
    #chat-close:hover { color: #38bdf8; }
    #chat-messages {
      flex: 1; overflow-y: auto; padding: 14px;
      display: flex; flex-direction: column; gap: 10px; max-height: 440px;
    }
    .msg { max-width: 88%; padding: 9px 12px; border-radius: 12px; font-size: 13px; line-height: 1.5; }
    .msg.bot { background: rgba(14,165,233,0.12); color: #d8f0ff; align-self: flex-start; border: 1px solid rgba(14,165,233,0.2); border-bottom-left-radius: 4px; }
    .msg.user { background: rgba(14,165,233,0.22); color: #fff8f0; align-self: flex-end; border-bottom-right-radius: 4px; }
    #chat-input-row { padding: 10px 12px; border-top: 1px solid rgba(14,165,233,0.15); display: flex; gap: 8px; }
    #chat-input { flex: 1; background: rgba(255,255,255,0.05); border: 1px solid rgba(14,165,233,0.2); border-radius: 8px; padding: 12px 14px; color: #f1f0ee; font-size: 14px; outline: none; }
    #chat-input:focus { border-color: rgba(14,165,233,0.45); }
    #chat-send { background: #0ea5e9; border: none; border-radius: 8px; width: 42px; height: 42px; cursor: pointer; display: flex; align-items: center; justify-content: center; }
    #chat-send:hover { background: #0284c7; }
    #chat-send:disabled { background: rgba(14,165,233,0.3); cursor: not-allowed; }
  `;
  document.head.appendChild(style);

  document.body.insertAdjacentHTML('beforeend', `
    <button id="chat-fab" title="Спросить о качестве воды">
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
    </button>
    <div id="chat-window">
      <div id="chat-header">
        <div class="chat-header-left">
          <div class="chat-dot"></div>
          <div>
            <div class="chat-title">Чистая Вода</div>
            <div class="chat-sub">Ассистент по качеству воды</div>
          </div>
        </div>
        <button id="chat-close">✕</button>
      </div>
      <div id="chat-messages">
        <div class="msg bot">Привет! Я могу рассказать о качестве воды в Алматы, объяснить показатели WQI, нитраты, мутность, рассказать о влиянии ИИ-серверов на потребление воды и дать рекомендации. Спрашивайте!</div>
      </div>
      <div id="chat-input-row">
        <input id="chat-input" placeholder="Спросите о воде в Алматы..." />
        <button id="chat-send">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
          </svg>
        </button>
      </div>
    </div>
  `);

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
          model: 'command-a-03-2025',
          messages: [
            { role: 'system', content: `Ты — ассистент сайта "Чистая Вода" о мониторинге качества и потребления воды в Алматы. Ты знаешь о показателях WQI, нитратах, мутности, свинце в воде, а также о том, что ИИ-серверные дата-центры потребляют огромное количество воды для охлаждения. Отвечай кратко и по делу на русском языке.` },
            ...history
          ]
        })
      });
      const data = await res.json();
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

  const tipStyle = document.createElement('style');
  tipStyle.textContent = `
    #chat-tip {
      position: fixed; bottom: 38px; right: 100px;
      background: rgba(2,13,26,0.95); border: 1px solid rgba(14,165,233,0.4);
      border-radius: 12px; padding: 10px 14px; z-index: 9997;
      color: #d8f0ff; font-size: 13px; font-family: sans-serif;
      white-space: nowrap; pointer-events: none;
      animation: tip-in 0.4s ease forwards;
    }
    #chat-tip span { color: #38bdf8; font-weight: 600; }
    #chat-tip::after {
      content: ''; position: absolute; right: -8px; top: 50%;
      transform: translateY(-50%);
      border: 8px solid transparent;
      border-left-color: rgba(14,165,233,0.4);
      border-right: none;
    }
    @keyframes tip-in {
      from { opacity: 0; transform: translateX(-10px); }
      to   { opacity: 1; transform: translateX(0); }
    }
  `;
  document.head.appendChild(tipStyle);

  const tip = document.createElement('div');
  tip.id = 'chat-tip';
  tip.innerHTML = '💧 <span>Спросите</span> нашего ИИ-ассистента!';
  document.body.appendChild(tip);

  setTimeout(() => { if (tip.parentNode) tip.remove(); }, 5000);
  fab.addEventListener('click', () => { if (tip.parentNode) tip.remove(); });
})();
