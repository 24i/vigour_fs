var config
	, cordovaReady = false
	, fsReady = false
	, fsRequested = false
	, EventEmitter = require('eventemitter3')
	, ee = new EventEmitter()

module.exports = exports

ee.on('error', function (err) {
	throw err // TODO
})

document.addEventListener('deviceready'
	, function () {
		cordovaReady = true
		ee.emit('cordovaReady')
	}
	, false)

exports.whenCordovaReady = function (cb) {
	if (!cordovaReady) {
		ee.on('cordovaReady', cb)
	} else {
		cb()
	}
}

exports.whenFsReady = function (cb) {
	exports.whenCordovaReady(function () {
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

function requestFS () {
	var error
	fsRequested = true
	window.requestFileSystem = window.requestFileSystem || window.webkitRequestFileSystem
	if (window.requestFileSystem) {
		config = require('../config')
  	window.requestFileSystem(config.fsType
  		, config.fsSize
  		, function(filesystem) {
		    window.fs = filesystem
		    fsReady = true
		    ee.emit('fsReady')
		  }
		  , function (err) {
		  	var error = err
		  	error.message = "Error requesting file system: " + error.message
		  	error.requestedFsType = config.fsType
		  	error.requestedFsSize = config.fsSize
		  	ee.emit('error', error)
		  })
	} else {
		error = new Error("No file system ((window.requestFileSystem || window.webkitRequestFileSystem) == false")
		ee.emit('error', error)
	}
}