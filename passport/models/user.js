var crypto = require('crypto');
var ObjectID = require('mongodb').ObjectID;
var async = require('async');

module.exports = function(mongoose){

    // 定义数据文档
    var userSchema = new mongoose.Schema({
        name: String,
        password: String,
        email: String,
        head: String,
        role: String,
        phone: Number,
        sex: Number
    },{
        collection: 'users'
    });

    var userModel = mongoose.model('User', userSchema);

    function User(user){
        this.name = user.name;
        this.password = user.password;
    }

    // 创建新用户
    User.prototype.save = function(callback){

        var defaultRole = 'vacationer';

        var user = {
            name: this.name,
            password: this.password,
            role: defaultRole
        };


        var newUser = new userModel(user);

        newUser.save(function(err, user){
            if(err){
                return callback(err);
            }
            callback(null,user);
        })

    };

    //获取用户信息
    User.get = function(type, content, callback, opt){
        var query = {};
        if(type == 'id'){
            query._id = new ObjectID(content);
        }else if(type == 'phone'){
            query.phone = content;
        }else if(type == 'email'){
            query.email = content;
        }else if(type == 'name'){
            query.name = content;
        }else{
            return callback('只支持通过【id,phone,email,name】来查询');
        }

        userModel.findOne(query,opt,function(err, user){
            if(err){
                return callback(err);
            }
            callback(null, user);
        });
    };

    //修改用户信息
    User.upload = function(_id, newuser, callback){
        if(!_id) callback('_id不能为空');
        if(!newuser) callback('更新内容不能为空');

        User.get('id',_id,function(err,user){
            if(!err){
                for(var i in user){
                    if(newuser[i] != null){
                        user[i] = newuser[i]
                    }
                }
                userModel.update({
                    "_id": new ObjectID(_id)
                },{$set: user}).exec(function(err){
                    callback(err,null);
                })
            }
        });
    };

    //获取用户列表
    User.getList = function(page, pagenum, callback){
        var num = pagenum || 10;

        async.waterfall([
                function(cb){
                    postModel.find({}).count(function(err, count){
                        cd(err,count);
                    })
                }
                , function(count, cb){
                    postModel.find({}).skip((page - 1) * 10).limit(num).sort({time:-1}).exec(function (err,docs) {
                        cb(err, docs, count);
                    });
                }
            ],function(err, docs, count){
                callback(err, docs, count);
            })
    };

    return User;

};