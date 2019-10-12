const cfg = require('../../config');
const functions = require('../../functions');
const enums = require('../../enums');
const express = require('express');
const db = require('../../' + cfg.dbPath);
const router = express.Router();
const mongoose = require('mongoose');

router.get('/:categoryId', async function(req, res) {
    var r = {
        games: [],
        categoryBackgroundImage: "",
        categoryName: "",
        categoryCountryIcon: "",
        categoryIcon: ""
    };
    var catId = req.params.categoryId;
    
    try{
        var games = await db.Games.
            find({category_id: catId}).
            populate({
                path: 'category_id',
                populate: {path: 'country_id'}
            }).
            sort('game_order');
        
        if (!games.length)
            throw Error;

        if (games[0].category_id.category_type == "N")
        {
            // check if user has country available
            if (await db.AvailableCountries
                .findOne({user_id: USER_ID, country_id: games[0].category_id.country_id}) == null)
            {
                throw Error;
            }
        }

        let currentGameIndex = games.length - 1;
        for (let i = 0; i < games.length; ++i){
            let game = games[i];
            if (!(await db.User_Game.findOne({game_id: game._id, user_id: USER_ID}))){
                currentGameIndex = i;
                break;
            }
        }
        
        await games.forEach(game => {
            r.games.push({
                name: game.game_name,
                gameId: game._id,
                gameInfo: game.game_info
            })
        });
        
        r.categoryBackgroundImage = cfg.imagesUrl + games[0].category_id.category_img;
        r.categoryIcon = cfg.imagesUrl +  games[0].category_id.category_icon;
        r.categoryName = games[0].category_id.category_name;
        r.currentGameIndex = currentGameIndex;
        r.isTestCategory = games[0].category_id.category_type == enums.CategoryType.BEGINNER_TEST;

        r.categoryCountryIcon = games[0].category_id.country_id != null ? 
            cfg.imagesUrl + games[0].category_id.country_id.country_icon : r.categoryIcon;

        res.json(r);
    }catch(err){
        console.log(err);
        res.status(404).send();
    }
});

