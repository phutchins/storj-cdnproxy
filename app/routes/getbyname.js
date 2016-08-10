// app/routes/ping.js
'use strict';

var config = require('nconf');
var async = require('async');
var through = require('through');
var CronJob = require('cron').CronJob;

// Add get file by filename
// Add ability to upload file with a put
// Add button to upload file which then results in listing the link to the file below
// Add ability to upload a file via HTTP PUT request

module.exports = function(router) {
  var fs = require('fs');
  var Storj = require('storj');
  var apiKey = process.env.API_KEY;
  var bucketId = process.env.BUCKETID;
  var KEYPASS = process.env.KEYPASS;
  var bridgeEmail = process.env.BRIDGEEMAIL;
  var bridgePass = process.env.BRIDGEPASS;
  var DATADIR = process.env.DATADIR;
  var bridgeURL = process.env.BRIDGEURL || 'https://api.storj.io';
  var fileNameIndex = {};

  // Create a client authenticated with your key

  var options = {
    basicauth: {
      email: bridgeEmail,
      password: bridgePass
    }
  };

  var client = new Storj.BridgeClient(bridgeURL, options);
	var keyPair = Storj.KeyPair();

	console.log('This device has been successfully paired.');

	var keyring;

  var privKey = keyPair.getPrivateKey();

	try {
		keyring = Storj.KeyRing(DATADIR, KEYPASS);
	} catch (err) {
		return console.log('Unable to unlock keyring, bad password? Error: %s', err);
	}

	var getFileList = function(bucketId, callback) {
	// Get the list of files from the configured bucket
	// Repeat every minute

    console.log('Type of bucketId: ', typeof(bucketId));
		client.listFilesInBucket(bucketId, function(err, files) {
      if (err) {
        console.log('Error listing files in bucket: ', err);
        return callback(err, null);
      }

			var count = 0;
			var fileCount = files.length;
			var fileNameIndex = {};
      var count = 0;

      while ( count < fileCount ) {
        var file = files[count];
				fileNameIndex[file.filename] = file;

				count++;

				if (count == fileCount) {
					callback(null, fileNameIndex);
				}
			};
		});
	};

  console.log('Bucket id: ', bucketId);

	getFileList(bucketId, function(err, index) {
    if (err) {
      return console.log('Error getting file list: %s', err);
    }

    console.log('Initial file list: ', fileNameIndex);

		fileNameIndex = index;

		router.route('/:fileName')
		.get(function(req, res) {

			// Keep track of the bucket ID and file hash
			var fileName = req.params.fileName;
			var fileId = fileNameIndex[fileName].id;
			var secret = keyring.get(fileId);
			var decrypter = new Storj.DecryptStream(secret);

			var streamLogger = through(function(data) {
				console.log('Got data from stream...');
				this.queue(data);
			});

			console.log("Request for file name: " + fileName);

			client.createFileStream(bucketId, fileId, function(err, stream) {
				if (err) {
					return console.log('Error creating file stream: %s', err);
				}

				console.log('Got file stream for file', fileName);
				stream.pipe(decrypter).pipe(res);
			});
		})
		.post(function(req, res, next) {
			return res.sendStatus(200);
		});
	});

	new CronJob('3 * * * * *', function() {
		getFileList(bucketId, function(err, index) {
      if (err) {
        return console.log('Error getting file list: %s', err);
      }

      console.log('New file list: ', fileNameIndex);

			fileNameIndex = index;
			console.log('File list updated');
		});
	}, null, true);
};
