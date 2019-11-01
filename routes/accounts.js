const cfg = require('../config');
const functions = require('../functions');
const enums = require('../enums');
const express = require('express');
const db = require('../' + cfg.dbPath);
const router = express.Router();
const passwordHash = require('password-hash');
const jwt = require('jsonwebtoken');
const url = require('url');    
const {google} = require('googleapis');



// login, password, mail
router.post('/signup', async function(req, res){
  const userData = req.query == null || Object.keys(req.query).length === 0 ? req.body : req.query;
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

      await session.commitTransaction();

      if (userData.isGoogle == "true")
        res.redirect(307, url.format({
          pathname:"/accounts/signin",
          query:userData}));
      else
        res.status(200).send();
      } catch(err) {
      await session.abortTransaction();
      console.log(err);
      res.status(400).json({message: errorMessage});
    } finally {
      await session.endSession();
    }
  }
});

router.post('/signin', async function(req, res){
  const session = await DB_CONNECTION.startSession();
  const userData = req.query == null || Object.keys(req.query).length === 0 ? req.body : req.query;
  const oneDayMS = 86400000;
  let r = {};
  let errorMessage = null;


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
      res.status(400).json({message: errorMessage});
    } finally {
      await session.endSession();
    }
  }
});

router.post('/signin/google', async function(req, res){
  const authCode = req.body.authCode;

  try {
    const oauth2Client = new google.auth.OAuth2(
      cfg.google_client_id,
      cfg.google_client_secret,
      cfg.google_redirect_url
    );

    const {tokens} = await oauth2Client.getToken(authCode)
    oauth2Client.setCredentials(tokens);

    const oauth2 = google.oauth2({
      auth: oauth2Client,
      version: 'v2'
    });
    const userInfo = (await oauth2.userinfo.get()).data;
    const user = await db.User.findOne({login: userInfo.name});

    const userData = {};
    userData.login = userInfo.name;
    userData.password = userInfo.id + cfg.google_password_appx;
    if (user == null){
      userData.mail = userInfo.email;
      userData.isGoogle = true;

      res.redirect(307, url.format({
        pathname:"/accounts/signup",
        query:userData}));
    } else{
      res.redirect(307, url.format({
        pathname:"/accounts/signin",
        query:userData}));
    }
  } catch(err){
      console.log(err);
      res.status(400).send();
  }
});

// Functions

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
