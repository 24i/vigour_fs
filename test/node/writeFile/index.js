var chai = require('chai') // TODO Remove this when gaston allows it
var expect = chai.expect	// TODO Remove this when gaston allows it
var path = require('path')

var fs = require('../../../lib/server')

var strContent = '南越国是前203年至前111年存在于岭南地区的一个国家，国都位于番禺，疆域包括今天中国的广东、'
  + '广西两省区的大部份地区，福建省、湖南、贵州、云南的一小部份地区和越南的北部。'
  + '南越国是秦朝灭亡后，由南海郡尉赵佗于前203年起兵兼并桂林郡和象郡后建立。'
  + '前196年和前179年，南越国曾先后两次名义上臣属于西汉，成为西汉的“外臣”。前112年，'
  + '南越国末代君主赵建德与西汉发生战争，被汉武帝于前111年所灭。南越国共存在93年，'
  + '历经五代君主。南越国是岭南地区的第一个有记载的政权国家，采用封建制和郡县制并存的制度，'
  + '它的建立保证了秦末乱世岭南地区社会秩序的稳定，有效的改善了岭南地区落后的政治、##济现状。'
  + '\n'
var bufContent = new Buffer(strContent, 'utf8')
var nbContent = 42
var tmpFilename = path.join(__dirname, 'tmp.txt')

describe('fs.writeFile', function () {
	it("should accept strings", function (done) {
		fs.writeFile(tmpFilename, strContent, function (err) {
			expect(err).not.to.exist
			fs.readFile(tmpFilename, function (err, buffer) {
				expect(err).not.to.exist
				expect(Buffer.byteLength(strContent)).to.equal(buffer.length)
				fs.unlinkSync(tmpFilename)
				done()
			})
		})
	})

	it("should accept buffers", function (done) {
		fs.writeFile(tmpFilename, bufContent, function (err) {
			expect(err).not.to.exist
			fs.readFile(tmpFilename, function (err, buf) {
				expect(err).not.to.exist
				expect(bufContent.length).to.equal(buf.length)
				fs.unlinkSync(tmpFilename)
				done()
			})
		})
	})

	it("should accept numbers", function (done) {
		fs.writeFile(tmpFilename, nbContent, { mode: 0600 }, function (err) {
			expect(err).not.to.exist
			fs.readFile(tmpFilename, function (err, buffer) {
				expect(err).not.to.exist
				expect(Buffer.byteLength('' + nbContent)).to.equal(buffer.length)
				fs.unlinkSync(tmpFilename)
				done()
			})
		})
	})

	it("should handle 260-character-long file paths", function (done) {
		var filenameLen = Math.max(260 - __dirname.length - 1, 1)
		var filename = path.join(__dirname, new Array(filenameLen + 1).join('x'))
		try {
		  fs.unlinkSync(fullPath)
		}
		catch (e) {
		  // Ignore.
		}
		fs.writeFile(filename, 'ok', function (err) {
		  expect(err).not.to.exist
		  fs.unlinkSync(filename)
		  done()
		});
	})
})