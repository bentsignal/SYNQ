/**
 * The page's behaviour: uploads one file at a time as the request body, and
 * keeps a live link to the phone over `/events`: whether transfers are on,
 * the accent, and how the import is going. Files wait here while the phone is
 * away or transfers are off, and go on by themselves when that changes. An
 * older binary has no `/events`, so the page falls back on checking `/ping`.
 */
import { el, flag } from "./dom";
import { connect, watch } from "./link";
import { state } from "./state";
import { add, cancel } from "./uploads";
import { apply, draw } from "./view";

/** The first state, which an older binary leaves as a token that won't parse. */
function readFirstState() {
  try {
    apply(JSON.parse(el("live").textContent));
  } catch {
    // The accent in the CSS, and what the stream says next, will do.
  }
}

function listenForFiles() {
  const input = el("files");
  input.addEventListener("change", () => {
    add(input.files ?? []);
    input.value = "";
  });
  el("cancel").addEventListener("click", cancel);
  let dragging = 0;
  window.addEventListener("dragenter", (event) => {
    event.preventDefault();
    dragging += 1;
    flag("over", true);
  });
  window.addEventListener("dragover", (event) => {
    event.preventDefault();
  });
  window.addEventListener("dragleave", (event) => {
    event.preventDefault();
    dragging = Math.max(0, dragging - 1);
    if (dragging === 0) flag("over", false);
  });
  window.addEventListener("drop", (event) => {
    event.preventDefault();
    dragging = 0;
    flag("over", false);
    add(event.dataTransfer?.files ?? []);
  });
  window.addEventListener("beforeunload", (event) => {
    if (state.queue.length > 0) event.preventDefault();
  });
}

readFirstState();
listenForFiles();
draw();
connect();
setInterval(watch, 1000);
