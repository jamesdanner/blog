const express = require('express')
const router  = express.Router()
const User = require('../models/User')
const Category = require('../models/Category')
const Content = require('../models/Content')

let res_data = null;
router.use(function(req, res, next){
    res_data = {
        code: 0,
        msg: ''
    }
    next()
})


router.use(function(req, res, next){
    if(!req.userInfo.isAdmin){
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
    User.count().then(function(count){
        //计算总页数
        pages = Math.ceil(count / limit )
        
        
        //取值不能超过pages
        page = Math.min(page, pages)
        page = Math.max(page, 1)
        
        User.find().limit(limit).skip(skip).then(function(doc){
            // 从数据库中读取所有用户的条数
            //limit(number) 获取用户的跳数
            //skip(2) 忽略的用户条数
            /*
                每页显示两条
                1: 1-2 skip: 0 -> 当前
                2: 3-4 skip: 2
            */ 
            res.render('admin/users', {
                userInfo: req.userInfo,
                users: doc,
                count: count,
                pages: pages,
                limit: limit,
                page: page
            })
        })
        
    })
})

router.get('/category', function(req, res, next){
    //升序 1
    //降序 -1
    Category.find().sort({_id: -1}).then(function(doc){
        res.render('admin/category', {
            userInfo: req.userInfo,
            category: doc
        })
    })
    
})

router.post('/category/add', function(req, res, next){
    const {name} = req.body
    if(!name){
        res_data.code = 1
        res_data.msg = '分类名称不能为空！'
        res.json(res_data)
        return
    }
    Category.findOne({name: name}).then(function(info){
        if(info){
            res_data.code = 4
            res_data.msg = '用户名被注册'
            res.json(res_data)
            return
        }
        let category = new Category({
            name: name
        });
        return category.save()
    }).then(function(info){
        res_data.msg = '添加成功！'
        res.json({
            data: info,
            code: res_data.code,
            msg: res_data.msg
        })
    })
})

router.post('/category/edit', function(req, res, next){
    const {name, id} = req.body
    if(!name){
        res_data.code = 1
        res_data.msg = '分类名称不能为空！'
        res.json(res_data)
        return
    }
    Category.findOne({name: name}).then(function(info){
        if(info){
            res_data.code = 4
            res_data.msg = '用户名被注册'
            res.json(res_data)
            return
        }
        Category.findOneAndUpdate({_id: id}, {name: name}, function(doc){
            res_data.msg = '更新成功！'
            res.json(res_data)
        })
    })
})

router.get('/category/delete', function(req, res, next){
    Category.deleteOne({_id: req.query.id}).then(function(err){
        res_data.msg = '删除成功！'
        res.json(res_data)
    })
})
router.get('/category/info', function(req, res, next){
    Category.findById({_id: req.query.id}).then(function(doc){
        res.json({
            data: doc,
            code: res_data.code,
            msg: res_data.msg
        })
    })
})



// 文章管理
router.get('/content', function(req, res, next){
    let page = req.query.page || 1
    const limit = 10
    const skip = (page - 1) * limit
    let pages = 0
    Content.count().then(function(count){
        pages = Math.ceil(count / limit)
        page = Math.min(page, pages)
        page = Math.max(page, 1)
        Content.find().limit(limit).skip(skip).populate(['category', 'user']).then(function(doc){
            res.render('admin/content', {
                userInfo: req.userInfo,
                contents: doc,
                count: count,
                pages: pages,
                limit: limit,
                page: page
            })
        })
    })
})
router.get('/content/add', function(req, res, next){
    Category.find().then(function(doc){
        res.render('admin/add', {
            userInfo: req.userInfo,
            categories: doc
        })
    })
})
                
router.get('/content/edit', function(req, res, next){
    Content.findById({_id: req.query.id}).then(function(doc){
        res.json({
            code: 0,
            data: doc
        })
        
    })
    
})
router.get('/content/delete', function(req, res){
    Content.deleteOne({_id: req.query.id}, function(doc){
        res.json({
            code: 1,
            msg: '删除成功！'
        })
    })
})
router.post('/content/add', function(req, res, next){
    let {category, title, description, content} = req.body
    if(!category) {
        res.json({
            code: 1,
            msg: '分类不能为空'
        })
        return
    }
    if(!title) {
        res.json({
            code: 1,
            msg: '标题不能为空'
        })
        return
    }
    new Content({
        category: category,
        title: title,
        user: req.userInfo._id.toString(),
        description: description,
        content: content
    }).save().then(function(doc){
        res.json({
            code: 0,
            msg: '添加成功！'
        })
    })
    
})
module.exports = router