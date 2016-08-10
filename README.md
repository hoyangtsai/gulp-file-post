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

// upload a zip file and decompress on the server
gulp.task('upload', function() {
  return gulp.src('./publish.zip')
    .pipe(upload({
      url: 'http://wapstatic.kf0309.3g.qq.com/receiver/receiver2.php',
      data: {
        to: '/data/wapstatic/keithytsai/open_zc'
      }
    })
  );
});

// upload multiple files
gulp.task('uploadCss', function() {
  return gulp.src('./publish/css/**/*')
    .pipe(upload({
      url: 'http://wapstatic.kf0309.3g.qq.com/receiver/receiver2.php',
      root: 'publish',
      remotePath: '/data/wapstatic/keithytsai/open_zc'
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

## License

MIT
