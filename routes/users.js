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
    db.User.count({login: userData.login}, function(err, response){
      if (response != 0)
        res.status(400).json({message: "Login exists"});
      else{
        //log
        console.log("New user request");

        var user = new db.User({
          login: userData.login,
          password: passwordHash.generate(userData.password),
          mail: userData.mail,
          exp_points: 0,
          level: 1,
          ammount_of_coins: 50,
          is_daily_mission_completed: false,
          is_account_private: false,
          logging_streak: 0,
          date_of_last_login: '1901-01-01',
          background_img_id: 0,
          picked_avatar_id: 0,
          current_country_id: 0,
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
  if(!userData.username ||
     !userData.password){  

     res.status(400).json({message: "Bad Request"});
  } else {

    db.User.findOne({login: userData.username}, function(err, User){
      if(err){
        res.status(500).json({message: "Database error/n" + err.message, type: "error"});
      }
      else{
        if(passwordHash.verify(userData.password, User.password)){
          var token = jwt.sign({ login: userData.username }, cfg.jwtSecret, { expiresIn: 129600 }); // 36h         
          res.status(200).json({message: "Signed in", jwtToken:token, type: "success"});
        }
        else{
          res.status(401).json({message: "Unauthorised access", type: "error"});
        }
      }
    });
  }
});

module.exports = router;
