var crypto = require('crypto');
var ObjectID = require('mongodb').ObjectID;

module.exports = function(mongoose){

    // 定义数据文档
    var userSchema = new mongoose.Schema({
        username: String,
        password: String,
        email: String,
        head: String,
        role: String,
        phone: Number,
        Sex: Number
    },{
        collection: 'users'
    });

    var userModel = mongoose.model('User', userSchema);

    function User(user){
        this.phone = user.name;
        this.email = user.email;
        this.password = user.password;
    };

    // 创建新用户
    User.prototype.save = function(user,callback){

        var md5 = crypto.createHash('md5'),
            defaultRole = 'vacationer';

        var user = {
            phone: this.phone,
            email: this.email,
            password: this.passowrd,
            role: defaultRole
        };

        var newUser = new userModel(user);

        newUser.save(function(err, user){
            if(err){
                return callback(err);
            }
            callback(null,user);
        })

    }

    //获取用户信息
    User.get = function(type, content, callback){
        var query = {};
        if(type=='id'){
            query._id = new ObjectID(content);
        }else if(type == 'phone'){
            query.phone = centent;
        }else if(type == 'email'){
            query.email = content;
        }else if(type == 'name'){
            query.name = content;
        }else{
            callback('只支持通过【id,phone,email,name】来查询');
        }
        userModel.findOne(query,function(err, user){
            if(err){
                return callback(err);
            }
            callback(null, user);
        });
    }

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
                postModel.update({
                    "_id": new ObjectID(_id)
                },{$set: user}).exec(function(err){
                    callback(err,null);
                })
            }
        });
    }

}