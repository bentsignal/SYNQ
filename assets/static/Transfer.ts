const Transfer = () => {
  return (`<!DOCTYPE html>
  <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>n-synk</title>
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
  
              #synk-logo {
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
  
              #popup {
                background-color: var(--popup);
                border-radius: 15px;
                padding: 10px 25px;
                user-select: none;
                text-align: center;
                display: flex;
                justify-content: flex-start;
                align-items: center;
                flex-direction: column;
                position: relative;
                height: 100px;
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
  
              .connecting {
                color: white;
              }
  
              .connected {
                color: rgb(175, 248, 175);
              }
  
              .disconnected {
                color: rgb(250, 89, 89);
              }
  
          </style>
      </head>
      <body>
        <script src="https://unpkg.com/@dotlottie/player-component@latest/dist/dotlottie-player.mjs" type="module"></script> 
        <script>
              document.addEventListener('DOMContentLoaded', () => {
                const overlay = document.getElementById('overlay')
                const count = document.getElementById('transferCount');
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
                
                document.getElementById('browseFiles').addEventListener('change', async (event) => {
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
                      console.log('Server: ' + startResponse.statusText)
                      overlay.style.display = "flex";
                      let file;
                      for (let i = 0; i < event.target.files.length; i++) {
                        count.innerText = (event.target.files.length - i);
                        file = event.target.files[i]
                        const name = file.name
                        const type = file.type
                        const blob = new Blob( [file], { type: type } )
                        const arrayBuffer = await blob.arrayBuffer()
                        const byteArray = new Uint8Array(arrayBuffer);
                        const b64 = btoa(byteArray.reduce((data, byte) => {
                          return data + String.fromCharCode(byte);
                        }, ''));
                        console.log('Sending file ' + name)
                        const transferEndpoint = window.location.href + 'fileUpload'
                        try {
                          const sendResponse = await fetch(transferEndpoint, {
                            method: 'POST',
                            headers: {
                              'Accept': 'application/json',
                              'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                              "name": name, 
                              "type": type,
                              "data": b64
                            })
                          })
                          console.log('Server: ' + sendResponse.statusText)
                        }
                        catch (error) {
                          console.log('Error: Could not send file. More info: ' + error)
                        }
                      }
                      overlay.style.display = "none";
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
                        })
                        console.log('Server: ' + finishResponse.statusText)
                      }
                      catch (error) {
                        console.log('Server: ' + error)
                      }
                    }
                    catch (error) {
                      console.log(error)
                    }
                  }
                })
  
                const setConnected = async (response) => {
                  let body = await response.text()
                  connectionStatus.innerHTML = '<span class="connected">Connected to ' + body + '</span>'
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
            <p>n-synk</p>
            <div id="connection-status">
              <span class="connecting">Connecting to server...</span>
            </div>
            <img id="synk-logo" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAYAAABw4pVUAAAACXBIWXMAAC4jAAAuIwF4pT92AAAGOmlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgOS4xLWMwMDEgNzkuMTQ2Mjg5OTc3NywgMjAyMy8wNi8yNS0yMzo1NzoxNCAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczpkYz0iaHR0cDovL3B1cmwub3JnL2RjL2VsZW1lbnRzLzEuMS8iIHhtbG5zOnBob3Rvc2hvcD0iaHR0cDovL25zLmFkb2JlLmNvbS9waG90b3Nob3AvMS4wLyIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0RXZ0PSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VFdmVudCMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIDI1LjMgKE1hY2ludG9zaCkiIHhtcDpDcmVhdGVEYXRlPSIyMDI0LTA2LTI2VDIwOjEwOjA0LTA0OjAwIiB4bXA6TW9kaWZ5RGF0ZT0iMjAyNC0wNi0yNlQyMDoxMDo1NS0wNDowMCIgeG1wOk1ldGFkYXRhRGF0ZT0iMjAyNC0wNi0yNlQyMDoxMDo1NS0wNDowMCIgZGM6Zm9ybWF0PSJpbWFnZS9wbmciIHBob3Rvc2hvcDpDb2xvck1vZGU9IjMiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6NTMwM2U5NjctMWIxZi00Nzk4LWFkMzItZmQ3NDgwZTBiOGRmIiB4bXBNTTpEb2N1bWVudElEPSJhZG9iZTpkb2NpZDpwaG90b3Nob3A6YzBjYzRkZGUtMDEwYy1mOTRjLWJlMWItYWRkZTZmYzBkYzJiIiB4bXBNTTpPcmlnaW5hbERvY3VtZW50SUQ9InhtcC5kaWQ6ZDIyYTJmYTEtNWM1NC00NDllLTlmZDktMDYzOTk4ZTc4YWE1Ij4gPHhtcE1NOkhpc3Rvcnk+IDxyZGY6U2VxPiA8cmRmOmxpIHN0RXZ0OmFjdGlvbj0iY3JlYXRlZCIgc3RFdnQ6aW5zdGFuY2VJRD0ieG1wLmlpZDpkMjJhMmZhMS01YzU0LTQ0OWUtOWZkOS0wNjM5OThlNzhhYTUiIHN0RXZ0OndoZW49IjIwMjQtMDYtMjZUMjA6MTA6MDQtMDQ6MDAiIHN0RXZ0OnNvZnR3YXJlQWdlbnQ9IkFkb2JlIFBob3Rvc2hvcCAyNS4zIChNYWNpbnRvc2gpIi8+IDxyZGY6bGkgc3RFdnQ6YWN0aW9uPSJjb252ZXJ0ZWQiIHN0RXZ0OnBhcmFtZXRlcnM9ImZyb20gYXBwbGljYXRpb24vdm5kLmFkb2JlLnBob3Rvc2hvcCB0byBpbWFnZS9wbmciLz4gPHJkZjpsaSBzdEV2dDphY3Rpb249InNhdmVkIiBzdEV2dDppbnN0YW5jZUlEPSJ4bXAuaWlkOjUzMDNlOTY3LTFiMWYtNDc5OC1hZDMyLWZkNzQ4MGUwYjhkZiIgc3RFdnQ6d2hlbj0iMjAyNC0wNi0yNlQyMDoxMDo1NS0wNDowMCIgc3RFdnQ6c29mdHdhcmVBZ2VudD0iQWRvYmUgUGhvdG9zaG9wIDI1LjMgKE1hY2ludG9zaCkiIHN0RXZ0OmNoYW5nZWQ9Ii8iLz4gPC9yZGY6U2VxPiA8L3htcE1NOkhpc3Rvcnk+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+5kA7+gAACElJREFUeJztnXuMXUUdxz+7wi60q2Jh0S5ailREFILWiI2Rh4otBRFTDAlg1IhPHlESiSYmGB//1MRgUxMCEmMIDdAGTCsYS9SiKFJBCWiRtGpB21oWleJu221pv/7xu9fdvc6ce+acc+8599z5JJNNdvbOmbuf85jH78wMSCJSHQbLrkBkNlFIxYhCKkYUUjGikIoRhVSMKKRiRCEV44iyK5CRo4DTgDMaP18HzG+kY7HvdRQwDOwB9gL7gF3As420FXiikaa6W30/Az3SUx8Bzp2R3kpxV/dLwB+BnwMPAJswgaVQZSEjwEXAh4Hl2BnfjingL8BOYDcwDrwIHG7kDwKvaKTjgYWNNHdGGQeAjcAaYD0wmetbBFJFIWcC1wCXA0cn/N0h4FHsjN4MbAG2YWd8KPOBtwGLgbOAczBJk8BdwE3AkxnKDUdSVdIySQ8pmT2Sbpd0saSRDtZlSNJ5klZK2t449k8bdezo/6FsCUhaKuk3bURslHSJpOES6jcg6WxJt0qakLRJ0pI6CjlZ0n0JEg5IulnSohLr2JrmSfqypB2S1koaq4OQYUk3StrfRsSCCgjwpSFJ10raJulqSYNFld3th/qbsNbLmZ78nwCfB/7UpfrkZQS4AXg7cBXWustHF8+qz0na57kqdktaUYEzP2s6RdLdki7ohStkCLgF+KgnfwPwCazP0MsMAJ/EmurfyVxIh4W8GrgXWOLIOwh8AfhuJytQAm8GlgKrsU5mEJ0UchI2FHGyI28c64E/2KmDl8xcYAWwjsBhmE4JWYT1oE9w5G0D3gc804kDV4gB4L3ArwmQ0gkhbwR+gY0VtfIH4D30/vMihDECWl9FCxnDzogTHXmPYVfGC0UesG4UKeSVwC+B0x15W4F30V9XRiaKmlMYBO7GLWMX8H6ijFQUJeRG7J/eykHgQ8D2go5Te4q4ZS0HfoS1Klr5LHBz3gP0E3mFjGITQ8c58u4ArsxTeD+S95Z1E24ZO7FZv0ggeYRcgk2zuvgUsXmbiay3rKOBp7Hwm1bWYcMikQxkvUKuxy1jCpsfiEwz1EipyCLkNcCXPHmrgL9mKLOuDGF3jHWklJJFyA3YTFkrk8DKDOXVlaaMDzRSKimhQuZhD2wX3wOeDyyvrsyU0SSVlFAh1zA7yq/JIeBbgWXVFZeMJm2lhLSyjgR2YJ3BVtYDH0xbUI1JkjGTDcClOGYUQ66Qi3DLALtd9TtpZUDClRIi5OOe348DPw4op46EyGjilJJWyPHYIKKLDWQLcK4LWWQ0+T8paYUsB17myVufoSJ1IY+MJrOkpBXiO+BBLLKkH5mDTTvkkdHkf1LStLKGsf6FqzO4GXufoh/5Nhaw4WIhNqXtYhx/0MP6NO8YLsYtA+BXKT5fV65PyPsh/m7AKuAbvg+muWW5og6bbE7x+chs/p2UmUZI0i2pV6LUu83LE/L+nvTBNELekZC3NcXn+xFfBxosctNLOyHDwAJP3i66/IZqD+Ga1gYQOYUswh1NAnFk18dc7K1eF8/SZpGCNEJ8xMA3N29IyGvbCGon5LUJef9pV3ifcmpC3iPtPtxOyKvC6hIhuRH0cLsPD0j6GnCxJ38Mf4thD/4Q0Z+R3HGqM4/gljKBPewTnyEDkooYIJvJA1jMVmkLuJTIHCwe7UhH3j3YW1WJDGKzVpdiw+h52YBNZPWjDIDzccuAlP/f5jOkCCneack+wnfrPwTcn6aAmQ/1PFKiDFs0zXfbvx94Lk0hra2sLFKiDOMC/A2g76ctxNXsDZESZUxzlef349hEVip8/ZA0UqKMaU4ALvTkrcZmVlOR1DFMkhJlzOaLuGMOJjEhqWnXU3dJiTJmcxz+29UtwL9CCksbudjsPEKU0cpK7AppZQIbaPxHSGEhoaTN2KEoY5qTgKeweaNWvgJ8M7TAKq5K2kusxe4YrfwNW2JkX2iBcanx7FyIWwbAdWSQAfEKycox2GrYY468NcAVWQuOV0g2VuOW8Ty2ZmRmopBwPoP7ChC2jGGuqe0oJIyzsMhDF18n5YhuEvEZkp6F2FpgroiSjdjg4mFHXhBRSDpGsThmV0TJk8C7sSnt3MRbVnuOwd4Qc8l4BlhGQTIgXIirZVFnRrFV8hY78p7DloPNv5r1DEKFvICtm+iLZqwTJ2LPjLc48nZgSxY+XfRBQ4XsxSr5Edzvq9eFc4Df4o7c/DP2zEiM0c1KlmfIXuBO4NPYKs5142oslMk1HfswdmV0bD2XvK2s64D9wK1Yx6iXGQVuwx+o8ANsWZGOjnbnbWWtwkY27wJOyV+d0liBLfLskrEfu2o+RhemHorqh4xhqzk8ik3YTBRRaBc4FVumcKkn/3Fs1bynulSfwvohO7GIxd3Yl7iWgEW7SmABtlrqE7hlTAFfBd5JF2UAHdnQZUy2P9MO2X5N8yqw4UozLZJtp3RAfu6T7Y9VSh07WfgS2Y5mE7Idzs6W7XjW7S85LNvhbWOCBMl2iltalohuCGmmZbI9ACXbE3ClbI/AoQ4ec0S21+Htsr0Pk3hIXdifMG3q5uDi6djkzWVM76L5IPY+xWPA77AXSUM5AuvAnYa9l3EutkmXb20WsOnVNdhE0+MZjtkxyhjtnYtFiV+OrRc/8+E/ib0EtB0bK3oR9162o9h2SmPA63FHfbSyH5uvWIuFdlayJVj28Psc7Iw+HzgP6/kXtaX4YeD32E4/m7CrsfLvRZYtpJVhbI/0M7Dh7gWNNB9bvHkOtqjLFHbGvwT8E7vV7cI6qVuw5uyWxt/0FFUT0vfECaqKEYVUjCikYkQhFSMKqRhRSMWIQipGFFIxopCK8V/rL1tHSEW5awAAAABJRU5ErkJggg=="/>
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
                  <p class="info-text" style="margin-top: 15px;">Select files for transfer. You can send multiple files at once.</p>
                  <p class="info-text" style="margin-bottom: 15px">Supports: mp3</p>
                  <button id="browse">
                      <label for="browseFiles" id="file-label">
                          Browse
                      </label>
                  </button>
                  <input type="file" id="browseFiles" style="display:none;" accept="audio/mpeg" multiple>
              </div>
          </main>
          <div id="overlay">
            <div id="popup">
              <p style="font-size: 14pt;">
                 <span id="transferCount">0</span> files remaining
              </p>
              <dotlottie-player src="https://lottie.host/369f338a-1c9f-42fd-ab69-4ae003f59b1b/SnX6MiLZSM.json" background="transparent" speed="1" id="loading" loop autoplay></dotlottie-player>
            </div>
          </div>
      </body>
  </html>`)
}

export default Transfer