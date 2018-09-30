const async = require('async');
let serveStatic = require('serve-static');
const {canonicalHost, defaultHost, dockerHostSwap} = require('../../utils/host');
const expressWebSocket = require('express-ws');
const express = require('express');
const fs = require('../../core/fs');
require('http-shutdown').extend();
var express = require('express');
let path = require('path');
var expressWebSocket = require('express-ws');
var bodyParser = require('body-parser');
var fs = require('../../core/fs.js');

const WEB_SOCKET_STATE_OPEN = 1;

class Server {
  constructor(options) {
    this.buildDir = options.buildDir;
    this.events = options.events;
    this.port = options.port || 8000;
    this.hostname = dockerHostSwap(options.host) || defaultHost;
    this.isFirstStart = true;
    this.opened = false;
    this.openBrowser = options.openBrowser;
  }

  start(callback) {
    const self = this;
    if (this.server && this.server.listening) {
      let message = __("a webserver is already running at") + " " +
          ("http://" + canonicalHost(this.hostname) +
           ":" + this.port).bold.underline.green;
      return callback(null, message);
    }

    const coverage = serveStatic(fs.dappPath('coverage/__root__/'), {'index': ['index.html', 'index.htm']});
    const coverageStyle = serveStatic(fs.dappPath('coverage/'));
    const main = serveStatic(this.buildDir, {'index': ['index.html', 'index.htm']});

    this.app = express();
    expressWebSocket(this.app);

    this.app.use(main);
    this.app.use('/coverage', coverage);
    this.app.use(coverageStyle);

    app.use(bodyParser.json()); // support json encoded bodies
    app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

    expressWebSocket(this.app);

    this.app.ws('/logs', function(ws, req) {
      self.events.on("log", function(logLevel, logMsg) {
        ws.send(JSON.stringify({msg: logMsg, msg_clear: logMsg.stripColors, logLevel: logLevel}), () => {});
      });
    });

    if (self.plugins) {
      let apiCalls = self.plugins.getPluginsProperty("apiCalls", "apiCalls");
      for (let apiCall of apiCalls) {
        console.dir("adding " + apiCall.method + " " + apiCall.endpoint);
        app[apiCall.method].apply(app, [apiCall.endpoint, apiCall.cb]);
      }
    }

    this.app.ws('/', function(ws, _req) {
      self.events.on('outputDone', () => {
        if (ws.readyState === WEB_SOCKET_STATE_OPEN) {
          return ws.send('outputDone');
        }
        // if the socket wasn't yet opened, listen for the 'open' event,
        // then send the 'outputDone' data
        ws.addEventListener('open', _event => {
          ws.send('outputDone');
        });
      });
    });

		if (this.enableCatchAll === true) {
			app.get('/*', function (req, res) {
				self.logger.trace('webserver> GET ' + req.path);
				res.sendFile(path.join(fs.dappPath(self.dist, 'index.html')));
			}
		}

    async.waterfall([
      function createPlaceholderPage(next) {
        if (!self.isFirstStart) {
          return next();
        }
        self.isFirstStart = false;
        self.events.request('build-placeholder', next);
      },
      function listen(next) {
        self.server = self.app.listen(self.port, self.hostname, () => {
          self.port = self.server.address().port;
          next();
        });
      },
      function openBrowser(next) {
        if (!self.openBrowser || self.opened) {
          return next();
        }
        self.opened = true;
        self.events.request('open-browser', next);
      }
    ], function (err) {
      if (err) {
        return callback(err);
      }
      const msg = (
        __('webserver available at') + ' ' +
          ('http://' + canonicalHost(self.hostname) + ':' + self.port).bold.underline.green
      );
      callback(null, msg, self.port);
    });
  }

  stop(callback) {
    if (!this.server || !this.server.listening) {
      return callback(null, __("no webserver is currently running"));
    }
    this.server.close(function() {
      callback(null, __("Webserver stopped"));
    });
  }
}

module.exports = Server;
