#!/usr/bin/env node
"use strict";

// gives a cli interface to quickly
// stop / start
// a front end server for ytb-wfe

// to read command line options
var argv = require('yargs').argv;
// to read command line user input
var readline = require('readline');
// to open a static html server
var YtbWfe = require("./index.js");

// read command line activity
var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// default options
var options={}
if( argv.path ) options.path = argv.path;
if( argv.port ) options.port = argv.port;

// create an app instance
var feServer = new YtbWfe( options );

// starts the fe server
feServer.start(function(){
  // then wait for command line ur input to quit
  rl.question("Press enter to quit..", function(answer) {
    // free resources and quit
    feServer.stop(function(){
      rl.close();
    });
  });
});
