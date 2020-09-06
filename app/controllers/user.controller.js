//User start
//This class is modeled after the online tutorial source:
//source:
//https://github.com/academind/node-restful-api-tutorial/tree/10-auth-signup
//Content: findAll(), register(), verify()
var MongoClient = require('mongodb').MongoClient;
//User is a mongoDB schema, which defines how a data object should look like
const User = require('../models/user.model.js');
const fs = require('fs');
var bodyParser = require('body-parser');

const dbConfig = require('../config/mongodb.config.js');

//"users" IS THE MODULE WITH FUNCTIONS THAT ARE IN 
const users = require('../controllers/user.controller.js');


//THIS IS A FUNCTION INVOKED WHEN THE USER REGISTERS
exports.register = (req, res) => {
    console.log("req.body");
    // console.log(req);
    console.log(req.body);
    console.log('Post a User: ' + JSON.stringify(req.body));

    //THE REGISTER AJAX BODY WILL BE USED TO CREATE A USER
    const user = new User({
        username: req.body.username,
        password: req.body.password,
        email: req.body.email,
        phoneno: req.body.phoneno,
        firstname: req.body.firstname,
        lastname: req.body.lastname
    });
    //POPULATES THE NEWLY CREATED OBJECT SHOWN ABOBE, INTO THE DATABASE.
    try {
        User.create(user).then(() => {
            res.send("Register Sucessful<br/><a href='/login.html'>Login and Start Learning!</a>");
           
            
        }).catch(() => { 

            res.send("Userame or email already exists, please try again!<a href='/login.html'>Back</a>") 
       
            
        });
    } catch (error) {
        console.log(error)
        res.send("Register Failed, please try again.   ")
    }
    finally {

    }


};


//THIS IS A FUNCTION TO PARSE A STRING INTO A MONGO OBJECTID
//THE MONGODB OBJECT ID(_id) IS UNIQUE FOR EACH OF THE DATABASE OBJECT 
var ObjectId = require('mongodb').ObjectID;

exports.verify = (req, res) => {


    let usn = req.body.username;
    let successMsg = " login successful";
    let incorrectMsg = "password not correct";
    let usrnameNotFoundMsg = "username not found";
    console.log("the user tried logging in with username: \n" + usn);

    let query = User.findOne({ "username": usn });
    query.then(function (theUser) {
        //if the user exists
        if (theUser) {
            //and the password corresponds to the username from the DB
            if (theUser.toObject().password == req.body.password) {

                console.log(theUser.toObject().username + successMsg)

                req.session.user_sid = theUser.toObject()._id;

                //The User's Session ID
                console.log("The User with req.session.user_sid")
                console.log(req.session.user_sid)
                console.log("has logged in")


                res.cookie({
                    "user_sid": theUser._id,
                    "sub": "null",
                    "UI_style": theUser.UI_style
                })

                console.log("redirecting to homepage----------")
                res.redirect("/homepage.html")


                res.end()
            }
            //but the password was not right
            else {
                console.log(incorrectMsg)
                res.send(incorrectMsg);
            }

        } else {
            console.log(usrnameNotFoundMsg);

            res.send(usrnameNotFoundMsg);
            res.end()
        }
    })

}

exports.changeAnnouncer = (req, res) => {
    MongoClient.connect(dbConfig.url, function (err, db) {
        if (err) throw err;
        var dbo = db.db("francomobile");

        console.log("req.body------------------line 104")
        console.log(req.body)

        let announcer = req.body.announcer

        console.log(announcer)

        dbo.collection("users").updateOne(
            //find the correct ObjectID
            {
                _id: ObjectId(req.session.user_sid),
            },
            {

                //set the announcer
                $set: { "announcer": announcer }
            }
        )
        db.close()
        res.end()
    });

}

exports.getProfile = (req, res) => {

    MongoClient.connect(dbConfig.url, function (err, db) {
        if (err) throw err;
        var dbo = db.db("francomobile");

        //find the user by session ID
        dbo.collection("users").findOne({
            _id: ObjectId(req.session.user_sid)
        }).then(theUser => {
            console.log(theUser)

            res.send(theUser)
            db.close()
            res.end()

        })

    })
}


exports.enterWordList = (req, res) => {
    console.log(req.body.chosenWordList)

    let wordlist_name = req.body.chosenWordList
    console.log("wordlist_name")
    console.log(wordlist_name)


    MongoClient.connect(dbConfig.url, function (err, db) {
        if (err) throw err;
        var dbo = db.db("francomobile");

        //find the user by session ID
        dbo.collection("wordlist").findOne({}
            , { wordlist_name: { $exists: true } }
        ).then(wordlist => {

            console.log("wordlist--------line 162")
            // console.log(wordlist)
            res.send(wordlist)
            db.close()
            res.end()
        })

    })
}

