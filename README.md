# vigour-fs

This is a simple implementation of the [node-fs](http://nodejs.org/api/fs.html) for client-side apps , if used on the server falls back to fs-gracefull. Most methods that you can use in node's fs are not supported tough! We plan to support the stream API in the future

## Installation

**Server:**
	
    $ git clone git@github.com:vigour-js/vigour-fs
    $ npm install

**Client:**

Use [browserify](https://github.com/substack/node-browserify) 
	
    $ browserify index.js > bundle.js

Or use prebuild version

```html
<script src="https://dev.vigour.io/vigour-fs.min.js"></script>
```
## Usage

Just as you would use [node-fs](http://nodejs.org/api/fs.html)

```javascript
var fs = require('vigour-fs');

fs.readFile('somefile.txt', 'utf8', function(err, data) {
  console.log(data, err)
})

fs.writeFile('somefile.txt', 'some data', function(err) {
  console.log(err)
})
```

## API

### fs.rootDir
root directory of the filesystem

### fs.readFile( *filename*, [options], *callback* )
Read files.

Adds functionality to filename so it can also be a url in which case it will try to load the file from that url, optionally retrying if request fails (see [available options](#user-content-readFile-available-options))

Argument | Type | Description
------ | ---- | -----------
filename | String or URL |  Filename can also include path
options | String or Object | Client only supports encoding no flag
callback | Function | Called with `callback(error)` if the operation failed, or `callback(null, data, response)` if the operation succeeded, where *data* is the requested file and *response* is a full [http response object](http://nodejs.org/api/http.html#http_http_incomingmessage).

<a name='readFile-available-options'></a>
#### Available Options
Option | Possible values | Default | Description
---|---|---|---
url | <ul><li>true</li><li>false</li></ul> | true | Whether to treat *path* as a url. If false, treats *path* as a local file path. Otherwise, treats *path* as a url if and only if it starts with `http://` or `https://`
maxTries | Positive integer above 0 | 1 | Number of attempts to make in total (5 means one attempt and four retries)
<a name='readFile-retryDelay'></a>retryDelay | Positive integer  | 500 | Time to wait before retrying the first time, in milliseconds. Subsequent attempts may use a different delay, dependant on the [`retryDelayType`](#user-content-readFile-retryDelayType) option. The delay may also be given by a 'retry-after' header accompanying a 503 response (see the [`respectRetryAfter`](#user-content-readFile-respectRetryAfter) option).
<a name='readFile-retryDelayType'></a>retryDelayType | <ul><li>exp</li><li>linear</li><li>constant</li></ul> | 'exp' | Time to wait before retrying, in milliseconds, as a function of the attempt number (`tryNb`) and the original delay (`retryDelay`) specified in the [`retryDelay`](#user-content-readFile-retryDelay) option <dl><dt>exp</dt><dd>`retryDelay * 2 ^ tryNb`</dd><dt>linear</dt><dd>`retryDelay * tryNb`</dd><dt>*anything else*</dt><dd>`retryDelay`</dd></dl>
<a name='readFile-respectRetryAfter'></a>respectRetryAfter | <ul><li>true</li><li>false</li></ul> | true | Whether to respect the delay provided in a `retry-after` header when receiving a 503 response. True will respect the received delay, false will ignore it and use the [`retryDelayType`](#user-content-readFile-retryDelayType) and [`retryDelay`](#user-content-readFile-retryDelay) options to determine the delay.
retryOn404 | <ul><li>true</li><li>false</li></ul> | false | Whether to retry when response status code is 404. This looks stupid, and most of the time it will be. It is recommended to leave the default in for this one.

#### Examples
```javascript
fs.readFile('somefile.txt', function(err, data) {
  console.log(data, err)
})

fs.readFile('somefile.txt', 'utf8', function(err, data) {
  console.log(data, err)
})

fs.readFile('somefile.txt', { encoding: 'utf8' }, function(err, data) {
  console.log(data, err)
})

fs.readFile('http://www.example.com/test.txt'
  , { encoding: 'utf8' }
  , function(err, data) {
    if (!err) {
      console.log('response header', data.head)
      console.log('response body', data.body)
    }
  })

fs.readFile('http://www.example.com/test.txt'
  , {
    encoding: 'utf8'
    , maxTries: 5
    , retryDelayType: 'exp'
    , retryDelay: 100
    , retryOn404: true
    , respectRetryAfter: true
  }
  , function(err, data) {
    if (!err) {
      console.log('response header', data.head)
      console.log('response body', data.body)
    }
  })
```

### fs.writeFile( *filename*, data, [options], *callback* )
Write file

Adds functionality to data so it can also be a url in which case it will try to get the data from that url (excluding the header) and write it to the file. The header should be part of the err object if the operation fails.

Argument | Type | Default | Description
------ | ---- | ------- | -----------
filename | String | |  Filename can also include path
data | String or Buffer or URL | | Buffer can create difficulties on certain clients
callback | function() | |  Callback
options | String or Object | | Client supports encoding and mode if possible. Adds url default on true

```javascript
fs.writeFile('somefile.txt', 'data in a string', function(err) {
  if(!err) console.log('succes!')
})

fs.writeFile('somefile.txt','http://www.google.com', function(err) {
  if(!err) console.log('succes!')
  else console.log(err.head)
})

//if you do not want urls to be parsed add an option url:false
fs.writeFile('somefile.txt'
  ,'http://www.google.com'
  , { url: false }
  , function(err) {
    if(!err) console.log('succes!')
    else console.log(err.head)
  })
```
### fs.readdir( *path*, *callback* )
Reads directory returns an array

Argument | Type | Default | Description
------ | ---- | ------- | -----------
path | String | |  path
callback | function() | |  Callback

```javascript
fs.readdir('somefolder', function(err, files) {
  if(!err) console.log('succes!', files)
})
```
### fs.mkdir( *path*,[ *options* ], *callback* )
Create a directory

Argument | Type | Default | Description
------ | ---- | ------- | -----------
path | String | |  path
callback | function() | |  Callback
options | Mode | | Defaults to 0777

```javascript
fs.mkdir('somefolder', function(err) {
  if(!err) console.log('succes!')
})
```
### fs.rmdir( *path*, *callback* )
Remove a directory only works when its empty (POSIX)

Argument | Type | Default | Description
------ | ---- | ------- | -----------
path | String | |  path
callback | function() | |  Callback

```javascript
fs.rmdir('somefolder', function(err) {
  if(!err) console.log('succes!')
})
```

### fs.rename( *oldPath*, *newPath*, *callback* )
Rename a file, can also use this to move files

Argument | Type | Default | Description
------ | ---- | ------- | -----------
oldPath | String | |  old path
newPath | String | |  new path
callback | function() | |  Callback

```javascript
fs.rename('bla/somefolder', 'bur/somefolder/' function(err) {
  if(!err) console.log('succes!')
})
```
### fs.unlink( *path*, *callback* )
Remove a file 

Argument | Type | Default | Description
------ | ---- | ------- | -----------
path | String | |  path
callback | function() | |  Callback

```javascript
fs.rename('bla/somefile.txt', function(err) {
  if(!err) console.log('succes!')
})
```
### fs.exists( *path*, *callback* )
Check if a file or folder exists

Argument | Type | Default | Description
------ | ---- | ------- | -----------
path | String | |  path
callback | function() | |  Callback

```javascript
fs.exists('bla/somefolder', function(exists) {
  if(exists) console.log('exists!')
})
```

### fs.stat( *path*, *callback* )
Check if a file or folder exists

Argument | Type | Default | Description
------ | ---- | ------- | -----------
oldPath | String | |  old path
newPath | String | |  new path
callback | function() | |  Callback

```javascript
fs.exists('bla/somefolder', function(err, stats) {
  if(!err) console.log(stats)
})
```
Stat object only has creation date, modification date and accesed date

Uses js [Date object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date)
```javascript
{
  atime: Date,
  mtime: Date,
  ctime: Date
}
```

### fs.remove( *path*, *callback* )
This is an addition to node's fs uses rimraf module
Remove a directory recursivly and clear all content, can also remove files

Argument | Type | Default | Description
------ | ---- | ------- | -----------
path | String | |  path
callback | function() | |  Callback

```javascript
fs.remove('somefolder', function(err) {
  if(!err) console.log('succes!')
})
```
### fs.mkdirp( *path*, [ *options* ], *callback*)
Addition to fs uses mkdirp package
Create a new directory and any necessary subdirectories at dir with octal permission string opts.mode. If opts is a non-object, it will be treated as the opts.mode.

Argument | Type | Default | Description
------ | ---- | ------- | -----------
path | String | |  path
options | Mode | 0777 | 
callback | function() | |  Callback

## License

  ISC
