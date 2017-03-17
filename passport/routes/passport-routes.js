var crypto = require('crypto'),
    mongoose = require('mongoose'),
    setting = require('../../setting/db-set.js'),
    async = require('async');

// console.log('mongodb://'+setting.host+':'+setting.port+'/'+setting.db);
mongoose.connect('mongodb://'+setting.host+':'+setting.port+'/'+setting.db);
var User = require('../models/user.js')(mongoose);
var path = '/passport';
var code = require('../../setting/resCode.js');

module.exports = [
    /*
    用户注册接口
    type：post
    传入参数：username，password，passwordRepest
    成功返回：{
                code: '0000',
                msg: '注册成功'
            }
    */
    {
        type: 'post',
        route: path + '/reg',
        func: function(req,res){
            var username = req.body.username,
                password = req.body.password,
                password_re = req.body.passwordRepeat;

            if(username === ''){//用户名不能为空
                return printCode(res,'1000');
            }
            if(password === ''){//密码不能为空
                return printCode(res,'1001');
            }
            if (password_re != password) {//两次输入的密码不一致
                return printCode(res,'1002');
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
                    return printCode(res,'0002');
                }
                if(user){//用户已存在
                    return printCode(res,'1003');
                }
                newUser.save(function (err, user) {
                    if (err) {
                        return printCode(res,'0001');
                    }

                    printCode(res,'0000');
                });
            });

        }
    },
    /*
    用户登录接口
    type：post
    传入参数：username，password
    username可以是昵称，手机号，email
    成功返回：{
                code: '0000',
                msg: '登录成功'
            }
     */
    {
        type: 'post',
        route: path + '/login',
        func: function(req,res){
            var username = req.body.username,
                md5 = crypto.createHash('md5'),
                password = md5.update(req.body.password).digest('hex');

            if(!username){//密码不能为空
                return printCode(res,'1000');
            }
            if(!req.body.password){//密码不能为空
                return printCode(res,'1001');
            }

            async.waterfall([function(cb){
                if(!isNaN(username)){
                    User.get('phone',username,function(err,user){
                        if(err) return cb('0002');
                        //如果没有用户，继续往下走
                        if(!user) return cb();
                        //如果有用户，但是密码不正确
                        if(password !== user.password) return cb('1005');
                        //有用户，而且密码正确
                        cb('0000',user);
                    });
                }else{
                    cb();
                }
            },function(cb){
                User.get('email',username,function(err,user){
                    if(err) return cb('0002');
                    //如果没有用户，继续往下走
                    if(!user) return cb();
                    //如果有用户，但是密码不正确
                    if(password !== user.password) return cb('1005');
                    //有用户，而且密码正确
                    cb('0000',user);
                });

            },function(cb){
                User.get('name',username,function(err,user){
                    if(err) return cb('0002');
                    //如果没有用户，不能继续往下走了，要抛出错误，用户不存在
                    if(!user) return cb('1004');
                    //如果有用户，但是密码不正确
                    if(password !== user.password) return cb('1005');
                    //有用户，而且密码正确
                    cb('0000',user);
                });
            }],function(err,user){
                if(err==='0000'){
                    req.session.user = {
                        id: user.id,
                        name: user.name,
                        role: user.role
                    };
                    printCode(res,'0000');
                }else{
                    printCode(res,err);
                }
            });
        }
    },
    /*
     验证用户是否登录
     type：post
     传入参数：无
     成功返回：{
                 code: '0000',
                 user: {
                    id: xxx,
                    name: xxx,
                    role: xxx
                 }
             }
     */
    {
        type: 'post',
        route: path + '/islogin',
        func: function(req,res){
            var user = req.session.user;
            if(user){
                res.json({
                    code: '0000',
                    result: user
                });
            }else{
                printCode(res,'1006');
            }
            
        }
    },
    /*
     退出登录
     type：post
     传入参数：无
     成功返回：{
                 code: '0000',
                 msg: xxx
             }
     */
    {
        type: 'post',
        route: path + '/logout',
        func: function(req,res){
            req.session.user = null;
            printCode(res,'0000');
        }
    },
    /*
     获取用户信息
     type：post
     传入参数：id
     成功返回：{
                 code: '0000',
                 result: {
                    _id: xxx,
                    email: xxx,
                    name: xxx,
                    phone: xxx,
                    role: xxx
                 }
             }
     */
    {
        type: 'post',
        route: path + '/getUserInfo',
        func: checkLogin
    },
    {
        type: 'post',
        route: path + '/getUserInfo',
        func: function(req,res){
            var id = req.body.id;
            if(id == undefined){
                printCode(res,'0001');
            }
            User.get('id',id,function(err,user){
                if(err){
                    printCode(res,'0002');
                }
                res.json({
                    code: '0000',
                    result: user
                });
            },['_id','name','role','email','phone','head']);
        }
    },
    /*
     更新用户信息
     type：post
     传入参数：{
                _id: xxx,
                name: xxx,
                email: xxx,
                phone: xxx,
                sex: xxx
            }
     成功返回：{
                 code: '0000',
                 msg: xxx
             }
     */
    {
        type: 'post',
        route: path + '/uploadUserInfo',
        func: checkLogin
    },
    {
        type: 'post',
        route: path + '/uploadUserInfo',
        func: function(req,res){
            var id = req.body._id,
                user={};

            user.name = req.body.name;
            user.email = req.body.email;
            user.phone = req.body.phone;
            user.sex = req.body.sex;

            if(!id){
                return printCode(res,'0001');
            }
            if(!user.name){
                return printCode(res,'1000');
            }

            async.waterfall([function(cb){
                User.get('id',id,function(err,visiter){
                    if(err) return printCode('0002');
                    cb(null,visiter);
                });
            },function(visiter,cb){
                if(user.name != visiter.name){
                    User.get('name',user.name,function(err,user){
                        if(user){
                            cb('1003');
                        }else{
                            cb(null,visiter);
                        }
                    });
                }else{
                    cb(null,visiter);
                }
            },function(visiter,cb){
                if(user.email != visiter.email){
                    User.get('email',user.email,function(err,user){
                        if(user){
                            cb('1008');
                        }else{
                            cb(null,visiter);
                        }
                    });
                }else{
                    cb(null,visiter);
                }
            },function(visiter,cb){
                if(user.phone != visiter.phone){
                    User.get('phone',user.phone,function(err,user){
                        if(user){
                            cb('1007');
                        }else{
                            cb();
                        }
                    });
                }else{
                    cb();
                }
            },function(cb){
                User.upload(id,user,function(err){
                    if(err){
                        cb('0002');
                    }else{
                        cb();
                    }
                })
            }],function(err){
                if(err){
                    printCode(res,err);
                }else{
                    req.session.user.name = user.name;
                    printCode(res,'0000');
                }
            });
        }
    },
    {
        type: 'post',
        route: path + '/upUserHead',
        func: checkLogin
    },
    {
        type: 'post',
        route: path + '/upUserHead',
        func: function(req,res){
            var headurl = req.body.headurl,
                id = req.session.user.id,
                user={};
            if(!headurl){
                return printCode(res,'1009');
            }
            user.head = headurl;
            User.upload(id,user,function(err){
                if(err){
                    printCode(res,'0002');
                }else{
                    printCode(res,'0000');
                }
            })

        }
    }
];

//检查是否有登录态
function checkLogin(req, res, next) {
    if (!req.session.user) {
        return res.json({
            code: '1006',
            msg: code['1006']
        })
    }
    next();
}

// 打印错误码
function printCode(res,num){
    return res.json({
        code: num,
        msg: code[num]
    })
}