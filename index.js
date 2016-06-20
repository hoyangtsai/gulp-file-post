var through = require('through2');
var gutil = require('gulp-util');
var PluginError = gutil.PluginError;
var green = gutil.colors.green;
var red = gutil.colors.red;

var request = require('request');
var fs = require('fs');
var path = require('path');

const PLUGIN_NAME = 'gulp-file-post';

module.exports = function(options) {
  if (options.constructor !== Object) {
    throw new PluginError(PLUGIN_NAME, 'Parameter not an object.');
  }
  if (!options.hasOwnProperty('url') || !options.hasOwnProperty('destDir')) {
    throw new PluginError(PLUGIN_NAME, 'Missing field.');
  }

  return through.obj(function(file, enc, cb) {
    if (file.isStream()) {
      throw new PluginError(PLUGIN_NAME, 'Streaming not supported.');
    }
    if (file.isNull() || file.isDirectory()) {
      cb(null);
    }

    if (file.isBuffer()) {
      var filePath = file.path;
      var fileExt = path.extname(filePath).substring(1);

      if (fileExt === 'zip') {
        var formData = {
          to: options.destDir,
          type: fileExt,
          file: fs.createReadStream(filePath)
        };
        for (var key in options) {
          if (key == 'url' || key == 'destDir') continue;
          formData[key] = options[key];
        }
        request.post({url: options.url, formData: formData}, function(err, resp, body) {
          if (err) {
            gutil.log(red('file: ', filePath));
            gutil.log(red(err));
            this.emit('error', new PluginError(PLUGIN_NAME, 'Upload Failed.'));
            return err;
          }
          if (resp.statusCode === 200) {
            gutil.log(green('Upload successed!'));
            cb(null);
          }
        });
      } else {
        // get local project root
        var dirname = path.resolve(__dirname, '../..', 'publish');
        var regexp = new RegExp('[\\s\\S]*' + dirname + '[\\/]?');
        var relPath = path.dirname(filePath.replace(/\\+/g, '\/')).replace(regexp, '') + '/';

        // assemble destDir + file root + file name
        var destPath = options.destDir + '/' + relPath + path.basename(filePath);

        var formData = {
          to: destPath,
          file: fs.createReadStream(filePath)
        };
        for (var key in options) {
          if (key == 'url' || key == 'destDir') continue;
          formData[key] = options[key];
        }
        request.post({url: options.url, formData: formData}, function(err, resp, body) {
          if (err) {
            gutil.log(red('file: ', filePath));
            gutil.log(red(err));
            this.emit('error', new PluginError(PLUGIN_NAME, 'Upload Failed.'));
            return err;
          }
          if (resp.statusCode === 200) {
            gutil.log(green(filePath, " => ", destPath, ", SUCCESS!"));
            cb(null);
          }
        });
      }
    }
  });
};
