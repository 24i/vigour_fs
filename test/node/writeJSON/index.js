var path = require('path')
var express = require('express')
var Promise = require('promise')
var fs = require('../../../lib/server')
var mkdirp = Promise.denodeify(fs.mkdirp)
var remove = Promise.denodeify(fs.remove)
var readJSON = Promise.denodeify(fs.readJSON)
var writeJSON = Promise.denodeify(fs.writeJSON)
var tmpPath = path.join(__dirname, 'tmp')
var fileName = 'file.json'

describe('fs.writeJSON', function () {
	describe("file", function () {
		it("should write stringified JSON", function (done) {
			var filename = path.join(__dirname, 'tmp.json')
			var obj = {
				key: "value"
			}
			fs.writeJSON(filename, obj, function (err) {
				expect(err).not.to.exist
				fs.readFile(filename, 'utf8', function (err, contents) {
					expect(err).not.to.exist
					expect(contents).to.equal('{"key":"value"}')
					fs.unlinkSync(filename)
					done()
				})
			})
		})
	})

	describe("http(s)", function () {
		var server = express()
		var port = 8000
		var handle
		server.use(function (req, res, next) {
			res.status(200).end(JSON.stringify({a:"Hello World"}))
		})
		before(function (done) {
			handle = server.listen(port, done)
		})
		before(function () {
			return mkdirp(tmpPath)
		})

		it("should return parsed JSON", function () {
			var url = "http://localhost:" + port
			var filePath = path.join(tmpPath, fileName)
			return writeJSON(filePath, url)
				.then(function () {
					return readJSON(filePath)
				})
				.then(function (obj) {
					expect(obj.a).to.equal("Hello World")
				})
		})

		after(function () {
	    return remove(tmpPath)
	  })
		after(function (done) {
			handle.close(done)
		})
	})
})
