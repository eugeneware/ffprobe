var JSONStream = require('JSONStream'),
    Deferred = require('deferential'),
    bl = require('bl'),
    spawn = require('child_process').spawn;
    spawnSync = require('child_process').spawnSync;

module.exports = getInfo;
function getInfo(filePath, opts, cb) {

  if(opts.sync){
    return getInfoSync(filePath, opts);
  }

  var params = [];
  params.push('-show_streams', '-print_format', 'json', filePath);

  var d = Deferred();
  var info;
  var stderr;

  var ffprobe = spawn(opts.path, params);
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

function getInfoSync(filePath, opts, cb) {
  var params = [];
  params.push('-show_streams', '-print_format', 'json', filePath);

  var info;
  var stderr;
  var ffprobe = spawnSync(opts.path, params);

  info = JSON.parse(ffprobe.stdout);

  if(Object.keys(info).length == 0) {
    var errMsg = ffprobe.stderr.toString().split('\n').filter(Boolean).pop();
    stderr = new Error(errMsg);
  }

  return { data: info, error: stderr }
}