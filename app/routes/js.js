'use strict';

var fs = require('fs');
var path = require('path');

module.exports = function(router) {
  router.route('/:fileName')
  .get(function(req, res) {
    var fileName = req.params.fileName;
    var filePath = path.join(__dirname, '../js/', fileName);
    var fileStat = fs.statSync(filePath);

    res.writeHead(200, {
      'Content-Type': 'text/javascript',
      'Content-Length': fileStat.size
    });

    var readStream = fs.createReadStream(filePath);
    readStream.pipe(res);
  });
};

