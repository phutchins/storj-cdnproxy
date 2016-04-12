// app/routes/ping.js
'use strict';

var config = require('nconf');

module.exports = function(router) {
    var fs = require('fs');
    var apiKey = process.env.apiKey;
    var bucket = process.env.bucket;

    // Import the library
    var StorjAPI = require('storj-bridge-client');

    // Create a client authenticated with your key
    var client = new StorjAPI.Client('https://api.storj.io', {
      keypair: new StorjAPI.KeyPair(apiKey)
    });

  router.route('/:imageName')
  .get(function(req, res) {
    console.log("[GET][getObject] Request.body: ", req.body);

    console.log("Image Name: " + req.params.imageName);

    // Keep track of the bucket ID and file hash
    var filehash = null;

    client.createToken(bucket, 'PULL').then(function(token) {
      // Need to get the filehash from the list of files somehow here
      // Might be good to add an API endpoint that returns the filehash for a given filename

      // Fetch the file pointer list
      return client.getFilePointer(bucket, token.token, filehash);
    }).then(function(pointers) {
      // Open download stream from network and a writable file stream
      var object = client.resolveFileFromPointers(pointers);
      res.writeHead(200, {'Content-Type': 'image/gif' });
      //var destination = fs.createWriteStream('<write_file_to_path>');
      //download.pipe(destination);
      res.end(object, 'binary');
    });
  })
  .post(function(req, res, next) {
    // Extract the ping data from the request
    var body = req.body;
    //var pingDataJSON = JSON.parse(body);
    var pingDataJSON = body;

    console.log("[POST][getObject] Request.body: ", body);

    Ping.create(pingDataJSON, function(err) {
      if (err) {
        console.log("[POST][PING] Failed to save ping: " + err);
        return res.sendStatus(500);
      }

      console.log("[POST][PING] Ping created!");

      return res.sendStatus(200);
    });
  });
};
