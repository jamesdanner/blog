const mongoose = require('mongoose')

const categorySchema = require('../schemas/categories')

//模型类的创建

module.exports = mongoose.model('Category', categorySchema)
