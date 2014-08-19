var http = require('http')
  , https = require('https')
  , util = require('./util')
  , through = require('through2')
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
  options = treatOptions(options)
  ;(options.url !== false && util.url(path))
		? readHttp(path, options, cb)
		: readFile(path, options, cb)
}

exports.writeFile = function (path, data, options, cb) {
	if (!cb) {
    cb = options
    options = {}
  }
  options = treatOptions(options)
  ;(options.url !== false && util.url(data))
		? writeHttp(path, data, options, cb)
		: writeFile(path, data, options, cb)
}

function treatOptions (options) {
  options.maxTries = (options.maxTries) ? options.maxTries : 1
  options.retryDelayType = (options.retryDelayType) ? options.retryDelayType : 'exp'
  options.retryDelay = (options.retryDelay) ? options.retryDelay : 500
  options.retryOn404 = (options.retryOn404) ? options.retryOn404 : false
  options.respectRetryAfter = (options.respectRetryAfter) ? options.respectRetryAfter : true
  return options
}

function readHttp (url, options, cb) {
	retryFactory(get, options)(url, options, function (err, throughStream) {
		var chunks
		if (err) {
			cb(err)
		} else {
			chunks = []
			throughStream.on('data', function (data) {
			  chunks.push(data)
			})
			throughStream.on('error', function (err) {
			  cb(err)
			})
			throughStream.on('end', function () {
			   cb(null, Buffer.concat(chunks))
			})
		}
	})
}

function writeHttp (path, url, options, cb) {
	retryFactory(get, options)(url, options, function (err, throughStream) {
		var file
		if (err) {
			cb(err)
		} else {
			file = exports.createWriteStream(path)
			throughStream.pipe(file)
			file.on('finish', cb)
		}
	})
}

function get (url, options, cb) {
	var throughStream = through()
	;(/^https/.test(url) ? https : http).get(url, function (res) {
		var error
		if (res.statusCode === 500 || res.statusCode === 503 || (options.retryOn404 && res.statusCode === 404)) {
			error = new Error("Remote server error")
			error.statusCode = res.statusCode
			if (res.headers['retry-after']) {
				error.retryAfter = parseInt(res.headers['retry-after'], 10) * 1000
			}
			error.retry = true
			res.resume()
			return cb(error)
		} else if (res.statusCode === 200) {
			res.pipe(throughStream)
			return cb(null, throughStream)
		} else {
			error = new Error("Error GETting url")
			error.statusCode = res.statusCode
			error.retry = false
			res.resume()
			return cb(error)
		}
	})
}

function retryFactory (fn, options) {
	return function () {
		var tryNb = 0
			, args = [].slice.call(arguments)
			, cb = args.pop()

		attempt()

		function attempt () {
			fn.apply(null, args.concat(function (err, throughStream) {
				var error
					, retryDelay
				if (err) {
					if (err.retry) {
						if (tryNb >= options.maxTries) {
							error = new Error("Maximum number of attempts (opions.maxTries) reached.")
							error.maxTries = options.maxTries
							return cb(error)
						} else {
							if (options.respectRetryAfter && err.retryAfter) {
								retryDelay = err.retryAfter
							} else if (options.retryDelayType === 'exp') {
			          retryDelay = options.retryDelay * 2 ^ tryNb
			        } else if (options.retryDelayType === 'linear') {
			          retryDelay = options.retryDelay * tryNb
			        } else /*if (options.retryDelayType === 'constant') */{ 
			          retryDelay = options.retryDelay
			        }
							setTimeout(attempt, retryDelay)
						}
					} else {
						error = err
						return cb(error)
					}
				} else {
					cb(null, throughStream)
				}
			}))
		}
	}
}




