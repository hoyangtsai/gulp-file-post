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
  if (!options instanceof Object) {
    throw new PluginError(PLUGIN_NAME, 'Parameter not an object.');
  }

  function handleErr(errMsg) {
    errMsg.forEach(function(msg, i) {
      gutil.log(red(msg));
    });
    this.emit('error', new PluginError(PLUGIN_NAME, 'Upload Failed.'));
    return;
  }

  return through.obj(function(file, enc, cb) {
    if (file.isStream()) {
      throw new PluginError(PLUGIN_NAME, 'Streaming not supported.');
    }

    if (file.isNull() || file.isDirectory()) {
      cb(null, file);
    }

    if (file.isBuffer()) {
      var filePath = file.path;
      var fileExt = path.extname(filePath).substring(1);

      if (fileExt === 'zip') {
        var formData = options.data || {};
        formData['file'] = fs.createReadStream(filePath);
        formData['type'] = fileExt;

        var reqData = {
          formData: formData
        };
        if (options.timeout) {
          reqData['timeout'] = options.timeout;
        }

        request.post(options.url, reqData, function(err, resp, body) {
          if (err) {
            var errMsg = ['file: ' + filePath, err];
            handleErr.call(this, errMsg);
          }
          if (resp) {
            if (resp.statusCode === 200) {
              gutil.log(green(filePath, 'uploaded successfully.'));
              cb(null, file);
            } else {
              var errMsg = [ 'statusCode: ' + resp.statusCode, 'statusMessage: ' + resp.statusMessage];
              handleErr.call(this, errMsg);
            }
          }
          if (options.callback) {
            options.callback();
          }
        });
      } else {
        // get absolute publish root
        var dirname =  options.root ?
          path.resolve(path.dirname(module.parent.id), options.root) :
          path.dirname(module.parent.id);

        // get relative root
        var regexp = new RegExp('[\\s\\S]*' + dirname + '[\\/]?');
        var relPath = path.dirname(filePath.replace(/\\+/g, '\/')).replace(regexp, '') + '/';

        // assemble remote path = to + relative root + file name
        var destPath = options.remotePath + '/' + relPath + path.basename(filePath);

        var formData = options.data || {};
        formData['file'] = fs.createReadStream(filePath);
        formData['to'] = destPath;

        var reqData = {
          formData: formData
        };
        if (options.timeout) {
          reqData['timeout'] = options.timeout;
        }

        request.post(options.url, reqData, function(err, resp, body) {
          if (err) {
            var errMsg = ['file: ' + filePath, err];
            handleErr.call(this, errMsg);
          }
          if (resp) {
            if (resp.statusCode === 200) {
              gutil.log(green(filePath, '=>', destPath, ', SUCCESS!'));
              cb(null, file);
            } else {
              var errMsg = [
                'file: ' + filePath,
                'statusCode: ' + resp.statusCode,
                'statusMessage: ' + resp.statusMessage
              ];
              handleErr.call(this, errMsg);
            }
          }
          if (options.callback) {
            options.callback();
          }
        });
      }
    }
  });
};
