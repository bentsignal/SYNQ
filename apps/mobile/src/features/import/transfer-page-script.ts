import { TRANSFER_VIEW } from "./transfer-page-view.ts";

/** Sending files, one at a time. */
const UPLOADS = `
  function settle(item) {
    if (queue[0] === item) queue.shift();
    current = null;
    waiting = false;
    loaded = 0;
  }

  function delivered(item) {
    sent += 1;
    sentBytes += item.file.size || 0;
    settle(item);
    if (queue.length === 0) allSent();
    pump();
  }

  function failed(item, message) {
    problemNames.push(item.file.name + (message ? " \\u2014 " + message : ""));
    total -= 1;
    totalBytes -= item.file.size || 0;
    settle(item);
    if (queue.length === 0 && sent > 0) allSent();
    pump();
  }

  /** It didn't get through, for now: back to the front of the line. */
  function retryLater(item) {
    current = null;
    waiting = false;
    loaded = 0;
    item.tries += 1;
    item.suspect = true;
    if (item.tries >= MAX_TRIES && !paused()) return failed(item, "");
    render();
    setTimeout(pump, RETRY_MS);
  }

  function send(item) {
    const xhr = new XMLHttpRequest();
    current = { item, file: item.file, xhr };
    xhr.open("POST", "/upload");
    xhr.setRequestHeader("X-File-Name", encodeURIComponent(item.file.name));
    xhr.setRequestHeader("X-Upload-Id", item.id);
    // Tells the phone how many files follow this one, so it knows the
    // transfer isn't over between files.
    xhr.setRequestHeader(
      "Content-Type",
      (item.file.type || "application/octet-stream") + "; synq-remaining=" + (queue.length - 1),
    );
    xhr.upload.onprogress = (event) => {
      if (!event.lengthComputable) return;
      loaded = event.loaded;
      render();
    };
    xhr.onload = () => {
      if (xhr.status === 200) return delivered(item);
      let reply = {};
      try { reply = JSON.parse(xhr.responseText); } catch (e) {}
      if (xhr.status === 403 && reply.off) {
        // Transfers went off just as this started. It waits with the rest.
        live.on = false;
        current = null;
        waiting = false;
        loaded = 0;
        return render();
      }
      if (xhr.status >= 500) return retryLater(item);
      failed(item, reply.error || "");
    };
    xhr.onerror = () => retryLater(item);
    xhr.send(item.file);
    render();
  }

  function pump() {
    render();
    if (waiting || paused() || queue.length === 0) return;
    const item = queue[0];
    waiting = true;
    if (!item.suspect) return send(item);
    // Its response may be what got lost, so ask before sending it again.
    attempt += 1;
    const asked = attempt;
    fetch("/uploaded?id=" + encodeURIComponent(item.id), { cache: "no-store" })
      .then((response) => response.json())
      .then((reply) => {
        if (asked !== attempt) return;
        if (reply.received) delivered(item);
        else send(item);
      })
      .catch(() => {
        if (asked !== attempt) return;
        waiting = false;
        setTimeout(pump, RETRY_MS);
      });
  }

  /** The phone went quiet: whatever was on its way may never answer. */
  function dropInFlight() {
    attempt += 1;
    if (current) {
      current.xhr.onload = null;
      current.xhr.onerror = null;
      current.xhr.abort();
      current.item.suspect = true;
    }
    current = null;
    waiting = false;
    loaded = 0;
  }

  function add(files) {
    const incoming = Array.from(files);
    if (incoming.length === 0) return;
    if (queue.length === 0) {
      sent = 0; total = 0; totalBytes = 0; sentBytes = 0; loaded = 0;
      adding = false; sawImport = false; problemNames = [];
      if (finishTimer !== null) clearTimeout(finishTimer);
      finishTimer = null;
    }
    for (const file of incoming) {
      const extension = file.name.split(".").pop().toLowerCase();
      if (!allowed.includes(extension)) {
        problemNames.push(file.name);
        continue;
      }
      nextId += 1;
      queue.push({ file, id: pageId + "-" + nextId, suspect: false, tries: 0 });
      total += 1;
      totalBytes += file.size || 0;
    }
    pump();
  }

  function cancel() {
    dropInFlight();
    queue = [];
    total = sent; totalBytes = sentBytes;
    if (sent > 0) allSent();
    render();
  }

`;

/** The live link, and the page's own events. */
const LINK = `
  function changeLink(next) {
    if (link === next) return;
    link = next;
    if (next === "lost") dropInFlight();
    pump();
  }

  function heard() {
    lastHeard = Date.now();
    streamSeen = true;
    changeLink("live");
  }

  function connect() {
    if (source) source.close();
    source = new EventSource("/events");
    const opened = source;
    opened.addEventListener("state", (event) => {
      heard();
      try { apply(JSON.parse(event.data)); } catch (e) {}
      pump();
    });
    opened.addEventListener("ping", heard);
    opened.onerror = () => {
      if (opened !== source) return;
      // The browser retries a dropped stream itself; a refused one it won't.
      if (opened.readyState === 2) {
        source = null;
        check();
      }
    };
  }

  /** Is the phone there at all? Used whenever the stream isn't. */
  function check() {
    if (checking) return;
    checking = true;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), CHECK_MS);
    fetch("/ping", { cache: "no-store", signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error("no");
        lastHeard = Date.now();
        // It answers but has never held a stream: an older binary.
        if (source === null && !streamSeen) changeLink("basic");
        else setTimeout(connect, RECONNECT_MS);
      })
      .catch(() => changeLink("lost"))
      .finally(() => {
        clearTimeout(timeout);
        checking = false;
      });
  }

  function watch() {
    const quiet = Date.now() - lastHeard;
    if (link === "basic") return check();
    if (quiet > LOST_MS) {
      changeLink("lost");
      check();
    }
  }

  input.addEventListener("change", () => { add(input.files); input.value = ""; });
  el("cancel").addEventListener("click", cancel);
  let dragging = 0;
  window.addEventListener("dragenter", (event) => { event.preventDefault(); dragging += 1; flag("over", true); });
  window.addEventListener("dragover", (event) => { event.preventDefault(); });
  window.addEventListener("dragleave", (event) => {
    event.preventDefault();
    dragging = Math.max(0, dragging - 1);
    if (dragging === 0) flag("over", false);
  });
  window.addEventListener("drop", (event) => {
    event.preventDefault();
    dragging = 0;
    flag("over", false);
    add(event.dataTransfer.files);
  });
  window.addEventListener("beforeunload", (event) => {
    if (queue.length > 0) event.preventDefault();
  });

  draw();
  connect();
  setInterval(watch, 1000);
})();
`;

/**
 * Uploads one file at a time as the request body, and keeps a live link to
 * the phone over `/events`: whether transfers are on, the accent, and how the
 * import is going. Files wait here while the phone is away or transfers are
 * off, and go on by themselves when that changes. An older binary has no
 * `/events`, so the page falls back on checking `/ping`.
 */
export const TRANSFER_SCRIPT = TRANSFER_VIEW + UPLOADS + LINK;
