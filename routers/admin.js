const express = require('express')
const router  = express.Router()
const Query = require('../db/index')
const util = require('../utils/index')
const {client} = require('../config/index')
const fs = require('fs');
var co = require('co');



let res_data = null;
router.use(function(req, res, next){
    res_data = {
        code: 0,
        msg: ''
    }
    next()
})


router.use(function(req, res, next){
    if(!req.userInfo.is_admin){
        res.send('请通过管理员账户登录！')
    }
    next()
})

router.get('/', function(req, res, next){
    res.render('admin/index')
})

router.get('/users', function(req, res, next){
    let page = req.query.page || 1
    const limit = 10
    const skip = (page - 1) * limit
    let pages = 0

    const sql = 'SELECT user_id, username, is_admin FROM users'
    const params = []

    Query(sql, params, function(err, rs, fields){
        res.render('admin/users', {
            userInfo: req.userInfo,
            users: rs,
        })
    })
})

router.get('/category', function(req, res, next){
    //升序 1
    //降序 -1
    const sql = 'SELECT * FROM categories'
    const params = []
    Query(sql, params, function(err, rs, fields){
        console.log(rs);
        res.render('admin/category', {
            userInfo: req.userInfo,
            category: rs,
        })
    })
    
})

router.post('/category/add', function(req, res, next){
    const {cat_name} = req.body
    if(!cat_name){
        res_data.code = 1
        res_data.msg = '分类名称不能为空！'
        res.json(res_data)
        return
    }
    Query('SELECT * FROM categories WHERE cat_name=?', [cat_name], function(err, doc){
        if(doc.length !== 0){
            res_data.code = 4
            res_data.msg = '用户名被注册'
            res.json(res_data)
            return
        }
        var sql = 'insert into categories(cat_name) values(?)'
        var param = [cat_name]
        Query(sql, param, function(err, rs){
            if(!err){
                res.json({
                    msg: '添加成功！'
                })
            }
        })
    })
})

router.post('/category/edit', function(req, res, next){
    const {cat_name, cat_id} = req.body
    if(!cat_name){
        res_data.code = 1
        res_data.msg = '分类名称不能为空！'
        res.json(res_data)
        return
    }
    Query('SELECT * FROM categories WHERE cat_name=?', [cat_name], function(err, doc){
        if(doc.length !== 0){
            res_data.code = 4
            res_data.msg = '用户名被注册'
            res.json(res_data)
            return
        }
        Query('UPDATE categories SET cat_name=? WHERE cat_id=?', [cat_name, cat_id], function(err, doc){
            res_data.msg = '更新成功！'
            res.json(res_data)
        })
    })
})

router.get('/category/delete', function(req, res, next){
    Query('DELETE FROM categories WHERE cat_id=?', [req.query.id], function(err, rs){
        if(!err) {
            res_data.msg = '删除成功！'
            res.json(res_data)
        }
    })
})
router.get('/category/info', function(req, res, next){
    Query('SELECT * FROM categories WHERE cat_id=?', [req.query.id], function(err, doc){
        console.log(doc);
        
        res.json({
            data: doc[0],
            code: res_data.code,
            msg: res_data.msg
        })
    })
    
})



// 文章管理
router.get('/content', function(req, res, next){
    const sql = `SELECT a.*, c.username, b.cat_name 
                FROM content a
                LEFT JOIN categories b ON a.cat_id = b.cat_id
                LEFT JOIN users c ON a.user_id = c.user_id
                ORDER BY a.add_time DESC`
    const params = []
    Query(sql, params, function(err, rs){
        res.render('admin/content', {
            userInfo: req.userInfo,
            contents: rs
        })
    })
    
})
router.get('/content/add', function(req, res, next){
    Query('SELECT * FROM categories', function(err, doc){
        res.render('admin/add', {
            userInfo: req.userInfo,
            categories: doc
        })
    })
})
                
router.get('/content/edit', function(req, res, next){
    const sql = 'SELECT * FROM content WHERE content_id=?'
    const params = [req.query.id]
    Query(sql, params, function(err, doc){
        res.json({
            code: 0,
            data: doc[0]
        })
    })
})
router.get('/content/delete', function(req, res){
    Query('DELETE FROM content WHERE content_id=?', [req.query.id], function(err, rs){
        if(!err) {
            res.json({
                code: 0,
                msg: '删除成功！'
            })
        }
    })
})

//文章添加
router.post('/content/add', function(req, res, next){
    let {cat_id, title, description, content, cover_url} = req.body

    var fileName = util.imgKey() + '.jpg';
    // 构建图片路径
    var filePath = __dirname + '/tmp/' + fileName;
    //过滤data:URL
    if(!cover_url){
        res.end({code: 0, msg: "图片上传不能为空！"})
    }
    
    var base64Data = cover_url.replace(/^data:image\/\w+;base64,/, "");
    var dataBuffer = new Buffer(base64Data, 'base64');
    fs.writeFile(filePath, dataBuffer, function(err) {
        if(err){
          res.end(JSON.stringify({status:"102",msg:"文件写入失败"})); 
        }else{
            var localFile = filePath;
            var key = fileName;
            //阿里云 上传文件 
            co(function* () {
                client.useBucket('e-lygpics');
                var result = yield client.put(key, filePath);
                var imageSrc = 'http://e-lygpics.oss-cn-shenzhen.aliyuncs.com/' + result.name;
                var sql = 'insert into content(cat_id, title, description, content, user_id, cover_url) values(?, ?, ?, ?, ?, ?)'
                var param = [cat_id, title, description, content, req.userInfo.user_id, imageSrc]
                Query(sql, param, function(err, rs){
                    if(!err){
                        res.json({
                            msg: '添加成功！'
                        })
                        fs.unlinkSync(filePath);
                    }
                })
            }).catch(function (err) {
                console.log(err);
                res.end(JSON.stringify({code: 0,msg:'上传失败',error:err},"utf-8")); 
                //上传之后删除本地文件
                fs.unlinkSync(filePath);
            });
           
           
        }
    });



    
})
module.exports = router