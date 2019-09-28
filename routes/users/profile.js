const cfg = require('../../config');
const functions = require('../../functions');
const express = require('express');
const db = require('../../' + cfg.dbPath);
const router = express.Router();
const mongoose = require('mongoose');

router.get('/:user_id?', async function(req, res) {
    const otherPlayerProfile = req.params.user_id != USER_ID && req.params.user_id != null;
    const userId = otherPlayerProfile ? req.params.user_id : USER_ID;
    if (!mongoose.Types.ObjectId.isValid(userId))
        throw Error;

    const r = {
        user: {}
    };
    r.user.isOurOwnProfile = !otherPlayerProfile;

    const avatarsArr = [];
    const backgroundsArr = [];
    const achievementsArr = [];
    let ui = [];
    let ua = [];

    try{
        const player_info = await db.User.
            findById(userId).
            populate('picked_avatar_id').
            populate('background_img_id');
            
        if (otherPlayerProfile){            
            ua.push({ avatar_id: player_info.picked_avatar_id });
            ui.push({ image_id: player_info.background_img_id });

            const checkBothDirections = {$or: [{user_from_id: USER_ID, user_to_id: userId},
                                               {user_to_id: USER_ID, user_from_id: userId}]};

            const friendship = await db.Friendship.findOne({...checkBothDirections, date_of_beginning: {$ne: null}});
            r.user.isFriend = friendship ? true : false;

            const friendshipRequest = await db.Friendship.findOne({...checkBothDirections, date_of_beginning: null});
            r.user.isFriendshipRequested = friendshipRequest != null && friendshipRequest.user_from_id == USER_ID ? true : false;
            r.user.didUserFriendRequestedUs = friendshipRequest != null && r.user.isFriendshipRequested == false ? true : false;
        }
        else{
            ua = await db.User_Avatar.
                find({user_id: userId}).
                populate('avatar_id');
        
            ui = await db.User_Image.
                find({user_id: userId}).
                populate('image_id');

            r.user.numberOfCoins = player_info.amount_of_coins;
        }

        await ui.forEach(i => {
            backgroundsArr.push({
                id: i.image_id._id,
                name: i.image_id.image_name,
                img: cfg.imagesUrl + i.image_id.image_img,
                price: i.image_id.price
            })
        })

        await ua.forEach(a => {
            avatarsArr.push({
                id: a.avatar_id._id,
                name: a.avatar_id.avatar_name,
                img: cfg.imagesUrl + a.avatar_id.avatar_img,
                price: a.avatar_id.price
            })
        })

        const uach = await db.User_Achievement.
            find({user_id: userId}).
            populate('achievement_id');

        await uach.forEach(a => {
            achievementsArr.push({
                name: a.achievement_id.achievement_name,
                src: cfg.imagesUrl + a.achievement_id.achievement_img,
            })
        })

        const userExperience = await functions.getUserExperienceAsync(USER_ID);

        r.user = {
            ...r.user, ...{
                avatarId: player_info.picked_avatar_id._id,
                avatars: avatarsArr,
                username: player_info.login,
                backgroundImageId: player_info.background_img_id._id,
                backgroundImages: backgroundsArr,
                level: player_info.level,
                experiencePoints: userExperience,
                pointsToAchieveNewLevel: player_info.points_to_new_level,
                achievements: achievementsArr
        }}

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
