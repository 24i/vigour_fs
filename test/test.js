#!/usr/bin/env node
var fs = require('../')
  , log = require('npmlog')
  , express = require('express')
  , readApp = express()
  , writeApp = express()
  , readPort = 8000
  , writePort = 8001
  , readRetryNb = 0
  , writeRetryNb = 0
  , readServer
  , writeServer
  , l
  , i
  , fails
  , nbLeft

log.warn('tests have to come later for specific environments')

// ---

fs.readFile(__dirname + '/files/data.txt', function (err, data) {
  if (err) {
    log.error('testing read file', 'Fail ', err)
  } else {
    log.info('testing read file', 'Pass ', data/*.toString()*/)
  }
})

// ---

fs.readFile('http://perdu.com', function (err, data, response) {
  if (err) {
    log.error('testing read url', 'Fail ', err)
  } else {
    log.info('testing read url', 'Pass ', data/*.toString()*/)
  }
})

// ---

fs.writeFile(__dirname + '/files/out.txt', "File writer's block", function (err) {
  if (err) {
    log.error('testing write file', 'Fail ', err)
  } else {
    log.info('testing write file', 'Pass')
  }
})

// ---

fs.writeFile(__dirname + '/files/out1.txt', 'http://perdu.com', function (err) {
  if (err) {
    log.error('testing write url', 'Fail ', err)
  } else {
    log.info('testing write url', 'Pass')
  }
})

// ---

fs.mkdirp(__dirname + '/files/yuz/yub/yubbie', function (err) {
  if (err) {
    log.error('testing mkdirp', 'Fail ', err)
  } else {
    log.info('testing mkdirp', 'Pass')
    fs.remove(__dirname + '/files/yuz', function (err) {
      if (err) {
        log.error('testing remove', 'Fail ', err)
      } else {
        log.info('testing remove', 'Pass')
      }
    })
  }
})

// ---

nbLeft = l = 10
fails = false

for (i = 0; i < l; i += 1) {
  fs.readFile('http://perdu.com', function (err, data, response) {
    nbLeft -= 1
    if (err) {
      fails = true
      finishManyGets(err)
    } else {
      finishManyGets(null, data)
    }
  })
}

function finishManyGets (err, data) {
  if (nbLeft === 0) {
    if (fails) {
      log.error('testing many subsequent GET requests', 'Fail', err)
    } else {
      log.info('testing many subsequent GET requests', 'Pass', data/*.toString()*/)
    }
  }
}

// ---

function middleFactory (retryVar, name) {
  return function middle (req, res, next) {
    if (retryVar === 0) {
      retryVar += 1
      // log.info(name + ' responding with 404')
      res.status(404).end()
    } else if (retryVar === 1) {
      retryVar += 1
      // log.info(name + ' responding with 500')
      res.status(500).end()
    } else if (retryVar === 2) {
      retryVar += 1
      // log.info(name + ' responding with 503 (1 second)')
      res.setHeader('Retry-After', 1)
      res.status(503).end()
    } else if (retryVar === 3) {
      retryVar += 1
      // log.info(name + ' responding with 503 (no retry-after header)')
      res.status(503).end()
    } else if (retryVar === 4) {
      retryVar += 1
      // log.info(name + ' responding with 503 (HTTP-date)')
      res.setHeader('Retry-After', "Fri, 1 Jan 2100 23:59:59 GMT")
      res.status(503).end()
    } else if (retryVar === 5) {
      retryVar += 1
      // log.info(name + ' responding with 500')
      res.status(500).end()
    } else if (retryVar === 6) {
      retryVar += 1
      // log.info(name + ' responding with 500')
      res.status(500).end()
    } else if (retryVar === 7) {
      retryVar += 1
      // log.info(name + ' responding with 500')
      res.status(500).end()
    } else if (retryVar === 8) {
      retryVar += 1
      // log.info(name + ' responding with 500')
      res.status(500).end()
    } else if (retryVar === 9) {
      retryVar += 1
      // log.info(name + ' responding with 500')
      res.status(500).end()
    } else {
      res.status(200).end(name + ' done')
    }
  }
}


readApp.use(middleFactory(readRetryNb, 'read'))

readServer = readApp.listen(readPort)

fs.readFile('http://localhost:' + readPort, {
    maxTries: 10
    , retryDelayType: 'constant'
    , retryDelay: 100
    , retryOn404: true
    , respectRetryAfter: true
  }
  , function (err, data, response) {
    if (err) {
      log.error('testing readFile retries', 'Fail', err)
    } else {
      log.info('testing readFile retries', 'Pass')
    }
    readServer.close()
  })

// ---

writeApp.use(middleFactory(writeRetryNb, 'write'))

writeServer = writeApp.listen(writePort)

fs.writeFile(__dirname + '/files/out2.txt', 'http://localhost:' + writePort, {
    maxTries: 10
    , retryDelayType: 'constant'
    , retryDelay: 100
    , retryOn404: true
    , respectRetryAfter: true
  }
  , function (err) {
    if (err) {
      log.error('testing writeFile retries', 'Fail', err)
    } else {
      log.info('testing writeFile retries', 'Pass')
    }
    writeServer.close()
  })