var login = require('./route-login');
var passport = require('../passport/routes/passport-routes.js')

module.exports = function(app){
    for(var i in login){
        app[login[i].type](login[i].route,login[i].func);
    }

    for(var j in passport){
        app[passport[j].type](passport[j].route,passport[j].func);
    }
};