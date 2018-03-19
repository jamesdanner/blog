const mongoose = require('mongoose')

//用户的表结构
module.exports = new mongoose.Schema({
    // 关联字段！！！！！！！
    //分类信息
    category: {
        type: mongoose.Schema.Types.ObjectId,
        //引用
        ref: 'Category'
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    addTime: {
        type: Date,
        default: new Date()
    },
    views: {
        type: Number,
        default: 0
    },
    title: String,
    description: {
        type: String,
        default: ''
    },
    content: {
        type: String,
        default: ''
    },
    comments: {
        type: Array,
        default: []
    }

})