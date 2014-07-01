module.exports = exports = require('graceful-fs')

var http = require('http')
  , https = require('https')
  , util = require('./util')
  , rimraf = exports.remove = require('rimraf')
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
    res.on('data',function(data) {
      chunks.push(data)
    })
    res.on('error',function(err) {
      callback(err)
    })
    res.on('end',function() {
       callback(null, Buffer.concat(chunks))
    })
  })
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

exports.readFile = function (path, options) {
  var callback = arguments[arguments.length-1]
    , options = options !== callback && options
    , url = options && options.url===false ? false : util.url(path)

  if(url) {
    getHttp( path, callback )
  } else {
    if(options) {
      readFile( path, options, callback )
    } else {
      readFile( path, callback )
    }
  }
}

