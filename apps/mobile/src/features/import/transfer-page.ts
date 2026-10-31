import { AUDIO_TYPES } from "./clean-tags.ts";

/** The extensions Wi-Fi Transfer accepts (the server checks them too). */
export const TRANSFER_EXTENSIONS = Object.keys(AUDIO_TYPES);

function escapeHtml(text: string) {
  return text.replace(/[&<>"']/g, (char) => `&#${String(char.charCodeAt(0))};`);
}

/**
 * The page a computer's browser loads from Wi-Fi Transfer: drop or choose
 * audio files, and each uploads (one at a time, as the request body, so
 * the phone streams it to disk) with its own progress. Styled like SYNQ:
 * near-black, the person's accent.
 */
export function transferPage({ accent, deviceName }: { accent: string; deviceName: string }) {
  const accept = TRANSFER_EXTENSIONS.map((extension) => `.${extension}`).join(",");
  const color = /^#[0-9a-f]{6}$/i.test(accent) ? accent : "#77adf8";
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>SYNQ Wi-Fi Transfer</title>
<style>
  :root { color-scheme: dark; --accent: ${color}; }
  * { box-sizing: border-box; }
  body {
    margin: 0; min-height: 100vh; background: #141414; color: #fff;
    font: 15px/1.45 -apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", Roboto, sans-serif;
    display: flex; justify-content: center;
  }
  main { width: 100%; max-width: 640px; padding: 64px 24px; }
  h1 { font-size: 28px; font-weight: 700; margin: 0 0 4px; letter-spacing: -0.01em; }
  .sub { color: rgba(235,235,245,.6); margin: 0 0 32px; }
  .drop {
    display: flex; flex-direction: column; align-items: center; gap: 12px;
    padding: 48px 24px; border-radius: 20px; text-align: center; cursor: pointer;
    background: #1c1c1e; border: 1.5px dashed rgba(235,235,245,.18);
    transition: border-color .15s, background-color .15s;
  }
  .drop.over { border-color: var(--accent); background: #232326; }
  .drop svg { width: 40px; height: 40px; color: var(--accent); }
  .drop strong { font-size: 17px; font-weight: 600; }
  .drop span { color: rgba(235,235,245,.6); }
  .button {
    margin-top: 4px; padding: 10px 20px; border-radius: 999px; border: 0;
    background: var(--accent); color: #141414; font: inherit; font-weight: 600; cursor: pointer;
  }
  ul { list-style: none; margin: 28px 0 0; padding: 0; }
  li {
    display: grid; grid-template-columns: 1fr auto; gap: 6px 12px; align-items: center;
    padding: 12px 0; border-bottom: .5px solid rgba(84,84,88,.6);
  }
  .name { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .state { color: rgba(235,235,245,.6); font-variant-numeric: tabular-nums; font-size: 13px; }
  .state.done { color: var(--accent); }
  .state.error { color: #ff6961; }
  .bar { grid-column: 1 / -1; height: 3px; border-radius: 2px; background: rgba(118,118,128,.24); overflow: hidden; }
  .bar i { display: block; height: 100%; width: 100%; background: var(--accent); transform-origin: left; transform: scaleX(0); transition: transform .2s linear; }
  .note { margin-top: 28px; color: rgba(235,235,245,.3); font-size: 13px; text-align: center; }
</style>
</head>
<body>
<main>
  <h1>SYNQ Wi-Fi Transfer</h1>
  <p class="sub">Sending to ${escapeHtml(deviceName)}. Keep Wi-Fi Transfer open in SYNQ until your files arrive.</p>
  <label class="drop" id="drop">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
    <strong>Drop music here</strong>
    <span>MP3, M4A, AAC, FLAC, or WAV</span>
    <span class="button">Choose Files</span>
    <input id="files" type="file" multiple accept="${accept},audio/*" hidden>
  </label>
  <ul id="list"></ul>
  <p class="note">Files go straight to your iPhone over your Wi-Fi, never the internet.</p>
</main>
<script>
(() => {
  const allowed = ${JSON.stringify(TRANSFER_EXTENSIONS)};
  const drop = document.getElementById("drop");
  const input = document.getElementById("files");
  const list = document.getElementById("list");
  const queue = [];
  let busy = false;

  function row(file) {
    const li = document.createElement("li");
    const name = document.createElement("span");
    name.className = "name";
    name.textContent = file.name;
    const state = document.createElement("span");
    state.className = "state";
    state.textContent = "Waiting";
    const bar = document.createElement("div");
    bar.className = "bar";
    const fill = document.createElement("i");
    bar.appendChild(fill);
    li.append(name, state, bar);
    list.appendChild(li);
    return { state, fill };
  }

  function add(files) {
    for (const file of files) {
      const ext = file.name.split(".").pop().toLowerCase();
      const view = row(file);
      if (!allowed.includes(ext)) {
        view.state.textContent = "Not a supported file";
        view.state.className = "state error";
        continue;
      }
      queue.push({ file, view });
    }
    next();
  }

  function next() {
    if (busy || queue.length === 0) return;
    busy = true;
    const { file, view } = queue.shift();
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/upload");
    xhr.setRequestHeader("X-File-Name", encodeURIComponent(file.name));
    xhr.setRequestHeader("Content-Type", file.type || "application/octet-stream");
    xhr.upload.onprogress = (event) => {
      if (!event.lengthComputable) return;
      const fraction = event.loaded / event.total;
      view.fill.style.transform = "scaleX(" + fraction + ")";
      view.state.textContent = Math.round(fraction * 100) + "%";
    };
    const finish = (ok, message) => {
      view.state.textContent = message;
      view.state.className = ok ? "state done" : "state error";
      if (ok) view.fill.style.transform = "scaleX(1)";
      busy = false;
      next();
    };
    xhr.onload = () => {
      if (xhr.status === 200) return finish(true, "Sent");
      let message = "Couldn't send";
      try { message = JSON.parse(xhr.responseText).error || message; } catch (e) {}
      finish(false, message);
    };
    xhr.onerror = () => finish(false, "Couldn't reach SYNQ. Is Wi-Fi Transfer still open?");
    view.state.textContent = "0%";
    xhr.send(file);
  }

  input.addEventListener("change", () => { add(input.files); input.value = ""; });
  for (const type of ["dragenter", "dragover"]) {
    window.addEventListener(type, (event) => { event.preventDefault(); drop.classList.add("over"); });
  }
  for (const type of ["dragleave", "drop"]) {
    window.addEventListener(type, (event) => { event.preventDefault(); drop.classList.remove("over"); });
  }
  window.addEventListener("drop", (event) => add(event.dataTransfer.files));
})();
</script>
</body>
</html>`;
}
