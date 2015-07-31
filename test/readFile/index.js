var chai = require('chai') // TODO Remove this when gaston allows it
var expect = chai.expect	// TODO Remove this when gaston allows it
var path = require('path')
var fs = require('../../lib/server')
var exec = require('child_process').exec
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

	it("should fail with err.code === 'ENOENT' on inexistant files", function (done) {
		var filename = path.join(__dirname, 'does_not_exist.txt')
		fs.readFile(filename, 'raw', function (err, data) {
			expect(err.code).to.equal("ENOENT")
			expect(err.message.indexOf(filename) >= 0)
			expect(data).not.to.exist
			done()
		})
	})

	it("should work on empty files", function (done) {
		var filename = path.join(__dirname, '..', 'data', 'empty.txt')
		fs.readFile(filename, function (err, data) {
			expect(err).not.to.exist
			expect(data).to.exist
			done()
		})
	})

	it("should work on empty files using utf8", function (done) {
		var filename = path.join(__dirname, '..', 'data', 'empty.txt')
		fs.readFile(filename, 'utf8', function (err, data) {
			expect(err).not.to.exist
			expect(data).to.equal('')
			done()
		})
	})

	it("should work on streams", function (done) {
		var filename = path.join(__dirname, '..', 'data', 'one.txt')
		var dataExpected = fs.readFileSync(filename, 'utf8')
		var node = JSON.stringify(process.execPath)
		var script = path.join(__dirname, '..', 'scripts', 'readFromStream.js')
		var cmd = "cat " + filename + " | " + node + " " + script
		exec(cmd, function (err, stdout, stderr) {
			expect(err).not.to.exist
			expect(stdout).to.equal(dataExpected)
			expect(stderr).to.equal('')
			done()
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