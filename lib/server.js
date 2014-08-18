module.exports = exports = require('graceful-fs')

var http = require('http')
  , https = require('https')
  , util = require('./util')
  , rimraf = exports.remove = require('rimraf')
  , mkdirp = exports.mkdirp = require('mkdirp')
  , readFile = exports.readFile
  , writeFile = exports.writeFile

function getFileHttp (url, callback) {
  var request = (/^https/.test(url) ? https : http).get(url, function(res) {
    callback(res)
  })
}

function getHttp (url, callback) {
  getFileHttp(url, function(res) {
    var chunks = []
    res.on('data', function(data) {
      chunks.push(data)
    })
    res.on('error', function(err) {
      callback(err)
    })
    res.on('end', function() {
       callback(null, Buffer.concat(chunks), res)
    })
  })
}

exports.readFile = function (path, options, callback) {
  var tryNb = 0

  if (!callback) {
    callback = options
    options = {}
  }

  options.url = (options.url) ? options.url : util.url(path)

  if(options.url) {
    options.maxTries = (options.maxTries) ? options.maxTries : 1
    options.retryDelayType = (options.retryDelayType) ? options.retryDelayType : 'exp'
    options.retryDelay = (options.retryDelay) ? options.retryDelay : 500
    options.retryOn404 = (options.retryOn404) ? options.retryOn404 : false
    options.respectRetryAfter = (options.respectRetryAfter) ? options.respectRetryAfter : true

    attempt()

    function attempt () {
      getHttp(path, cbFactory(retry, options, callback))
    }
    
    function retry (delay) {
      var retryDelay
      tryNb += 1
      if (tryNb >= options.maxTries) {
        callback('Reached max retry number. Failing')
      } else {
        if (options.respectRetryAfter && delay) {
          retryDelay = delay
        } else {
          if (options.retryDelayType === 'exp') {
            retryDelay = options.retryDelay * 2 ^ tryNb
          } else if (options.retryDelayType === 'linear') {
            retryDelay = options.retryDelay * tryNb
          } else /*if (options.retryDelayType === 'constant') */{ 
            retryDelay = options.retryDelay
          }
        }
        setTimeout(attempt, retryDelay)
      }
    }
  } else {
    if(options) {
      readFile(path, options, callback)
    } else {
      readFile(path, callback)
    }
  }
}

function cbFactory (retry, options, callback) {
  var successCodes = [200, 201, 202, 203, 301, 302, 304, 307]
  return function (err, data, response) {
    if (err) {
      callback(err)
    } else {
      if (response.statusCode === 500 || (response.statusCode === 404 && options.retryOn404)) {
        retry()
      } else if (response.statusCode === 503) {
        retry(parseInt(response.headers['retry-after'], 10) * 1000)
      } else if (~successCodes.indexOf(response.statusCode)) {
        callback(null, data, response)
      } else {
        callback(err)
      }
    }
  }
}

function writeHttp (filename, dataurl, callback) {
  var file = exports.createWriteStream(filename)
  getFileHttp(dataurl, function(res) {
    res.pipe(file)
    file.on('finish', function() {
      file.close(callback)
    })
  })
}


exports.writeFile = function(path, data, options) {
   var callback = arguments[arguments.length-1]
    , options = options !== callback && options
    , url = options && options.url===false ? false : util.url(data)

    if(url) {
      writeHttp(path,data,callback)
    } else {
      if(options) {
        writeFile(path, data, options, callback)
      } else {
        writeFile(path, data, callback)
      }
    }
}


