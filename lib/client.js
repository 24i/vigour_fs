var ua = require('vigour-js/browser/ua')
	, ready = false
	, fs = null

module.exports = exports = {}

if(ua.native) {
	document.addEventListener('deviceready', exports.init, false)

	exports.init = function () {
		window.requestFileSystem = window.requestFileSystem || window.webkitRequestFileSystem
		if (window.requestFileSystem) {
	  	window.requestFileSystem(window.PERMANENT
	  		, 2*1024*1024
	  		, function(filesystem) {
			    fs = filesystem
			    ready = true
			    alert('file system ready')
			  }
			  , function (err) {
			  	alert("Error requesting file system: " + err)
			  	throw new Error("Error requesting file system: " + err)
			  });
		} else {
			alert("No file system")
			throw new Error("No file system")
		}
	}

	exports.readFile = function (filename, options, cb) {
  	if (!cb) {
  		cb = options
  		options = null
  	}
  	if (!ready) {
  		cb("File system not ready")
  	} else {

  	}
  }

  exports.writeFile = function (filename, data, options, cb) {
  	if (!cb) {
  		cb = options
  		options = null
  	}
  	if (!ready) {
  		cb("File system not ready")
  	} else {

  	}
  }

  exports.exists = function (path, cb) {
  	if (!ready) {
  		cb("File system not ready")
  	} else {

  	}
  }

  exports.mkdirp = function (path, options, cb) {
  	if (!cb) {
  		cb = options
  		options = null
  	}
  	if (!ready) {
  		cb("File system not ready")
  	} else {

  	}
  }
} else {
	// TODO
}