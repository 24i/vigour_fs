var path = require('path')
var fs = require('../../../lib/server')

describe('fs.readJSON', function () {
	it("should return parsed JSON", function (done) {
		var filename = path.join(__dirname, '..', '..', 'data', 'valid.json')
		fs.readJSON(filename, function (err, obj) {
			expect(err).not.to.exist
			expect(obj.key).to.equal("value")
			done()
		})
	})
})
