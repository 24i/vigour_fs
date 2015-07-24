var fs = require("../")
	, express = require('express')
	, app = express()
	, port = 8999
	, server

app.get("/path", function (req, res, next) {
	res.header('Location', '/success')
	res.status(301).end()
})

app.get("/url", function (req, res, next) {
	res.header('Location', 'http://localhost:8999/success')
	res.status(301).end()
})

app.get("/way/deeper/path", function (req, res, next) {
	res.header('Location', '/success')
	res.status(301).end()
})

app.get("/way/deeper/url", function (req, res, next) {
	res.header('Location', 'http://localhost:8999/success')
	res.status(301).end()
})

app.get("/success", function (req, res, next) {
	res.send("SUCCESS")
})

server = app.listen(port, function () {
	console.log("Listening on port " + port)
	console.log("Testing path")
	fs.readFile("http://localhost:8999/path", function (err, data) {
		if (err) {
			console.error("FAIL", err)
		} else {
			console.log(data.toString())
			console.log("Testing url")
			fs.readFile("http://localhost:8999/url", function (err, data) {
				if (err) {
					console.error("FAIL", err)
				} else {
					console.log(data.toString())
					console.log("Testing deep path")
					fs.readFile("http://localhost:8999/way/deeper/path", function (err, data) {
						if (err) {
							console.error("FAIL", err)
						} else {
							console.log(data.toString())
							console.log("Testing deep url")
							fs.readFile("http://localhost:8999/way/deeper/url", function (err, data) {
								if (err) {
									console.error("FAIL", err)
								} else {
									console.log(data.toString())
									console.log("ALL DONE")
									server.close()
								}
							})
						}
					})
				}
			})
		}
	})
})

