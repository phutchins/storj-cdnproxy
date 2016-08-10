// config/initializers/server.js

var express = require('express');
var path = require('path');
// Local dependecies
var config = require('nconf');
var BinaryJS = require('binaryjs');
var http = require('http');
var https = require('https');
var storj = require('storj');
var stream = require('stream');
var fs = require('fs');
var through = require('through');

// create the express app
// configure middlewares
var bodyParser = require('body-parser');
var morgan = require('morgan');
var logger = require('winston');
var app;

var start = function(cb) {
  'use strict';
  // Configure express
  app = express();

  app.use(function(err, req, res, next) {
    logger.debug('[SERVER] Passing through app.use first');
    next(err);
  });

  app.use(morgan('common'));
  app.use(bodyParser.urlencoded({extended: true}));
  app.use(bodyParser.json({type: '*/*'}));

  logger.info('[SERVER] Initializing routes');
  require('../../app/routes/index')(app);

  app.use(express.static(path.join(__dirname, 'public')));

  // Error handler
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.json({
      message: err.message,
      error: (app.get('env') === 'development' ? err : {})
    });
    next(err);
  });

  app.listen(config.get('NODE_PORT'));
  logger.info('[SERVER] Listening on port ' + config.get('NODE_PORT'));
  //app.listen(3033);
  //logger.info('[SERVER] Listening on port 3033');
  var binHttpServer = http.createServer();

  var binaryServer = BinaryJS.BinaryServer({server: binHttpServer});

  binHttpServer.listen(9000);

  binaryServer.on('connection', function(binClient) {
    // Send this to handle binary client

    var DATADIR = process.env.DATADIR;
    var BRIDGEPASS = process.env.BRIDGEPASS;
    var KEYPASS = process.env.KEYPASS;
    var BRIDGEURL = process.env.BRIDGEURL || 'https://api.storj.io';
    var BRIDGEEMAIL = process.env.BRIDGEEMAIL;
    var BUCKETID = process.env.BUCKETID;

    var toBuffer = through(function(data) {
      this.queue(new Buffer(data));
    });

    binClient.on('stream', function(binStream, meta) {
      var secret = new storj.DataCipherKeyIv();
      var encrypter = new storj.EncryptStream(secret);

      // Store this secret in local keyring (or somewhere that makes sense)

      // Get keyring for bucket
      try {
        var keyring = storj.KeyRing(DATADIR, KEYPASS);
      } catch(err) {
        return console.log('Error creating keyring: %s', err);
      }

      var options = {
        basicauth: {
          email: BRIDGEEMAIL,
          password: BRIDGEPASS,
          concurrency: 6
        }
      };

      // Create token for upload
      var client = new storj.BridgeClient(BRIDGEURL, options);
      var filePath = '/tmp/' + meta.name;
      var writeStream = fs.createWriteStream(filePath, { autoClose: true });

      binStream.on('end', function() {
        console.log('binStream has ended...');

        writeStream.end();
      });

      binStream.pipe(toBuffer).pipe(encrypter).pipe(writeStream);

      writeStream.on('finish', function() {
        console.log('Done caching file to disk, storing file in bucket');

        // Should do this in parallel with saving the file to disk before storing in bucket
        client.createToken(BUCKETID, 'PUSH', function(err, token) {
          if (err) {
            return console.log('Error getting token: %s', err);
          }

          console.log('Streaming file to bucket, grind some beans and enjoy some fresh tasty coffee..');

          client.storeFileInBucket(BUCKETID, token.token, filePath, function(err, file) {
            if (err) {
              return console.log('Error storing file in bucket: %s', err);
            }

            console.log('Stored file in bucket! ', file);

            keyring.set(file.id, secret);

            // Create mirrors here if desired
          });
        });
      });
    });
  });

  if (cb) {
    return cb();
  }
};

module.exports = start;
