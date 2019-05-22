var cfg = require('../config');
var express = require('express');
var db = require('../' + cfg.dbPath);
var router = express.Router();
var passwordHash = require('password-hash');


/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

// login, password, mail
router.post('/signup', function(req, res){
  var userData = req.body;
  //Check if all fields are provided and are valid:
  if(!userData.login ||
     !userData.password ||
     !userData.mail){  

     res.status(400);
     res.json({message: "Bad Request"});
  } else {
    var user = new db.User({
      login: userData.login,
      password: userData.password,
      mail: userData.mail,
      salt: passwordHash.generate(userData.password),
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
 
    user.save(function(err, User){
      if(err)
         res.json({message: "Database error/n" + err.message, type: "error"});
      else
         res.json({message: "New user added", type: "success"});
   });
  }
});

module.exports = router;
