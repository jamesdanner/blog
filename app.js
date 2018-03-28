const express = require('express')
const swig = require('swig')
const bodyParser = require('body-parser')
const Cookies = require('cookies')
const app = express()
const Query = require('./db/index')
//设置静态文件托管
//用户访问url以/public开始，那么直接返回 __dirname + '/public' 下的文件
app.use('/public', express.static( __dirname + '/public'))

//模板引擎的名称， 同时也是模板文件的后缀， / 解析处理模板内容的方法
app.engine('html', swig.renderFile)
//模板文件的目录（必须是views） / 目录
app.set('views', './views')

app.set('view engine', 'html')
//开发过程中要取消模板的缓存
swig.setDefaults({cache: false})

app.use(bodyParser({limit: '5mb'}))
//设置cookie
app.use(function(req, res, next){
    req.cookies = new Cookies(req, res)
    if(req.cookies.get('userInfo')){
        try {
            req.userInfo = JSON.parse(req.cookies.get('userInfo'))
            //获取管理员类型
            Query('SELECT * FROM users WHERE user_id=?', [req.userInfo.user_id], function(err, doc){
                req.userInfo.is_admin = Boolean(doc[0].is_admin)
            })
        }catch(e){
        }
    }
    next()
})
//设置bodyparser
app.use(bodyParser.urlencoded({extended: true}))


app.use('/admin', require('./routers/admin'))
app.use('/api', require('./routers/api'))
app.use('/', require('./routers/main'))
app.listen(5001, '127.0.0.1', function(){
    console.log('ok==')
})

