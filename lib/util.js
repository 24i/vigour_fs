var http = require('http')
  , https = require('https')
  , through = require('through2')
  , concat = require('concat-stream')

exports.url = function(str) {
  return /^https?:\/\//.test(str)
}

exports.treatOptions = function (options) {
  options.maxTries = (options.maxTries) ? options.maxTries : 1
  options.retryDelayType = (options.retryDelayType) ? options.retryDelayType : 'exp'
  options.retryDelay = (options.retryDelay) ? options.retryDelay : 500
  options.retryOn404 = (options.retryOn404) ? options.retryOn404 : false
  options.respectRetryAfter = (options.respectRetryAfter) ? options.respectRetryAfter : true
  options.maxRetryDelay = (options.maxRetryDelay) ? options.maxRetryDelay : 60000
  return options
}

exports.readHttp = function (url, options, cb) {
	exports.getRetry(url, options, function (err, throughStream) {
		if (err) {
			cb(err)
		} else {
			throughStream.pipe(concat(function (data) {
				cb(null, data)
			}))
		}
	})
}

exports.getRetry = function (url, options, cb) {
	exports.retryFactory(exports.get, options)(url, options, cb)
}

exports.get = function (url, options, cb) {
	var throughStream = through()
	;(/^https/.test(url) ? https : http).get(url, function (res) {
		var error
			, retryAfter
			, parsed
			, diff
		if (res.statusCode === 500 || res.statusCode === 503 || (options.retryOn404 && res.statusCode === 404)) {
			error = new Error("Remote server error (" + res.statusCode + ")")
			error.statusCode = res.statusCode
			retryAfter = res.headers['retry-after']
			error.retry = true
			if (retryAfter) {
				error.retryAfterContent = retryAfter
				parsed = parseInt(retryAfter, 10)
				if (parsed) {
					error.retryAfter = parsed * 1000
				} else {
					parsed = (new Date(retryAfter)).getTime()
					if (parsed) {
						diff = parsed - Date.now()
						if (diff > 0) {
							error.retryAfter = diff
						}
					}
				}
				if (error.retryAfter > options.maxRetryDelay) {
					error.retry = false
					error.message += "; Retry-After delay over maxRetryDelay"
				}
			}
			res.resume()
			return cb(error)
		} else if (res.statusCode === 200) {
			res.pipe(throughStream)
			return cb(null, throughStream)
		} else {
			error = new Error("Error GETting url. StatusCode: " + res.statusCode)
			error.statusCode = res.statusCode
			error.retry = false
			res.resume()
			return cb(error)
		}
	})
}

exports.retryFactory = function (fn, options) {
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
							error = err
							error.message += ". Maximum number of attempts reached"
							error.maxTries = options.maxTries
							return cb(error)
						} else {
							if (options.respectRetryAfter && err.retryAfter) {
								retryDelay = err.retryAfter
							} else if (options.retryDelayType === 'exp') {
			          retryDelay = options.retryDelay * Math.pow(2, tryNb)
			        } else if (options.retryDelayType === 'linear') {
			          retryDelay = options.retryDelay * tryNb
			        } else /*if (options.retryDelayType === 'constant') */{ 
			          retryDelay = options.retryDelay
			        }
			        tryNb += 1
			        if (retryDelay > options.maxRetryDelay) {
			        	retryDelay = options.maxRetryDelay
			        }
							setTimeout(attempt, retryDelay)
						}
					} else {
						error = err
						return cb(error)
					}
				} else {
					return cb(null, throughStream)
				}
			}))
		}
	}
}