import { el, flag, root } from "./dom";
import { DRAW_MS, FINISH_FALLBACK_MS, paused, state } from "./state";

const ACCENT = /^#[0-9a-f]{6}$/i;

const line = el("line");
const nameText = el("name");
const fill = el("fill");
const statusText = el("status");
const problems = el("problems");

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

/** A reply or a message from the phone, whatever it turns out to hold. */
export function toRecord(value: unknown) {
  return isRecord(value) ? value : {};
}

/** The page's lighter middle: the accent 45% of the way to white. */
function lighter(accent: string) {
  const channels = [1, 3, 5].map((at) => {
    const value = parseInt(accent.slice(at, at + 2), 16);
    return Math.round(value + (255 - value) * 0.45)
      .toString(16)
      .padStart(2, "0");
  });
  return `#${channels.join("")}`;
}

/** The tab's icon: the page's icon, with its corners and its gradients. */
function drawFavicon(accent: string) {
  el("favicon").href =
    "data:image/svg+xml," +
    encodeURIComponent(
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96"><defs>' +
        `<mask id="m"><image width="96" height="96" href="${TRANSFER_LOGO}"/></mask>` +
        '<linearGradient id="b" x2="0" y2="1"><stop stop-color="#303030"/><stop offset="1" stop-color="#161616"/></linearGradient>' +
        `<linearGradient id="a" x2="0" y2="1"><stop offset=".22" stop-color="${accent}"/>` +
        `<stop offset=".52" stop-color="${lighter(accent)}"/><stop offset=".78" stop-color="${accent}"/></linearGradient>` +
        '</defs><rect width="96" height="96" rx="21.5" fill="url(#b)"/>' +
        '<rect width="96" height="96" fill="url(#a)" mask="url(#m)"/></svg>',
    );
}

function applyAccent(accent: unknown) {
  if (typeof accent !== "string" || !ACCENT.test(accent)) return;
  root.style.setProperty("--accent", accent);
  drawFavicon(accent);
}

function statusWords() {
  if (state.link === "lost") return "Disconnected";
  if (state.link === "connecting") return "Connecting";
  return state.live.on ? "Connected" : "Transfers Off";
}

function sendingWords() {
  if (paused()) {
    const count = state.queue.length;
    return {
      detail: "",
      text: count === 1 ? "1 file waiting" : `${count} files waiting`,
    };
  }
  const { sent, total } = state;
  return {
    detail: state.current ? state.current.file.name : "",
    text:
      total > 1
        ? `Sending ${Math.min(sent + 1, total)} of ${total}`
        : "Sending",
  };
}

function doneWords() {
  if (state.sent === 0) return "";
  const count = state.live.imported > 0 ? state.live.imported : state.sent;
  return count === 1 ? "1 Song Added" : `${count} Songs Added`;
}

function activityWords() {
  if (state.queue.length > 0) return sendingWords();
  return {
    detail: "",
    text: state.adding ? "Adding to your library" : doneWords(),
  };
}

function drawProblems() {
  const names = state.problemNames;
  problems.hidden = names.length === 0;
  el("problems-count").textContent =
    names.length === 1
      ? "1 file couldn’t be sent"
      : `${names.length} files couldn’t be sent`;
  const list = el("problems-list");
  while (list.children.length > names.length) list.lastChild?.remove();
  for (let i = list.children.length; i < names.length; i++) {
    const li = document.createElement("li");
    li.textContent = names[i] ?? "";
    list.appendChild(li);
  }
}

function drawFace() {
  const { link, live } = state;
  const face = live.on ? "ready" : "off";
  root.dataset.face = link === "lost" ? "lost" : face;
  root.dataset.link = link;
  statusText.textContent = statusWords();
}

export function draw() {
  state.drawTimer = null;
  state.lastDraw = Date.now();
  drawFace();
  const busy = state.queue.length > 0;
  flag("busy", busy && !paused());
  flag("activity", busy || state.adding || state.sent > 0);
  flag("done", !busy && !state.adding && state.sent > 0);
  const { detail, text } = activityWords();
  line.textContent = text;
  nameText.textContent = detail;
  el("cancel").hidden = !busy;
  document.title = busy ? `${text} · SYNQ` : "SYNQ";
  const { loaded, sentBytes, totalBytes } = state;
  const fraction = totalBytes > 0 ? (sentBytes + loaded) / totalBytes : 0;
  fill.style.transform = `scaleX(${fraction})`;
  drawProblems();
}

/** Words change a few times a second at most, however fast files go. */
export function render() {
  if (state.drawTimer !== null) return;
  state.drawTimer = setTimeout(
    draw,
    Math.max(0, DRAW_MS - (Date.now() - state.lastDraw)),
  );
}

function finishRun() {
  if (state.finishTimer !== null) clearTimeout(state.finishTimer);
  state.finishTimer = null;
  state.adding = false;
  render();
}

export function allSent() {
  state.adding = state.link !== "basic";
  if (state.adding) {
    state.finishTimer = setTimeout(finishRun, FINISH_FALLBACK_MS);
  }
  if (state.adding && state.sawImport && !state.live.importing) {
    state.adding = false;
  }
}

function readLive(message: Record<string, unknown>) {
  const { live } = state;
  if (typeof message.away === "boolean") state.away = message.away;
  if (typeof message.on === "boolean") live.on = message.on;
  if (typeof message.importing === "boolean")
    live.importing = message.importing;
  if (typeof message.imported === "number") live.imported = message.imported;
}

/** Takes in what the phone says. */
export function apply(incoming: unknown) {
  const message = toRecord(incoming);
  readLive(message);
  applyAccent(message.accent);
  if (state.live.importing) state.sawImport = true;
  if (state.adding && state.sawImport && !state.live.importing) finishRun();
}
