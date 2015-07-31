var path = require('path')
var fs = require('../../../lib/server')

describe('fs.writeJSON', function () {
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
