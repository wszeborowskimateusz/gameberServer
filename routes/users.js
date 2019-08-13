var cfg = require('../config');
var express = require('express');
var db = require('../' + cfg.dbPath);
var router = express.Router();

var profileRouter = require('./users/profile');
var shopRouter = require('./users/shop');
var rankingsRouter = require('./users/rankings');

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
router.use('/shop', shopRouter);
router.use('/rankings', rankingsRouter);

router.get('/get/:id', async function(req, res){
    var r = {};
    var player_id = req.params.id;

    try
    {
        var player_info = await db.User.FindById(player_id);
        if (!player_info)
            throw Error;

        r.username = player_info.login;
        r.level = player_info.level;
        r.experiencePoints = player_info.points;
        r.pointsToAchieveNewLevel = player_info.points_to_new_level;

        var friendship = await db.Friendship.FindOne({user_from: USER_ID, user_to: player_id});
        var rev_friendship = await db.Friendship.FindOne({user_to: USER_ID, user_from: player_id});

        r.isFriend = friendship || rev_friendship;

        var achievements = await db.User_Achievement.
            find({user_id: player_id}).
            populate('achievement_id');

        r.achievements = [];

        await achievements.forEach(a => {
            r.achievements.push({
                src: cfg.imagesUrl + a.achievement_img,
                name: a.achievement_name
            })
        })
        
        res.json(r);
    }catch(err){
        console.log(err);
        return res.status(404);
    }
});

module.exports = router;
