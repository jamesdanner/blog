const express = require('express')
const router  = express.Router()
const Query = require('../db/index')



let data = {}
//处理通用数据的方式   -重要-
router.use(function(req, res, next){
    data = {
        userInfo: req.userInfo,
        categories: []
    }
    Query('SELECT * FROM categories', function(err, rs, fields){
        data.categories = rs
        next()
    })
})


router.get('/', function(req, res, next){
    const {cat_id} = req.query
    const sql = `SELECT a.*, c.username, b.cat_name
                FROM content a
                LEFT JOIN categories b ON a.cat_id = b.cat_id
                LEFT JOIN users c ON a.user_id = c.user_id
                ${cat_id ? 'WHERE a.cat_id=?' : ''}
                ORDER BY a.add_time DESC`
    const params = [cat_id]
    Query(sql, params, function(err, doc){
        console.log(doc)
        
        data.contents = doc
        res.render('main/index', data)
    })
    
})

router.get('/view', function(req, res){
    const {content_id} = req.query
    const sql = `SELECT * FROM content WHERE content_id=?`
    const params = [content_id]
    
    Query(sql, params, function(err, doc){
        data.content = doc[0]
        const sql_com = `SELECT c.*, u.username
                        FROM comments c
                        LEFT JOIN users u ON c.user_id = u.user_id
                        WHERE content_id=?`
                        
        Query(`UPDATE content SET views = views+1 WHERE content_id = ? `, params, function(err, doc){})
        Query(sql_com, params, function(err, com_doc){
            data.comments_list = com_doc
            res.render('main/view', data)
        })
        
    })
    
})
module.exports = router