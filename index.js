var express = require('express');
var routes = require('./routes/index')
var app = express();

//设置端口号
app.set('port', process.env.PORT || 8081);

routes(app);

var server = app.listen(app.get('port'),function(){
   console.log('Express server listening on port ' + app.get('port'));
});