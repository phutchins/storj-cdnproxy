'use strict';

var Storj = require('storj');
var bridgeEmail = process.env.BRIDGEEMAIL;
var bridgePass = process.env.BRIDGEPASS;
var bridgeURL = process.env.BRIDGEURL || 'https://api.storj.io';

module.exports.getFileNameIndex = function(client, bucketId, callback) {
  client.listFilesInBucket(bucketId, function(err, files) {
    if (err) {
      console.log('Error listing files in bucket: ', err);
      return callback(err, null);
    }

    if (!files || files.length === 0) {
      console.log('No files in bucket');
      return callback(null, null)
    }

    var count = 0;
    var fileCount = files.length;
    var fileNameIndex = {};

    while ( count < fileCount ) {
      var file = files[count];
      fileNameIndex[file.filename] = file;

      count++;

      if (count == fileCount) {
        callback(null, fileNameIndex);
      }
    }
  });
};

module.exports.getBasicAuthClient = function(callback) {
  var options = {
    basicauth: {
      email: bridgeEmail,
      password: bridgePass
    }
  };

  var client = new Storj.BridgeClient(bridgeURL, options);

  console.log('This device has been successfully paired.');
  return callback(client);
};
