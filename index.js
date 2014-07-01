module.exports = require('vigour-js/util').isNode 
  ? require('graceful-fs') 
  : require('./client')