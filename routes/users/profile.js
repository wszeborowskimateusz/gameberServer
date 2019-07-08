var cfg = require('../../config');
var express = require('express');
var db = require('../../' + cfg.dbPath);
var router = express.Router();

router.get('/', function(req, res) {
    var r = {
        user: null
    };

    var avatarsArr = [];
    var backgroundsArr = [];
    var achievementsArr = [];

    db.User_Avatar.
    find({user_id: USER_ID}).
    populate('user_id').
    populate('avatar_id').
    exec(function (err, ua) {
        if (err) return res.status(404);
        
        ua.forEach(function(a) {
            avatarsArr.push({
                id: a.avatar_id.avatar_id,
                name: a.avatar_id.avatar_name,
                img: cfg.imagesUrl + a.avatar_id.avatar_img,
                price: a.avatar_id.price
            })
        })

        db.User_Image.
        find({user_id: USER_ID}).
        populate('image_id').
        exec(function (err, ui) {
            if (err) return res.status(404);

            ui.forEach(function(i) {
                backgroundsArr.push({
                    id: i.image_id.image_id,
                    name: i.image_id.image_name,
                    img: cfg.imagesUrl + i.image_id.image_img,
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
                        src: cfg.imagesUrl + a.achievement_id.achievement_img,
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
                    pointsToAchieveNewLevel: ua[0].user_id.points_to_new_level,
                    numberOfCoins: ua[0].user_id.amount_of_coins,
                    achievements: achievementsArr
                }

                res.json(r);
            });
        });
    });
});

router.post('/change-avatar', function(req, res){
    var newAvatarId = req.body.avatarId;

    db.User_Avatar.
    find({user_id: USER_ID}).
    populate('user_id').
    populate('avatar_id').
    exec(function (err, ua) {
        if (err) 
            return res.status(404);      
        var avatarToChange = ua.find(avatar => avatar.avatar_id.avatar_id == newAvatarId);
        if (avatarToChange != null){
            db.User.update({_id: USER_ID}, {picked_avatar_id: avatarToChange._id}, function(err, raw) {
                if (err)
                    res.status(406).json({message: "Not Acceptable"})
                else
                    res.status(200).json({message: "The avatar has been changed"});
            });
        }
        else
            res.status(406).json({message: "Not Acceptable"});
    })
});

router.post('/change-image', function(req, res){
    var newImageId = req.body.imageId;

    db.User_Image.
    find({user_id: USER_ID}).
    populate('user_id').
    populate('image_id').
    exec(function (err, ui) {
        if (err) 
            return res.status(404);      
        var imageToChange = ui.find(image => image.image_id.image_id == newImageId);
        if (imageToChange != null) {
            db.User.update({_id: USER_ID}, {background_image_id: imageToChange._id}, function(err, raw) {
                if (err)
                    res.status(406).json({message: "Not Acceptable"})
                else
                    res.status(200).json({message: "The background image has been changed"});
            });
        }
        else
            res.status(406).json({message: "Not Acceptable"});
    })
});

module.exports = router;
