var mysql=require("mysql");
var pool = mysql.createPool({
    waitForConnections:true,
    connectionLimit:2,
    host     : '120.79.237.49',
    user     : 'blog',
    password : '',
    database : 'blog'
});

var query = function(sql, param, callback){
    pool.getConnection(function(err, conn){
        if(err){
            callback(err,null,null);
            return
        }
        conn.query(sql, param, function(qerr, vals, fields){
            //事件驱动回调
            callback(qerr,vals,fields);
        });
          //释放连接
        conn.release()
    });
};


module.exports = query