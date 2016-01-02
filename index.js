var stream = require('stream'),
    JSONStream = require('JSONStream'),
    spawn = require('child_process').spawn;

module.exports = getInfo;
function getInfo(filePath, opts, cb) {
  var params = [];
  params.push('-show_streams', '-print_format', 'json', filePath);

  var ffprobe = spawn(opts.path, params);
  ffprobe.stdin.once('error', cb);

  ffprobe.stdout
    .pipe(JSONStream.parse())
    .once('data', cb.bind(null, null));
}
