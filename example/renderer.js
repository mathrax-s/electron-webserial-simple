// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// No Node.js APIs are available in this process because
// `nodeIntegration` is turned off. Use `preload.js` to
// selectively enable features needed in the rendering
// process.


// シリアル通信 関連
let port;
let serialPortList ;
let portCustomNameList ;

let reader;
let lineBuffer;
let latestData = [];  // この配列に受信データが入る

let inputDone;
let outputDone;
let inputStream;
let outputStream;


// p5js
const s = (p) => {
    let dropDownList ;
    let button = [] ;
    let buttonName = ['ポート更新','接続','切断'] ;
    let nowSelect = null;
    let lastSelect = null;
    let lastPortName = null;

    p.setup = () =>{
      p.createCanvas(p.windowWidth, p.windowHeight);
      for(let i=0; i<3; i++){
          button[i] = p.createButton(buttonName[i]);
          button[i].position(240 + 60 * i, 30);
          button[i].size(60, 60);
      }

      button[0].mousePressed(p.updatePortButton);
      button[1].mousePressed(p.connectPortButton);
      button[2].mousePressed(p.disconnectPortButton);
      
      dropDownList = p.createSelect();
      dropDownList.position(30, 40);
      dropDownList.size(170, 30);
      dropDownList.option('select...');
      dropDownList.selected('select...');
      // ドロップダウン項目が選択されたときに呼ばれる関数のはずだけど
      // シリアル通信と一緒に使うと呼ばれないときがあるので
      // drawのなかで、項目のチェックを行うことにしています
      // dropDownList.changed(p.dropdownChanged);
    }
    
    p.draw = () =>{
      p.background(255,200,100);

      //ドロップダウン項目の選択されたものをチェック
      p.dropdownChecking();

      //シリアル受信した値を表示する
      if(latestData!=null){
        let data = [];
        for(let i=0; i<latestData.length; i++){
          p.fill(255);
          p.textSize(24);
          p.text(latestData[i], 50 + 100*i, 150);

          data[i] = p.map(latestData[i], -2024,2047, 0, 100);
          p.rect(50+100*i, 180, data[i],5);
        }
      }
    }

    //ドロップダウン項目の追加
    //このとき前回選んだ項目があれば、それを選択する
    p.setDropdownOption = (_op) =>{
      dropDownList.option(_op);

      //最後に選んだ項目があれば、
      if(lastPortName!=null){
        //最後に選んだ項目を、自動的に選択する
        //（切断するたびに何度もドロップダウンで選ぶ手間を省くため）
        dropDownList.selected(lastPortName);
      }
    }

    //ドロップダウン項目をチェックする
    p.dropdownChecking = () =>{
      nowSelect = dropDownList.value();
      //もし以前に選んだ項目とちがうときは、
      if(nowSelect != lastSelect){
        //ポート選択情報もアップデートする
        p.portSelectUpdate();
        lastSelect = nowSelect;
      }
    }

    //シリアルポート
    //ポートの更新
    p.updatePortButton = () =>{
      p.updatePort();
    }

    p.updatePort = async () => {
      //ドロップダウンとシリアル通信と一緒に使うと、
      //ドロップダウンが機能しなくなるので
      //やむなく強引に解決したもので、
      //いったんremoveして、新しく生成することにしています
      dropDownList.remove()

      dropDownList = p.createSelect();
      dropDownList.position(30, 40);
      dropDownList.size(170, 30);
      dropDownList.option('select...');

      //updateSerialPort()で、
      //main.jsに、シリアルポートのリクエストを行い、
      //返ってくる情報から、ドロップダウンの項目をつくります
      await updateSerialPort();
    }

    //ポート選択情報をアップデートする
    p.portSelectUpdate=() =>{
      if(nowSelect != null){
        //選んだポート名が、JSONにあるとき、そのJSONをメインに送る
        if( (nowSelect != 'select...')){
          let index = null;
          for(let i=0; i<serialPortList.length; i++){  
            if(serialPortList != null){
              //今選んだドロップダウン項目に、portNameが含まれているかどうかチェック
              let result = nowSelect.indexOf(serialPortList[i].portName);
              if(result !== -1){
                index = i;
                // console.log("index : "+i)
              }
            }
          }
          if(index != null){
					  const sendData = serialPortList[index];
            //main.jsに、選んだポートのJSONを送信する
					  window.api.SetPort(sendData);
            //いま選んだポートの名前をlastPortNameに格納
            //（ドロップダウンの項目を追加するとき、
            // lastPortNameが存在すればそれを選ぶようにするため）
            lastPortName = portCustomNameList[index];
          }
        }
      }
    }

    //ポートの接続
    p.connectPortButton = async () => {
      //ポートが使われていたら切断する
      if(port){
        await disconnectSerialPort();
        port = null;
      }
      //シリアルポートと接続する
      await connectSerialPort();
      p.updatePort();
    }

    //ポートの切断
    p.disconnectPortButton = async() =>{
      //ポートが使われていたら切断する
      if(port!=null){
        await disconnectSerialPort();
      }
    }
}
const app = new p5(s)





