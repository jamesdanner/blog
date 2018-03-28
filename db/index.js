var mysql = require("mysql");
const {db} = require('../config/index')
var pool = mysql.createPool({
    waitForConnections:true,
    connectionLimit:2,
    host     : db.host,
    user     : db.user,
    password : db.password,
    database : db.database,
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