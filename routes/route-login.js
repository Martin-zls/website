module.exports = [
    {
        type: 'get',
        route: '/',
        func: function(req,res){
            res.send('Hello World');
        }
    },
    {
        type: 'get',
        route: '/1',
        func: function(req,res){
            console.log(req);
            res.send('Hello World11');
        }
    }
];