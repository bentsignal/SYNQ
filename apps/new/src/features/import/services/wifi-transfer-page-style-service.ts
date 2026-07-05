export const wifiTransferPageStyles = `
      :root {
        color-scheme: dark;
        --bg: #121417;
        --panel: #1d2420;
        --text: #f8faf9;
        --muted: #a8b5af;
        --accent: #27c0a7;
        --danger: #ff8b80;
      }
      * { box-sizing: border-box; }
      body {
        background: var(--bg);
        color: var(--text);
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        margin: 0;
        min-height: 100vh;
        padding: 28px;
      }
      main {
        display: grid;
        gap: 18px;
        margin: 0 auto;
        max-width: 720px;
      }
      h1 {
        font-size: clamp(30px, 8vw, 56px);
        letter-spacing: 0;
        line-height: 1;
        margin: 0;
      }
      p {
        color: var(--muted);
        font-size: 17px;
        line-height: 1.5;
        margin: 0;
      }
      .panel {
        background: var(--panel);
        border: 1px solid #33413a;
        border-radius: 8px;
        display: grid;
        gap: 14px;
        padding: 18px;
      }
      input {
        border: 1px dashed #4d5d55;
        border-radius: 8px;
        color: var(--muted);
        padding: 22px;
        width: 100%;
      }
      button {
        background: var(--accent);
        border: 0;
        border-radius: 8px;
        color: #061311;
        cursor: pointer;
        font-size: 14px;
        font-weight: 800;
        min-height: 44px;
        padding: 0 16px;
        text-transform: uppercase;
      }
      button:disabled {
        cursor: not-allowed;
        opacity: 0.45;
      }
      #status.error { color: var(--danger); }
      #status.success { color: var(--accent); }
`;

