// ログ

module.exports = {
  LOGTYPE : {
    S98 : 0,
    NLG : 1
  },
  getLogInstance : function(type) {
    var LogClass = null;
    switch(type) {
      case this.LOGTYPE.S98:
        LogClass = require("./log_s98");
      break;
      case this.LOGTYPE.NLG:
        LogClass = require("./log_nlg");
      break;
      default:
        return null;
    }
    var log = new LogClass();
    log.init();
    return log;
  }
}