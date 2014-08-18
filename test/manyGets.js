var fs = require('../')
	, l = 10
	, i
	, fails = false
	, nbLeft = l

for (i = 0; i < l; i += 1) {
	fs.readFile('http://www.google.com', function (err) {
		if (err) {
			fails = true
		} else {
			nbLeft -= 1
			if (nbLeft === 0) {
				console.log('all done')
			}
		}
	})
}