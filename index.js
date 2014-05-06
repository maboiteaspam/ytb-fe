
// gives an api to quickly
// programatically stop / start
// a front end server for ytb-wfe

var glob = require("glob")
var _ = require("underscore")
var express = require('express');
var http = require('http');
var fs = require('fs');

var d_options = {
  hostname:"localhost", // 0.0.0.0 to listen external interface
  port:3000,
  path:__dirname+"/www/",
  api_location:null
};

var YtbWfe = function(options) {

  options = _.defaults(options, d_options);

  var server;
  var app = express();
  if( options.api_location ){
    var router = express.Router();
    var inject_api_location = function(file){
      var n_content = "";
      n_content += "<head>";
      n_content += "<script> window.api_location ='"+options.api_location+"'; </script>";
      var f_content = fs.readFileSync(file).toString().replace("<head>",n_content);
      return f_content;
    };
    router.get(/\/index[.]htm(l)?/, function(req, res, next) {
      var file = options.path+"/"+req.path;
      if( fs.existsSync(file) ){
        var f_content = inject_api_location( file );
        return res.send(f_content);
      }
      next();
    });
    router.get("/", function(req, res, next) {
      var file = options.path+"/index.html";
      if( fs.existsSync(file) ){
        var f_content = inject_api_location( file );
        return res.send(f_content);
      }
      var file = options.path+"/index.htm";
      if( fs.existsSync(file) ){
        var f_content = inject_api_location( file );
        return res.send(f_content);
      }
      next();
    });
    router.get('/list_themes',  function(req, res){
      var opt = {
        cwd:options.path+'/themes/',
        mark:true
      }
      glob("*.css", opt, function (er, files) {
        var r = [];
        for( var n in files ){
          r.push({
            url:"/themes/"+files[n],
            name:files[n].replace(".bootstrap.min.css","")
          })
        }
        res.json(r);
      })
    });
    router.get('/config', function(req, res){
      res.json({

      });
    });
    app.use('/', router);
  }
  app.use(express.static( options.path ));

  this.start = function(then){
    server = http.createServer(app).listen(options.port,options.hostname,null,then);
  };
  this.stop = function(then){
    server.close(); // odd, after first client query, callback is not called anymore
    if( then ) then(); // have to trigger it manually here
  };
};
module.exports = YtbWfe;