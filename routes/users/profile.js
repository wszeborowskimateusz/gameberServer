var cfg = require('../../config');
var express = require('express');
var db = require('../../' + cfg.dbPath);
var router = express.Router();

// TODO: Full path to images
router.get('/', function(req, res) {
    var r = {
        user: null
    };
    //r['user'] = [];

    var avatarsArr = [];
    var backgroundsArr = [];
    var achievementsArr = [];

    //var avatarId, username, backgroundImageId, level, experiencePoints, pointsToAchieveNewLevel, numberOfCoins;

    console.log('DEBUG#0');

    db.User_Avatar.
    find({user_id: USER_ID}).
    populate('user_id').
    populate('avatar_id').
    exec(function (err, ua) {
        //console.log('DEBUG#1');
        if (err) return res.status(404);
        //console.log('DEBUG#2');
        
        ua.forEach(function(a) {
            avatarsArr.push({
                id: a.avatar_id.avatar_id,
                name: a.avatar_id.avatar_name,
                img: a.avatar_id.avatar_img,
                price: a.avatar_id.price
            })
        })

        // avatarId = ua[0].user_id.picked_avatar_id;
        // username = ua[0].user_id.login;
        // backgroundImageId = ua[0].user_id.background_image_id;
        // level = ua[0].user_id.level;
        // experiencePoints = ua[0].user_id.exp_points;
        // pointsToAchieveNewLevel = 0; // TODO: brak info w bazie
        // numberOfCoins = ua[0].user_id.amount_of_coins;

        //console.log(avatarsArr);
        db.User_Image.
        find({user_id: USER_ID}).
        populate('image_id').
        exec(function (err, ui) {
            if (err) return res.status(404);

            ui.forEach(function(i) {
                backgroundsArr.push({
                    id: i.image_id.image_id,
                    name: i.image_id.image_name,
                    img: i.image_id.image_img,
                    price: i.image_id.price
                })
            })

            db.User_Achievement.
            find({user_id: USER_ID}).
            populate('achievement_id').
            exec(function (err, uach) {
                if (err) return res.status(404);

                uach.forEach(function(a) {
                    achievementsArr.push({
                        name: a.achievement_id.achievement_name,
                        src: a.achievement_id.achievement_img,
                    })
                })

                r.user = {
                    avatarId: ua[0].user_id.picked_avatar_id,
                    avatars: avatarsArr,
                    username: ua[0].user_id.login,
                    backgroundImageId: ua[0].user_id.background_image_id,
                    backgroundImages: backgroundsArr,
                    level: ua[0].user_id.level,
                    experiencePoints: ua[0].user_id.exp_points,
                    pointsToAchieveNewLevel: 0, // TODO: brak info w bazie
                    numberOfCoins: ua[0].user_id.amount_of_coins,
                    achievements: achievementsArr
                }

                res.json(r);
            });
        });
    });
});

router.post('/change-avatar', function(req, res){

});

router.post('/change-image', function(req, res){

});

module.exports = router;
