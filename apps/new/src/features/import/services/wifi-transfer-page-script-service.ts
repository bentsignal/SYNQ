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

