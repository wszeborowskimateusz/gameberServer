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

        r.categoryCountryIcon = cfg.imagesUrl + (games[0].category_id.country_id != null ? 
            games[0].category_id.country_id.country_icon : r.categoryIcon);

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

        const isCategoryPassed = await db.User_Category.
            findOne({user_id: USER_ID, category_id: categoryId});
        if (isCategoryPassed)
            throw Error;

        const passedGames = await (await db.User_Game.
            find({user_id: USER_ID}).
            populate({
                path: 'game_id',
                match: {category_id: {$eq: categoryId}}
            })).
            filter(x => x.game_id.category_id != null).
            length;

        const gamesInCategory = await db.Games.
            find({category_id: categoryId}).
            count();
        
        const user = await db.User.findById(USER_ID);

        if ((passedGames/gamesInCategory)*100 >= percentagePassTreshold){
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
                await functions.giveAchievementToUserAsync(ac._id, USER_ID, session);
                r.achievements.push({
                    src: cfg.imagesUrl + ac.achievement_id.achievement_img,
                    name: ac.achievement_id.achievement_name
                });
            }

            if (user.beginners_test_status == enums.BeginnersTestStatus.TEST_STARTED){
                user.beginners_test_status = enums.BeginnersTestStatus.MAP;
                await user.save({ session });
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


module.exports = router;