import { TRANSFER_SCRIPT } from "./transfer-page-script.ts";
import { TRANSFER_STYLE } from "./transfer-page-style.ts";
import { TRANSFER_EXTENSIONS } from "./transfer-page-view.ts";

export { TRANSFER_EXTENSIONS, TRANSFER_SCRIPT };

/**
 * The native server puts the live state here as it serves the page, so the
 * first paint is already right (`TransferServer.stateToken`). An older
 * binary leaves it, and the script falls back on the accent in the CSS.
 */
export const LIVE_STATE_TOKEN = "__SYNQ_LIVE_STATE__";

const METER = "<i></i><i></i><i></i><i></i>";
const CHECK =
  '<svg class="check" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 8.5l3.2 3.2L13 4.8"/></svg>';

/**
 * The page a computer's browser loads from Wi-Fi Transfer: drop or choose
 * audio files anywhere on it, and they upload one at a time as the request
 * body, so the phone streams each to disk. A single self-contained file,
 * since it has to work with no internet. Near-black with the person's accent,
 * which follows the phone's theme.
 */
export function transferPage({ accent }: { accent: string }) {
  const accept = TRANSFER_EXTENSIONS.map((extension) => `.${extension}`).join(
    ",",
  );
  const color = /^#[0-9a-f]{6}$/i.test(accent) ? accent : "#77adf8";
  return `<!doctype html>
<html lang="en" data-face="ready" data-link="connecting">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>SYNQ</title>
<style>${TRANSFER_STYLE} :root { --accent: ${color}; }</style>
</head>
<body>
<header>
  <span class="mark">SYNQ</span>
  <span class="status" role="status"><span class="meter" aria-hidden="true">${METER}</span><span id="status">Connecting</span></span>
</header>
<main>
  <div class="card">
    <label class="target">
      <input id="files" type="file" multiple accept="${accept},audio/*">
      <span class="face ready"><strong>Drop music here</strong><span>or choose files</span></span>
      <span class="face off"><strong>Turn on Wi-Fi Transfer in SYNQ</strong><span>or drop files to send when it’s on</span></span>
      <span class="face lost"><strong>Open SYNQ on your iPhone</strong><span>Files you drop will send when it’s back</span></span>
    </label>
    <div class="activity">
      ${CHECK}<span class="line" id="line"></span><span class="name" id="name"></span>
      <button type="button" id="cancel" hidden>Cancel</button>
    </div>
    <div class="rail" aria-hidden="true"><i id="fill"></i></div>
  </div>
  <div class="below">
    <p class="line-note">Files go straight to your iPhone over your Wi-Fi.</p>
    <details id="problems" hidden>
      <summary id="problems-count"></summary>
      <ul id="problems-list"></ul>
    </details>
  </div>
</main>
<script type="application/json" id="live">${LIVE_STATE_TOKEN}</script>
<script>${TRANSFER_SCRIPT}</script>
</body>
</html>`;
}
