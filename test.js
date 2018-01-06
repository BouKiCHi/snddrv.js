// ログダンプテスト

console.log("LogDump test start.");

var LogDump = require("./logdump_s98");

function writePsgLog() {
  var log = new LogDump();
  log.init(log.LOGTYPE.S98);

  // デバイス追加
  var id = log.addDevice(log.DEVICE_TYPE.PSG,log.CLOCK.BC_3M57,0);

  // CH.A tone = on
  log.writeValue(id,0x07,0x3e);
  // CH.A volume
  log.writeValue(id,0x08,0x0a);
  // CH.A freq fine
  log.writeValue(id,0x00,0xfe);
  // CH.A freq corse
  log.writeValue(id,0x01,0x00);
  log.addWait(3000);

  return log;
}

function writeOpllLog() {
  var log = new LogDump();
  log.init(log.LOGTYPE.S98);

  // デバイス追加
  var id = log.addDevice(log.DEVICE_TYPE.OPLL,log.CLOCK.BC_3M57,0);

  // inst 1 vol 3
  log.writeValue(id,0x30,0x13);
  // pitch h
  log.writeValue(id,0x20,0x09);
  // pitch l
  log.writeValue(id,0x10,0x11);
  // key-on
  log.writeValue(id,0x20,0x19);
  log.addWait(3000);

  return log;
}

function writeLog(filename, log) {
  // ファイル書き込み
  var fs = require('fs');
  var data = new Uint8Array(log.data());
  try {
    fs.writeFileSync(filename,data);
  } catch(e) {
    console.log("error:" + e);
    return;
  }
}

writeLog("psg.s98",writePsgLog());
writeLog("opll.s98",writeOpllLog());

console.log("done.");