router.post('/finish', async function(req, res) {
    const r = {
        achievements: []
    };
    const categoryId = req.body.categoryId;
    const session = await DB_CONNECTION.startSession();

    try{
        await session.startTransaction();

        const category = await db.Categories.
            findById(categoryId);
        if (!category)
            throw Error;
        
        const percentagePassTreshold = category.percentage_pass_treshold == null ? 100 : category.percentage_pass_treshold;

        if (category.category_type != enums.CategoryType.CLASH){
            const isCategoryPassed = await db.User_Category.
                findOne({user_id: USER_ID, category_id: categoryId});
            if (isCategoryPassed)
                throw Error;
        }

        const passedGames = await (await db.User_Game.
            find({user_id: USER_ID}).
            populate({
                path: 'game_id',
                match: {category_id: {$eq: categoryId}}
            })).
            filter(x => x.game_id != null);

        const gamesInCategoryNumber = await db.Games.
            find({category_id: categoryId}).
            countDocuments();
        
        const user = await db.User.
            findById(USER_ID).
            populate('picked_avatar_id');
        
        const percentageResult = (passedGames.length/gamesInCategoryNumber)*100;
        r.percentage = percentageResult;

        if (category.category_type == enums.CategoryType.CLASH){
            const clashId = req.body.clashId;
            let areWeTheWinner, isOpponentTheWinner, didOpponentFinished;

            const clash = await db.Clashes.findOne({_id: clashId,
                $or: [{user_from_percentage: null, user_from_id: USER_ID},
                      {user_to_percentage: null, user_to_id: USER_ID}] });
            if (!clash)
                throw Error;
            
            const areWeUserFrom = clash.user_from_id == USER_ID;
            if (areWeUserFrom){
                clash.user_from_percentage = percentageResult;
                didOpponentFinished = clash.user_to_percentage != null;
                if (didOpponentFinished){
                    areWeTheWinner = percentageResult > clash.user_to_percentage;
                    isOpponentTheWinner = percentageResult < clash.user_to_percentage;
                }
            } else{
                clash.user_to_percentage = percentageResult;
                didOpponentFinished = clash.user_from_percentage != null;
                if (didOpponentFinished)
                    areWeTheWinner = percentageResult > clash.user_from_percentage;
                    isOpponentTheWinner = percentageResult < clash.user_from_percentage;
            }
            await clash.save({ session });
            
            const opponent = await db.User.
                findById(areWeUserFrom ? clash.user_to_id : clash.user_from_id).
                populate('picked_avatar_id');
            if (didOpponentFinished){
                if (areWeTheWinner)
                    await givePrizeForClash(user, opponent, category, false, session);
                else if (isOpponentTheWinner)
                    await givePrizeForClash(opponent, user, category, false, session);
                else 
                    await givePrizeForClash(user, opponent, category, true, session);
            }

            for (const passedGame of passedGames)
                await passedGame.remove({ session });
        }
        else if (percentageResult >= percentagePassTreshold){
            const newPassedCategory = new db.User_Category({
                user_id: USER_ID,
                category_id: categoryId
            })
            newPassedCategory.save({ session });

            await functions.giveCoinsToUserAsync(category.prize_coins, USER_ID, session)
            await functions.giveExperienceToUserAsync(category.prize_points, category.category_name, USER_ID, session)

            const achievements4Category = await db.Achievement_Category.
                find({category_id: categoryId}).
                populate('achievement_id');
            
            for (const ac of achievements4Category){
                await functions.giveAchievementToUserAsync(ac._id, null, USER_ID, session);
                r.achievements.push({
                    src: cfg.imagesUrl + ac.achievement_id.achievement_img,
                    name: ac.achievement_id.achievement_name
                });
            }

            if (user.beginners_test_status == enums.BeginnersTestStatus.TEST_STARTED){
                user.beginners_test_status = enums.BeginnersTestStatus.MAP;
                await user.save({ session });
                await functions.giveAchievementToUserAsync(null, enums.AchievementsSymbol.FIRST_STEP, USER_ID, session);
            }
            else if (user.beginners_test_status == enums.BeginnersTestStatus.BEGINNER){
                const beginnerCategories = await db.Categories.
                    find({category_type: enums.CategoryType.BEGINNER}).
                    countDocuments();

                const passedBeginnerCategories = await (await db.User_Category.
                    find({user_id: USER_ID}).
                    session(session).
                    populate({
                        path: 'category_id',
                        match: {category_type: {$eq: enums.CategoryType.BEGINNER}}
                    })).
                    filter(x => x.category_id != null).
                    length;

                if (passedBeginnerCategories >= beginnerCategories){
                    user.beginners_test_status = enums.BeginnersTestStatus.MAP
                    await user.save({ session });
                    await functions.giveAchievementToUserAsync(null, enums.AchievementsSymbol.FIRST_STEP, USER_ID, session);
                }
            }

            r.coins = category.prize_coins;
            r.experiencePoints = category.prize_points;
            r.isPassed = true;
        }
        else{
            if (user.beginners_test_status == enums.BeginnersTestStatus.TEST_STARTED || 
                user.beginners_test_status == enums.BeginnersTestStatus.TEST)
            {
                user.beginners_test_status = enums.BeginnersTestStatus.BEGINNER
                await user.save({ session });
            } 

            r.isPassed = false;
        }
            
        await session.commitTransaction();
        res.json(r);
    }
    catch(err){
        await session.abortTransaction();
        console.log(err);
        res.status(400).send();
    } finally {
        await session.endSession();
    }
});

// Functions

async function givePrizeForClash(winner, loser, category, isDraw, session){ // if isDraw then winner and loser are the same
    const prize = isDraw ? {coinsPrize: category.prize_coins / 2, pointsPrize: category.prize_points / 2} :
                           {coinsPrize: category.prize_coins, pointsPrize: category.prize_points}

    await functions.giveCoinsToUserAsync(prize.coinsPrize, winner._id, session);
    await functions.giveExperienceToUserAsync(prize.pointsPrize, enums.ExperienceSubject.CLASH, winner._id, session);
    if (isDraw){
        await functions.giveCoinsToUserAsync(prize.coinsPrize, loser._id, session);
        await functions.giveExperienceToUserAsync(prize.pointsPrize, enums.ExperienceSubject.CLASH, loser._id, session);
    }
    await functions.addNotificationAsync(isDraw ? enums.NotificationType.CLASH_DRAW : enums.NotificationType.CLASH_WON, loser.picked_avatar_id.avatar_img,
        loser.login, winner._id, loser._id, prize, session);
    await functions.addNotificationAsync(isDraw ? enums.NotificationType.CLASH_DRAW : enums.NotificationType.CLASH_LOST, winner.picked_avatar_id.avatar_img,
        winner.login, loser._id, winner._id, isDraw ? prize : {coinsPrize: 0, pointsPrize: 0}, session);
}

module.exports = router;