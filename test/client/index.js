function notify (prefix, msg) {
    var str = prefix
        , p
    if (msg) {
        str += ": " + msg
    }
    p = document.createElement('p')
    p.appendChild(
        document.createTextNode(str)
    )
    document.getElementById('messages').appendChild(p)
}
try {
    var fs = require('../../')
        , filePath = 'out.txt'
        , fileContents = "File writer's block"
    fs.writeFile(filePath, fileContents, function (err) {
      if (err) {
        notify('FAIL write file', JSON.stringify(err))
      } else {
        notify('PASS write file')
        fs.readFile(filePath, function (err, data) {
            if (err) {
                notify('FAIL read file', JSON.stringify(err))
            } else {
                notify('PASS read file', data)
            }
        })
      }
    })

    fs.readFile('https://api.themoviedb.org/3/search/movie?api_key=1858b4fe727192fef95bf123deab5353&query=Mud', function (err, data, response) {
      if (err) {
        notify('FAIL', 'testing read url', err)
      } else {
        notify('PASS', 'testing read url', data/*.toString()*/)
      }
    })
} catch (e) {
    notify("Exception", e.stack)
}