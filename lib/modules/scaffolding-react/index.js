const Handlebars = require('handlebars');
const fs = require('../../core/fs');
let utils = require('../../utils/utils.js');


Handlebars.registerHelper('capitalize', function(word) {
  return word.charAt(0).toUpperCase() + word.slice(1);
});

Handlebars.registerHelper('ifview', function(stateMutability, options) {
  let result = stateMutability === 'view' || stateMutability === 'pure' || stateMutability === 'constant';
  if (result) {
    return options.fn(this);
  }
  return options.inverse(this);
});

Handlebars.registerHelper('ifeq', function(elem, value, options) {
  if (elem === value) {
    return options.fn(this);
  }
  return options.inverse(this);
});

Handlebars.registerHelper('ifarr', function(elem, options) {
  if (elem.indexOf('[]') > -1) {
    return options.fn(this);
  }
  return options.inverse(this);
});


Handlebars.registerHelper('iflengthgt', function(arr, val, options) {
  if (arr.length > val) {
    return options.fn(this);
  }
  return options.inverse(this);
});

Handlebars.registerHelper('emptyname', function(name, index) {
  return name ? name : 'output' + index;
});

Handlebars.registerHelper('trim', function(name) {
  return name.replace('[]', '');
});


Handlebars.registerHelper('methodname', function(abiDefinition, functionName, inputs) {
  let funCount = abiDefinition.filter(x => x.name === functionName).length;
  if (funCount === 1) {
    return '.' + functionName;
  }
  return new Handlebars.SafeString(`['${functionName}(${inputs !== null ? inputs.map(input => input.type).join(',') : ''})']`);
});

class ScaffoldingReact {
  constructor(embark, options) {
    this.embark = embark;
    this.options = options;
    this.embark.registerDappGenerator('react', this.build.bind(this));
  }

  _generateFile(contract, templateFilename, extension, data, overwrite) {
    const filename = contract.className.toLowerCase() + '.' + extension;
    const filePath = './app/' + filename;
    if (!overwrite && fs.existsSync(filePath)) {
      throw new Error("file '" + filePath + "' already exists");
    }

    const templatePath = utils.joinPath(__dirname, 'templates/' + templateFilename);
    const source = fs.readFileSync(templatePath).toString();
    const template = Handlebars.compile(source);

    // Write template
    const result = template(data);
    fs.writeFileSync(filePath, result);
    return filePath;
  }

  build(contract, overwrite, cb) {
    const packageInstallCmd = 'npm install react react-bootstrap react-dom';
    utils.runCmd(packageInstallCmd, null, (err) => {
      if (err) {
        this.embark.logger.error(err.message);
        process.exit(1);
      }

      try {
        const filename = contract.className.toLowerCase();

        this._generateFile(contract, 'index.html.hbs', 'html',
          {
            'title': contract.className,
            filename
          }, overwrite);

        const filePath = this._generateFile(contract, 'dapp.js.hbs', 'js',
          {
            'title': contract.className,
            'contractName': contract.className,
            'functions': contract.abiDefinition.filter(x => x.type === 'function')
          }, overwrite);

        // Update config
        const contents = fs.readFileSync("./embark.json");
        let embarkJson = JSON.parse(contents);
        embarkJson.app["js/" + filename + ".js"] = "app/" + filename + '.js';
        embarkJson.app[filename + ".html"] = "app/" + filename + '.html';

        fs.writeFileSync("./embark.json", JSON.stringify(embarkJson, null, 4));

        this.embark.logger.info('app/' + filename + ".html generated");
        this.embark.logger.info('app/' + filename + ".js generated");

        cb(null, filePath);
      } catch (error) {
        this.embark.logger.error(error.message);
        process.exit(1);
      }
    });
  }
}

module.exports = ScaffoldingReact;
