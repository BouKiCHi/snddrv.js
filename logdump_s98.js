// ログ
var LogDump = function() {
  this.S98_MAGIC = [0x53,0x39,0x38]; // S98

  this.LOGTYPE = {
    S98 : 1
  };

  this.buffer = [];
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
    PSG  : 15,
    DCSG : 16
  };

  this.CLOCK = {
    BC_4M00 : 4000000,
    BC_3M57 : 3579545,
    BC_7M98 : 7987200,
    BC_14M3 : 14318180
  };


  this.device_map = [];

  // UNIT:us
  this.sync_us = 10000;
  this.time_us = 0;
};

LogDump.prototype.init = function(filetype) {
};

LogDump.prototype.addDevice = function(deviceType,clock,pan) {
  var id = this.device_map.length;
  this.device_map.push({
    type: deviceType,
    clock: clock,
    pan: pan
  });
  return id;
};

LogDump.prototype.addWait = function(time_ms) {
  this.time_us += (1000 * time_ms);
};

LogDump.prototype.addWaitUs = function(time_us) {
  this.time_us += time_us;
};


LogDump.prototype.writeWait = function() {
  // 時間
  var c = 0;
  while(this.time_us >= this.sync_us) {
    this.time_us -= this.sync_us;
    c++;
  }
 
  if (c == 0) return;

  if (c < 2) {
    this.push_value(0xff);
    return;
  }

  // c >= 2
  this.push_value(0xfe);
  c-=2;

  // 可変長リトルエンディアン数 : 7bit = 1で継続
  while(1) {
    var v = c & 0x7f;
    c >>= 7;
    if (!c) { 
      this.push_value(v);
      break;
    }
    this.push_value(v | 0x80);
  }
};


LogDump.prototype.writeValue = function(id,address,value) {

  this.writeWait();

  // デバイス アドレス データ
  var cmd = (id*2);
  if (address >= 0x100) cmd++;

  this.push_value(cmd);
  this.push_value(address & 0xff);
  this.push_value(value & 0xff);
};

LogDump.prototype.writeLe = function(buffer, value) {  
  buffer.push(value & 0xff);
  buffer.push((value>>8) & 0xff);
  buffer.push((value>>16) & 0xff);
  buffer.push((value>>24) & 0xff);
};

LogDump.prototype.writeLePos = function(buffer,pos, value) {  
  buffer[pos] = (value & 0xff);
  buffer[pos + 1] = ((value>>8) & 0xff);
  buffer[pos + 2] = ((value>>16) & 0xff);
  buffer[pos + 3] = ((value>>24) & 0xff);
}


LogDump.prototype.header = function(data) {
  var result = this.S98_MAGIC;
  result.push(0x33); // '3'
  this.writeLe(result,0); // タイマー分子
  this.writeLe(result,0); // タイマー分母
  this.writeLe(result,0); // 予約
  this.writeLe(result,0); // タグ位置 // 0x10
  this.writeLe(result,0); // ダンプデータ
  this.writeLe(result,0); // ループポイント
  this.writeLe(result,this.device_map.length); // デバイス数

  for(var i=0; i < this.device_map.length; i++) {
    var d = this.device_map[i];
    this.writeLe(result,d.type);
    this.writeLe(result,d.clock);
    this.writeLe(result,d.pan);
    this.writeLe(result,0);
  }

  // ダンプ位置の設定
  this.writeLePos(result,0x14,result.length);
  return result;
};


LogDump.prototype.push_array = function(data) {
  for(var i=0; i<data.length; i++) this.buffer.push(data[i]);
};

LogDump.prototype.push_value = function(value) {
  this.buffer.push(value);
};

LogDump.prototype.data = function() {
  this.writeWait();
  var result = this.header();
  return result.concat(this.buffer);
}

module.exports = LogDump;