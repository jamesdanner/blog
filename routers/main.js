const express = require('express')
const router  = express.Router()
const Category = require('../models/Category')
const Content = require('../models/Content')




let data = {}
//处理通用数据的方式   -重要-
router.use(function(req, res, next){
    data = {
        userInfo: req.userInfo,
        categories: []
    }
    Category.find().then(function(doc){
        data.categories = doc
        next()
    })
})


router.get('/', function(req, res, next){
    
    data.page = Number(req.query.page || 1)
    data.limit = 10
    data.pages = 0
    data.count = 0
    data.category = req.query.category || ''

    let where = {}
    if(data.category){
        where.category = data.category
    }
    Content.where(where).count().then(function(count){
        data.count = count
        data.page = Math.min(data.page, data.pages)
        data.page = Math.max(data.page, 1)
        let skip = (data.page - 1) * data.limit

        
        return Content.where(where).find().limit(data.limit).skip(skip).populate(['category', 'user']).sort({addTime: -1})
    }).then(function(contents){
        data.contents = contents
        res.render('main/index', data)
    })
    
    
    
})

router.get('/view', function(req, res){
    const {content_id} = req.query
    
    Content.findOne({
        _id: content_id
    }).populate('user').then(function(doc){
        data.content = doc
        doc.views++
        doc.save()
        data.content.comments = data.content.comments.reverse()
        res.render('main/view', data)
    })

})
module.exports = router