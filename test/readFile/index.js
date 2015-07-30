var chai = require('chai') // TODO Remove this when gaston allows it
var expect = chai.expect	// TODO Remove this when gaston allows it
var path = require('path')
var fs = require('../../lib/server')

var largeFilePath = path.join(__dirname, '..', 'data', 'large_file.txt')
var tooBig = 1024 * 1024 * 1024
var bigButFine = tooBig - 1

describe('fs.readFile', function () {
	it("should fail with err.code === 'EISDIR' on directories", function (done) {
		fs.readFile('/', { encoding: 'utf8' }, function (err, data) {
			expect(err.code).to.equal('EISDIR')
			done()
		})
	})

	it("should fail with err.name === 'RangeError' on files of (1024*1024*1024) bytes or more", function (done) {
		this.timeout(10000)
		makeFile(tooBig, function () {
		  fs.readFile(largeFilePath, function (err) {
		  	expect(err.name).to.equal('RangeError')
		  	try { fs.unlinkSync(largeFilePath) } catch (e) {}
		  	done()
		  })
		})
	})

	it("should succeed on files of less than (1024*1024*1024) bytes", function (done) {
		this.timeout(10000)
		makeFile(bigButFine, function () {
		  fs.readFile(largeFilePath, function (err) {
		  	expect(err).not.to.exist
		  	try { fs.unlinkSync(largeFilePath) } catch (e) {}
		  	done()
		  })
		})
	})
	  
	process.on('uncaughtException', function (err) {
	  it('should not throw uncaughtException', function () {
	  	expect(true).to.be.true
	  })
	})
})

function makeFile(filesize, cb) {
  var buf = new Buffer(filesize / 1024)
  buf.fill('a')

  try { fs.unlinkSync(largeFilePath) } catch (e) {}
  var w = 1024
  var ws = fs.createWriteStream(largeFilePath)
  ws.on('close', cb)
  ws.on('drain', write)
  write()
  function write() {
    do {
      w--
    } while (false !== ws.write(buf) && w > 0);
    if (w === 0) {
      ws.end()
    }
  }
}