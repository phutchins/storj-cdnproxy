'use strict';

var config = require('nconf');
var pug = require('pug');
var path = require('path');

module.exports = function(router) {
  router.route('/')
  .get(function(req, res) {
    // Serve Jade template
    var locals;
    var options = {
      pretty: true,
      locals: {
        count: 32
      }
    };

    var html = pug.renderFile(path.join(__dirname, '../views/upload.pug'), options);

    res.send(html);
  })
  .post(function(req, res) {
    // Accept file stream
    req.on('data', function(data) {
      // Save the file here from the data received
      // this method will be implemented later, for now we will just use binaryJS
      console.log('Got some data: ', data);
    });

    console.log('REQ: ', req);
    console.log('RES: ', res);
    // Return 200 OK
  });
};
