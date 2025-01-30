const Transfer = () => {
  return (`<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>SYNQ</title>
        <link rel="icon" type="image/x-icon" href="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMgAAADICAYAAACtWK6eAAAACXBIWXMAAC4jAAAuIwF4pT92AAAGOmlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgOS4xLWMwMDEgNzkuMTQ2Mjg5OTc3NywgMjAyMy8wNi8yNS0yMzo1NzoxNCAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczpkYz0iaHR0cDovL3B1cmwub3JnL2RjL2VsZW1lbnRzLzEuMS8iIHhtbG5zOnBob3Rvc2hvcD0iaHR0cDovL25zLmFkb2JlLmNvbS9waG90b3Nob3AvMS4wLyIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0RXZ0PSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VFdmVudCMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIDI1LjMgKE1hY2ludG9zaCkiIHhtcDpDcmVhdGVEYXRlPSIyMDI0LTA4LTA5VDE1OjQzOjM5LTA0OjAwIiB4bXA6TW9kaWZ5RGF0ZT0iMjAyNC0wOC0wOVQxNTo0NToxNS0wNDowMCIgeG1wOk1ldGFkYXRhRGF0ZT0iMjAyNC0wOC0wOVQxNTo0NToxNS0wNDowMCIgZGM6Zm9ybWF0PSJpbWFnZS9wbmciIHBob3Rvc2hvcDpDb2xvck1vZGU9IjMiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6MzRlY2Q3YmUtNDNiNC00NmJjLWJhNGYtMDk5MDgzYzI3ZDY1IiB4bXBNTTpEb2N1bWVudElEPSJhZG9iZTpkb2NpZDpwaG90b3Nob3A6OGRkM2FhM2EtYjM0Ni1lNjQ2LTg0YTEtODA5MjcwYzcyNGExIiB4bXBNTTpPcmlnaW5hbERvY3VtZW50SUQ9InhtcC5kaWQ6OTgzNDhmMjAtZmU0Ny00Nzc0LWFhZjAtYmNkOGRiZjI0ZjFlIj4gPHhtcE1NOkhpc3Rvcnk+IDxyZGY6U2VxPiA8cmRmOmxpIHN0RXZ0OmFjdGlvbj0iY3JlYXRlZCIgc3RFdnQ6aW5zdGFuY2VJRD0ieG1wLmlpZDo5ODM0OGYyMC1mZTQ3LTQ3NzQtYWFmMC1iY2Q4ZGJmMjRmMWUiIHN0RXZ0OndoZW49IjIwMjQtMDgtMDlUMTU6NDM6MzktMDQ6MDAiIHN0RXZ0OnNvZnR3YXJlQWdlbnQ9IkFkb2JlIFBob3Rvc2hvcCAyNS4zIChNYWNpbnRvc2gpIi8+IDxyZGY6bGkgc3RFdnQ6YWN0aW9uPSJjb252ZXJ0ZWQiIHN0RXZ0OnBhcmFtZXRlcnM9ImZyb20gYXBwbGljYXRpb24vdm5kLmFkb2JlLnBob3Rvc2hvcCB0byBpbWFnZS9wbmciLz4gPHJkZjpsaSBzdEV2dDphY3Rpb249InNhdmVkIiBzdEV2dDppbnN0YW5jZUlEPSJ4bXAuaWlkOjM0ZWNkN2JlLTQzYjQtNDZiYy1iYTRmLTA5OTA4M2MyN2Q2NSIgc3RFdnQ6d2hlbj0iMjAyNC0wOC0wOVQxNTo0NToxNS0wNDowMCIgc3RFdnQ6c29mdHdhcmVBZ2VudD0iQWRvYmUgUGhvdG9zaG9wIDI1LjMgKE1hY2ludG9zaCkiIHN0RXZ0OmNoYW5nZWQ9Ii8iLz4gPC9yZGY6U2VxPiA8L3htcE1NOkhpc3Rvcnk+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+LwAFYAAAHT9JREFUeJztnXm8HeP9x9/PSaSxr0GJoon9Ivallnu0dhpSQuKW0CPEVs0hsZVSO1dpFI1rP4RQsStt77lIbbWF2HOLoj/EriHEnef3xzwz88ycJfeeM2e75/t+veaeWc7MfM99PZ/5Pt/v88zzKK01giDkJ1FrAwShnhGBCEIRRCCCUAQRiCAU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">
        <style>
            @charset "UTF-8";

            @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,200..800;1,200..800&display=swap');

            :root {
                --bg: #101010;
                --text: #fff;
                --main: #63a3ff;
                --disabled: #1d3c68;
                --alt-button: #fff;
                --info-text: #8d8d8d;
                --popup: #393939;
                --bad: rgb(250, 89, 89);
            }

            html {
                width: 100vw;
                height: 100vh;
                margin: 0;
                color: var(--text);
                background-color: var(--bg);
                font-family: 'Plus Jakarta Sans'
            }

            body {
                width: 100vw;
                height: 100vh;
                margin: 0;
                display: flex;
                flex-direction: column;
            }

            header {
                border-bottom: 1px solid #1e1e1e;
                display: flex;
                flex-direction: row;
                justify-content: space-between;
                align-items: center;
                text-align: center;
                padding: 0 40px;
                color: var(--main);
                font-weight: 800;
                font-size: 20pt;
            }

            #SYNQ-logo {
                width: 40px;
                height: auto;
            }

            #upload {
                width: 35px;
                height: auto;
                filter: invert(76%) sepia(45%) saturate(6852%) hue-rotate(194deg) brightness(105%) contrast(101%);
            }

            main {
                display: flex;
                flex: 1 0 auto;
            }

            #empty {
                display: flex;
                flex: 1 0 auto;
                justify-content: center;
                align-items: center;
                flex-direction: column;
            }

            button {
                display: inline-block;
                border-radius: 15px;
                border: none;
                font-size: 16px;
                font-weight: '400';
                width: 100px;
                height: 42px;
            }

            label {
              display: flex;
              justify-content: center;
              align-items: center;
              width: 100%;
              height: 100%;
              color: var(--bg);
            }

            button:hover {
                background-image: linear-gradient(rgb(0 0 0/10%) 0 0);
                cursor: pointer;
            }

            label:hover {
                cursor: pointer;
            }

            .info-text {
                font-size: 14px;
                color: var(--info-text);
                margin: 0 0 10px 0;
            }

            #overlay {
              position: absolute;
              width: 100vw;
              height: 100vh;
              background-color: rgba(0, 0, 0, .5);
              backdrop-filter: blur(5px);
              top: 0;
              z-index: 1;
              display: none;
              justify-content: center;
              align-items: center;
            }

            .popup {
              background-color: var(--popup);
              border-radius: 15px;
              padding: 10px 25px;
              user-select: none;
              text-align: center;
              justify-content: flex-start;
              align-items: center;
              flex-direction: column;
              position: relative;
            }

            #transfer-popup {
              display: none;
              height: 100px;
            }

            #error-popup {
              display: none;
              justify-content: center;
              height: 200px;
              width: 300px;
            }

            #close-error {
              position: absolute;
              top: 15px;
              right: 15px;
              width: 25px;
            }

            #close-error:hover {
              cursor: pointer;
            }

            #loading {
              width: 200px; 
              height: 80px;
              position: absolute;
              bottom: 0;
            }

            #connection-loading {
              width: 100px;
              height: 40px;
            }

            #connection-status {
              font-weight: 400;
              font-size: 14pt;
              display: flex;
              flex-direction: row;
              justify-content: center;
              align-items: center;
            }

            #server-name {
              font-weight: 800;
            }

            .connecting {
              color: white;
            }

            .connected {
              color: rgb(175, 248, 175);
            }

            .disconnected {
              color: var(--bad);
            }

            header {
              padding: 20px 40px;
            }

            @media screen and (max-width: 500px) {
              #connection-status {
                font-size: 12pt;
              }
            }

        </style>
    </head>
    <body>
      <script src="https://unpkg.com/@dotlottie/player-component@latest/dist/dotlottie-player.mjs" type="module"></script> 
      <script>
            document.addEventListener('DOMContentLoaded', () => {
              const overlay = document.getElementById('overlay')
              const transferPopup = document.getElementById('transfer-popup')
              const errorPopup = document.getElementById('error-popup')
              const errorClose = document.getElementById('close-error')
              const errorMessage = document.getElementById('error-message')
              const countString = document.getElementById('transferCount');
              const checkEndpoint = window.location.href + 'checkConnection'
              const connectionStatus = document.getElementById('connection-status')

              const checkConnection = async () => {
                try {
                  return await fetch(checkEndpoint);
                }
                catch (error) {
                  throw error
                }
              }

              const idgen = (len) => {
                let result = '';
                for (let i = 0; i < len; i++) {
                  result += Math.floor(Math.random()*10).toString();
                }
                return result;
              }

              errorClose.addEventListener('click', () => {
                overlay.style.display = 'none';
                errorPopup.style.display = 'none';
              })
              
              const handleFileChange = async (event) => {
                if (event.target.files) {
                  try {
                    const startEndpoint = window.location.href + 'startTransfer'
                    const startResponse = await fetch(startEndpoint, {
                      method: 'POST',
                      headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                      },
                      body: JSON.stringify({
                        "size": event.target.files.length
                      })
                    })
                    const startResponseJson = await startResponse.json();
                    console.log('Server: ' + startResponseJson.message);
                    if (startResponseJson.status === 200) {
                      transferPopup.style.display = "none";
                      overlay.style.display = "flex";
                      transferPopup.style.display = "flex";
                      let file;
                      for (let i = 0; i < event.target.files.length; i++) {
                        const count = (event.target.files.length - i);
                        const s = count === 1 ? '' : 's'
                        countString.innerText = String(count) + ' file' + s + ' remaining'
                        file = event.target.files[i]
                        const name = file.name
                        const type = file.type
                        const id = idgen(10);
                        const blob = new Blob( [file], { type: type } )
                        const arrayBuffer = await blob.arrayBuffer()
                        const byteArray = new Uint8Array(arrayBuffer);
                        const b64 = btoa(byteArray.reduce((data, byte) => {
                          return data + String.fromCharCode(byte);
                        }, ''));
                        const transferEndpoint = window.location.href + 'fileUpload'
                        try {
                          console.log('Sending file ' + name);
                          const sendResponse = await fetch(transferEndpoint, {
                            method: 'POST',
                            headers: {
                              'Accept': 'application/json',
                              'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                              "id": id,
                              "name": name, 
                              "type": type,
                              "data": b64
                            })
                          })
                          const sendResponseJson = await sendResponse.json();
                          console.log('Server: ' + sendResponseJson.message);
                        }
                        catch (error) {
                          console.log('Error: Could not send file. More info: ' + error)
                        }
                      }
                      
                      overlay.style.display = "none";
                      transferPopup.style.display = "none";
                      try {
                        const finishEndpoint = window.location.href + 'finishTransfer'
                        const finishResponse = await fetch(finishEndpoint, {
                          method: 'POST',
                          headers: {
                            'Accept': 'application/json',
                            'Content-Type': 'application/json'
                          },
                          body: JSON.stringify({
                            "size": event.target.files.length
                          })
                        });
                        const finishResponseJson = await finishResponse.json();
                        console.log('Server: ' + finishResponseJson.message);
                      }
                      catch (error) {
                        console.log('Server: ' + error)
                      }
                    }
                    else {
                      transferPopup.style.display = "none";
                      overlay.style.display = "flex";
                      errorPopup.style.display = "flex";
                      errorMessage.innerText = startResponseJson.message;
                    }
                  }
                  catch (error) {
                    console.log('error requesting transfer:', error);
                    transferPopup.style.display = "none";
                    overlay.style.display = "flex";
                    errorPopup.style.display = "flex";
                    errorMessage.innerText = "Something went wrong. Please try again."
                  }
                }
                document.getElementById('browseFiles').value = '';
              }

              const browseFilesElement = document.getElementById('browseFiles');
              if (browseFilesElement) {
                browseFilesElement.removeEventListener('change', handleFileChange);
                browseFilesElement.addEventListener('change', handleFileChange);
              }

              const setConnected = async (response) => {
                let body = await response.text();
                let device = body ? body.replace(/"/g, '') : 'server'
                connectionStatus.innerHTML = '<span class="connected">Connected to <span id="server-name">' + device + '</span></span>'
              }

              const setDisconnected = () => {
                connectionStatus.innerHTML = '<span class="disconnected">Failed to connect. Retrying...</span>';
              }

              const runCheck = async () => {
                await new Promise((resolve) => setTimeout(resolve, 3000));
                try {
                  let response = await checkConnection();
                  await setConnected(response);
                }
                catch (error) {
                  setDisconnected(error);
                  console.log('Failed to connect to server: ' + error)
                }
                runCheck();
              }

              runCheck();

            })
        </script>
        <header>
          <!--<p>SYNQ</p>-->
          <div id="connection-status">
            <span class="connecting">Connecting to device...</span>
          </div>
          <img id="SYNQ-logo" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMgAAADICAYAAACtWK6eAAAACXBIWXMAAC4jAAAuIwF4pT92AAAGOmlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgOS4xLWMwMDEgNzkuMTQ2Mjg5OTc3NywgMjAyMy8wNi8yNS0yMzo1NzoxNCAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczpkYz0iaHR0cDovL3B1cmwub3JnL2RjL2VsZW1lbnRzLzEuMS8iIHhtbG5zOnBob3Rvc2hvcD0iaHR0cDovL25zLmFkb2JlLmNvbS9waG90b3Nob3AvMS4wLyIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0RXZ0PSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VFdmVudCMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIDI1LjMgKE1hY2ludG9zaCkiIHhtcDpDcmVhdGVEYXRlPSIyMDI0LTA4LTA5VDE1OjQzOjM5LTA0OjAwIiB4bXA6TW9kaWZ5RGF0ZT0iMjAyNC0wOC0wOVQxNTo0NToxNS0wNDowMCIgeG1wOk1ldGFkYXRhRGF0ZT0iMjAyNC0wOC0wOVQxNTo0NToxNS0wNDowMCIgZGM6Zm9ybWF0PSJpbWFnZS9wbmciIHBob3Rvc2hvcDpDb2xvck1vZGU9IjMiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6MzRlY2Q3YmUtNDNiNC00NmJjLWJhNGYtMDk5MDgzYzI3ZDY1IiB4bXBNTTpEb2N1bWVudElEPSJhZG9iZTpkb2NpZDpwaG90b3Nob3A6OGRkM2FhM2EtYjM0Ni1lNjQ2LTg0YTEtODA5MjcwYzcyNGExIiB4bXBNTTpPcmlnaW5hbERvY3VtZW50SUQ9InhtcC5kaWQ6OTgzNDhmMjAtZmU0Ny00Nzc0LWFhZjAtYmNkOGRiZjI0ZjFlIj4gPHhtcE1NOkhpc3Rvcnk+IDxyZGY6U2VxPiA8cmRmOmxpIHN0RXZ0OmFjdGlvbj0iY3JlYXRlZCIgc3RFdnQ6aW5zdGFuY2VJRD0ieG1wLmlpZDo5ODM0OGYyMC1mZTQ3LTQ3NzQtYWFmMC1iY2Q4ZGJmMjRmMWUiIHN0RXZ0OndoZW49IjIwMjQtMDgtMDlUMTU6NDM6MzktMDQ6MDAiIHN0RXZ0OnNvZnR3YXJlQWdlbnQ9IkFkb2JlIFBob3Rvc2hvcCAyNS4zIChNYWNpbnRvc2gpIi8+IDxyZGY6bGkgc3RFdnQ6YWN0aW9uPSJjb252ZXJ0ZWQiIHN0RXZ0OnBhcmFtZXRlcnM9ImZyb20gYXBwbGljYXRpb24vdm5kLmFkb2JlLnBob3Rvc2hvcCB0byBpbWFnZS9wbmciLz4gPHJkZjpsaSBzdEV2dDphY3Rpb249InNhdmVkIiBzdEV2dDppbnN0YW5jZUlEPSJ4bXAuaWlkOjM0ZWNkN2JlLTQzYjQtNDZiYy1iYTRmLTA5OTA4M2MyN2Q2NSIgc3RFdnQ6d2hlbj0iMjAyNC0wOC0wOVQxNTo0NToxNS0wNDowMCIgc3RFdnQ6c29mdHdhcmVBZ2VudD0iQWRvYmUgUGhvdG9zaG9wIDI1LjMgKE1hY2ludG9zaCkiIHN0RXZ0OmNoYW5nZWQ9Ii8iLz4gPC9yZGY6U2VxPiA8L3htcE1NOkhpc3Rvcnk+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+LwAFYAAAHT9JREFUeJztnXm8HeP9x9/PSaSxr0GJoon9Ivallnu0dhpSQuKW0CPEVs0hsZVSO1dpFI1rP4RQsStt77lIbbWF2HOLoj/EriHEnef3xzwz88ycJfeeM2e75/t+veaeWc7MfM99PZ/5Pt/v88zzKK01giDkJ1FrAwShnhGBCEIRRCCCUAQRiCAU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"/>
        </header>
        
        <main>
            <div id="empty">
                <svg id="upload" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 1000 1000">
                    <defs>
                      <style>
                        .cls-1 {
                          fill: none;
                          stroke: #231f20;
                          stroke-linecap: round;
                          stroke-linejoin: round;
                          stroke-width: 100px;
                        }
                  
                        .cls-2 {
                          fill: #fff;
                          stroke-width: 0px;
                        }
                      </style>
                    </defs>
                    <path class="cls-1" d="M941.23,577.28v224.38c0,60.98-50.2,133.64-133.43,133.64H206.69c-91.16,0-151.93-73.98-151.93-133.64v-216.37"/>
                    <g>
                      <line class="cls-2" x1="500" y1="693.54" x2="500" y2="51.49"/>
                      <line class="cls-1" x1="500" y1="693.54" x2="500" y2="51.49"/>
                    </g>
                    <g>
                      <line class="cls-2" x1="251.4" y1="298.08" x2="498" y2="51.49"/>
                      <line class="cls-1" x1="251.4" y1="298.08" x2="498" y2="51.49"/>
                    </g>
                    <g>
                      <line class="cls-2" x1="746.59" y1="298.08" x2="500" y2="51.49"/>
                      <line class="cls-1" x1="746.59" y1="298.08" x2="500" y2="51.49"/>
                    </g>
                  </svg>
                <p class="info-text" style="margin-top: 15px;">Select files for transfer</p>
                <p class="info-text" style="margin-bottom: 15px">Supports: mp3, flac, wav, m4a, aac</p>
                <button id="browse">
                    <label for="browseFiles" id="file-label">
                        Browse
                    </label>
                </button>
                <input type="file" id="browseFiles" style="display:none;" accept="audio/mpeg, audio/flac, audio/wav, audio/mp4, audio/aac, audio/x-m4a" multiple>
            </div>
        </main>
        <div id="overlay">
          <div id="transfer-popup" class="popup">
            <p id="transferCount" style="font-size: 14pt;">
               1 file remaining
            </p>
            <dotlottie-player src="https://lottie.host/369f338a-1c9f-42fd-ab69-4ae003f59b1b/SnX6MiLZSM.json" background="transparent" speed="1" id="loading" loop autoplay></dotlottie-player>
          </div>
          <div id="error-popup" class="popup">
            <img id="close-error" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAgAAAAIACAYAAAD0eNT6AAAACXBIWXMAABE5AAAROQEb2ZNGAAAF0mlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgOS4xLWMwMDEgNzkuMTQ2Mjg5OTc3NywgMjAyMy8wNi8yNS0yMzo1NzoxNCAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczpkYz0iaHR0cDovL3B1cmwub3JnL2RjL2VsZW1lbnRzLzEuMS8iIHhtbG5zOnBob3Rvc2hvcD0iaHR0cDovL25zLmFkb2JlLmNvbS9waG90b3Nob3AvMS4wLyIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0RXZ0PSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VFdmVudCMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIDI1LjMgKE1hY2ludG9zaCkiIHhtcDpDcmVhdGVEYXRlPSIyMDI0LTA3LTIxVDE4OjM3OjM0LTA0OjAwIiB4bXA6TW9kaWZ5RGF0ZT0iMjAyNC0wNy0yMVQxODozOTo0OC0wNDowMCIgeG1wOk1ldGFkYXRhRGF0ZT0iMjAyNC0wNy0yMVQxODozOTo0OC0wNDowMCIgZGM6Zm9ybWF0PSJpbWFnZS9wbmciIHBob3Rvc2hvcDpDb2xvck1vZGU9IjMiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6ZDQyMGYzNDgtNTJmNy00NjNjLWI5ZTUtNTdlNTI0ZGM3ODQ5IiB4bXBNTTpEb2N1bWVu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">
            <h1 style="color: var(--bad);">ERROR</h1>
            <p id="error-message" style="font-size: 14pt;">
            </p>
          </div>
        </div>
    </body>
</html>`);
}

export default Transfer;