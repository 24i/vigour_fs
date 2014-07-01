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

### fs.readFile( *filename*, [options], *callback* )
Read files.
Adds functionality to filename can also be an url then it will try to load the file from the url

Argument | Type | Default | Description
------ | ---- | ------- | -----------
filename | String or URL | |  Filename can also include path
callback | function() | |  Callback
options | String or Object | | Client only supports encoding no flag

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

fs.readFile('http://www.example.com/test.txt', { encoding: 'utf8' }, function(err, data) {
  console.log(data, err)
})
```

### fs.writeFile( *filename*, data, [options], *callback* )
Write file
Adds functionality to data can also be an url then it will try to write the file from the url

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

//if you do not want urls to be parsed add an option url:false
fs.writeFile('somefile.txt','http://www.google.com', function(err) {
  if(!err) console.log('succes!')
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
