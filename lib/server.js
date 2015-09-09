var util = require('./util')
var node_path = require('path')
var xml2js = require('xml2js')
var parseXmlString = xml2js.parseString
var xmlBuilder = new xml2js.Builder({headless: true})
var readFile
var writeFile
var exists

// Start with graceful-fs
module.exports = exports = require('graceful-fs')

// extras
exports.remove = require('rimraf')
exports.mkdirp = require('mkdirp')
exports.prependFile = require('prepend-file')

// Modifications

// Store original graceful-fs method
readFile = exports.readFile

exports.readFile = function (path, options, cb) {
  if (!cb) {
    cb = options
    options = {}
  }
  options = util.defaults(options)
  ;(options.url !== false && util.url(path))
    ? util.readHttp(path, options, cb)
    : readFile(path, options, cb)
}

// Store original graceful-fs method
writeFile = exports.writeFile

exports.writeFile = function (path, data, options, cb) {
  if (!cb) {
    cb = options
    options = {}
  }
  options = util.defaults(options)
  if (options.mkdirp) {
    var dirPath = path.slice(0, path.lastIndexOf('/'))
    exports.mkdirp(dirPath, function (err) {
      if (err) {
        cb(err)
      } else {
        finish()
      }
    })
  } else {
    finish()
  }

  function finish () {
    if (options.url !== false && util.url(data)) {
      exports.writeHttp(path, data, options, cb)
    } else {
      writeFile(path, data, options, cb)
    }
  }
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

exports.cp = function (src, dest, options, cb) {
  if (!cb) {
    cb = options // TODO js.nodeify
  }
  exports.mkdirp(dest.substring(0, dest.lastIndexOf('/')), function (err) {
    if (err) {
      cb(err)
    } else {
      exports.readFile(src, function (err, data) {
        if (err) {
          cb(err)
        } else {
          exports.writeFile(dest, data, cb)
        }
      })
    }
  })
}

exports.readJSON = function (path, options, cb) {
  if (!cb) {
    cb = options
    options = {}
  }
  options = util.defaults(options)
  exports.readFile(path, options, function (err, data) {
    if (err) {
      cb(err)
    } else {
      var json
      try {
        json = JSON.parse(data)
      } catch (e) {
        return cb(e)
      }
      cb(null, json)
    }
  })
}

exports.writeJSON = function (path, obj, options, cb) {
  var str
  if (!cb) {
    cb = options
    options = {}
  }
  options = util.defaults(options)
  if (typeof obj === 'string') {
    str = obj
  } else {
    try {
      str = JSON.stringify(obj, options.replacer || null, options.space || null)
    } catch (e) {
      return cb(e)
    }
  }
  exports.writeFile(path, str, options, cb)
}

exports.editJSON = function (path, fn, options, cb) {
  if (!cb) {
    cb = options
    options = {}
  }
  options = util.defaults(options)
  if (options.url !== false && util.url(path)) {
    var error = new TypeError("editJSON doesn't support urls")
    error.code = 'TypeError'
    throw error
  }
  exports.readJSON(path, options, function (err, obj) {
    var newObj
    if (err) {
      cb(err)
    } else {
      newObj = fn(obj)
      if (newObj.then) {
        newObj.then(function (val) {
          exports.writeJSON(path, val, options, cb)
        })
      } else {
        exports.writeJSON(path, newObj, options, cb)
      }
    }
  })
}

exports.readXML = function (path, options, cb) {
  if (!cb) {
    cb = options
    options = {}
  }
  options = util.defaults(options)
  exports.readFile(path, options, function (err, data) {
    if (err) {
      cb(err)
    } else {
      parseXmlString(data, cb)
    }
  })
}

exports.writeXML = function (path, obj, options, cb) {
  var str
  if (!cb) {
    cb = options
    options = {}
  }
  options = util.defaults(options)
  if (typeof obj === 'string') {
    str = obj
  } else {
    try {
      str = xmlBuilder.buildObject(obj)
    } catch (e) {
      return cb(e)
    }
  }
  exports.writeFile(path, str, options, cb)
}

exports.editXML = function (path, fn, options, cb) {
  if (!cb) {
    cb = options
    options = {}
  }
  options = util.defaults(options)
  if (options.url !== false && util.url(path)) {
    var error = new TypeError("editXML doesn't support urls")
    error.code = 'TypeError'
    throw error
  }
  exports.readXML(path, options, function (err, obj) {
    var newObj
    if (err) {
      cb(err)
    } else {
      newObj = fn(obj)
      if (newObj.then) {
        newObj.then(function (val) {
          exports.writeXML(path, val, options, cb)
        })
      } else {
        exports.writeXML(path, newObj, options, cb)
      }
    }
  })
}

// options --- if function -- becomes cb
// options
//
// cb err object can have multiple errors but still parse parts of the object
/*
  {
    exclude: [] *optional
    method:function(path, field, isDir, obj) // if return true current dir
  }
*/
function exclude (exclude$, field, obj, errs, cb) {
  if (exclude$ instanceof RegExp) {
    if (exclude$.test(field)) {
      if (--obj.rdy === 0) {
        cb(errs, obj.val)
      }
      return true
    }
  } else {
    if (field === exclude$) {
      if (--obj.rdy === 0) {
        cb(errs, obj.val)
      }
      return true
    }
  }
}

exports.walk = function (path, options, cb, obj, current, field, errs) {
  var method
  if (!cb) {
    cb = options
    options = null
  }
  if (!obj) {
    obj =
      { val: {},
        rdy: 1,
        top: path
    }
    field = path
    current = obj.val
  }

  if (options) {
    if (options.exclude) {
      if (options.exclude instanceof Array) {
        for (var i = 0, len = options.exclude.length; i < len; i += 1) {
          if (exclude(options.exclude[i], field, obj, errs, cb)) return
        }
      } else {
        if (exclude(options.exclude, field, obj, errs, cb)) return
      }
    }
    if (options.method) {
      method = options.method
    }
  }

  exports.exists(path, function (exists) {
    if (!exists) {
      if (!errs) {
        errs = []
      }
      errs.push('file does not exist ' + path)
      if (--obj.rdy === 0) cb(errs, obj.top ? obj.val[obj.top] : obj.val)
    } else {
      exports.stat(path, function (err, stats) {
        if (err) {
          if (!errs) {
            errs = []
          }
          errs.push(err)
          if (--obj.rdy === 0) {
            cb(errs, obj.top ? obj.val[obj.top] : obj.val)
          }
        } else {
          if (stats.isDirectory()) {
            exports.readdir(path, function (err, files) {
              if (err) {
                if (!errs) errs = []
                errs.push(err)
                if (--obj.rdy === 0) {
                  cb(errs, obj.top ? obj.val[obj.top] : obj.val)
                }
              } else {
                if (method && method(path, field, files, obj, current)) {
                  if (--obj.rdy === 0) {
                    cb(errs, obj.top ? obj.val[obj.top] : obj.val)
                  }
                  return
                }
                current[field] = {}
                files.forEach(function (val) {
                  obj.rdy++
                  exports.walk((path + '/' + val), options, cb, obj, current[field], val, errs)
                })
              }
              if (--obj.rdy === 0) {
                cb(errs, obj.top ? obj.val[obj.top] : obj.val)
              }
            })
          } else {
            current[field] = true
            ;(method && method(path, field, false, obj, current))
            if (--obj.rdy === 0) {
              cb(errs, obj.top ? obj.val[obj.top] : obj.val)
            }
          }
        }
      })
    }
  })
}

exports.expandStars = function (src, rootPath) {
  return new Promise(function (resolve, reject) {
    var acc = []
    var nbPending = 0
    var errors = []
    function traverse (obj) {
      var key
      for (key in obj) {
        acc.push(key)
        if (typeof obj[key] === 'object') {
          traverse(obj[key])
        } else if (obj[key] === '*' || obj[key] === true) {
          nbPending += 1
          expand(obj, key, node_path.join(rootPath, acc.join('/')), expandDone)
        }
        acc.pop()
      }

      function expandDone (err) {
        nbPending -= 1
        done(err)
      }
    }

    traverse(src)
    done()

    function expand (obj, key, rootPath, callback) {
      exports.walk(rootPath, {
        exclude: /^\./
      }
        , function (err, tree) {
          if (err) {
            throw new Error(err)
          }
          obj[key] = tree
          callback(null)
        })
    }

    function done (err) {
      if (err) {
        errors.push(err)
      }
      if (nbPending === 0) {
        if (errors.length === 0) {
          resolve(src)
        } else {
          reject(errors)
        }
      }
    }
  })
}

// Store original graceful-fs method
exists = exports.exists

exports.exists = function (path, _cb) {
  var cb = _cb
  if (_cb.length === 2) {
    cb = function (exists) {
      _cb(null, exists)
    }
  }
  return exists(path, cb)
}