const updateSerialPort = async () =>{
  try{
	  let updateport = await navigator.serial.requestPort();
  }catch (e){

  }
}

const connectSerialPort = async() =>{
  const filters = [
    { usbVendorId: 0x0d28,	usbProductId: 0x0204} 	//micro:bit ID.
  ];

  const options = {
    baudRate: 115200,
    dataBits: 8,
    parity: 'none',
    stopBits: 1,
    flowControl: 'none',
  };

  port = null;
  latestData = null;
  try{
  	port = await navigator.serial.requestPort();
  }
  catch (e){
	  return
  }

  try{
    await port.open(options);
  }
  catch (e){
	  return
  }
  // CODELAB: Add code setup the output stream here.
  const encoder = new TextEncoderStream();
  outputDone = encoder.readable.pipeTo(port.writable);
  outputStream = encoder.writable;


  // CODELAB: Add code to read the stream here.
  let decoder = new TextDecoderStream();
  inputDone = port.readable.pipeTo(decoder.writable);
  inputStream = decoder.readable;

  reader = inputStream.getReader();
  readLoop();
}

const disconnectSerialPort = async () => {
  // CODELAB: Close the input stream (reader).
  if (reader) {
    await reader.cancel();
    await inputDone.catch(() => {});
    reader = null;
    inputDone = null;
  }
  // CODELAB: Close the output stream.
  if (outputStream) {
    await outputStream.getWriter().close();
    await outputDone;
    outputStream = null;
    outputDone = null;
  }
  // CODELAB: Close the port.
  await port.close();
  port = null;
}

/**
 * @name readLoop
 * Reads data from the input stream and displays it on screen.
 */
const readLoop = async () => {
  // CODELAB: Add read loop here.
  while (true) {
    const {
      value,
      done
    } = await reader.read();
    if (value) {
      lineBuffer += value;
      let lines = lineBuffer.split('\n');
      if (lines.length > 1) {
        latestData = lineBuffer.split(',');
        lineBuffer = lines.pop().trim();
      }
    }
    if (done) {
      reader.releaseLock();
      break;
    }
  }
}

const writeToStream = (...lines) => {
  // CODELAB: Write to output stream
  const writer = outputStream.getWriter();
  lines.forEach((line) => {
    console.log('[SEND]', line);
    writer.write(line + '\n');
  });
  writer.releaseLock();
}

const getSerialList = (port_info) =>{
  serialPortList = JSON.parse(port_info);
  // console.log(serialPortList);
  portCustomNameList = [];

	for(let i=0; i<serialPortList.length; i++){
		let sp = '';
		sp += serialPortList[i].portName ;
		if(serialPortList[i].displayName != null){
			sp +=(' ('+serialPortList[i].displayName+')');
		}
		app.setDropdownOption(sp);
    portCustomNameList[i] = sp;
    // console.log("port " + i + ":" + sp);
	}
	
}

window.api.GetPort((arg) => getSerialList(arg));