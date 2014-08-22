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
        , nonFilePath = 'nothingHere.txt'
        , fileContents = "File writer's block"
        , url = "https://api.themoviedb.org/3/search/movie?api_key=1858b4fe727192fef95bf123deab5353&query=Mud"
        , downloadTarget = 'out2.txt'
        , nonDirPathRoot = 'i'
        , nonDirPath = '/dont/exists'


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
                fs.rename(downloadTarget, 'renamed.txt', function (err) {
                    if (err) {
                        notify('FAIL', 'testing file rename', JSON.stringify(err))
                    } else {
                        notify('PASS', 'testing file rename')
                        fs.readFile('renamed.txt', function (err, data) {
                            if (err) {
                                notify('FAIL', 'read downloaded', JSON.stringify(err))
                            } else {
                                notify('PASS', 'read downloaded'/*, data*/)
                            }
                        })
                    }
                })
            }
        })

    fs.readFile(url, function (err, data) {
      if (err) {
        notify('FAIL', 'testing read url', JSON.stringify(err))
      } else {
        notify('PASS', 'testing read url'/*, JSON.stringify(data)*/)
      }
    })

    fs.exists(filePath, function (exists) {
        if (exists) {
            notify('PASS', 'testing exists on existing file')
        } else {
            notify('FAIL', 'testing exists on existing file', 'pass if write file failed')
        }
    })

    fs.exists(nonFilePath, function (exists) {
        if (exists) {
            notify('FAIL', 'testing exists on inexistant file')
        } else {
            notify('PASS', 'testing exists on inexistant file')
        }
    })

    fs.mkdirp(nonDirPathRoot + nonDirPath, function (err) {
        if (err) {
            notify('FAIL', 'testing mkdirp')
        } else {
            notify('PASS', 'testing mkdirp')
            fs.rename(nonDirPathRoot, 'renamedDir', function (err) {
                if (err) {
                    notify('FAIL', 'testing rename on a directory', JSON.stringify(err))
                } else {
                    notify('PASS', 'testing rename on a directory')
                    fs.remove('renamedDir', function (err) {
                        if (err) {
                            notify('FAIL', 'testing remove on existing directory', JSON.stringify(err))
                        } else {
                            notify('PASS', 'testing remove on existing directory')
                            fs.exists(nonDirPathRoot + nonDirPath, function (exists) {
                                if (exists) {
                                    notify('FAIL', 'either exists is broken, or remove on existing directory fails, or rename on directory fails')
                                } else {
                                    notify('PASS', 'Existing directory indeed removed')
                                }
                            })
                        }
                    })
                }
            })
        }
    })

    fs.remove('asdfgssadsfdhsd', function (err) {
        if (err) {
            notify('FAIL', 'testing remove on inexistent directory', JSON.stringify(err))
        } else {
            notify('PASS', 'testing remove on inexistent directory')
        }
    })
} catch (e) {
    notify("Exception", e.stack)
}