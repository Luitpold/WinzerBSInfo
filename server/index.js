var fs = require('fs'); //import the file handling module
var http = require('http'); //import http module
var https = require('https'); //import https module

var colors = require('colors'); var clear = require('clear'); clear(); //Make the console output look nicer

var useSsl = false;

//setup web server
var express = require('express');
var app = express();

var httpServer = http.createServer(app);

//start web server
function init(httpPort, httpsPort){
  //setup additional styles for the console
  colors.setTheme({
    error: ['white', 'bgRed']
  });

  console.log(getStatusPrefix() + '\tstarting http-Server..');
  httpServer.listen(httpPort); //start http server
  console.log(getStatusPrefix() + '\thttp-Servers running!\n' + getStatusPrefix() + '\tstarting https-Server..');
  startHttpsServer(httpsPort); //start https server
}

function startHttpsServer(httpsPort){
  try{ //check if the credentials are provided (/ssl/server.key; /ssl/server.cert)
    var privateKey = fs.readFileSync(__dirname + '/../ssl/server.key', 'utf8');
    var certificate = fs.readFileSync(__dirname + '/../ssl/server.cert', 'utf8');

    var credential = { key: privateKey, cert: certificate };
    var httpsServer = https.createServer(credential, app);
    httpsServer.listen(httpsPort);
    console.log('STATUS:'.blue + '\thttps-Servers running!');
    useSsl = true; //enable https enforcement
  }catch(e){ //show error in console
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
   if(!req.secure && useSsl) { //redirect to https if http is used and https server is running
       return res.redirect(['https://', req.get('Host'), req.url].join(''));
   }
   console.log((getDate() + ' TRAFFIC:').green + '\t"' + (req.url).gray + '" was requested by "' + (req.ip + '').gray + '".');
   next();
});

//serve static fileSize - TODO: replace with custom routes to hide file structure
app.use(express.static(__dirname + '/../client'));

// ---------- start server ----------
init(80, 443);
