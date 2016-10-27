var stream = require('stream'),
    JSONStream = require('JSONStream'),
    Deferred = require('deferential'),
    bl = require('bl'),
    execFile = require('child_process').execFile;

module.exports = getInfo;
function getInfo(filePath, opts, cb) {
  var params = [];
  params.push('-show_streams', '-print_format', 'json', filePath);

  var d = Deferred();
  var info;
  var stderr;

  var ffprobe = execFile(opts.path, params);
  ffprobe.once('close', function (code) {
    if (!code) {
      d.resolve(info);
    } else {
      var err = stderr.split('\n').filter(Boolean).pop();
      d.reject(new Error(err));
    }
  });

  ffprobe.stderr.pipe(bl(function (err, data) {
    stderr = data.toString();
  }));

  ffprobe.stdout
    .pipe(JSONStream.parse())
    .once('data', function (data) {
      info = data;
    });

  return d.nodeify(cb);
}
