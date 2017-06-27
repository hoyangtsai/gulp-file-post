const through = require('through2');
const gutil = require('gulp-util');
const PluginError = gutil.PluginError;
const green = gutil.colors.green;
const red = gutil.colors.red;

const request = require('request');
const fs = require('fs');
const path = require('path');

const PLUGIN_NAME = 'gulp-file-post';

function gulpFilePost(options) {
  if (!options instanceof Object) {
    throw new PluginError(PLUGIN_NAME, 'Missing options!');
  }

  var stream = through.obj(function(file, enc, cb) {
    if (file.isStream()) {
      return cb(new PluginError(PLUGIN_NAME, 'Streaming not supported'));
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
            ['file: ' + filePath, err].forEach(function(msg) {
              gutil.log(red(msg));
            });
            return cb(new PluginError(PLUGIN_NAME, err));
          }
          if (resp) {
            if (resp.statusCode === 200) {
              gutil.log(green(filePath, 'uploaded successfully.'));
              cb(null, file);
            } else {
              var respMsg = [
                'statusCode: ' + resp.statusCode, 
                'statusMessage: ' + resp.statusMessage
              ];
              respMsg.forEach(function(msg) {
                gutil.log(red(msg));
              });
              return cb(new PluginError(PLUGIN_NAME, respMsg));
            }
          }
          if (options.callback && typeof options.callback === 'function') {
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
            ['file: ' + filePath, err].forEach(function(msg) {
              gutil.log(red(msg));
            });
            return cb(new PluginError(PLUGIN_NAME, err));
          }
          if (resp) {
            if (resp.statusCode === 200) {
              gutil.log(green(filePath, '=>', destPath, ', SUCCESS!'));
              cb(null, file);
            } else {
              var respMsg = [
                'file: ' + filePath,
                'statusCode: ' + resp.statusCode,
                'statusMessage: ' + resp.statusMessage
              ];
              respMsg.forEach(function(msg) {
                gutil.log(red(msg));
              });
              return cb(new PluginError(PLUGIN_NAME, respMsg));
            }
          }
        });
      }
    }
  });

  return stream;
}

module.exports = gulpFilePost;
