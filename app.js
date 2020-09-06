const express = require('express')
const app = express()
const port = 3000


//Handles Sessions
const session = require('express-session')
app.use(session({
  key: 'user_sid',
  // user_sid :null,
  secret: 'hard work',
  resave: false,
  saveUninitialized: false,

  cookie: {

    expires: 600000000
  }

}));

//mongoDB
// const mongo_uri = "mongodb+srv://future_curves:13533407585@cluster0-sslsz.mongodb.net"

const dbConfig = require('./app/config/mongodb.config.js');
const mongoose = require('mongoose');


mongoose.Promise = global.Promise;

// Connecting to the database
mongoose.connect(dbConfig.url)
  .then(() => {
    console.log("Successfully connected to MongoDB.");
  }).catch(err => {
    console.log('Could not connect to MongoDB.');
    process.exit();
  });

const MongoClient = require('mongodb').MongoClient;

//body Parser
bodyParser = require("body-parser")
//// PARSE APPLICATION/X-WWW-FORM-URLENCODED///////////////
/**/app.use(bodyParser.urlencoded({ extended: false }))/**/
//                 PARSE APPLICATION/JSON                //
/**/app.use(bodyParser.json())						   /**/
///////////////////////////////////////////////////////////


//folder structure
app.use(express.static(__dirname + '/static'));

const users = require('./app/controllers/user.controller.js');


// 验证 login verification
app.post('/user/verify', users.verify)


//登出
app.get('/user/logout', users.logout)


//提交注册表单到此
app.post('/user/register', users.register)


// 换发音人
app.post('/user/changeAnnouncer', users.changeAnnouncer)

// 获取当前用户的资料
app.get('/user/getProfile', users.getProfile)

// 进入学习表时
app.post('/enterWordList', users.enterWordList)

// 获取当前列表的学习进度
app.get('/getTrackerInfo', users.getTrackerInfo)

// 添加单词到 favorite
app.post('/addFavorite', users.addFavorite)

// 取消 cancel favorite
app.post('/cancelFavorite',users.cancelFavorite)

// 获取收藏夹的内容
app.get('/getFavorite', users.getFavorite)

//下一个卡片时，更新tracker
app.post('/wordIndexUpdate', users.wordIndexUpdate)


//获取已斩单词
app.get('/getPassedList', users.getPassedList)

//加入已斩单词
app.post('/addToPassedList', users.addToPassedList)



// Root, index.html
app.get('/', (req, res) => res.send('/index.html'))

//报告错误
app.post('/bugReport',users.bugReport)


//当前数据倒退1
app.post('/wordIndexMinus',(req,res)=>{

})

// app.get('/getDistractor',users.getDistractor)

//根据之前的端口变量 const port 进行侦听
//${port}把具体的port也log出来。
app.listen(port, () => console.log(`Example app listening on port ${port}!`))