var util = require('./util')
  , node_path = require('path')
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

//options --- if function -- becomes cb
//options 
//
//cb err object can have multiple errors but still parse parts of the object
/*
  {
    exclude: [] *optional
    method:function(path, field, isDir, obj) // if return true current dir    
  }
*/
function exclude(exclude$, field, obj, errs, cb) {
  if(exclude$ instanceof RegExp) {
    if(exclude$.test(field)) {
      if(--obj.rdy===0) cb(errs,obj.val)
      return true
    }
  } else {
    if(field===exclude$) {
      if(--obj.rdy===0) cb(errs,obj.val)
      return true
    }
  }
}

exports.walk = function(path, options, cb, obj, current, field, errs) {
  var method
  if(!cb) {
    cb = options
    options = null
  } 
  if(!obj) {
    obj = 
    { val:{}
    , rdy:1
    , top:path
    }
    field = path
    current = obj.val
  }

  if(options) {
    if(options.exclude) {
      if(options.exclude instanceof Array) {
        for(var i=0,len=options.exclude.length;i<len;i++) {
          if(exclude(options.exclude[i], field, obj, errs, cb)) return
        }
      } else {
        if(exclude(options.exclude, field, obj, errs, cb)) return
      }
    }
    if(options.method) method = options.method
  }

  exports.exists(path, function(exists) {
    if(!exists) {
      if(!errs) errs = []
      errs.push('file does not exist '+path)
      if(--obj.rdy===0) cb(errs,obj.top?obj.val[obj.top]:obj.val)
    } else {
      exports.stat(path,function(err,stats) {
        if(err) {
          if(!errs) errs = []
          errs.push(err)
          if(--obj.rdy===0) cb(errs,obj.top?obj.val[obj.top]:obj.val)
        } else {
          if(stats.isDirectory()) {
            exports.readdir(path, function(err, files) {
              if(err) {
                if(!errs) errs = []
                errs.push(err)
                if(--obj.rdy===0) cb(errs,obj.top?obj.val[obj.top]:obj.val)
              } else {
                if(method && method(path, field, files, obj, current)) {
                  if(--obj.rdy===0) cb(errs,obj.top?obj.val[obj.top]:obj.val)
                  return;
                }
                current[field] = {}
                files.forEach(function(val){
                  obj.rdy++
                  exports.walk( (path+'/'+val),  options, cb, obj, current[field], val, errs)
                })
              }
              if(--obj.rdy===0) cb(errs,obj.top?obj.val[obj.top]:obj.val)
            })
          } else {
            current[field] = true
            ;(method && method(path, field, false, obj, current))
            if(--obj.rdy===0) cb(errs,obj.top?obj.val[obj.top]:obj.val)
          }
        }
      })
    }
  })
}

exports.expandStars = function (src, rootPath) {
  return new Promise(function (resolve, reject) {
      var acc = []
        , nbPending = 0
        , errors = []
      function traverse (obj) {
        var key
        for (key in obj) {
          acc.push(key)
          if (typeof obj[key] === 'object') {
            traverse(obj[key])
          } else if (obj[key] === '*') {
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



