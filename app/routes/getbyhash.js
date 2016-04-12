// app/routes/ping.js
'use strict';

module.exports = function(router) {
    var fs = require('fs');

    // Import the library
    var StorjAPI = require('storj-bridge-client');

    // Create a client authenticated with your key
    var client = new StorjAPI.Client('https://api.storj.io', {
      keypair: new StorjAPI.KeyPair('23b143dadba0a07ae1107fc088ad4167f1cbfff1e581be76c8eb7b69af37ac54')
    });

  router.route('/:imageHash')
  .get(function(req, res) {
    console.log("Image Hash: " + req.params.imageHash);

    // Keep track of the bucket ID and file hash
    var bucket = '5705567e894c2ad76df71df9';
    var filehash = req.params.imageHash;

    client.createToken(bucket, 'PULL').then(function(token) {
      // Fetch the file pointer list
      console.log("Returning getFilePointers");
      return client.getFilePointer(bucket, token.token, filehash);
    }).then(function(pointers) {
      // Open download stream from network and a writable file stream
      console.log("Got pointers, sending image to client");

      var objectStream = fs.createWriteStream();
      var object = client.resolveFileFromPointers(pointers)

      console.log("Got object from resolve file pointers");

      object.pipe(res);
      //res.writeHead(200, {'Content-Type': 'image/jpeg' });

      console.log("Piped image to var");

      // Need to create some sort of stream object here
      //var destination = fs.createWriteStream('<write_file_to_path>');

      console.log("Wrote HEAD");

      //Need to pipe the stream into a string here
      //download.pipe(res);
      return res.end();
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
