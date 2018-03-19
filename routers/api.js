const express = require('express')
const router  = express.Router()
const User = require('../models/User')
const Content = require('../models/Content')

let res_data = null;
router.use(function(req, res, next){
    res_data = {
        code: 0,
        msg: ''
    }
    next()
})
router.post('/user/register', function(req, res, next){
    console.log(req.body);
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
    User.findOne({username: username}).then(function(userInfo){
        if(userInfo){
            res_data.code = 4
            res_data.msg = '用户名被注册'
            res.json(res_data)
            return
        }
        let user = new User({
            username: username,
            password: password
        });
        return user.save()
    }).then(function(newUserInfo){
        res_data.msg = '注册成功！'
        res.json(res_data)
    })
})

router.post('/user/login', function(req, res, next){
    const {username, password} = req.body
    User.findOne({username: username, password: password}).then(function(userInfo){
        if(!userInfo) {
            res_data.code = 2
            res_data.msg = '用户名或者密码错误'
        } else {
            res_data.code = 0
            res_data.msg = '登录成功！'
        }
        req.cookies.set('userInfo', JSON.stringify({
            _id: userInfo._id,
            username: userInfo.username,
            isAdmin: userInfo.isAdmin
        }))
        
        
        res.json(res_data)
        return
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