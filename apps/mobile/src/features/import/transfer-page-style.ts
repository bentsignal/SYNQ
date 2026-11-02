/** A speck of film grain, so the charcoal's soft glow doesn't band. */
const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 .5 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

export const TRANSFER_STYLE = `
  @property --accent { syntax: "<color>"; inherits: true; initial-value: #77adf8; }
  :root {
    color-scheme: dark;
    --muted: rgba(235,235,245,.56);
    --faint: rgba(235,235,245,.3);
    --hairline: rgba(255,255,255,.08);
    transition: --accent .7s ease;
  }
  * { box-sizing: border-box; }
  html, body { height: 100%; }
  body {
    margin: 0; background: #141414; color: #fff;
    font: 15px/1.4 -apple-system, BlinkMacSystemFont, "Segoe UI Variable Text", "Segoe UI", system-ui, sans-serif;
    -webkit-font-smoothing: antialiased;
    display: flex; flex-direction: column; align-items: center;
    padding: clamp(16px, 3.2vh, 32px) clamp(16px, 4vw, 40px);
    min-height: 100vh; min-height: 100dvh;
  }
  /* The room: a soft pool of the accent under the card, and some grain. */
  body::before, body::after { content: ""; position: fixed; inset: 0; pointer-events: none; z-index: -1; }
  body::before {
    background: radial-gradient(60vmax 42vmax at 50% 54%, color-mix(in srgb, var(--accent) 11%, transparent), transparent 70%);
    transition: opacity .6s;
  }
  body::after { background-image: ${GRAIN}; opacity: .035; }
  [data-face="off"] body::before, [data-face="lost"] body::before { opacity: .4; }
  [data-over] body::before { opacity: 1.6; }

  header {
    width: 100%; max-width: 720px; display: flex; align-items: center; justify-content: space-between;
    height: 32px; flex: none;
  }
  .mark { display: block; width: 32px; height: 32px; border-radius: 22.37%; box-shadow: 0 0 0 .5px var(--hairline); }
  .status {
    display: flex; align-items: center; gap: 9px; font-size: 13px; color: var(--muted);
  }
  /* The live link, drawn as a small level meter. */
  .meter { display: flex; align-items: center; gap: 2px; height: 14px; }
  .meter i {
    display: block; width: 2.5px; height: 14px; border-radius: 2px; background: var(--accent);
    transform: scaleY(.22); transform-origin: center;
    transition: background-color .5s, opacity .5s, transform .5s;
  }
  [data-link="live"] .meter i, [data-link="basic"] .meter i { animation: breathe 2.8s ease-in-out infinite; }
  .meter i:nth-child(2) { animation-delay: -.7s !important; }
  .meter i:nth-child(3) { animation-delay: -1.5s !important; }
  .meter i:nth-child(4) { animation-delay: -2.2s !important; }
  [data-busy] .meter i { animation: level .9s ease-in-out infinite !important; }
  [data-face="off"] .meter i { animation: none; background: var(--faint); transform: scaleY(.22); }
  [data-link="connecting"] .meter i, [data-link="lost"] .meter i {
    background: var(--faint); animation: seek 1.6s ease-in-out infinite;
  }
  @keyframes breathe { 0%, 100% { transform: scaleY(.28); } 50% { transform: scaleY(.62); } }
  @keyframes level { 0%, 100% { transform: scaleY(.35); } 50% { transform: scaleY(1); } }
  @keyframes seek { 0%, 100% { opacity: .35; } 50% { opacity: 1; } }

  main {
    flex: 1; width: 100%; max-width: 720px; min-height: 0;
    display: flex; flex-direction: column; justify-content: center; gap: 18px;
    padding: clamp(12px, 3vh, 28px) 0 clamp(20px, 6vh, 64px);
  }
  .card {
    position: relative; overflow: hidden; border-radius: 28px;
    height: clamp(240px, 52vh, 460px);
    background: linear-gradient(180deg, rgba(255,255,255,.04), rgba(255,255,255,.016));
    box-shadow: inset 0 0 0 1px var(--hairline), inset 0 1px 0 rgba(255,255,255,.05), 0 40px 90px -50px #000;
    transition: box-shadow .25s, transform .3s cubic-bezier(.2,.8,.2,1);
  }
  .card:hover { box-shadow: inset 0 0 0 1px rgba(255,255,255,.13), inset 0 1px 0 rgba(255,255,255,.05), 0 40px 90px -50px #000; }
  .card:focus-within { box-shadow: inset 0 0 0 1.5px var(--accent), 0 40px 90px -50px #000; }
  [data-over] .card {
    transform: scale(1.012);
    box-shadow: inset 0 0 0 1.5px var(--accent), 0 40px 110px -44px color-mix(in srgb, var(--accent) 50%, transparent);
  }
  .target {
    position: absolute; inset: 0; display: grid; place-items: center; cursor: pointer; padding: 24px;
    text-align: center;
  }
  .target input { position: absolute; width: 1px; height: 1px; opacity: 0; }
  /* The faces share one spot and cross-fade, so nothing moves between states. */
  .face {
    grid-area: 1 / 1; display: flex; flex-direction: column; align-items: center; gap: 6px;
    opacity: 0; transform: translateY(3px); pointer-events: none;
    transition: opacity .35s, transform .35s;
  }
  [data-face="ready"] .face.ready, [data-face="off"] .face.off, [data-face="lost"] .face.lost {
    opacity: 1; transform: none;
  }
  .face strong { font-size: clamp(21px, 2.8vw, 27px); font-weight: 600; letter-spacing: -.018em; line-height: 1.2; }
  .face span { color: var(--muted); }
  .face.ready span { color: var(--accent); transition: color .5s; }
  .activity {
    position: absolute; left: 0; right: 0; bottom: 0; padding: 0 12px 0 22px; height: 52px;
    display: flex; align-items: center; gap: 10px;
    opacity: 0; transform: translateY(6px); transition: opacity .3s, transform .3s; pointer-events: none;
  }
  [data-activity] .activity { opacity: 1; transform: none; pointer-events: auto; }
  .line { font-weight: 500; font-size: 14px; font-variant-numeric: tabular-nums; white-space: nowrap; }
  .name { flex: 1; min-width: 0; color: var(--muted); font-size: 13px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .check { width: 14px; height: 14px; color: var(--accent); display: none; flex: none; margin-right: -2px; }
  [data-done] .check { display: block; }
  button {
    font: inherit; font-size: 13px; color: var(--muted); background: none; border: 0; cursor: pointer;
    padding: 6px 10px; border-radius: 999px; transition: color .15s, background-color .15s;
  }
  button:hover { color: #fff; background: rgba(255,255,255,.07); }
  button:focus-visible { outline: 2px solid var(--accent); outline-offset: 1px; }
  .rail { position: absolute; left: 0; right: 0; bottom: 0; height: 2px; opacity: 0; transition: opacity .3s; }
  [data-busy] .rail { opacity: 1; }
  .rail i {
    display: block; height: 100%; background: var(--accent); transform-origin: left; transform: scaleX(0);
    transition: transform .3s linear, background-color .5s;
  }
  .line-note { margin: 0; text-align: center; color: var(--muted); font-size: 13.5px; }
  /* Under the card without moving it. */
  .below { position: relative; }
  details { position: absolute; top: 100%; left: 0; right: 0; margin-top: 12px; color: var(--muted); font-size: 13px; text-align: center; }
  details summary { cursor: pointer; list-style: none; }
  details summary::-webkit-details-marker { display: none; }
  details ul { list-style: none; margin: 8px auto 0; padding: 0; max-width: 480px; max-height: 136px; overflow: auto; }
  details li { padding: 3px 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: var(--faint); }
  @media (max-height: 460px) {
    main { justify-content: flex-start; }
    .card { height: 200px; }
  }
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after { animation: none !important; transition: none !important; }
    .meter i { transform: scaleY(.5); }
  }
`;
