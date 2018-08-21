let fs = require('../core/fs.js');
let utils = require('../utils/utils.js');

class TemplateGenerator {
  constructor(templateName) {
    this.templateName = templateName;
  }

  downloadAndGenerate(uri, destinationFolder, name) {
    let {url, filePath} = this.getExternalProject(uri);
    let tmpFilePath = fs.tmpDir(filePath);

    fs.mkdirpSync(utils.dirname(tmpFilePath));
    utils.downloadFile(url, tmpFilePath, () => {
      let fspath = utils.joinPath(destinationFolder, name);
      const decompress = require('decompress');

      decompress(tmpFilePath, fspath, {
        map: file => {
          let fixed_path = file.path.split('/');
          fixed_path.shift(); // remove first directory
          file.path = utils.joinPath(...fixed_path);
          return file;
        }
      });
    });
  }

  generate(destinationFolder, name) {
    let templatePath = fs.embarkPath(utils.joinPath('templates', this.templateName));
    console.log(__('Initializing Embark Template....').green);
    let fspath = utils.joinPath(destinationFolder, name);

    fs.copySync(templatePath, fspath);
    utils.cd(fspath);
    utils.sed('package.json', '%APP_NAME%', name);

    if (name === 'embark_demo') {
      console.log(__('Installing packages...').green);
      utils.runCmd('npm install');
    }

    console.log(__('Init complete').green);
    console.log('\n' + __('App ready at ').green + fspath);

    if (name === 'embark_demo') {
      console.log('-------------------'.yellow);
      console.log(__('Next steps:').green);
      console.log(('-> ' + ('cd ' + fspath).bold.cyan).green);
      console.log('-> '.green + 'embark run'.bold.cyan);
      console.log(__('For more info go to http://embark.status.im').green);
    }
  }

  getExternalProject(uri) {
    const constants = require('../constants');
    const RAW_URL = 'https://github.com/';

    let match = uri.match(
      /\.[a-z]+\/([-a-zA-Z0-9@:%_+.~#?&\/=]+)/
    );

    let url, folder;

    if (uri.startsWith('http')) {
      url = uri + "/archive/master.zip"
      folder = match[1]
    } else if (uri.startsWith('github')) {
      url = "https://" + uri + "/archive/master.zip"
      folder = match[1]
    } else if (uri.split('/').length === 2) {
      url = "https://github.com/" + uri + "/archive/master.zip"
      folder = uri
    } else if (uri.indexOf('/') === -1) {
      url = "https://github.com/embark-framework/embark-" + uri + "-template/archive/master.zip"
      folder = "embark-framework/embark-" + uri + "-template"
    }

    return {
      url,
      filePath: utils.joinPath(".embark/templates/", folder, "archive.zip")
    };
  }

}

module.exports = TemplateGenerator;
