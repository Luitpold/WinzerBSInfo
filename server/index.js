var fs = require('fs');
var http = require('http');
var https = require('https');

var colors = require('colors'); //Make the console output look nicer

var useSsl = false;

var express = require('express');
var app = express();

var httpServer = http.createServer(app);

function init(httpPort, httpsPort){
  colors.setTheme({
    error: ['white', 'bgRed']
  });

  console.log(getStatusPrefix() + '\tstarting http-Server..');
  httpServer.listen(httpPort);
  console.log(getStatusPrefix() + '\thttp-Servers running!\n' + getStatusPrefix() + '\tstarting https-Server..');
  startHttpsServer();
}

function startHttpsServer(){
  try{
    var privateKey = fs.readFileSync(__dirname + '/../ssl/server.key', 'utf8');
    var certificate = fs.readFileSync(__dirname + '/../ssl/server.cert', 'utf8');

    var credential = { key: privateKey, cert: certificate };
    var httpsServer = https.createServer(credential, app);
    httpsServer.listen(httpsPort);
    console.log('STATUS:'.blue + '\thttps-Servers running!');
    useSsl = true;
  }catch(e){
    var err = ('' + e).error;
    console.log(getStatusPrefix() + '\thttps-Server was not created!\n'+ err);
  }
}

function getStatusPrefix(){
  return (getDate() + ' STATUS:').blue
}

function getDate(){
  var now = new Date();
  return now.getHours() + ':' + now.getMinutes() + ':' + now.getSeconds();
}

//force ssl for maximum security
app.use(function(req, res, next) {
   if(!req.secure && useSsl) {
       return res.redirect(['https://', req.get('Host'), req.url].join(''));
   }
   console.log((getDate() + ' TRAFFIC:').green + '\t"' + (req.url).gray + '" was requested.');
   next();
});

//serve static fileSize - TODO: replace with custom routes to hide file structure
app.use(express.static(__dirname + '/../client'));

// ---------- start server ----------
init(80, 443);
