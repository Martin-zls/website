var login = require('./route-login');

module.exports = function(app){
    for(var i in login){
        app[login[i].type](login[i].route,login[i].func);
    }
};