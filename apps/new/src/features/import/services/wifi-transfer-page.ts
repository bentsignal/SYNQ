import { wifiTransferPageScript } from "./wifi-transfer-page-script-service";
import { wifiTransferPageStyles } from "./wifi-transfer-page-style-service";

export function getWifiTransferPage() {
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>SYNQ Transfer</title>
    <style>
${wifiTransferPageStyles}
    </style>
  </head>
  <body>
    <main>
      <h1>SYNQ Transfer</h1>
      <p>Choose audio files here and keep the SYNQ Wi-Fi import screen open until the transfer finishes.</p>
      <section class="panel">
        <input id="files" type="file" multiple accept="audio/*" />
        <button id="send" type="button">Send files</button>
        <p id="status">Waiting for files.</p>
      </section>
    </main>
    <script>
${wifiTransferPageScript}
    </script>
  </body>
</html>`;
}
