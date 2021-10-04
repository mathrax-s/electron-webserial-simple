// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.
window.addEventListener('DOMContentLoaded', () => {
  const replaceText = (selector, text) => {
    const element = document.getElementById(selector)
    if (element) element.innerText = text
  }

  for (const type of ['chrome', 'node', 'electron']) {
    replaceText(`${type}-version`, process.versions[type])
  }
})

const {contextBridge, ipcRenderer} = require('electron')
contextBridge.exposeInMainWorld(
  "api", {
    // シリアルポートの番号を送る
    SetPort: (data) => ipcRenderer.send("set_serialport_p5", data),
    
    // シリアルポートの情報を受け取る
    // ipcRendererが受信したら、
    // その引数を、GetPortの引数にある関数に送る
    GetPort: (f) => {
      ipcRenderer.on("get_serialport_p5", (event, arg) => f(arg));
    }
  })
  
