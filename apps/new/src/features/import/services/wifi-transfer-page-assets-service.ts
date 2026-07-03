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

export const wifiTransferPageScript = `
      const filesInput = document.getElementById("files");
      const sendButton = document.getElementById("send");
      const statusLabel = document.getElementById("status");

      const setStatus = (message, className = "") => {
        statusLabel.textContent = message;
        statusLabel.className = className;
      };

      const readFileAsBase64 = (file) => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onerror = () => reject(new Error("Could not read " + file.name));
        reader.onload = () => {
          const value = String(reader.result || "");
          resolve(value.includes(",") ? value.split(",")[1] : value);
        };
        reader.readAsDataURL(file);
      });

      sendButton.addEventListener("click", async () => {
        const files = Array.from(filesInput.files || []);
        if (files.length === 0) {
          setStatus("Choose at least one audio file.", "error");
          return;
        }

        sendButton.disabled = true;
        setStatus("Preparing transfer...");

        try {
          const startResponse = await fetch("./startTransfer", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ size: files.length }),
          });
          if (!startResponse.ok) {
            throw new Error("Transfer could not start.");
          }

          for (let index = 0; index < files.length; index += 1) {
            const file = files[index];
            setStatus("Sending " + file.name + " (" + (index + 1) + "/" + files.length + ")");
            const data = await readFileAsBase64(file);
            const response = await fetch("./fileUpload", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                data,
                id: Date.now() + index,
                name: file.name,
                type: file.type || "audio/mpeg",
              }),
            });
            if (!response.ok) {
              throw new Error("Upload failed for " + file.name);
            }
          }

          const finishResponse = await fetch("./finishTransfer", { method: "POST" });
          if (!finishResponse.ok) {
            throw new Error("Transfer could not finish.");
          }
          setStatus("Transfer complete. Return to SYNQ.", "success");
        } catch (error) {
          setStatus(error instanceof Error ? error.message : "Transfer failed.", "error");
        } finally {
          sendButton.disabled = false;
        }
      });
`;
