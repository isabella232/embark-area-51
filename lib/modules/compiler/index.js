let async = require('../../utils/async_extend.js');

class Compiler {
  constructor(embark, options) {
    const self = this;
    this.plugins = options.plugins;
    this.events = embark.events;
    this.logger = embark.logger;

    this.disableOptimizations = options.disableOptimizations;

    this.events.setCommandHandler("compiler:contracts", function(contractFiles, options, cb) {
      self.compile_contracts(contractFiles, options, cb);
    });
  }

  compile_contracts(contractFiles, options, cb) {
    const self = this;
    let available_compilers = {};

    if (contractFiles.length === 0) {
      return cb(null, {});
    }

    let pluginCompilers = self.plugins.getPluginsProperty('compilers', 'compilers');
    pluginCompilers.forEach(function (compilerObject) {
      available_compilers[compilerObject.extension] = compilerObject.cb;
    });

    let compiledObject = {};

    let compilerOptions = {
      disableOptimizations: this.disableOptimizations || options.disableOptimizations
    };

    async.eachObject(available_compilers,
      function (extension, compiler, callback) {
        let matchingFiles = contractFiles.filter(function (file) {
          let fileMatch = file.filename.match(/\.[0-9a-z]+$/);
          if (fileMatch && (fileMatch[0] === extension)) {
            file.compiled = true;
            return true;
          }
          return false;
        });

        if (!matchingFiles || !matchingFiles.length) {
          return callback();
        }
        compiler.call(compiler, matchingFiles, compilerOptions, function (err, compileResult) {
          Object.assign(compiledObject, compileResult);
          callback(err, compileResult);
        });
      },
      function (err) {
        contractFiles.forEach(file => {
          if (!file.compiled) {
            self.logger.warn(__("%s doesn't have a compatible contract compiler. Maybe a plugin exists for it.", file.filename));
          }
        });

        cb(err, compiledObject);
      }
    );
  }
}

module.exports = Compiler;
