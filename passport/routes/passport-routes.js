var crypto = require('crypto'),
    mongoose = require('mongoose'),
    setting = require('../../setting/db-set.js');

console.log('mongodb://'+setting.host+':'+setting.port+'/'+setting.db);
mongoose.connect('mongodb://'+setting.host+':'+setting.port+'/'+setting.db);
var User = require('../models/user.js')(mongoose);

module.exports = [
    {
        type: 'post',
        route: '/passport/reg',
        func: function(req,res){
            var username = req.body.username,
                password = req.body.password,
                password_re = req.body.passwordRepeat,
                result = {};

            if(username == ''){//用户名不能为空
                result.code = '0000';
                result.msg = '用户名不能为空';
                return res.json(result);
            }
            if(password == ''){//密码不能为空
                result.code = '0000';
                result.msg = '密码不能为空';
                return res.json(result);
            }
            if (password_re != password) {//两次输入的密码不一致
                result.code = '0000';
                result.msg = '两次输入的密码不一致';
                return res.json(result);
            }

            //生成密码的 md5 值
            var md5 = crypto.createHash('md5'),
                password = md5.update(req.body.password).digest('hex');
            var newUser = new User({
                name: username,
                password: password,
                email: ''
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
                        code: '0002',
                        msg: '用户已存在'
                    })
                }
                newUser.save(function (err, user) {
                    if (err) {
                        return res.json({
                            code: '0003',
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
    {
        type: 'post',
        route: '/passport/getUserList',
        func: function(req,res){
            var username = req.body.username,
                password = md5.update(req.body.password).digest('hex');

            User.get('name',username,function(err, user){
                if(err){
                    res.json(err);
                }
                if()
            });
        }
    }
];