var express = require('express');
var http = require('http');
var path = require('path');
var logger = require('morgan');
var errorhandler = require("errorhandler");

var app = express();

app.set('port', process.env.PORT || 8081);
app.use(logger());
app.use(errorhandler());

//app.use(express.static(__dirname)); // Current directory is root
app.use(express.static(path.join(__dirname, 'dist')));

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
