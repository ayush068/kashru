(function () {
  const currentScript = document.currentScript;
  const apiUrl =
    currentScript?.dataset.apiUrl || "http://localhost:8000/api/v1/chat";
  const brand = currentScript?.dataset.brand || "Kashru Assistant";
  const whatsappFallback =
    "https://wa.me/919806604871?text=Hi%20Kashru%20Technologies%2C%20I%20want%20to%20discuss%20a%20project";

  if (document.getElementById("kashru-chat-widget")) return;

  const styles = document.createElement("style");
  styles.textContent = `
    #kashru-chat-widget {
      --kc-bg: #07111f;
      --kc-panel: #0b1728;
      --kc-border: rgba(126, 192, 255, 0.22);
      --kc-text: #eef6ff;
      --kc-muted: #9bb3ca;
      --kc-blue: #2f8cff;
      --kc-blue-2: #6bd6ff;
      --kc-user: #123b68;
      font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      position: fixed;
      right: 22px;
      bottom: 22px;
      z-index: 999999;
      color: var(--kc-text);
    }
    #kashru-chat-widget * { box-sizing: border-box; }
    .kc-launcher {
      width: 62px;
      height: 62px;
      border: 1px solid rgba(255,255,255,0.18);
      border-radius: 999px;
      background: linear-gradient(135deg, var(--kc-blue), #0f5fc8);
      color: white;
      cursor: pointer;
      box-shadow: 0 18px 42px rgba(0, 34, 84, 0.45);
      display: grid;
      place-items: center;
      transition: transform .18s ease, box-shadow .18s ease;
    }
    .kc-launcher:hover { transform: translateY(-2px); box-shadow: 0 22px 50px rgba(0, 34, 84, 0.55); }
    .kc-launcher svg { width: 29px; height: 29px; }
    .kc-panel {
      width: min(370px, calc(100vw - 32px));
      height: min(590px, calc(100vh - 110px));
      margin-bottom: 14px;
      border: 1px solid var(--kc-border);
      border-radius: 18px;
      background: radial-gradient(circle at top right, rgba(47,140,255,.2), transparent 32%), var(--kc-panel);
      box-shadow: 0 24px 70px rgba(0,0,0,.38);
      overflow: hidden;
      display: none;
      flex-direction: column;
    }
    .kc-panel.kc-open { display: flex; }
    .kc-header {
      padding: 16px 16px 14px;
      border-bottom: 1px solid var(--kc-border);
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .kc-mark {
      width: 38px;
      height: 38px;
      border-radius: 12px;
      display: grid;
      place-items: center;
      background: rgba(47,140,255,.18);
      border: 1px solid rgba(107,214,255,.25);
      color: var(--kc-blue-2);
      font-weight: 800;
    }
    .kc-title { font-size: 15px; font-weight: 750; line-height: 1.2; }
    .kc-status { font-size: 12px; color: var(--kc-muted); margin-top: 2px; }
    .kc-close {
      margin-left: auto;
      width: 34px;
      height: 34px;
      border: 0;
      border-radius: 999px;
      background: rgba(255,255,255,.06);
      color: var(--kc-text);
      cursor: pointer;
      font-size: 22px;
      line-height: 1;
    }
    .kc-messages {
      flex: 1;
      padding: 16px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .kc-msg {
      max-width: 86%;
      padding: 10px 12px;
      border-radius: 14px;
      font-size: 14px;
      line-height: 1.45;
      white-space: pre-wrap;
    }
    .kc-bot {
      align-self: flex-start;
      background: rgba(255,255,255,.07);
      border: 1px solid rgba(255,255,255,.08);
      border-bottom-left-radius: 6px;
    }
    .kc-user {
      align-self: flex-end;
      background: var(--kc-user);
      border: 1px solid rgba(107,214,255,.16);
      border-bottom-right-radius: 6px;
    }
    .kc-typing {
      align-self: flex-start;
      display: none;
      gap: 4px;
      padding: 12px;
      border-radius: 14px;
      background: rgba(255,255,255,.07);
    }
    .kc-typing span {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: var(--kc-blue-2);
      animation: kc-pulse 1s infinite ease-in-out;
    }
    .kc-typing span:nth-child(2) { animation-delay: .15s; }
    .kc-typing span:nth-child(3) { animation-delay: .3s; }
    @keyframes kc-pulse { 0%, 80%, 100% { opacity: .3; transform: translateY(0); } 40% { opacity: 1; transform: translateY(-3px); } }
    .kc-actions { display: flex; margin-top: 8px; }
    .kc-whatsapp {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-height: 36px;
      padding: 8px 11px;
      border-radius: 999px;
      background: #1fb55f;
      color: white;
      text-decoration: none;
      font-size: 13px;
      font-weight: 700;
    }
    .kc-form {
      padding: 12px;
      border-top: 1px solid var(--kc-border);
      display: flex;
      gap: 8px;
      background: rgba(3, 8, 16, .38);
    }
    .kc-input {
      flex: 1;
      min-width: 0;
      min-height: 42px;
      border: 1px solid rgba(255,255,255,.12);
      border-radius: 999px;
      background: rgba(255,255,255,.07);
      color: var(--kc-text);
      padding: 0 14px;
      outline: none;
      font: inherit;
      font-size: 14px;
    }
    .kc-input::placeholder { color: #7891a8; }
    .kc-send {
      width: 42px;
      height: 42px;
      flex: 0 0 42px;
      border: 0;
      border-radius: 999px;
      background: var(--kc-blue);
      color: white;
      cursor: pointer;
      display: grid;
      place-items: center;
    }
    .kc-send:disabled { opacity: .55; cursor: not-allowed; }
    .kc-send svg { width: 19px; height: 19px; }
    @media (max-width: 520px) {
      #kashru-chat-widget { right: 16px; bottom: 16px; }
      .kc-panel { height: min(570px, calc(100vh - 96px)); }
    }
  `;

  const root = document.createElement("div");
  root.id = "kashru-chat-widget";
  root.innerHTML = `
    <div class="kc-panel" role="dialog" aria-label="${escapeHtml(brand)}">
      <div class="kc-header">
        <div class="kc-mark">K</div>
        <div>
          <div class="kc-title">${escapeHtml(brand)}</div>
          <div class="kc-status">Usually replies instantly</div>
        </div>
        <button class="kc-close" type="button" aria-label="Close chat">×</button>
      </div>
      <div class="kc-messages" aria-live="polite"></div>
      <div class="kc-typing" aria-label="Assistant is typing"><span></span><span></span><span></span></div>
      <form class="kc-form">
        <input class="kc-input" type="text" maxlength="1000" placeholder="Ask about services..." autocomplete="off" />
        <button class="kc-send" type="submit" aria-label="Send message">
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12h13M13 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </button>
      </form>
    </div>
    <button class="kc-launcher" type="button" aria-label="Open Kashru chat">
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M7.5 18.5 4 21v-4.8A8.3 8.3 0 0 1 3 12C3 7.6 7 4 12 4s9 3.6 9 8-4 8-9 8c-1.6 0-3.1-.3-4.5-1.5Z" stroke="currentColor" stroke-width="1.9" stroke-linejoin="round"/><path d="M8 11.5h8M8 14.5h5" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/></svg>
    </button>
  `;

  document.head.appendChild(styles);
  document.body.appendChild(root);

  const panel = root.querySelector(".kc-panel");
  const launcher = root.querySelector(".kc-launcher");
  const close = root.querySelector(".kc-close");
  const messages = root.querySelector(".kc-messages");
  const form = root.querySelector(".kc-form");
  const input = root.querySelector(".kc-input");
  const send = root.querySelector(".kc-send");
  const typing = root.querySelector(".kc-typing");
  let greeted = false;

  launcher.addEventListener("click", () => {
    panel.classList.toggle("kc-open");
    if (panel.classList.contains("kc-open")) {
      input.focus();
      if (!greeted) {
        addMessage("bot", "Hi! I'm Kashru's assistant — ask me about our services, or I can connect you with the team.");
        greeted = true;
      }
    }
  });

  close.addEventListener("click", () => panel.classList.remove("kc-open"));

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const message = input.value.trim();
    if (!message) return;

    addMessage("user", message);
    input.value = "";
    setBusy(true);

    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });

      if (!response.ok) throw new Error("Chat API unavailable");
      const data = await response.json();
      addMessage("bot", data.answer || "I do not have that detail yet. I can connect you with the team.", data.handoff, data.whatsapp_url);
    } catch (error) {
      addMessage("bot", "I couldn't reach the assistant right now. You can still message our team directly.", true, whatsappFallback);
    } finally {
      setBusy(false);
    }
  });

  function addMessage(type, text, handoff, whatsappUrl) {
    const item = document.createElement("div");
    item.className = `kc-msg kc-${type}`;
    item.textContent = text;

    if (handoff) {
      const actions = document.createElement("div");
      actions.className = "kc-actions";
      const link = document.createElement("a");
      link.className = "kc-whatsapp";
      link.href = whatsappUrl || whatsappFallback;
      link.target = "_blank";
      link.rel = "noopener";
      link.textContent = "Chat on WhatsApp";
      actions.appendChild(link);
      item.appendChild(actions);
    }

    messages.appendChild(item);
    messages.scrollTop = messages.scrollHeight;
  }

  function setBusy(isBusy) {
    typing.style.display = isBusy ? "flex" : "none";
    send.disabled = isBusy;
    input.disabled = isBusy;
    messages.scrollTop = messages.scrollHeight;
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }
})();
