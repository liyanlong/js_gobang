// if you want read more serve-staitc package, 
// please access https://github.com/expressjs/serve-static

var serveStatic = require('serve-static');
var finalhandler = require('finalhandler')
var http = require('http');
var fs = require('fs');
var serve = serveStatic('./docs', {'index': ['index.html', 'index.htm']});
http.createServer(function (req, res) {
  serve(req, res, finalhandler(req, res));
}).listen(8080, '0.0.0.0')

console.log(`\nListening at http://localhost:8080\n`);
