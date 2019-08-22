const cfg = require('./config');
const express = require('express');
const db = require('./' + cfg.dbPath);
const mongoose = require('mongoose');


//#region rankings
async function getRankingAsync(startYear, startMonth, startDay, limit){
    //month starts counting at 0
    var users = await db.Experience.aggregate([      
        { $match: {
            date_of_receiving: {$gte: new Date(startYear, startMonth - 1, startDay)}
        }},
        { $group: {
            _id: "$user_id",
            exp_points: { $sum: "$earned_points" }
        }},
        { $lookup: {
            from: 'users', localField: '_id', foreignField: '_id', as: 'user'
        }},
        { $unwind: '$user' },
        { $lookup: {
            from: 'avatars', localField: 'user.picked_avatar_id', foreignField: '_id', as: 'avatar'
        }},
        { $unwind: '$avatar' }
    ]).sort('-exp_points').limit(limit)
    return users;
}

async function formatRankingPositionAsync(name, userId, img, level, experiencePoints){
    return {
        name: name,
        userId: userId,
        img: cfg.imagesUrl + img,
        level: level,
        experiencePoints: experiencePoints
    };
}

module.exports.fillRankingAsync = async function (startYear, startMonth, startDay, limit){
    var result = [];
    var positions = await getRankingAsync(startYear, startMonth, startDay, limit);
    for (let i = 0; i < positions.length; ++i){
        var position = positions[i];
        var user = await formatRankingPositionAsync(position.user.login, position._id, position.avatar.avatar_img, position.user.level, position.exp_points);
        result.push(user)
    }
    return result;
}
//#endregion

//#region experience
module.exports.giveExperienceToUserAsync = async function (experiencePoints, subject, userId, session){
    const newExperience = new db.Experience({
        earned_points: experiencePoints,
        subject: subject,
        user_id: userId
    })
    await newExperience.save({ session });

    const userExperience = await db.Experience.aggregate([      
        { $match: {
            user_id: {$eq: mongoose.Types.ObjectId(USER_ID)}
        }},
        { $group: {
            _id: "$user_id",
            exp_points: { $sum: "$earned_points" }
        }}]);

    const user = await db.User.findById(USER_ID);

    while (userExperience[0].exp_points >= user.points_to_new_level){
        user.points_to_new_level = Math.floor(Math.pow(user.points_to_new_level, cfg.newLevelPower));
        user.level++;
    }

    await user.save({ session });

}
//#endregion

//#region coins
module.exports.giveCoinsToUserAsync = async function (coins, userId, session){
    const user = await db.User.findById(userId);
    
    user.amount_of_coins += coins;
    user.save({ session });
}
//#endregion