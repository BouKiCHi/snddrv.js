// ログ
var LogDump = function() {
  this.S98_MAGIC = [0x53,0x39,0x38,0x33]; // S983
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
    OPL3 : 9,
    PSG_8910 : 15,
    DCSG : 16
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

  // UNIT:us
  this.syncUs = 10000;
  this.timeUs = 0;
};

//
// 種別
//
LogDump.prototype.getExtension = function() {
  return ".s98";
}

LogDump.prototype.addDevice = function(deviceType,clock,pan) {
  var id = this.deviceMap.length;
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
  this.dump.appendData(result,this.S98_MAGIC);
  this.dump.writeLe(result,0); // タイマー分子
  this.dump.writeLe(result,0); // タイマー分母
  this.dump.writeLe(result,0); // 予約
  this.dump.writeLe(result,0); // タグ位置 // 0x10
  this.dump.writeLe(result,0); // ダンプデータ
  this.dump.writeLe(result,0); // ループポイント
  this.dump.writeLe(result,this.deviceMap.length); // デバイス数

  for(var i=0; i < this.deviceMap.length; i++) {
    var d = this.deviceMap[i];
    this.dump.writeLe(result,d.type);
    this.dump.writeLe(result,d.clock);
    this.dump.writeLe(result,d.pan);
    this.dump.writeLe(result,0);
  }

  // ダンプ位置の設定
  this.dump.writeLePos(result,0x14,result.length);
  return result;
};

LogDump.prototype.addWait = function(timeMs) {
  this.timeUs += (1000 * timeMs);
};

LogDump.prototype.addWaitUs = function(timeUs) {
  this.timeUs += timeUs;
};


LogDump.prototype.writeWait = function() {
  var c = 0;
  while(this.timeUs >= this.syncUs) {
    this.timeUs -= this.syncUs;
    c++;
  }
 
  if (c == 0) return;

  if (c < 2) {
    this.dump.pushValue(0xff);
    return;
  }

  // c >= 2
  this.dump.pushValue(0xfe);
  c-=2;

  // 可変長リトルエンディアン数 : 7bit = 1で継続
  while(1) {
    var v = c & 0x7f;
    c >>= 7;
    if (!c) { 
      this.dump.pushValue(v);
      break;
    }
    this.dump.pushValue(v | 0x80);
  }
};


LogDump.prototype.writeValue = function(id,address,value) {

  this.writeWait();

  // デバイス アドレス データ
  var cmd = (id*2);
  if (address >= 0x100) cmd++;

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