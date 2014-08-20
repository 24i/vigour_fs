module.exports = exports = require('vigour-js/util').isNode 
	? require('./lib/server')
	: require('./lib/client')
