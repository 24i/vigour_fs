var ua = require('../../vigour-js/browser/ua')
	, fsRoot = "cdvfile://localhost/persistent/"
module.exports = exports = {}

if(ua.native) {
	(function () {
		var util = require('./util')
			, nativeUtil = require('./nativeUtil')

		exports.readFile = function (path, options, cb) {
			nativeUtil.whenFsReady(function () {
				if (!cb) {
		  		cb = options
		  		options = {}
		  	}
		  	options = util.treatOptions(options)
		  	;(options.url !== false && util.url(path))
					? util.readAjax(path, options, cb)
					: readFile(path, options, cb)
			})
	  }

	  function readFile (path, options, cb) {
		  window.fs.root.getFile(path
		  	, {
		  		create: false
		  	}
		  	, function (fileEntry) {
		    fileEntry.file(function (file) {
		      var reader = new FileReader()
		      reader.onloadend = function (err) {
		      	if (err.error) {
		      		cb(err)
		      	} else {
		        	cb(null, this.result)
		      	}
		      }
		      reader.readAsText(file)
		    }, function (err) {
		    	err.failPoint = 'fileEntry.file'
		    })
		  }, function (err) {
		  	err.failPoint = 'getFile'
		  	cb(err)
		  })
		}

	  exports.writeFile = function (path, data, options, cb) {
	  	nativeUtil.whenFsReady(function () {
	  		if (!cb) {
		  		cb = options
		  		options = {}
		  	}
		  	options = util.treatOptions(options)
		  	;(options.url !== false && util.url(data))
					? exports.writeHttp(path, data, options, cb)
					: writeFile(path, data, options, cb)
	  	})
	  }

	  function writeFile (path, data, options, cb) {
			window.fs.root.getFile(path
				, {
					create: true
				}
				, function (fileEntry) {
			    fileEntry.createWriter(function (fileWriter) {
			      fileWriter.onwriteend = function (err) {
			      	if (err.error) {
			        	cb(err)
			        } else {
			        	cb(null)
			        }
			      }
			      fileWriter.onerror = function(err) {
			      	err.failPoint = 'onerror'
			        cb(err)
			      }
			    	fileWriter.write(data)
			    }, function (err) {
			    	err.failPoint = 'createWriter'
			    	cb(err)
			    })
		  }, function (err) {
	    	err.failPoint = 'getFile'
	    	cb(err)
	    })
		}

	  exports.writeHttp = function (path, url, options, cb) {
	  	var fileTransfer = new FileTransfer();
			var uri = encodeURI(url);

			fileTransfer.download(
		    uri
		    , fsRoot + path
		    , function (entry) {
		    	cb(null)
		    }
		    , function (err) {
					cb(err)
		    }
		    , false
			);
	  }

		exports.exists = function (path, cb) {
			nativeUtil.whenFsReady(function () {
				window.fs.root.getFile(path
					, { create : false }
					, function () {
						cb(true)
					}
					, function () {
						cb(false)
					})
			})
		}

		exports.mkdirp = function (path, cb) {
			nativeUtil.whenFsReady(function () {
				var folderParts = path.split('/')

				var createDir = function(rootDir, folders) {
					// Throw out './' or '/' and move on. Prevents: '/foo/.//bar'.
					if (folders[0] == '.' || folders[0] == '') {
						folders = folders.slice(1)
					}
					rootDir.getDirectory(folders[0]
						, { create: true }
						, function (dirEntry) {
							if (dirEntry.isDirectory) {
								if (folders.length && folders.length > 1) {
									createDir(dirEntry, folders.slice(1))
								} else {
									cb(null)
								}
							} else {
								var error = new Error(path + ' is not a directory')
								cb(error)
							}
						}
						, function (err) {
							if (err.code === FileError.INVALID_MODIFICATION_ERR) {
								cb(null)
							} else {
								cb(err)
							}
						})
				}

				createDir(window.fs.root, folderParts)
			})
		}
	}())
}