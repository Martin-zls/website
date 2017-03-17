var express = require('express');
var fs = require('fs');
var bodyParser = require('body-parser');
var path = require('path');
var routes = require('./routes/index');
var setting = require('./setting/db-set.js');
// var connect = require('connect');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);

var app = express();


//设置端口号
app.set('port', process.env.PORT || 8081);


//定义静态文件夹
app.use(express.static(path.join(__dirname, 'page')));
app.use(express.static(path.join(__dirname, 'fileoperate')));

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({extended: true})); // for parsing application/x-www-form-urlencoded

//把session存在mongo里，这样在重启浏览器之后登录态还在。
app.use(session({
    secret: setting.cookieSecret,
    resave: false,
    saveUninitialized: true,
    cookie: {secure: false},
    store: new MongoStore({
        url: 'mongodb://'+setting.host+':'+setting.port+'/'+setting.db
    })
}));

routes(app);

var server = app.listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
});