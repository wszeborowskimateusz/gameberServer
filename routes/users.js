var cfg = require('../config');
var express = require('express');
var db = require('../' + cfg.dbPath);
var router = express.Router();

var profileRouter = require('./users/profile');

//TEST FIELD
// var ua = new db.User_Avatar({
//     user_id: 28,
//     avatar_id: 1
// });
//ua.save();
// ua.save();
// var a = new db.Avatars({
//     avatar_id: 1,
//     avatar_name: 'lol',
//     avatar_img: 'lol',
//     price: 2.70
// });

//a.save();
//TEST FIELD - END

router.use('/profile', profileRouter);

module.exports = router;
