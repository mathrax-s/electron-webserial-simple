// Modules to control application life and create native browser window
const {app, BrowserWindow} = require('electron')
const path = require('path')


let selectedPortInfo = null;

function createWindow () {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 450,
    height:300,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  })

  // and load the index.html of the app.
  mainWindow.loadFile('index.html')

  // Open the DevTools.
  // デバッグツールをつかう
  // mainWindow.webContents.openDevTools()

  mainWindow.webContents.session.on('select-serial-port', (event, portList, webContents, callback) => {
    // console.log('SELECT-SERIAL-PORT FIRED WITH', portList);

    //レンダラープロセスに、送信
    webContents.send('get_serialport_p5',JSON.stringify(portList));
    event.preventDefault();

    let selectedPort = portList.find((device) => {     
      //ipcRendererから送られてきた、
      //選択したポートのJSONをチェックする
      //シリアル番号、USBベンダーID、プロダクトIDが一致するものがあれば、true
      if(selectedPortInfo!=null){
        if( device.serialNumber == selectedPortInfo.serialNumber && 
            device.vendorId == selectedPortInfo.vendorId && 
            device.productId == selectedPortInfo.productId) {
              return true
        }
      }
    });
    if (!selectedPort) {
      // 何もコールバックしない
      callback('')
    } else {
      // シリアルポートのIDをコールバック
      callback(selectedPort.portId)
    }
  });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow()
  
  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
const {ipcMain} = require('electron')
ipcMain.on("set_serialport_p5", (event, arg) => {
  // console.log(arg)
  selectedPortInfo = arg;
});