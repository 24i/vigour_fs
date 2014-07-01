module.exports = exports = require('vigour-js/util').isNode 
  ? require('./lib/server') 
  : require('./lib/client')

//niet alles fs gracefull ook remove adden en url stuff voor write en read

