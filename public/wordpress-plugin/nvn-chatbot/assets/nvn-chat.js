/**
 * NVN Chatbot - Vanilla JS Embed Widget
 * Hosted version - no build step required
 */
(function() {
  'use strict';

  // ============= Helpers =============
  function adjustColor(hex, amount) {
    var num = parseInt(hex.replace('#', ''), 16);
    var r = Math.min(255, Math.max(0, (num >> 16) + amount));
    var g = Math.min(255, Math.max(0, ((num >> 8) & 0x00ff) + amount));
    var b = Math.min(255, Math.max(0, (num & 0x0000ff) + amount));
    return '#' + ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0');
  }

  function escapeHtml(str) {
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function renderMarkdown(text) {
    var paragraphs = text.split(/\n\n+/);
    var html = paragraphs.map(function(para) {
      para = para.trim();
      if (!para) return '';
      var lines = para.split('\n');
      var isList = lines.every(function(l) { return /^\s*[-*•]\s/.test(l) || l.trim() === ''; });
      if (isList) {
        var items = lines.filter(function(l) { return l.trim(); }).map(function(l) {
          return '<li>' + inlineFormat(l.replace(/^\s*[-*•]\s*/, '')) + '</li>';
        });
        return '<ul>' + items.join('') + '</ul>';
      }
      return '<p>' + inlineFormat(para.replace(/\n/g, '<br/>')) + '</p>';
    });
    return html.join('');
  }

  function inlineFormat(text) {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
  }

  // ============= Main Widget =============
  function NVNChatWidget(config) {
    this.config = Object.assign({
      apiUrl: '',
      apiKey: '',
      position: 'bottom-right',
      primaryColor: '#7e57c2',
      accentColor: '#c2185b'
    }, config);

    this.isOpen = false;
    this.isTyping = false;
    this.messages = [];
    this.sessionId = this._uuid();
    this._injectStyles();
    this._createDOM();
    this._bindEvents();
  }

  NVNChatWidget.prototype._uuid = function() {
    if (crypto.randomUUID) return crypto.randomUUID();
    return 'xxxx-xxxx-xxxx'.replace(/x/g, function() {
      return ((Math.random() * 16) | 0).toString(16);
    });
  };

  NVNChatWidget.prototype._injectStyles = function() {
    if (document.getElementById('nvn-chat-styles')) return;
    var style = document.createElement('style');
    style.id = 'nvn-chat-styles';
    style.textContent = [
      "@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Playfair+Display:wght@600&display=swap');",
      "@keyframes nvnSlideUp { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }",
      "@keyframes nvnTyping { 0%,80%,100% { transform:scale(0.8); opacity:0.5; } 40% { transform:scale(1); opacity:1; } }",
      "@keyframes nvnPulse { 0%,100% { box-shadow: 0 0 0 0 rgba(126,87,194,0.4); } 50% { box-shadow: 0 0 0 12px rgba(126,87,194,0); } }",
      "#nvn-chat-widget * { box-sizing: border-box; margin: 0; padding: 0; }",
      "#nvn-chat-widget { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 14px; line-height: 1.6; -webkit-font-smoothing: antialiased; }",
      ".nvn-fab { width:64px; height:64px; border-radius:50%; border:none; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:transform 0.3s; animation: nvnPulse 2s infinite; }",
      ".nvn-fab:hover { transform:scale(1.1); }",
      ".nvn-window { display:flex; flex-direction:column; height:520px; width:400px; max-width:calc(100vw - 2rem); background:#fff; border-radius:20px; box-shadow:0 12px 48px rgba(0,0,0,0.18); border:none; overflow:hidden; animation:nvnSlideUp 0.3s ease-out; }",
      ".nvn-header { padding:18px 20px; display:flex; align-items:center; justify-content:space-between; }",
      ".nvn-header-icon { width:42px; height:42px; border-radius:50%; background:rgba(255,255,255,0.2); display:flex; align-items:center; justify-content:center; flex-shrink:0; }",
      ".nvn-header-title { font-weight:600; color:#fff; font-size:17px; font-family:'Playfair Display',Georgia,serif; }",
      ".nvn-header-sub { font-size:12px; color:rgba(255,255,255,0.75); margin-top:2px; }",
      ".nvn-close { background:transparent; border:none; color:rgba(255,255,255,0.8); cursor:pointer; padding:8px; border-radius:50%; display:flex; align-items:center; justify-content:center; transition:background 0.2s; }",
      ".nvn-close:hover { background:rgba(255,255,255,0.15); color:#fff; }",
      ".nvn-messages { flex:1; overflow-y:auto; padding:16px 14px; background:#faf8f5; scroll-behavior:smooth; }",
      ".nvn-messages::-webkit-scrollbar { width:5px; }",
      ".nvn-messages::-webkit-scrollbar-track { background:transparent; }",
      ".nvn-messages::-webkit-scrollbar-thumb { background:rgba(0,0,0,0.15); border-radius:10px; }",
      ".nvn-empty { text-align:center; padding:40px 20px; color:#6b7280; font-size:14px; line-height:1.6; }",
      ".nvn-msg { display:flex; margin-bottom:10px; animation:nvnSlideUp 0.25s ease-out; }",
      ".nvn-msg-user { justify-content:flex-end; }",
      ".nvn-msg-bot { justify-content:flex-start; }",
      ".nvn-bubble { max-width:82%; padding:12px 16px; font-size:14px; line-height:1.65; box-shadow:0 2px 10px rgba(0,0,0,0.08); color:#fff; word-wrap:break-word; overflow-wrap:break-word; }",
      ".nvn-bubble a { color:#ffd700 !important; text-decoration:underline; }",
      ".nvn-bubble strong { font-weight:700; }",
      ".nvn-bubble p { margin-bottom:8px; }",
      ".nvn-bubble p:last-child { margin-bottom:0; }",
      ".nvn-bubble ul, .nvn-bubble ol { margin:6px 0 6px 18px; padding:0; }",
      ".nvn-bubble li { margin-bottom:4px; }",
      ".nvn-bubble-user { border-radius:18px 18px 4px 18px; }",
      ".nvn-bubble-bot { border-radius:18px 18px 18px 4px; }",
      ".nvn-time { font-size:10px; margin-top:6px; opacity:0.6; }",
      ".nvn-typing { display:flex; align-items:center; gap:6px; padding:16px 20px; border-radius:18px 18px 18px 4px; }",
      ".nvn-dot { width:8px; height:8px; border-radius:50%; background:rgba(255,255,255,0.6); animation:nvnTyping 1.4s infinite ease-in-out; }",
      ".nvn-input-area { display:flex; align-items:flex-end; gap:10px; padding:14px 16px; border-top:1px solid #eee; background:#fff; }",
      ".nvn-textarea { flex:1; resize:none; border-radius:14px; border:1.5px solid #e0ddd8; padding:12px 16px; font-size:14px; font-family:inherit; min-height:44px; max-height:120px; outline:none; background:#faf8f5; transition:border-color 0.2s; }",
      ".nvn-textarea:focus { border-color:#7e57c2; background:#fff; }",
      ".nvn-textarea::placeholder { color:#9ca3af; }",
      ".nvn-send { width:44px; height:44px; border-radius:14px; border:none; cursor:pointer; display:flex; align-items:center; justify-content:center; flex-shrink:0; transition:opacity 0.2s, transform 0.15s; }",
      ".nvn-send:hover:not(:disabled) { transform:scale(1.05); }",
      ".nvn-send:disabled { opacity:0.4; cursor:not-allowed; }"
    ].join('\n');
    document.head.appendChild(style);
  };

  NVNChatWidget.prototype._createDOM = function() {
    var c = this.config;
    this.container = document.createElement('div');
    this.container.id = 'nvn-chat-widget';
    this.container.style.cssText = 'position:fixed;bottom:24px;z-index:99999;' + (c.position === 'bottom-left' ? 'left:24px;' : 'right:24px;');

    // FAB button
    this.fab = document.createElement('button');
    this.fab.className = 'nvn-fab';
    this.fab.style.background = 'linear-gradient(135deg,' + c.primaryColor + ',' + adjustColor(c.primaryColor, -20) + ')';
    this.fab.style.boxShadow = '0 4px 20px rgba(0,0,0,0.2)';
    this.fab.setAttribute('aria-label', 'Chat megnyitása');
    this.fab.innerHTML = '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>';

    // Chat window
    this.windowEl = document.createElement('div');
    this.windowEl.className = 'nvn-window';
    this.windowEl.style.display = 'none';
    this.windowEl.innerHTML = [
      '<div class="nvn-header" style="background:linear-gradient(135deg,' + c.primaryColor + ',' + adjustColor(c.primaryColor, -15) + ')">',
      '  <div style="display:flex;align-items:center;gap:12px">',
      '    <div class="nvn-header-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l1.912 5.813a2 2 0 0 0 1.275 1.275L21 12l-5.813 1.912a2 2 0 0 0-1.275 1.275L12 21l-1.912-5.813a2 2 0 0 0-1.275-1.275L3 12l5.813-1.912a2 2 0 0 0 1.275-1.275L12 3z"/></svg></div>',
      '    <div><div class="nvn-header-title">NVN Asszisztens</div><div class="nvn-header-sub">Mindig itt vagyok, ha kérdésed van!</div></div>',
      '  </div>',
      '  <button class="nvn-close" aria-label="Bezárás"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>',
      '</div>',
      '<div class="nvn-messages"><div class="nvn-empty"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6b7280" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom:12px"><path d="M12 3l1.912 5.813a2 2 0 0 0 1.275 1.275L21 12l-5.813 1.912a2 2 0 0 0-1.275 1.275L12 21l-1.912-5.813a2 2 0 0 0-1.275-1.275L3 12l5.813-1.912a2 2 0 0 0 1.275-1.275L12 3z"/></svg><br>Szia! 👋 Miben segíthetek a Női Vállalkozók Napjával kapcsolatban?</div></div>',
      '<div class="nvn-input-area">',
      '  <textarea class="nvn-textarea" placeholder="Írj üzenetet..." rows="1"></textarea>',
      '  <button class="nvn-send" style="background:' + c.accentColor + '" disabled><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg></button>',
      '</div>'
    ].join('');

    this.container.appendChild(this.fab);
    this.container.appendChild(this.windowEl);
    document.body.appendChild(this.container);

    // Cache DOM refs
    this.messagesEl = this.windowEl.querySelector('.nvn-messages');
    this.textareaEl = this.windowEl.querySelector('.nvn-textarea');
    this.sendBtn = this.windowEl.querySelector('.nvn-send');
    this.closeBtn = this.windowEl.querySelector('.nvn-close');
  };

  NVNChatWidget.prototype._bindEvents = function() {
    var self = this;
    this.fab.addEventListener('click', function() { self._open(); });
    this.closeBtn.addEventListener('click', function() { self._close(); });
    this.sendBtn.addEventListener('click', function() { self._send(); });
    this.textareaEl.addEventListener('input', function() {
      self.sendBtn.disabled = !self.textareaEl.value.trim() || self.isTyping;
    });
    this.textareaEl.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        self._send();
      }
    });
  };

  NVNChatWidget.prototype._open = function() {
    this.isOpen = true;
    this.fab.style.display = 'none';
    this.windowEl.style.display = 'flex';
    this.textareaEl.focus();
  };

  NVNChatWidget.prototype._close = function() {
    this.isOpen = false;
    this.fab.style.display = 'flex';
    this.windowEl.style.display = 'none';
  };

  NVNChatWidget.prototype._scrollBottom = function() {
    this.messagesEl.scrollTop = this.messagesEl.scrollHeight;
  };

  NVNChatWidget.prototype._addMessage = function(content, isUser) {
    // Remove empty state
    var empty = this.messagesEl.querySelector('.nvn-empty');
    if (empty) empty.remove();

    var c = this.config;
    var row = document.createElement('div');
    row.className = 'nvn-msg ' + (isUser ? 'nvn-msg-user' : 'nvn-msg-bot');
    var bubble = document.createElement('div');
    bubble.className = 'nvn-bubble ' + (isUser ? 'nvn-bubble-user' : 'nvn-bubble-bot');
    bubble.style.backgroundColor = isUser ? c.accentColor : c.primaryColor;

    if (isUser) {
      bubble.textContent = content;
    } else {
      bubble.innerHTML = renderMarkdown(content);
    }

    var time = document.createElement('div');
    time.className = 'nvn-time';
    var now = new Date();
    time.textContent = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
    bubble.appendChild(time);

    row.appendChild(bubble);
    this.messagesEl.appendChild(row);
    this._scrollBottom();
    return bubble;
  };

  NVNChatWidget.prototype._showTyping = function() {
    var c = this.config;
    var row = document.createElement('div');
    row.className = 'nvn-msg nvn-msg-bot';
    row.id = 'nvn-typing';
    var bubble = document.createElement('div');
    bubble.className = 'nvn-typing';
    bubble.style.backgroundColor = c.primaryColor;
    bubble.innerHTML = '<span class="nvn-dot" style="animation-delay:0ms"></span><span class="nvn-dot" style="animation-delay:0.2s"></span><span class="nvn-dot" style="animation-delay:0.4s"></span>';
    row.appendChild(bubble);
    this.messagesEl.appendChild(row);
    this._scrollBottom();
  };

  NVNChatWidget.prototype._hideTyping = function() {
    var el = document.getElementById('nvn-typing');
    if (el) el.remove();
  };

  NVNChatWidget.prototype._send = async function() {
    var content = this.textareaEl.value.trim();
    if (!content || this.isTyping) return;

    this.textareaEl.value = '';
    this.sendBtn.disabled = true;
    this.isTyping = true;
    this.textareaEl.disabled = true;

    this._addMessage(content, true);
    this.messages.push({ role: 'user', content: content });

    this._showTyping();

    var self = this;
    var assistantContent = '';

    try {
      var resp = await fetch(this.config.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + this.config.apiKey
        },
        body: JSON.stringify({ messages: this.messages, sessionId: this.sessionId })
      });

      if (!resp.ok) {
        throw new Error('HTTP ' + resp.status);
      }

      var reader = resp.body.getReader();
      var decoder = new TextDecoder();
      var textBuffer = '';
      var botBubble = null;

      while (true) {
        var result = await reader.read();
        if (result.done) break;
        textBuffer += decoder.decode(result.value, { stream: true });

        var newlineIndex;
        while ((newlineIndex = textBuffer.indexOf('\n')) !== -1) {
          var line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);
          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (line.startsWith(':') || line.trim() === '') continue;
          if (!line.startsWith('data: ')) continue;
          var jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') break;
          try {
            var parsed = JSON.parse(jsonStr);
            var delta = parsed.choices && parsed.choices[0] && parsed.choices[0].delta && parsed.choices[0].delta.content;
            if (delta) {
              assistantContent += delta;
              if (!botBubble) {
                self._hideTyping();
                botBubble = self._addMessage(assistantContent, false);
              } else {
                var timeEl = botBubble.querySelector('.nvn-time');
                botBubble.innerHTML = renderMarkdown(assistantContent);
                if (timeEl) botBubble.appendChild(timeEl);
                self._scrollBottom();
              }
            }
          } catch (e) {
            textBuffer = line + '\n' + textBuffer;
            break;
          }
        }
      }

      if (assistantContent) {
        self.messages.push({ role: 'assistant', content: assistantContent });
      }
    } catch (err) {
      console.error('NVN Chat error:', err);
      self._hideTyping();
      self._addMessage('Sajnálom, jelenleg nem tudok válaszolni. Kérlek próbáld újra később, vagy nézz be a Facebook csoportba! 💜', false);
    }

    self._hideTyping();
    self.isTyping = false;
    self.textareaEl.disabled = false;
    self.sendBtn.disabled = !self.textareaEl.value.trim();
    self.textareaEl.focus();
  };

  // ============= Global Init =============
  window.NVNChat = {
    init: function(config) {
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
          new NVNChatWidget(config);
        });
      } else {
        new NVNChatWidget(config);
      }
    }
  };
})();
