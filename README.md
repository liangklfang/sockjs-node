####1.服务端代码

```js
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

```


####2.客户端代码

```html

<!doctype html>
<html><head>
    <script src="//cdn.jsdelivr.net/jquery/2.1.4/jquery.min.js"></script>
    <script src="//cdn.jsdelivr.net/sockjs/1.0.1/sockjs.min.js"></script>
    <style>
     html{
      border:1px solid red;
     }
      .box {
          width: 300px;
          float: left;
          margin: 0 20px 0 20px;
      }
      .box div, .box input {
          border: 1px solid;
          -moz-border-radius: 4px;
          border-radius: 4px;
          width: 100%;
          padding: 0px;
          margin: 5px;
      }
      .box div {
          border-color: grey;
          height: 300px;
          overflow: auto;
      }
      .box input {
          height: 30px;
      }
      h1 {
          margin-left: 30px;
      }
      body {
          background-color: #F0F0F0;
          font-family: "Arial";
      }
    </style>
</head><body lang="en">
    <h1>SockJS Express example</h1>

    <div id="first" class="box">
      <div></div>
      <form><input autocomplete="off" value="Type here..."></input></form>
    </div>

    <script>
        var sockjs_url = '/echo';
        var sockjs = new SockJS(sockjs_url);
        //这里的sockjs_url要和服务器一致,否则服务器接受不到。而且客户端也要加入socket.js的源文件才能使用socketjs的API
        $('#first input').focus();

        var div  = $('#first div');
        var inp  = $('#first input');
        var form = $('#first form');

        var print = function(m, p) {
            p = (p === undefined) ? '' : JSON.stringify(p);
            div.append($("<code>").text(m + ' ' + p));
            div.append($("<br>"));
            div.scrollTop(div.scrollTop()+10000);
        };

        sockjs.onopen    = function()  {print('[*] open', sockjs.protocol);};
        sockjs.onmessage = function(e) {print('客户端收到内容', e.data);};
        //接收到服务器的消息
        sockjs.onclose   = function()  {print('[*] close');};
        //服务器关闭

        form.submit(function() {
            print('[ ] sending', inp.val());
            sockjs.send(inp.val());
            //发送消息到服务器
            inp.val('');
            return false;
        });

    </script>
</body></html>

```
