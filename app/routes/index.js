'use strict';

var changeCase = require('change-case');
var express = require('express');
var routes = require('require-dir')();

module.exports = function(app) {

  // Initialize all routes
  Object.keys(routes).forEach(function(routeName) {
    var router = express.Router();
    // You can add some middleware here
    // router.use(someMiddleware);

    // Initialize the route to add its functionality to router
    require('./' + routeName)(router);
    console.log("Loading route name: " + routeName);

    // Add router to the speficied route name in the app
    app.use('/' + changeCase.paramCase(routeName), router);
  });
};
