// app/routes/ping.js
'use strict';

var config = require('nconf');
var async = require('async');
var through = require('through');


// Add get file by filename
// Add ability to upload file with a put
// Add button to upload file which then results in listing the link to the file below

module.exports = function(router) {
  var fs = require('fs');
  var apiKey = process.env.API_KEY;
  var bucketId = process.env.BUCKETID;
  var keypass = process.env.KEYPASS;
  var DATADIR = process.env.DATADIR;
  var bridgeURL = process.env.BRIDGEURL || 'https://api.storj.io';

  // Import the library
  var Storj = require('storj');

  // Create a client authenticated with your key
  var client = new Storj.BridgeClient(bridgeURL, {
    keypair: new Storj.KeyPair(apiKey)
  });

  var keyring;

  try {
    keyring = Storj.KeyRing(DATADIR, keypass);
  } catch (err) {
    return console.log('Unable to unlock keyring, bad password? Error: %s', err);
  }

  router.route('/:fileId')
  .get(function(req, res) {

    // Keep track of the bucket ID and file hash
    var fileId = req.params.fileId;
    var secret = keyring.get(fileId);
    var decrypter = new Storj.DecryptStream(secret);

    var streamLogger = through(function(data) {
      console.log('Got data from stream...');
      this.queue(data);
    });

    console.log("Request for image hash: " + fileId);

    client.createFileStream(bucketId, fileId, function(err, stream) {
      if (err) {
        return console.log('Error getting stream for file %s, ERR: %s', fileId, err);
      }

      console.log('Got stream for file with id %s, piping to decrypter', fileId);

      stream.pipe(decrypter).pipe(res);
    });
  })
  .post(function(req, res, next) {
    return res.sendStatus(200);
  });
};
