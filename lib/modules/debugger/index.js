var RemixDebug = require('remix-debug-debugtest');
var CmdLine = RemixDebug.CmdLine;
var DebuggerManager = require('./debugger_manager.js');

class TransactionDebugger {
  constructor(embark, _options) {
    const self = this
    this.embark = embark

    this.debugger_manager = new DebuggerManager("http://localhost:8545")
    embark.events.on('contracts:compile:solc', this.debugger_manager.setInputJson.bind(this.debugger_manager))
    embark.events.on('contracts:compiled:solc', this.debugger_manager.setOutputJson.bind(this.debugger_manager))

    this.tx_tracker = {}
    this.last_tx = ""

    this.isDebugging = false
    this.listenToEvents()
    this.listenToCommands()
    this.listentoAPI()
  }

  listenToEvents() {
    const self = this
    this.embark.events.on('blockchain:tx', (tx) => {
      this.embark.events.request("contracts:contract", tx.name, (contract) => {
        self.tx_tracker[tx.transactionHash] = {tx: tx, contract: contract}
        self.last_tx = tx.transactionHash
        if (tx.status !== '0x0') return

        self.embark.logger.info("Transaction failed");

        self.debugger_manager.getLastLine(tx.transactionHash, contract.filename, (lines) => {
          lines.forEach((line) => {
            self.embark.logger.error(line)
          })
        })
      })
    })
  }

  listentoAPI() {
    this.debuggerData = {}
    this.apiDebugger = false

    this.embark.registerAPICall('post', '/embark-api/debugger/start', (req, res) => {
      let txHash = req.body.params.txHash

      this.embark.events.request("contracts:contract:byTxHash", txHash, (err, contract) => {
        if (err) {
          this.embark.logger.error(err);
          return res.send({error: err})
        }

        let filename = contract.filename

        this.debuggerData = {}
        this.apiDebugger = this.debugger_manager.createDebuggerSession(txHash, filename, () => {
        })
        res.send({ok :true})
      })
    });

    this.embark.registerAPICall('post', '/embark-api/debugger/JumpBack', (req, res) => {
      this.apiDebugger.stepJumpNextBreakpoint()
      res.send({ok :true})
    })
    this.embark.registerAPICall('post', '/embark-api/debugger/JumpForward', (req, res) => {
      this.apiDebugger.stepJumpPreviousBreakpoint()
      res.send({ok :true})
    })
    this.embark.registerAPICall('post', '/embark-api/debugger/StepOverForward', (req, res) => {
      this.apiDebugger.stepOverForward(true)
      res.send({ok :true})
    })
    this.embark.registerAPICall('post', '/embark-api/debugger/StepOverBackward', (req, res) => {
      this.apiDebugger.stepOverBack(true)
      res.send({ok :true})
    })
    this.embark.registerAPICall('post', '/embark-api/debugger/StepIntoForward', (req, res) => {
      this.apiDebugger.stepIntoForward(true)
      res.send({ok :true})
    })
    this.embark.registerAPICall('post', '/embark-api/debugger/StepIntoBackward', (req, res) => {
      this.apiDebugger.stepIntoBack(true)
      res.send({ok :true})
    });
    this.embark.registerAPICall('post', '/embark-api/debugger/breakpoint', (req, res) => {
      console.dir("new breakpoint")
      res.send({ok :true})
    });

    this.embark.registerAPICall('ws', '/embark-api/debugger', (ws, _req) => {
      if (!this.apiDebugger) return

      this.apiDebugger.events.on("source", (lineColumnPos, rawLocation) => {
        this.debuggerData.sources = {lineColumnPos, rawLocation}
        ws.send(JSON.stringify(this.debuggerData), () => {})
      })

      this.apiDebugger.events.on("locals", (data) => {
        this.debuggerData.locals = this.simplifyDebuggerVars(data)
        ws.send(JSON.stringify(this.debuggerData), () => {})
      })

      this.apiDebugger.events.on("globals", (data) => {
        this.debuggerData.globals = this.simplifyDebuggerVars(data)
        ws.send(JSON.stringify(this.debuggerData), () => {})
      })
    });
  }

  simplifyDebuggerVars(data) {
    let new_data = {};

    for (let key in data) {
      let field = data[key];
      new_data[`${key} (${field.type})`] = field.value
    }

    return new_data
  }

  listenToCommands() {
    const self = this
    this.cmdDebugger = false

    this.embark.registerConsoleCommand((cmd, _options) => {
      let cmdName = cmd.split(" ")[0]
      let txHash = cmd.split(" ")[1]
      return {
        match: () => cmdName === 'debug',
        process: (cb) => {
          if (txHash) {
            this.embark.events.request("contracts:contract:byTxHash", txHash, (err, contract) => {
              if (err) {
                this.embark.logger.error(err);
                return;
              }
              let filename = contract.filename
              self.cmdDebugger = self.debugger_manager.createDebuggerSession(txHash, filename, () => {
                self.cmdDebugger.getSource().forEach((line) => {
                  console.dir(line)
                })
              })
            });
            return
          }
          let filename = self.tx_tracker[self.last_tx].contract.filename
          self.cmdDebugger = self.debugger_manager.createDebuggerSession(self.last_tx, filename, () => {
            self.cmdDebugger.getSource().forEach((line) => {
              console.dir(line)
            })
          })
        }
      };
    })

    this.embark.registerConsoleCommand((cmd, _options) => {
      return {
        match: () => (cmd === 'next' || cmd === 'n'),
        process: (cb) => {
          if (!self.cmdDebugger.currentStep()) {
            console.dir("end of execution reached")
            return self.cmdDebugger.unload()
          }
          self.cmdDebugger.stepOverForward(true)
          self.cmdDebugger.getSource().forEach((line) => {
            console.dir(line)
          })
        }
      };
    })

    this.embark.registerConsoleCommand((cmd, _options) => {
      return {
        match: () => (cmd === 'previous' || cmd === 'p'),
        process: (cb) => {
          if (!self.cmdDebugger.currentStep()) {
            console.dir("end of execution reached")
            return self.cmdDebugger.unload()
          }
          self.cmdDebugger.stepOverBack(true)
          self.cmdDebugger.getSource().forEach((line) => {
            console.dir(line)
          })
        }
      };
    })

    this.embark.registerConsoleCommand((cmd, _options) => {
      return {
        match: () => (cmd === 'var local' || cmd === 'v l' || cmd === 'vl'),
        process: (cb) => {
          self.cmdDebugger.displayLocals()
        }
      };
    })

    this.embark.registerConsoleCommand((cmd, _options) => {
      return {
        match: () => (cmd === 'var global' || cmd === 'v g' || cmd === 'vg'),
        process: (cb) => {
          self.cmdDebugger.displayGlobals()
        }
      };
    })
  }

}

module.exports = TransactionDebugger
