const cfg = require('../config');
const functions = require('../functions');
const enums = require('../enums');
const express = require('express');
const db = require('../' + cfg.dbPath);
const router = express.Router();
const passwordHash = require('password-hash');
const jwt = require('jsonwebtoken');


// login, password, mail
router.post('/signup', async function(req, res){
  const userData = req.body;
  let errorMessage = "";
  const session = await DB_CONNECTION.startSession();

  //Check if all fields are provided and are valid:
  if(!userData.login ||
     !userData.password ||
     !userData.mail){  
      
     res.status(400).json({message: enums.Message.BAD_REQUEST});
  } else {
    try{
      await session.startTransaction();

      const userLogins = await db.User.countDocuments({login: userData.login});
      if (userLogins != 0) {
        errorMessage = enums.Message.LOGIN_EXISTS;
        throw Error;
      }

      const userMails = await db.User.countDocuments({mail: userData.mail});
      if (userMails != 0) {
        errorMessage = enums.Message.MAIL_EXISTS;
        throw Error;
      }

      //log
      console.log("New user request");

      const defultAvatar = await db.Avatars.findOne({avatar_name: cfg.defaultAvatarName});
      const defultImage = await db.BackgroundImages.findOne({image_name: cfg.defaultBackgroundName});

      if(!defultAvatar || !defultImage){
        errorMessage = enums.Message.SERVER_ERROR;
        throw Error;
      }

      const user = new db.User({
        login: userData.login,
        password: await passwordHash.generate(userData.password),
        mail: userData.mail,
        picked_avatar_id: defultAvatar._id,
        background_img_id: defultImage._id
      });
      await user.save({ session });

      const defaultUserAvatar = new db.User_Avatar({ user_id: user._id, avatar_id: defultAvatar._id });
      await defaultUserAvatar.save({ session });

      const defaultUserBackground = new db.User_Image({ user_id: user._id, image_id: defultImage._id });
      await defaultUserBackground.save({ session });

      //log
      console.log("New user created");

      await session.commitTransaction();
      res.status(200).send();
    } catch(err) {
      await session.abortTransaction();
      console.log(err);
      res.status(500).json({message: errorMessage});
    } finally {
      await session.endSession();
    }
  }
});

router.post('/signin', async function(req, res){
  const session = await DB_CONNECTION.startSession();
  const userData = req.body;
  const oneDayMS = 86400000;
  let r = {};
  let errorMessage = null;

  //log
  console.log(userData);  

  //Check if all fields are provided and are valid:
  if(!userData.login ||
     !userData.password){  

     res.status(400).json({message: enums.Message.BAD_REQUEST});
  } else {
    try {
      await session.startTransaction();

      const user = await db.User.findOne({login: userData.login});

      if(user == null || !passwordHash.verify(userData.password, user.password)) {
        errorMessage = enums.Message.UNAUTHORISED_ACCESS;
        throw error;
      }

      r.isFirstLoginAttempt = user.date_of_last_login.toISOString() == new Date("0-1-1").toISOString();

      const todayDate = new Date();
      todayDate.setHours(0,0,0,0);

      const lastLoginDate = user.date_of_last_login;
      lastLoginDate.setHours(0,0,0,0);

      const timeSinceLastLogin = todayDate - lastLoginDate;

      if (timeSinceLastLogin == oneDayMS) {
        user.logging_streak++;
        if (user.logging_streak > 1) {
          const coins = user.logging_streak * cfg.loginStreakCoinsMultiplier;
          const experience = user.logging_streak * cfg.loginStreakExperienceMultiplier;
          r.everydayAwards = {
            loginStreak: user.logging_streak,
            coins: coins,
            experiencePoints: experience,
            achievements: []
          }
          await functions.giveCoinsToUserAsync(coins, user._id, session);
          await functions.giveExperienceToUserAsync(experience, enums.ExperienceSubject.LOGIN_STREAK, user._id, session);
          
          const loginStreakAchievement = await achievementForLoginStreak(user.logging_streak, session);
          if (loginStreakAchievement)
            r.everydayAwards.achievements.push(loginStreakAchievement);
        }
      }
      else if(timeSinceLastLogin > oneDayMS)
        user.logging_streak = 1;

      user.date_of_last_login = new Date();
      await user.save({ session });

      const seasonalCategory = await checkForSeasonalCategory(user._id);
      r = {...r, ...seasonalCategory};

      r.jwtToken = jwt.sign({ login: userData.login, user_id: user._id }, cfg.jwtSecret, { expiresIn: cfg.expirationTimeJWT });
      r.message = enums.Message.SUCCESS_LOGIN;
      r.type = "success"
      await session.commitTransaction();
      res.status(200).json(r);
    } catch(err){
      await session.abortTransaction();
      console.log(err);
      res.status(500).json({message: errorMessage});
    } finally {
      await session.endSession();
    }
  }
});

async function achievementForLoginStreak(loginStreak, session){
  const newAchievementSymbol = enums.AchievementsSymbol['LOGIN_STREAK_' + loginStreak];
  if (!newAchievementSymbol)
    return null

  const newAchievement = await functions.giveAchievementToUserAsync(null, newAchievementSymbol, USER_ID, session);
  return  {name: newAchievement.achievement_name,
           src: cfg.imagesUrl + newAchievement.achievement_img}
}

async function checkForSeasonalCategory(userId){
  const currentDate = new Date();

  const passedCategoriesIds = await (await db.User_Category.
    find({user_id: userId})).
    map(c => c.category_id);

  const seasonalCategory = await db.Categories.findOne({
    category_type: enums.CategoryType.SEASONAL,
    date_from: {$lte: currentDate},
    date_to: {$gte: currentDate },
    _id: {$nin: passedCategoriesIds}
  });

  return {
    seasonalCategoryId: seasonalCategory != null ? seasonalCategory._id : null,
    seasonalCategoryName: seasonalCategory != null ? seasonalCategory.category_name : null,
    seasonalCategoryImg: seasonalCategory != null ? cfg.imagesUrl + seasonalCategory.category_img : null
  }
}

module.exports = router;
