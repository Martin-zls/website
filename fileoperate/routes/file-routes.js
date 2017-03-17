var path = '/file';
var code = require('../../setting/resCode.js');
var settings = require('../../setting/db-set.js');
var multer = require('multer');
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, settings.uploadDest)
    },
    filename: function (req, file, cb) {
        var arr = file.originalname.split('.');
        cb(null, 'files_' + Date.now() + '_' + Math.ceil(Math.random()*10000) + '.' + arr.pop());
    }
});
var upload = multer({ storage: storage }).single('avatar');

module.exports = [
    {
        type: 'post',
        route: path+'/fileUpload',
        func: checkLogin
    },
    {
        type: 'post',
        route: path+'/fileUpload',
        func: function(req, res){
            upload(req,res,function (err) {
                if(err){
                    if(err.code === 'LIMIT_UNEXPECTED_FILE'){
                        return printCode(res,'2001')
                    }else{
                        return printCode(res,'2000')
                    }
                }
                res.send({
                    code: '0000',
                    filename: req.file.filename
                })
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