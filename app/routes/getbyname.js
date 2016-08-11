// app/routes/ping.js
'use strict';

var config = require('nconf');
var async = require('async');
var through = require('through');
var CronJob = require('cron').CronJob;
var utils = require('../lib/utils');

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
  var client;

  // Create a client authenticated with your key
  utils.getBasicAuthClient(function(newClient) {
    var self = this;
    client = newClient;

    var keyring;

    try {
      keyring = Storj.KeyRing(DATADIR, KEYPASS);
    } catch (err) {
      return console.log('Unable to unlock keyring, bad password? Error: %s', err);
    }

    console.log('Bucket id: ', bucketId);

    utils.getFileNameIndex(client, bucketId, function(err, index) {
      if (err) {
        return console.log('Error getting file list: %s', err);
      }

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

/*
          var splitFileName = fileName.split('.');
          var lastElementIndex = splitFileName.length-1;
          var fileExtension = splitFileName[lastElementIndex];

          if (fileExtension === 'svg') {
            res.writeHead(200, {'Content-Type': 'image/svg+xml'});
          }
*/

          var imgMime;
          switch (fileName.toLowerCase().slice(-4))
          {
            case ".bmp":              imgMime = "bmp";     break;
            case ".gif":              imgMime = "gif";     break;
            case ".jpg": case "jpeg": imgMime = "jpeg";    break;
            case ".png": case "apng": imgMime = "png";     break;
            case ".svg": case "svgz": imgMime = "svg+xml"; break;
            case ".tif": case "tiff": imgMime = "tiff";    break;
            default: console.log("File does not appear to be an image: " + fileName); return;
          }

          if (imgMime) {
            res.writeHead(200, {'Content-Type': 'image/' + imgMime});
          }

          if (!imgMime) {
            console.log("File type unknown");
          }

          console.log('Got file stream for file', fileName);
          stream.pipe(decrypter).pipe(res);
        });
      })
      .post(function(req, res, next) {
        return res.sendStatus(200);
      });
    });

    new CronJob('0,10,20,30,40,50 * * * * *', function() {
      utils.getFileNameIndex(client, bucketId, function(err, index) {
        if (err) {
          return console.log('Error getting file list: %s', err);
        }

        fileNameIndex = index;
        console.log('File list updated');
      });
    }, null, true);
  });
};
