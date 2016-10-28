var execFile = require('child_process').execFile
var Promise = global.Promise || require('promise/lib/es6-extensions')

module.exports = function (filePath, opts, cb) {
  var params = []
  params.push('-show_streams', '-print_format', 'json', filePath)

  var promise = new Promise(function (resolve, reject) {
    execFile(opts.path, params, function (error, stdout) {
      if (error) {
        return reject(new Error(error))
      }

      resolve(JSON.parse(stdout))
    })
  })

  if (cb) {
    promise.then(function (info) {
      cb(undefined, info)
    }).catch(function (err) {
      cb(err)
    })
  }

  return promise
}
