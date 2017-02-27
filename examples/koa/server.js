var koa     = require('koa');
var sockjs  = require('sockjs');
var http    = require('http');
var fs      = require('fs');
var path    = require('path');

// 1. Echo sockjs server
var sockjs_opts = {sockjs_url: "http://cdn.jsdelivr.net/sockjs/1.0.1/sockjs.min.js"};
//这里的sockjs_url可以留空
var sockjs_echo = sockjs.createServer(sockjs_opts);
sockjs_echo.on('connection', function(conn) {
	console.log('connection received!');
	//connection只是连接的时候调用一次
    conn.on('data', function(message) {
     //每次客户端发送一个消息这里都会获取到
        conn.write("服务器返回消息"+message);
    });
});

// 2. koa server
var app = koa();
app.use(function *() {
    var filePath = __dirname + '/index.html';
    this.type = path.extname(filePath);
    this.body = fs.createReadStream(filePath);
});

var server = http.createServer(app.callback());
sockjs_echo.installHandlers(server, {prefix:'/echo'});
//All http requests that don't go under the path selected by prefix will remain unanswered
// and will be passed to previously registered handlers. You must install your custom http handlers before calling installHandlers.
//Once you have create Server instance you can hook it to the http.Server instance.
server.listen(9999, 'localhost');
console.log('服务器正常启动.......' );
