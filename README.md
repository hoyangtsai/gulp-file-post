# gulp-file-post

> Upload file to remote server via http post.

## Install

```
npm install --save-dev gulp-file-post
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
      callback: function() {
        del.sync('dest.zip');
      },
      timeout: 10000
    })
  );
});

// upload multiple files
gulp.task('uploadCss', function() {
  return gulp.src('./dest/css/**/*')
    .pipe(upload({
      url: 'http://example.com/receiver.php',
      root: 'dest',
      remotePath: '/path/file/goes'
    })
  );
});
```

### options

name | type | description
--- | --- | --- 
url | string | remote server receiver
root | string | based root to assemble remote path while uploading multiple files
remotePath | string | remote relative path while uploading multiple files
data | object | object of the formdata in the request body
timeout | number | integer containing the number of milliseconds to wait for a server to send response headers
callback | object | callback function

## License

MIT
