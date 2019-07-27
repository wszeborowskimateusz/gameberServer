var cfg = require('../config');
var express = require('express');
var db = require('../' + cfg.dbPath);
var router = express.Router();
var passwordHash = require('password-hash');
var jwt = require('jsonwebtoken');


// /* GET users listing. */
// router.get('/', function(req, res, next) {
//   res.send('respond with a resource');
// });

// login, password, mail
router.post('/signup', function(req, res){
  var userData = req.body;
  //Check if all fields are provided and are valid:
  if(!userData.login ||
     !userData.password ||
     !userData.mail){  
      
     res.status(400).json({message: "Bad Request"});
  } else {
    db.User.count({login: userData.login}, async function(err, response){
      if (response != 0)
        res.status(400).json({message: "Login exists"});
      else{
        //log
        console.log("New user request");

        var defultAvatar = await db.Avatars.findOne({avatar_name: "default"});
        var defultImage = await db.BackgroundImages.findOne({image_name: "default"});

        if(!defultAvatar || !defultImage)
          res.status(500).json({message: "Database error/n" + err.message, type: "error"});

        var user = new db.User({
          login: userData.login,
          password: passwordHash.generate(userData.password),
          mail: userData.mail,
          picked_avatar_id: defultAvatar._id,
          background_img_id: defultImage._id
        });

        db.User_Avatar.create({ user_id: user._id, avatar_id: defultAvatar._id }, function (err) {
          if (err)
              return res.status(500).json({message: "DB error"});
        });

        db.User_Image.create({ user_id: user._id, image_id: defultImage._id }, function (err) {
          if (err)
              return res.status(500).json({message: "DB error"});
        });
    
        //log
        console.log("New user created");

        user.save(function(err, User){
          if(err){
            //log
            console.log("Save error"); 
            res.status(500).json({message: "Database error/n" + err.message, type: "error"});
          }
          else{
            //log
            console.log("New user saved");
            res.status(201).json({message: "New user added", type: "success"});
          }
        });
      }
    });
  } 
});

router.post('/signin', function(req, res){
  var userData = req.body;

  //log
  console.log(userData);  

  //Check if all fields are provided and are valid:
  if(!userData.login ||
     !userData.password){  

     res.status(400).json({message: "Bad Request"});
  } else {

    db.User.findOne({login: userData.login}, function(err, User){
      if(err){
        res.status(500).json({message: "Database error/n" + err.message, type: "error"});
      }
      else{
        if(User == null || !passwordHash.verify(userData.password, User.password)) {
          res.status(401).json({message: "Unauthorised access", type: "error"});
        }
        else {
          var token = jwt.sign({ login: userData.login, user_id: User._id }, cfg.jwtSecret, { expiresIn: 129600 }); // 36h         
          res.status(200).json({message: "Signed in", jwtToken:token, type: "success"});
        }
      }
    });
  }
});

module.exports = router;
