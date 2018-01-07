// ログ
var LogDump = function() {
  this.NLG_MAGIC = [0x4E,0x4C,0x47,0x31]; // NLG1

  this.DEVICE_TYPE = {
    NONE : 0,
    PSG  : 1,
    OPN  : 2,
    OPN2 : 3,
    OPNA : 4,
    OPM  : 5,
    OPLL : 6,
    OPL  : 7,
    OPL2 : 8,
    OPL3 : 9
  };

  this.CLOCK = {
    BC_4M00 : 4000000,
    BC_3M57 : 3579545,
    BC_7M98 : 7987200,
    BC_14M3 : 14318180
  };
  this.dump = require("./dump");
};

LogDump.prototype.init = function() {
  this.buffer = [];
  this.dump.setBuffer(this.buffer);
  
  this.deviceMap = [];
  this.fmCount = 0;
  this.psgCount = 0;

  // UNIT:us
  this.syncUs = 10000;
  this.timeUs = 0;

  this.timerSetting = false;
};

//
// 種別
//
LogDump.prototype.getExtension = function() {
  return ".nlg";
}

LogDump.prototype.isTypeFm = function(deviceType) {
  switch(deviceType) {
    case this.DEVICE_TYPE.OPN:
    case this.DEVICE_TYPE.OPN2:
    case this.DEVICE_TYPE.OPNA:
    case this.DEVICE_TYPE.OPM:
    case this.DEVICE_TYPE.OPLL:
    case this.DEVICE_TYPE.OPL:
    case this.DEVICE_TYPE.OPL2:
    case this.DEVICE_TYPE.OPL3:
      return true;
  }
  return false;
}

// 失敗時:-1
LogDump.prototype.addDevice = function(deviceType,clock,pan) {
  var isFm = this.isTypeFm(deviceType);
  var id = -1;

  if (isFm && this.fmCount < 3) {
      id = 1 + this.fmCount;
      this.fmCount++;
  }

  if (!isFm && this.psgCount < 1) {
    id = this.psgCount;
    this.psgCount++;
  }

  this.deviceMap.push({
    type: deviceType,
    clock: clock,
    pan: pan
  });

  return id;
};

// ヘッダ
LogDump.prototype.header = function(data) {
  var result = [];
  this.dump.fillBuffer(result,0x60);
  this.dump.copyData(result, 0, this.NLG_MAGIC);
  this.dump.writeWordLePos(result,4, 110); // NLG_VER
  this.dump.writeLePos(result,72, this.CLOCK.BC_4M00);
  return result;
};

LogDump.prototype.addWait = function(timeMs) {
  this.timeUs += (1000 * timeMs);
};

LogDump.prototype.addWaitUs = function(timeUs) {
  this.timeUs += timeUs;
};

LogDump.prototype.writeCtc = function() {
  var ctc0 = Math.floor(this.syncUs / 128);
  this.dump.pushValue(0x81); // CTC0
  this.dump.pushValue(ctc0);
  this.dump.pushValue(0x82); // CTC3
  this.dump.pushValue(0x02);
}

LogDump.prototype.writeWait = function() {
  var c = 0;
  while(this.timeUs >= this.syncUs) {
    this.timeUs -= this.syncUs;
    c++;
  }
 
  if (c == 0) return;

  if (!this.timerSetting) {
    this.timerSetting = true;
    this.writeCtc();
  }

  while(c > 0) {
    this.dump.pushValue(0x80);
    c--;
  }
};


LogDump.prototype.writeValue = function(id, address, value) {

  this.writeWait();

  // デバイス アドレス データ
  var cmd = id;
  if (address >= 0x100) cmd+=0x40;

  this.dump.pushValue(cmd);
  this.dump.pushValue(address & 0xff);
  this.dump.pushValue(value & 0xff);
};

LogDump.prototype.data = function() {
  this.writeWait();
  var result = this.header();
  return result.concat(this.buffer);　
}

module.exports = LogDump;