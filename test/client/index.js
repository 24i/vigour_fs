try {
    var nativeUtil = require('../../lib/nativeUtil')

    function notify () {
        var args = arguments
        nativeUtil.whenCordovaReady(function () {
            p = document.createElement('p')
            p.appendChild(
                document.createTextNode([].slice.call(args).join(': '))
            )
            document.getElementById('messages').appendChild(p)
        })
    }

    var fs = require('../../')
        , filePath = 'out.txt'
        , fileContents = "File writer's block"
        , url = "https://api.themoviedb.org/3/search/movie?api_key=1858b4fe727192fef95bf123deab5353&query=Mud"
        , downloadTarget = 'out2.txt'


    fs.writeFile(filePath, fileContents, function (err) {
        if (err) {
        notify('FAIL', 'write file', JSON.stringify(err))
        } else {
        notify('PASS', 'write file')
        fs.readFile(filePath, function (err, data) {
            if (err) {
                notify('FAIL', 'read file', JSON.stringify(err))
            } else {
                notify('PASS', 'read file', JSON.stringify(data))
            }
        })
        }
    })

    fs.writeFile(downloadTarget
        , url
        , function (err) {
            if (err) {
                notify('FAIL', 'testing write url', JSON.stringify(err))
            } else {
                notify('PASS', 'testing write url')
                fs.readFile(downloadTarget, function (err, data) {
                    if (err) {
                        notify('FAIL', 'read downloaded', JSON.stringify(err))
                    } else {
                        notify('PASS', 'read downloaded', data)
                    }
                })
            }
        })

    fs.readFile(url, function (err, data, response) {
      if (err) {
        notify('FAIL', 'testing read url', err)
      } else {
        notify('PASS', 'testing read url', JSON.stringify(data))
      }
    })
} catch (e) {
    notify("Exception", e.stack)
}