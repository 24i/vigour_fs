#!/usr/bin/env node
//let's do some file writes -- for now pretty hard to integrate osx etc
var fs = require('../')
  , log = require('npmlog')

log.warn('tests have to come later for specific environments')

fs.readFile(__dirname+'/files/pipe.jpg',function(err, data) {
  if(!err) log.info('done')
})

fs.readFile('http://www.google.com' , function(err, data) {
  // log.info(data)
  if(err) { 
    log.error('ERROR! cannot get google', err) 
  } else { 
    log.info('done loading google', data)
  }
})

fs.writeFile(__dirname+'/files/vigour.html','https://github.com/',function(err, data) {
  if(err) info.error(err)
})


fs.remove(__dirname+'/files/bla', function() {
  log.error('XXXX')
})