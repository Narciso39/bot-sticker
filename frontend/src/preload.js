const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electron", {
  sendMessage: (msg) => ipcRenderer.send("message", msg),
});
cd