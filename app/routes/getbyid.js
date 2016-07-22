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
  var bucket = process.env.BUCKET;
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

  router.route('/:id')
  .get(function(req, res) {

    // Keep track of the bucket ID and file hash
    var id = req.params.id;
    var secret = keyring.get(id);
    var decrypter = new Storj.DecryptStream(secret);

    var streamLogger = through(function(data) {
      console.log('Got data from stream...');
      this.queue(data);
    });

    console.log("Request for image hash: " + req.params.id);

    client.createToken(bucket, 'PULL', function(err, token) {
      console.log('Token for PULL created, getting file pointers...');


      //async.retry(3, function(cb, result) {
        client.getFilePointers({
          bucket: token.bucket,
          token: token.token,
          file: id
        }, function(err, pointers) {
          if (err) {
            console.log('Error getting file pointers: %s', err);
            return console.log('Trying again...');
          }

          //return cb(err, pointers);
      //}, function(err, pointers) {

        console.log('Got pointers for file. Resolving pointers.');

        client.resolveFileFromPointers(pointers, function(err, stream, queue) {
          console.log('Pointers resolved. Decrypting file and piping to client');

          stream.pipe(decrypter).pipe(res);
        });
      //});
      });
    });
  })
  .post(function(req, res, next) {
    return res.sendStatus(200);
  });
};
