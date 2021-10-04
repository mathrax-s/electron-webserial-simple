# Electron Fiddle +  WebSerialAPI + p5js

<a href = "https://www.electronjs.org/fiddle">Electron Fiddle</a>をつかって、シリアル通信アプリケーション（試作）をつくりました。Electron v15.0.0以降で動作します。シリアル通信には「WebSerialAPI」をつかっていて、プルダウンメニューでシリアルポートを選べるようにしています。

「WebSerialAPI」は、まだ実験段階ということで、Electronにするとシリアルポート選択のGUIが提供されません。そこでp5jsでプルダウンメニューをつくって、シリアルポートを選べるようにつくりました。

<img src = "./screenshot_01.png"></img>

<img src = "./screenshot_02.png"></img>



micro:bitの加速度センサXYZの信号を受信しているところです。

<img src = "./screenshot_03.png"></img>





## micro:bitのテストプログラム

https://makecode.microbit.org/_Uf3KRD5mUTxc

<img src = "./microbit.png"></img>



## 参考

- WebSerialAPIについて参考にさせていただきました

  https://codelabs.developers.google.com/codelabs/web-serial#2
  
  

- ElectronとWebSerialAPIについて参考にさせていただきました

  https://gist.github.com/jkleinsc/284893c7f01d3cb4559508ca06919481#file-main-js-L21

  

- ElectronでWebSerialの「ポート選択のGUIがありません」という情報

	https://github.com/electron/electron/issues/22478#issuecomment-898650533
	
	


- WebSerialAPIとp5js

  https://editor.p5js.org/kuzeshozo/sketches/ahXeFwTB3