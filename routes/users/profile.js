const cfg = require('../../config');
const express = require('express');
const db = require('../../' + cfg.dbPath);
const router = express.Router();
const mongoose = require('mongoose');

router.get('/:user_id?', async function(req, res) {
    const otherPlayerProfile = req.params.user_id != null; 
    const userId = otherPlayerProfile ? req.params.user_id : USER_ID;
    if (!mongoose.Types.ObjectId.isValid(userId))
        throw Error;

    const r = {
        user: {}
    };

    const avatarsArr = [];
    const backgroundsArr = [];
    const achievementsArr = [];

    try{
        const player_info = await db.User.
            findById(userId).
            populate('picked_avatar_id').
            populate('background_img_id');
            
        if (otherPlayerProfile){            
            avatarsArr.push(player_info.picked_avatar_id);
            backgroundsArr.push(player_info.background_img_id);

            const friendship = await db.Friendship.FindOne({user_from: USER_ID, user_to: userId});
            const rev_friendship = await db.Friendship.FindOne({user_to: USER_ID, user_from: userId});
            
            r.user.isFriend = friendship || rev_friendship;
        }
        else{
            const ua = await db.User_Avatar.
                find({user_id: userId}).
                populate('avatar_id');
        
            await ua.forEach(a => {
                avatarsArr.push({
                    id: a.avatar_id._id,
                    name: a.avatar_id.avatar_name,
                    img: cfg.imagesUrl + a.avatar_id.avatar_img,
                    price: a.avatar_id.price
                })
            })

            const ui = await db.User_Image.
                find({user_id: userId}).
                populate('image_id');

            await ui.forEach(i => {
                backgroundsArr.push({
                    id: i.image_id._id,
                    name: i.image_id.image_name,
                    img: cfg.imagesUrl + i.image_id.image_img,
                    price: i.image_id.price
                })
            })

            r.user.numberOfCoins = ua[0].user_id.amount_of_coins;
        }

        const uach = await db.User_Achievement.
            find({user_id: userId}).
            populate('achievement_id');

        await uach.forEach(a => {
            achievementsArr.push({
                name: a.achievement_id.achievement_name,
                src: cfg.imagesUrl + a.achievement_id.achievement_img,
            })
        })

        r.user = {
            avatarId: player_info.picked_avatar_id._id,
            avatars: avatarsArr,
            username: player_info.login,
            backgroundImageId: player_info.background_img_id._id,
            backgroundImages: backgroundsArr,
            level: player_info.level,
            experiencePoints: player_info.exp_points,
            pointsToAchieveNewLevel: player_info.points_to_new_level,
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
