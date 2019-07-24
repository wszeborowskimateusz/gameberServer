var cfg = require('../../config');
var express = require('express');
var db = require('../../' + cfg.dbPath);
var router = express.Router();
var mongoose = require('mongoose');

router.get('/', async function(req, res) {
    var r = {
        user: null
    };

    var avatarsArr = [];
    var backgroundsArr = [];
    var achievementsArr = [];

    try{
        var ua = await db.User_Avatar.
            find({user_id: USER_ID}).
            populate({
                path: 'user_id',
                populate: {path: 'picked_avatar_id'},
                populate: {path: 'background_img_id'}
            }).
            populate('avatar_id');
        
        ua.forEach(function(a) {
            avatarsArr.push({
                id: a.avatar_id._id,
                name: a.avatar_id.avatar_name,
                img: cfg.imagesUrl + a.avatar_id.avatar_img,
                price: a.avatar_id.price
            })
        })

        var ui = await db.User_Image.
            find({user_id: USER_ID}).
            populate('image_id');

        ui.forEach(function(i) {
            backgroundsArr.push({
                id: i.image_id._id,
                name: i.image_id.image_name,
                img: cfg.imagesUrl + i.image_id.image_img,
                price: i.image_id.price
            })
        })

        var uach = await db.User_Achievement.
            find({user_id: USER_ID}).
            populate('achievement_id');

        uach.forEach(function(a) {
            achievementsArr.push({
                name: a.achievement_id.achievement_name,
                src: cfg.imagesUrl + a.achievement_id.achievement_img,
            })
        })
        r.user = {
            avatarId: ua[0].user_id.picked_avatar_id._id,
            avatars: avatarsArr,
            username: ua[0].user_id.login,
            backgroundImageId: ua[0].user_id.background_img_id._id,
            backgroundImages: backgroundsArr,
            level: ua[0].user_id.level,
            experiencePoints: ua[0].user_id.exp_points,
            pointsToAchieveNewLevel: ua[0].user_id.points_to_new_level,
            numberOfCoins: ua[0].user_id.amount_of_coins,
            achievements: achievementsArr
        }

        res.json(r);
    }catch(err){
        console.log(err);
        return res.status(404);
    }
});

router.post('/change-avatar', function(req, res){
    var newAvatarId = req.body.avatarId;
    
    if (mongoose.Types.ObjectId.isValid(newAvatarId))
        db.User_Avatar.
        find({
            user_id: USER_ID,
            avatar_id: newAvatarId
        }).
        exec(function (err, ua) {
            if (err || !ua.length) 
                return res.status(406).json({message: "Not Acceptable"});
            db.User.update({_id: USER_ID}, {picked_avatar_id: newAvatarId}, function(err, raw) {
                if (err)
                    res.status(406).json({message: "Not Acceptable"});
                else
                    res.status(200).json({message: "The avatar has been changed"});
            });
        })
    else
        res.status(406).json({message: "Not Acceptable"});
});

router.post('/change-image', function(req, res){
    var newImageId = req.body.imageId;

    if (mongoose.Types.ObjectId.isValid(newImageId))
        db.User_Image.
        find({
            user_id: USER_ID,
            image_id: newImageId
        }).
        exec(function (err, ui) {
            if (err || !ui.length) 
                return res.status(406).json({message: "Not Acceptable"});
            db.User.update({_id: USER_ID}, {background_img_id: newImageId}, function(err, raw) {
                if (err)
                    res.status(406).json({message: "Not Acceptable"});
                else
                    res.status(200).json({message: "The background image has been changed"});
            });
        })
    else
        res.status(406).json({message: "Not Acceptable"});
});

module.exports = router;
