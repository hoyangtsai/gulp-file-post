# gulp-file-post

[![npm](https://img.shields.io/npm/v/gulp-file-post.svg)](https://www.npmjs.com/package/gulp-file-post)
[![npm](https://img.shields.io/npm/dm/gulp-file-post.svg)](https://www.npmjs.com/package/gulp-file-post)

> Upload file to remote server via http post.

## Install

```
npm install gulp-file-post
```

## Example

```js
var gulp = require('gulp');
var upload = require('gulp-file-post');
var del = require('del');

// upload a zip file and decompress on the server
gulp.task('upload', function() {
  return gulp.src('./dest.zip')
    .pipe(upload({
      url: 'http://example.com/receiver.php',
      data: {
        to: '/path/file/goes'
      },
      timeout: 10000
    }).on('error', function(err) {
      // catch error message
    }).on('end', function(){
      // do something else
    });
  );
});

// upload multiple files
gulp.task('uploadCss', function() {
  return gulp.src('./dest/css/**/*')
    .pipe(upload({
      url: 'http://example.com/receiver.php',
      root: 'dest',
      remotePath: '/path/file/goes'
    }).on('error', function(err) {
      // catch error message
    }).on('end', function(){
      // do something else
    });
  );
});
```

### options

name | type | description | required
--- | --- | --- | ---
url | string | remote server receiver | ✔
root | string | based root to assemble remote path while uploading multiple files | ✔
remotePath | string | remote relative path while uploading multiple files
data | object | object of a formdata | ✔
timeout | number | integer of milliseconds to wait for server responding | ✘
callback | object | callback function | ✘

## License

MIT
