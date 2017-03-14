var crypto = require('crypto'),
    mongoose = require('mongoose'),
    setting = require('../../setting/db-set.js'),
    async = require('async');

// console.log('mongodb://'+setting.host+':'+setting.port+'/'+setting.db);
mongoose.connect('mongodb://'+setting.host+':'+setting.port+'/'+setting.db);
var User = require('../models/user.js')(mongoose);

module.exports = [
    /*
    用户注册接口
    type：post
    传入参数：username，password，passwordRepest
    成功返回{
            code: '0000',
            msg: '注册成功'
        }
    */
    {
        type: 'post',
        route: '/passport/reg',
        func: function(req,res){
            var username = req.body.username,
                password = req.body.password,
                password_re = req.body.passwordRepeat,
                result = {};

            if(username == ''){//用户名不能为空
                result.code = '0001';
                result.msg = '用户名不能为空';
                return res.json(result);
            }
            if(password == ''){//密码不能为空
                result.code = '0001';
                result.msg = '密码不能为空';
                return res.json(result);
            }
            if (password_re != password) {//两次输入的密码不一致
                result.code = '0001';
                result.msg = '两次输入的密码不一致';
                return res.json(result);
            }

            //生成密码的 md5 值
            var md5 = crypto.createHash('md5'),
                password = md5.update(req.body.password).digest('hex');

            var newUser = new User({
                name: username,
                password: password
            });

            //检查用户名
            User.get('name', newUser.name, function(err, user){
                if(err){
                    return res.json({
                        code: '0001',
                        msg: err
                    })
                }

                if(user){
                    return res.json({
                        code: '0001',
                        msg: '用户已存在'
                    })
                }
                newUser.save(function (err, user) {
                    if (err) {
                        return res.json({
                            code: '0001',
                            msg: err
                        })
                    }

                    return res.json({
                        code: '0000',
                        msg: '注册成功'
                    })
                });
            })

        }
    },
    /*
    用户登录接口
    type：post
    传入参数：username，password
    username可以是昵称，手机号，email
    成功返回{
            code: '0000',
            msg: '登录成功'
        }
     */
    {
        type: 'post',
        route: '/passport/login',
        func: function(req,res){
            var username = req.body.username,
                md5 = crypto.createHash('md5'),
                password = md5.update(req.body.password).digest('hex');

            console.log(req.session.views,2222);

            async.waterfall([
                function(cb){
                    if(!isNaN(username)){
                        User.get('phone',username,function(err, user){
                            if(err){
                                return res.json(err);
                            }else{
                                if(user && user.password === password){
                                    res.json({
                                        code: '0000',
                                        msg: '登录成功'
                                    });
                                    req.session.user = user;
                                }else{
                                    cb();
                                }
                                
                            }
                        });
                    }else{
                        cb();
                    }
                    
                },
                function(cb){
                    User.get('email',username,function(err, user){
                        if(err){
                            return res.json(err);
                        }else{
                            if(user && user.password === password){
                                res.json({
                                    code: '0000',
                                    msg: '登录成功'
                                })
                                req.session.user = user;
                            }else{
                                cb();
                            }
                        }
                    })
                },
                function(cb){
                    User.get('name',username,function(err, user){
                        if(err){
                            return res.json(err);
                        }else{
                            if(user && user.password === password){
                                res.json({
                                    code: '0000',
                                    msg: '登录成功'
                                });
                                req.session.user = user;
                            }else{
                                cb();
                            }
                        }
                    })
                }
            ],function(){
                res.json({
                    code: '0001',
                    msg: '用户名或密码不正确'
                });
            });
            
        }
    },
    {
        type: 'post',
        route: '/passport/islogin',
        func: function(req,res){
            var views = req.session.views
            if (views == undefined) {
                req.session.views = 0;
            }else{
                req.session.views++;
            }
            console.log(req.session.views);
            res.json(req.session.views)
        }
    }
];