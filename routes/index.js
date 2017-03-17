var passport = require('../passport/routes/passport-routes.js');
var fileoperate = require('../fileoperate/routes/file-routes')

module.exports = function(app){
    for(var j in passport){
        app[passport[j].type](passport[j].route,passport[j].func);
    }

    for(var k in fileoperate){
        if(fileoperate[k].middleware){
            app[fileoperate[k].type](fileoperate[k].route,fileoperate[k].middleware,fileoperate[k].func);
        }else{
            app[fileoperate[k].type](fileoperate[k].route,fileoperate[k].func);
        }
    }
};