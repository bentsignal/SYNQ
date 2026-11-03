import { AUDIO_TYPES } from "./clean-tags.ts";
import { TRANSFER_LOGO_MASK } from "./transfer-page-logo.ts";

/** The extensions Wi-Fi Transfer accepts (the server checks them too). */
export const TRANSFER_EXTENSIONS = Object.keys(AUDIO_TYPES);

/**
 * The start of the page's script: what it knows, and how it's drawn. The
 * pieces join into one function in the page (`TRANSFER_SCRIPT`).
 */
export const TRANSFER_VIEW = `
(() => {
  const allowed = ${JSON.stringify(TRANSFER_EXTENSIONS)};
  const LOST_MS = 2500;
  const RETRY_MS = 1200;
  const CHECK_MS = 1500;
  const RECONNECT_MS = 500;
  const DRAW_MS = 300;
  const MAX_TRIES = 5;
  const FINISH_FALLBACK_MS = 5000;
  const root = document.documentElement;
  const el = (id) => document.getElementById(id);
  const input = el("files");
  const line = el("line");
  const name = el("name");
  const fill = el("fill");
  const statusText = el("status");
  const problems = el("problems");

  const live = { on: true, importing: false, imported: 0 };
  let link = "connecting";
  let source = null;
  let lastHeard = Date.now();
  let streamSeen = false;
  let checking = false;
  let away = false;

  let queue = [];
  let current = null;
  let waiting = false;
  let attempt = 0;
  let sent = 0;
  let total = 0;
  let totalBytes = 0;
  let sentBytes = 0;
  let loaded = 0;
  let adding = false;
  let sawImport = false;
  let finishTimer = null;
  let problemNames = [];
  let nextId = 0;
  let lastDraw = 0;
  let drawTimer = null;
  const pageId = Date.now().toString(36) + Math.random().toString(36).slice(2);

  function flag(key, on) {
    if (on) root.dataset[key] = "";
    else delete root.dataset[key];
  }

  /** The tab's icon: the page's icon, with its corners and its gradients. */
  function drawFavicon(accent) {
    // The page's lighter middle: the accent 45% of the way to white.
    const light = "#" + [1, 3, 5].map((at) => {
      const value = parseInt(accent.slice(at, at + 2), 16);
      return Math.round(value + (255 - value) * 0.45).toString(16).padStart(2, "0");
    }).join("");
    el("favicon").href = "data:image/svg+xml," + encodeURIComponent(
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96"><defs>' +
      '<mask id="m"><image width="96" height="96" href="${TRANSFER_LOGO_MASK}"/></mask>' +
      '<linearGradient id="b" x2="0" y2="1"><stop stop-color="#303030"/><stop offset="1" stop-color="#161616"/></linearGradient>' +
      '<linearGradient id="a" x2="0" y2="1"><stop offset=".22" stop-color="' + accent + '"/>' +
      '<stop offset=".52" stop-color="' + light + '"/><stop offset=".78" stop-color="' + accent + '"/></linearGradient>' +
      '</defs><rect width="96" height="96" rx="21.5" fill="url(#b)"/>' +
      '<rect width="96" height="96" fill="url(#a)" mask="url(#m)"/></svg>',
    );
  }

  function apply(state) {
    if (typeof state !== "object" || state === null) return;
    if (typeof state.away === "boolean") away = state.away;
    if (typeof state.on === "boolean") live.on = state.on;
    if (typeof state.importing === "boolean") live.importing = state.importing;
    if (typeof state.imported === "number") live.imported = state.imported;
    if (typeof state.accent === "string" && /^#[0-9a-f]{6}$/i.test(state.accent)) {
      root.style.setProperty("--accent", state.accent);
      drawFavicon(state.accent);
    }
    if (live.importing) sawImport = true;
    if (adding && sawImport && !live.importing) finishRun();
  }

  try { apply(JSON.parse(el("live").textContent)); } catch (e) {}

  function paused() {
    return !live.on || link === "lost" || link === "connecting";
  }

  function draw() {
    drawTimer = null;
    lastDraw = Date.now();
    const face = link === "lost" ? "lost" : live.on ? "ready" : "off";
    root.dataset.face = face;
    root.dataset.link = link;
    statusText.textContent =
      link === "lost" ? "Disconnected"
      : link === "connecting" ? "Connecting"
      : live.on ? "Connected" : "Transfers Off";
    const busy = queue.length > 0;
    flag("busy", busy && !paused());
    flag("activity", busy || adding || sent > 0);
    flag("done", !busy && !adding && sent > 0);
    let text = "";
    let detail = "";
    if (busy && paused()) {
      text = queue.length === 1 ? "1 file waiting" : queue.length + " files waiting";
    } else if (busy) {
      text = total > 1 ? "Sending " + Math.min(sent + 1, total) + " of " + total : "Sending";
      detail = current ? current.file.name : "";
    } else if (adding) {
      text = "Adding to your library";
    } else if (sent > 0) {
      const count = live.imported > 0 ? live.imported : sent;
      text = count === 1 ? "1 Song Added" : count + " Songs Added";
    }
    line.textContent = text;
    name.textContent = detail;
    el("cancel").hidden = !busy;
    document.title = busy ? text + " \\u00b7 SYNQ" : "SYNQ";
    const fraction = totalBytes > 0 ? (sentBytes + loaded) / totalBytes : 0;
    fill.style.transform = "scaleX(" + fraction + ")";
    problems.hidden = problemNames.length === 0;
    el("problems-count").textContent = problemNames.length === 1
      ? "1 file couldn\\u2019t be sent"
      : problemNames.length + " files couldn\\u2019t be sent";
    const list = el("problems-list");
    while (list.children && list.children.length > problemNames.length) list.lastChild.remove();
    for (let i = list.children ? list.children.length : 0; i < problemNames.length; i++) {
      const li = document.createElement("li");
      li.textContent = problemNames[i];
      list.appendChild(li);
    }
  }

  /** Words change a few times a second at most, however fast files go. */
  function render() {
    if (drawTimer !== null) return;
    drawTimer = setTimeout(draw, Math.max(0, DRAW_MS - (Date.now() - lastDraw)));
  }

  function finishRun() {
    if (finishTimer !== null) clearTimeout(finishTimer);
    finishTimer = null;
    adding = false;
    render();
  }

  function allSent() {
    adding = link !== "basic";
    if (adding) finishTimer = setTimeout(finishRun, FINISH_FALLBACK_MS);
    if (adding && sawImport && !live.importing) adding = false;
  }

`;
