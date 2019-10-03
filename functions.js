const cfg = require('./config');
const enums = require('./enums');
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

    const userExperience = await this.getUserExperienceAsync(userId, session);

    const user = await db.User.findById(userId);

    while (userExperience >= user.points_to_new_level){
        user.points_to_new_level = Math.floor(Math.pow(user.points_to_new_level, cfg.newLevelPower));
        user.level++;
    }

    await user.save({ session });

}

module.exports.getUserExperienceAsync = async function (userId, session){
    const experience = await db.Experience.aggregate([      
        { $match: {
            user_id: {$eq: mongoose.Types.ObjectId(userId)}
        }},
        { $group: {
            _id: "$user_id",
            exp_points: { $sum: "$earned_points" }
        }}]).session(session)
    return experience.length == 0 ? 0 : experience[0].exp_points;
}
//#endregion

//#region coins
module.exports.giveCoinsToUserAsync = async function (coins, userId, session){
    const user = await db.User.findById(userId);
    
    user.amount_of_coins += coins;
    await user.save({ session });
}
//#endregion

//#region notifications
module.exports.addNotificationAsync = async function (type, notificationImg, name, userId, userFromId, data, session){
    const newNotification = new db.Notifications({
        type: type,
        notification_img: notificationImg,
        name: name,
        data: JSON.stringify(data),
        user_from_id: userFromId,
        user_id: userId
    })
    if (session != null)
        await newNotification.save({ session });
    else
        await newNotification.save();
    return newNotification._id;
}

module.exports.removeNotificationAsync = async function (notificationId, session){
    const notification = await db.Notifications.findById(notificationId);
    notification.is_deleted = true;
    if (session != null)
        await notification.save({ session });
    else
        await notification.save();
}
//#endregion

//#region achievements
module.exports.giveAchievementToUserAsync = async function (achievementId, achievementSymbol, userId, session){
    const achievement = achievementSymbol == null ? 
        db.Achievements.findById(achievementId) :
        db.Achievements.findOne({achievement_symbol: achievementSymbol});
    
    const existingAchievement = await db.User_Achievement.
        findOne({user_id: userId, achievement_id: achievement._id});
    if (session == null || existingAchievement) 
        throw Error;

    await this.addNotificationAsync(enums.NotificationType.NEW_ACHIEVEMENT, achievement.achievement_img,
         achievement.achievement_name, userId, null, null, session);

    const newAchievement = new db.User_Achievement({
        user_id: userId,
        achievement_id: achievement._id
    });
    await newAchievement.save({ session });

    return achievement;
}
//#endregion
