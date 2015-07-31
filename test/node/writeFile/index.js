var chai = require('chai') // TODO Remove this when gaston allows it
var expect = chai.expect	// TODO Remove this when gaston allows it
var path = require('path')

var fs = require('../../../lib/server')


describe('fs.writeFile', function () {
	it("should handle 260-character-long file paths", function (done) {
		var fileNameLen = Math.max(260 - __dirname.length - 1, 1)
		var fileName = path.join(__dirname, new Array(fileNameLen + 1).join('x'))
		try {
		  fs.unlinkSync(fullPath)
		}
		catch (e) {
		  // Ignore.
		}
		fs.writeFile(fileName, 'ok', function (err) {
		  expect(err).not.to.exist
		  fs.unlinkSync(fileName)
		  done()
		});
	})
})