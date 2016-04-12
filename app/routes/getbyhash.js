// app/routes/ping.js
'use strict';

var config = require('nconf');

module.exports = function(router) {
    var fs = require('fs');
    var apiKey = process.env.API_KEY;
    var bucket = process.env.BUCKET;

    // Import the library
    var StorjAPI = require('storj-bridge-client');

    // Create a client authenticated with your key
    var client = new StorjAPI.Client('https://api.storj.io', {
      keypair: new StorjAPI.KeyPair(apiKey)
    });

  router.route('/:imageHash')
  .get(function(req, res) {
    console.log("Request for image hash: " + req.params.imageHash);

    // Keep track of the bucket ID and file hash
    var filehash = req.params.imageHash;

    client.createToken(bucket, 'PULL').then(function(token) {
      // Fetch the file pointer list
      return client.getFilePointer(bucket, token.token, filehash);
    }).then(function(pointers) {
      var object = client.resolveFileFromPointers(pointers)

      object.pipe(res);
    });
  })
  .post(function(req, res, next) {
    return res.sendStatus(200);
  });
};
