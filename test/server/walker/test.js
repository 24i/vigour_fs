#!/usr/bin/env node
var fs = require('../../../')
  , log = require('npmlog')

fs.walk(
  __dirname+'/files'
, { exclude:[ /\.js$/, 'c2' ] 
  , method:function(path, isDir) {
      console.log()
    }
  }
, function(err,obj) {
  console.log('error:', err)
  console.log('result:',JSON.stringify(obj,false,2))
})

// fs.walk(
//   __dirname+'/files'
// , { exclude:/$\.js/ }
// , function(err,obj) {
//   console.log('XXX',err,JSON.stringify(obj,false,2))
// })

