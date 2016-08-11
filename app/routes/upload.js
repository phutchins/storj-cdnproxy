'use strict';

var config = require('nconf');
var pug = require('pug');
var path = require('path');
var utils = require('../lib/utils');
var bucketId = process.env.BUCKETID;

module.exports = function(router) {
  router.route('/')
  .get(function(req, res) {
    // get file list
    console.log('[UPLOAD] Rendering page...');
    utils.getBasicAuthClient(function(client) {

      console.log('[UPLOAD] Got basic auth client...');
      utils.getFileNameIndex(client, bucketId, function(err, fileNameIndex) {
        console.log('[UPLOAD] Got fileNameIndex');

        var options = {
          pretty: true,
          fileNameIndex: fileNameIndex
        };

        console.log('File Name Index is: ', fileNameIndex);

        // Serve Jade template
        var html = pug.renderFile(path.join(__dirname, '../views/upload.pug'), options);

        res.send(html);
      });
    });
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
