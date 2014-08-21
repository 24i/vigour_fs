var util = require('./util')
  , rimraf
  , mkdirp
  , readFile
  , writeFile

module.exports = exports = require('graceful-fs')

rimraf = exports.remove = require('rimraf')
mkdirp = exports.mkdirp = require('mkdirp')
readFile = exports.readFile
writeFile = exports.writeFile

exports.readFile = function (path, options, cb) {
	if (!cb) {
    cb = options
    options = {}
  }
  util.defaults(options)
  ;(options.url !== false && util.url(path))
		? util.readHttp(path, options, cb)
		: readFile(path, options, cb)
}

exports.writeFile = function (path, data, options, cb) {
	if (!cb) {
    cb = options
    options = {}
  }
  util.defaults(options)
  ;(options.url !== false && util.url(data))
		? exports.writeHttp(path, data, options, cb)
		: writeFile(path, data, options, cb)
}

exports.writeHttp = function (path, url, options, cb) {
	util.getRetry(url, options, function (err, throughStream) {
		var file
		if (err) {
			cb(err)
		} else {
			file = exports.createWriteStream(path)
			throughStream.pipe(file)
			file.on('error', function (err) {
				cb(err)
			})
			file.on('finish', cb)
		}
	})
}





