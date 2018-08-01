let async = require('async');
let windowSize = require('window-size');

let Monitor = require('./monitor.js');
let Console = require('./console.js');

class Dashboard {
  constructor(options) {
    this.logger = options.logger;
    this.events = options.events;
    this.plugins = options.plugins;
    this.version = options.version;
    this.env = options.env;
    this.ipc = options.ipc;

    this.events.on('firstDeploymentDone', this.checkWindowSize.bind(this));
    this.events.on('outputDone', this.checkWindowSize.bind(this));
  }

  checkWindowSize() {
    let size = windowSize.get();
    if (size.height < 40 || size.width < 118) {
      this.logger.warn(__("tip: you can resize the terminal or disable the dashboard with") + " embark run --nodashboard".bold.underline);
    }
  }

  start(done) {
    let console, monitor;
    let self = this;

    let plugin = this.plugins.createPlugin('dashboard', {});
    plugin.registerAPICall(
      'ws',
      '/embark-api/dashboard',
      (ws, req) => {
        let dashboardState = { contractsState: [], environment: "", status: "", availableServices: [] };

        // TODO: doesn't feel quite right, should be refactored into a shared
        // dashboard state
        self.events.request('setDashboardState');

        self.events.on('contractsState', (contracts) => {
          dashboardState.contractsState = [];

          contracts.forEach(function (row) {
            dashboardState.contractsState.push({contractName: row[0], address: row[1], status: row[2]});
          });
          ws.send(JSON.stringify(dashboardState));
        });
        self.events.on('status', (status) => {
          dashboardState.status = status;
          ws.send(JSON.stringify(dashboardState));
        });
        self.events.on('servicesState', (servicesState) => {
          dashboardState.availableServices = servicesState;
          ws.send(JSON.stringify(dashboardState));
        });
      }
    );

    async.waterfall([
      function startConsole(callback) {
        console = new Console({
          events: self.events,
          plugins: self.plugins,
          version: self.version,
          ipc: self.ipc,
          logger: self.logger
        });
        callback();
      },
      function startMonitor(callback) {
        monitor = new Monitor({env: self.env, console: console, events: self.events});
        self.logger.logFunction = monitor.logEntry;

        self.events.on('contractsState', monitor.setContracts);
        self.events.on('status', monitor.setStatus.bind(monitor));
        self.events.on('servicesState', monitor.availableServices.bind(monitor));

        self.events.setCommandHandler("console:command", monitor.executeCmd.bind(monitor));

        self.logger.info('========================'.bold.green);
        self.logger.info((__('Welcome to Embark') + ' ' + self.version).yellow.bold);
        self.logger.info('========================'.bold.green);

        // TODO: do this after monitor is rendered
        callback();
      }
    ], function () {
      self.console = console;
      self.monitor = monitor;
      done();
    });
  }

}

module.exports = Dashboard;
