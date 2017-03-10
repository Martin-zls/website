var express = require('express');
var fs = require('fs');
var bodyParser = require('body-parser');
var path = require('path');
var routes = require('./routes/index');

var app = express();

//定义静态文件夹
app.use(express.static(path.join(__dirname, 'page')));

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

//设置端口号
app.set('port', process.env.PORT || 8081);

routes(app);

var server = app.listen(app.get('port'),function(){
   console.log('Express server listening on port ' + app.get('port'));
});