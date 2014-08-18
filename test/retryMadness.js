var express = require('express')
	, fs = require('../')
	, app = express()
	, port = 8000
	, retryNb = 0
	, server
app.use(function (req, res, next) {
	if (retryNb === 0) {
		retryNb += 1
		console.log('responding with 404')
		res.status(404).end()
	} else if (retryNb === 1) {
		retryNb += 1
		console.log('responding with 500')
		res.status(500).end()
	} else if (retryNb === 2) {
		retryNb += 1
		console.log('responding with 503 (2 seconds)')
		res.setHeader('Retry-After', 2)
		res.status(503).end()
	} else if (retryNb === 3) {
		retryNb += 1
		console.log('responding with 503 (no retry-after header)')
		res.status(503).end()
	} else if (retryNb === 4) {
		retryNb += 1
		console.log('responding with 500')
		res.status(500).end()
	} else if (retryNb === 5) {
		retryNb += 1
		console.log('responding with 500')
		res.status(500).end()
	} else if (retryNb === 6) {
		retryNb += 1
		console.log('responding with 500')
		res.status(500).end()
	} else if (retryNb === 7) {
		retryNb += 1
		console.log('responding with 500')
		res.status(500).end()
	} else if (retryNb === 8) {
		retryNb += 1
		console.log('responding with 500')
		res.status(500).end()
	} else if (retryNb === 9) {
		retryNb += 1
		console.log('responding with 500')
		res.status(500).end()
	} else {
		res.status(200).end('done')
	}
})

server = app.listen(port)
console.log('server listening on port ', 8000)

fs.readFile('http://localhost:8000/', {
		maxTries: 100
    , retryDelayType: 'constant'
    , retryDelay: 100
    , retryOn404: true
    , respectRetryAfter: true
	}
	, function (err, data, response) {
		if (err) {
			console.error('FAIL', err)
		} else {
			console.log('PASS')
		}
		server.close()
	})
