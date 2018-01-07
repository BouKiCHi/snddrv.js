//
// バッファ操作
//
module.exports = {
  writeLe : function(buffer, value) {  
    buffer.push(value & 0xff);
    buffer.push((value>>8) & 0xff);
    buffer.push((value>>16) & 0xff);
    buffer.push((value>>24) & 0xff);
  },

  writeLePos : function(buffer, pos, value) {  
    buffer[pos] = (value & 0xff);
    buffer[pos + 1] = ((value>>8) & 0xff);
    buffer[pos + 2] = ((value>>16) & 0xff);
    buffer[pos + 3] = ((value>>24) & 0xff);
  },
  writeWordLePos : function(buffer, pos, value) {  
    buffer[pos] = (value & 0xff);
    buffer[pos + 1] = ((value>>8) & 0xff);
  },
  appendData : function(buffer, data) {
    for(var i = 0; i < data.length; i++) buffer.push(data[i] & 0xff);
  },

  copyData : function(buffer, pos, data) {
    for(var i = 0; i < data.length; i++) buffer[pos + i] = (data[i] & 0xff);
  },

  fillBuffer : function(buffer,length) {
    for(var i = 0; i < length; i++) buffer.push(0x00);
  },
  setBuffer : function(buffer) {
    this.buffer = buffer;
  },
  pushArray : function(data) {
    for(var i=0; i<data.length; i++) this.buffer.push(data[i]);
  },
  pushValue : function(value) {
    this.buffer.push(value);
  }
}
