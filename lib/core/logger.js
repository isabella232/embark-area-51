require('colors');
let fs = require('./fs.js');

class Logger {
  constructor(options) {
    this.events = options.events || {emit: function(){}};
    this.logLevels = ['error', 'warn', 'info', 'debug', 'trace'];
    this.logLevel = options.logLevel || 'info';
    this.logFunction = options.logFunction || console.log;
    this.logFile = options.logFile;
  }
}

Logger.prototype.registerAPICall = function (plugins) {
  const self = this;

  let plugin = plugins.createPlugin('dashboard', {});
  plugin.registerAPICall(
    'ws',
    '/embark-api/logs',
    (ws, _req) => {
      self.events.on("log", function(logLevel, logMsg) {
        ws.send(JSON.stringify({msg: logMsg, msg_clear: logMsg.stripColors, logLevel: logLevel}), () => {});
      });
    }
  );
};

Logger.prototype.writeToFile = function (_txt) {
  if (!this.logfile) {
    return;
  }

  fs.appendFileSync(this.logFile, "\n" + Array.from(arguments).join(' '));
};

Logger.prototype.error = function () {
  if (!arguments.length || !(this.shouldLog('error'))) {
    return;
  }
  this.events.emit("log", "error", ...arguments);
  this.logFunction(...Array.from(arguments).map(t => { return t ? t.red : t; }));
  this.writeToFile("[error]: ", ...arguments);
};

Logger.prototype.warn = function () {
  if (!arguments.length || !(this.shouldLog('warn'))) {
    return;
  }
  this.events.emit("log", "warn", ...arguments);
  this.logFunction(...Array.from(arguments).map(t => { return t ? t.yellow : t; }));
  this.writeToFile("[warning]: ", ...arguments);
};

Logger.prototype.info = function () {
  if (!arguments.length || !(this.shouldLog('info'))) {
    return;
  }
  this.events.emit("log", "info", ...arguments);
  this.logFunction(...Array.from(arguments).map(t => { return t ? t.green : t; }));
  this.writeToFile("[info]: ", ...arguments);
};

Logger.prototype.debug = function () {
  if (!arguments.length || !(this.shouldLog('debug'))) {
    return;
  }
  this.events.emit("log", "debug", ...arguments);
  this.logFunction(...arguments);
  this.writeToFile("[debug]: ", ...arguments);
};

Logger.prototype.trace = function () {
  if (!arguments.length || !(this.shouldLog('trace'))) {
    return;
  }
  this.events.emit("log", "trace", ...arguments);
  this.logFunction(...arguments);
  this.writeToFile("[trace]: ", ...arguments);
};

Logger.prototype.dir = function (txt) {
  if (!txt || !(this.shouldLog('info'))) {
    return;
  }
  this.events.emit("log", "dir", txt);
  this.logFunction(txt);
  this.writeToFile("[dir]: ");
  this.writeToFile(txt);
};

Logger.prototype.shouldLog = function (level) {
  return (this.logLevels.indexOf(level) <= this.logLevels.indexOf(this.logLevel));
};

module.exports = Logger;
