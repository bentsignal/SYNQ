import type { Upload } from "./state";
import { MAX_TRIES, paused, RETRY_MS, state } from "./state";
import { allSent, render, toRecord } from "./view";

/** Nothing's on its way any more. */
function clearCurrent() {
  state.current = null;
  state.waiting = false;
  state.loaded = 0;
}

function settle(item: Upload) {
  if (state.queue[0] === item) state.queue.shift();
  clearCurrent();
}

function delivered(item: Upload) {
  state.sent += 1;
  state.sentBytes += item.file.size;
  settle(item);
  if (state.queue.length === 0) allSent();
  pump();
}

function failed(item: Upload, message: string) {
  state.problemNames.push(item.file.name + (message ? ` — ${message}` : ""));
  state.total -= 1;
  state.totalBytes -= item.file.size;
  settle(item);
  if (state.queue.length === 0 && state.sent > 0) allSent();
  pump();
}

/** It didn't get through, for now: back to the front of the line. */
function retryLater(item: Upload) {
  clearCurrent();
  item.tries += 1;
  item.suspect = true;
  if (item.tries >= MAX_TRIES && !paused()) {
    failed(item, "");
    return;
  }
  render();
  setTimeout(pump, RETRY_MS);
}

function readReply(text: string) {
  try {
    return toRecord(JSON.parse(text));
  } catch {
    return {};
  }
}

function answered(xhr: XMLHttpRequest, item: Upload) {
  if (xhr.status === 200) {
    delivered(item);
    return;
  }
  const reply = readReply(xhr.responseText);
  if (xhr.status === 403 && reply.off) {
    // Transfers went off just as this started. It waits with the rest.
    state.live.on = false;
    clearCurrent();
    render();
    return;
  }
  if (xhr.status >= 500) {
    retryLater(item);
    return;
  }
  failed(item, typeof reply.error === "string" ? reply.error : "");
}

function send(item: Upload) {
  const xhr = new XMLHttpRequest();
  state.current = { file: item.file, item, xhr };
  xhr.open("POST", "/upload");
  xhr.setRequestHeader("X-File-Name", encodeURIComponent(item.file.name));
  xhr.setRequestHeader("X-Upload-Id", item.id);
  // Tells the phone how many files follow this one, so it knows the
  // transfer isn't over between files.
  xhr.setRequestHeader(
    "Content-Type",
    `${item.file.type || "application/octet-stream"}; synq-remaining=${state.queue.length - 1}`,
  );
  xhr.upload.onprogress = (event) => {
    if (!event.lengthComputable) return;
    state.loaded = event.loaded;
    render();
  };
  xhr.onload = () => {
    answered(xhr, item);
  };
  xhr.onerror = () => {
    retryLater(item);
  };
  xhr.send(item.file);
  render();
}

/** Its response may be what got lost, so ask before sending it again. */
function askThenSend(item: Upload) {
  state.attempt += 1;
  const asked = state.attempt;
  fetch(`/uploaded?id=${encodeURIComponent(item.id)}`, { cache: "no-store" })
    .then((response) => response.json())
    .then((reply: unknown) => {
      if (asked !== state.attempt) return;
      if (toRecord(reply).received) delivered(item);
      else send(item);
    })
    .catch(() => {
      if (asked !== state.attempt) return;
      state.waiting = false;
      setTimeout(pump, RETRY_MS);
    });
}

export function pump() {
  render();
  const item = state.queue[0];
  if (state.waiting || paused() || item === undefined) return;
  state.waiting = true;
  if (item.suspect) askThenSend(item);
  else send(item);
}

/** The phone went quiet: whatever was on its way may never answer. */
export function dropInFlight() {
  state.attempt += 1;
  if (state.current) {
    const { item, xhr } = state.current;
    xhr.onload = null;
    xhr.onerror = null;
    xhr.abort();
    item.suspect = true;
  }
  clearCurrent();
}

/** A new run starts once the last one has nothing left to send. */
function startRun() {
  state.sent = 0;
  state.total = 0;
  state.totalBytes = 0;
  state.sentBytes = 0;
  state.loaded = 0;
  state.adding = false;
  state.sawImport = false;
  state.problemNames = [];
  if (state.finishTimer !== null) clearTimeout(state.finishTimer);
  state.finishTimer = null;
}

export function add(files: ArrayLike<File>) {
  const incoming = Array.from(files);
  if (incoming.length === 0) return;
  if (state.queue.length === 0) startRun();
  for (const file of incoming) {
    const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
    if (!TRANSFER_EXTENSIONS.includes(extension)) {
      state.problemNames.push(file.name);
      continue;
    }
    state.nextId += 1;
    state.queue.push({
      file,
      id: `${state.pageId}-${state.nextId}`,
      suspect: false,
      tries: 0,
    });
    state.total += 1;
    state.totalBytes += file.size;
  }
  pump();
}

export function cancel() {
  dropInFlight();
  state.queue = [];
  state.total = state.sent;
  state.totalBytes = state.sentBytes;
  if (state.sent > 0) allSent();
  render();
}
