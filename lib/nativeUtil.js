var config
	, fsReady = false
	, fsRequested = false
	, cordova = require('vigour-js/browser/cordova')
	, EventEmitter = require('eventemitter3')
	, ee = new EventEmitter()

ee.on('error', function (err) {
	ee.emit('fsReady', err)
})

module.exports = exports = {
	whenFsReady: function (cb) {
		cordova.whenReady(function () {
			if (!fsReady) {
				ee.on('fsReady', cb)
				if (!fsRequested) {
					requestFS()
				}
			} else {
				cb()
			}
		})
	}
}

function requestFS () {
	var error
		, time
		, ignore = false
	fsRequested = true
	window.requestFileSystem = window.requestFileSystem || window.webkitRequestFileSystem
	if (window.requestFileSystem) {
		time = window.setTimeout(function () {
			ignore = true
			ee.emit('error', new Error("window.requestFileSystem doesn't call either of its callbacks withing 1 second."))
			fsRequested = false
		}, 1000)
		config = require('../config')
  	window.requestFileSystem(config.fsType
  		, config.fsSize
  		, function(filesystem) {
  			if (!ignore) {
  				window.fs = filesystem
			    fsReady = true
			    fsRequested = false
			    window.clearTimeout(time)
			    ee.emit('fsReady', null)	
  			}
		  }
		  , function (err) {
		  	if (!ignore) {
		  		var error = err
			  	fsRequested = false
			  	error.message = "Error requesting file system: " + error.message
			  	error.requestedFsType = config.fsType
			  	error.requestedFsSize = config.fsSize
			  	window.clearTimeout(time)
			  	ee.emit('error', error)	
		  	}
		  })
	} else {
		error = new Error("No file system ((window.requestFileSystem || window.webkitRequestFileSystem) == false")
		ee.emit('error', error)
	}
}