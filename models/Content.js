const mongoose = require('mongoose')

const ccontentSchema = require('../schemas/content')

//模型类的创建

module.exports = mongoose.model('Content', ccontentSchema)
