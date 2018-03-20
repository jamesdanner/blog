const express = require('express')
const router  = express.Router()
const User = require('../models/User')
const Content = require('../models/Content')
const Query = require('../db/index')

let res_data = null;
router.use(function(req, res, next){
    res_data = {
        code: 0,
        msg: ''
    }
    next()
})
router.post('/user/register', function(req, res, next){
    const {username, password, repassword} = req.body
    if(!username){
        res_data.code = 1
        res_data.msg = '用户名不能为空'
        res.json(res_data)
        return
    }
    if(!password){
        res_data.code = 1
        res_data.msg = '密码不能为空'
        res.json(res_data)
        return
    }
    if(password !== repassword){
        res_data.code = 1
        res_data.msg = '两次密码不一致'
        res.json(res_data)
        return
    }
    var sql = 'SELECT * FROM users WHERE username=?'
	var param = [username]
    Query(sql, param, function(err, rs, fields){
        if(rs.length > 0) {
            res_data.code = 4
            res_data.msg = '用户名被注册'
            res.json(res_data)
            return
        } else {
            res_data.msg = '注册成功！'
            res.json(res_data)
            var sql = 'insert into users(username,password) values(?,?)';
            var param = [username, password];
            Query(sql,param,function(err,rs){})
        }
    })
    
})

router.post('/user/login', function(req, res, next){
    const {username, password} = req.body
    const sql = 'SELECT * FROM users WHERE username=? AND password=?'
    const param = [username, password]
    Query(sql, param, function(err, rs, fields){
        if(rs.length === 0 ){
            res_data.code = 2
            res_data.msg = '用户名或者密码错误'
        } else {
            res_data.code = 0
            res_data.msg = '登录成功！'
            console.log(rs);
            
            req.cookies.set('userInfo', JSON.stringify({
                user_id: rs[0].user_id,
                username: rs[0].username,
                is_admin: rs[0].is_admin
            }))
        }
        res.json(res_data)
    })
})
router.get('/user/logout', function(req, res, next){
    req.cookies.set('userInfo', null)
    res.json(res_data)
})

//评论提交

router.post('/comment/post', function(req, res, next){
    const id = req.body.content_id || 0;
    let postData = {
        username: req.userInfo.username,
        postTime: new Date(),
        content: req.body.content
    }
    Content.findOne({
        _id: id
    }).then(function(content){
        content.comments.push(postData)
        return content.save()
    }).then(function(newContent){
        res_data.msg = '评论成功！'
        res_data.data = newContent
        res.json(res_data)
    })
})


module.exports = router