exports.getTrackerInfo = (req, res) => {
    MongoClient.connect(dbConfig.url, function (err, db) {
        if (err) throw err;
        var dbo = db.db("francomobile");

        //find the user by session ID
        dbo.collection("users").findOne(
            {
                _id: ObjectId(req.session.user_sid)
            }
        ).then(theUser => {

            console.log("theUser.tracker")
            console.log(theUser.tracker)
            tracker = theUser.tracker
            res.send(tracker)
            db.close()
            res.end()
        })

    })
}

// 添加到喜欢列表 Add Word To Favorite
exports.addFavorite = (req, res) => {

    MongoClient.connect(dbConfig.url, function (err, db) {
        if (err) throw err;
        var dbo = db.db("francomobile");

        let favoriteWord = req.body.favoriteWord

        dbo.collection("users").updateOne(
            //find the correct ObjectID
            {
                _id: ObjectId(req.session.user_sid),
            },
            {
                // 把这个单词
                $push: { "favorite": favoriteWord }
            },
            { upsert: true }
        )
        db.close()
        res.end()
    });

}


// 取消收藏 pop from favorite list
exports.cancelFavorite = (req, res) => {

    MongoClient.connect(dbConfig.url, function (err, db) {
        if (err) throw err;
        var dbo = db.db("francomobile");

        console.log("req.body------------------line 235")
        console.log(req.body)

        let favoriteWord = req.body.favoriteWord

        console.log("favoriteWord ------ 240")
        console.log(favoriteWord)

        dbo.collection("users").updateOne(
            //find the correct ObjectID
            {
                _id: ObjectId(req.session.user_sid),
            },
            {
                // 把这个单词从收藏列表中拿出
                $pull: { "favorite": favoriteWord }
            },
            { upsert: true }
        )
        db.close()
        res.end()
    });

}

exports.getFavorite = (req, res) => {

    MongoClient.connect(dbConfig.url, function (err, db) {
        if (err) throw err;
        var dbo = db.db("francomobile");

        console.log("req.body------------------line 235")
        console.log(req.body)

        let favoriteWord = req.body.favoriteWord

        console.log("favoriteWord ------ 240")
        console.log(favoriteWord)

        dbo.collection("users").findOne(
            //find the correct ObjectID
            {
                _id: ObjectId(req.session.user_sid),
            },
        ).then(result => {
            console.log("result.favorite ------------ 279")
            console.log(result.favorite)
            res.send(result.favorite)
            db.close()
            res.end()
        })

    });


}

//the when the user clicks on "next word"
//the index to keep track of the current word in the database
//increases one. 
exports.wordIndexUpdate = (req, res) => {
    let currentWordListName = req.body.currentWordListName
    let currentStudyProgress = parseInt(req.body.currentStudyProgress)

    console.log(currentWordListName)
    var listTracker = "tracker." + currentWordListName

    try {
        MongoClient.connect(dbConfig.url, function (err, db) {
            if (err) throw err;
            var dbo = db.db("francomobile");


            dbo.collection("users").updateOne(
                //find the correct ObjectID
                {
                    _id: ObjectId(req.session.user_sid),
                },

                {
                    //  put the variable into "[ ]"
                    // https://stackoverflow.com/questions/17039018/how-to-use-a-variable-as-a-field-name-in-mongodb-native-findone
                    $set: { [listTracker]: currentStudyProgress }
                }
            )
            db.close()


        })
    } catch (e) {
        console.log(e)
    }
    finally {
        res.end()
    }
}

//the user logs out 
exports.logout = (req, res) => {
    console.log("the user" + req.session.user_sid + " logs out")
    req.session = null;
    res.redirect('/login.html');
    console.log(req.session)
}

//reports bugs to the databse
exports.bugReport = (req, res) => {


    let bugsToReport = req.body;
    console.log("bugsToReport")
    console.log(bugsToReport)

    MongoClient.connect(dbConfig.url, function (err, db) {
        if (err) throw err;
        var dbo = db.db("francomobile");


        dbo.collection("bugs").insertOne(
            bugsToReport
        )
        res.send("success")
        db.close()
        res.end()
    });
}

exports.getPassedList = (req, res) => {
    dbo.collection("users").findOne(
        //find the correct ObjectID
        {
            _id: ObjectId(req.session.user_sid),
        },
    ).then(result => {
        console.log("result.passed ------------ 357")
        console.log(result.passed)
        res.send(result.passed)
        db.close()
        res.end()
    })

}


exports.addToPassedList = (req, res) => {
    MongoClient.connect(dbConfig.url, function (err, db) {
        if (err) throw err;
        var dbo = db.db("francomobile");
        console.log("passed")
        console.log(req.body)
        let passed = req.body.passed

        dbo.collection("users").updateOne(
            //find the correct ObjectID
            {
                _id: ObjectId(req.session.user_sid),
            },
            {
                // 把这个单词
                $push: { "passed": passed }
            },
            { upsert: true }
        )
        db.close()
        res.end()
    });
}

// exports.getDistractor = (req,res) =>{

// }