import { CHECK_MS, LOST_MS, RECONNECT_MS, state } from "./state";
import { dropInFlight, pump } from "./uploads";
import { apply } from "./view";

function changeLink(next: typeof state.link) {
  if (state.link === next) return;
  state.link = next;
  if (next === "lost") dropInFlight();
  pump();
}

function heard() {
  state.lastHeard = Date.now();
  state.streamSeen = true;
  changeLink(state.away ? "lost" : "live");
}

function readState(data: unknown) {
  try {
    apply(JSON.parse(String(data)));
  } catch {
    // Not something the phone said: what the page knows still stands.
  }
}

export function connect() {
  if (state.source) state.source.close();
  const opened = new EventSource("/events");
  state.source = opened;
  opened.addEventListener("state", (event) => {
    readState(event.data);
    heard();
    pump();
  });
  opened.addEventListener("ping", heard);
  opened.onerror = () => {
    if (opened !== state.source) return;
    // The browser retries a dropped stream itself, but not a refused one.
    if (opened.readyState === 2) state.source = null;
    // Either way, a closed app answers nothing, so say so right away.
    check();
  };
}

/** Is the phone there at all? Used whenever the stream isn't. */
function check() {
  if (state.checking) return;
  state.checking = true;
  const controller = new AbortController();
  const timeout = setTimeout(() => {
    controller.abort();
  }, CHECK_MS);
  fetch("/ping", { cache: "no-store", signal: controller.signal })
    .then((response) => {
      if (!response.ok) throw new Error("no");
      state.lastHeard = Date.now();
      // It answers but has never held a stream: an older binary.
      if (state.source === null && !state.streamSeen) changeLink("basic");
      else setTimeout(connect, RECONNECT_MS);
    })
    .catch(() => {
      changeLink("lost");
    })
    .finally(() => {
      clearTimeout(timeout);
      state.checking = false;
    });
}

export function watch() {
  const quiet = Date.now() - state.lastHeard;
  if (state.link === "basic") {
    check();
    return;
  }
  // A hiccup on the Wi-Fi shouldn't cost an upload in flight: only a phone
  // that doesn't answer when asked is gone.
  if (quiet > LOST_MS) check();
}
