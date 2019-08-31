var cfg = require('../../config');
var functions = require('../../functions');
var express = require('express');
var db = require('../../' + cfg.dbPath);
var router = express.Router();
var mongoose = require('mongoose');

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
        });

        if (!games.length)
            throw Error;
        
        await games.forEach(game => {
            r.games.push({
                name: game.game_name,
                gameId: game._id,
                gameInfo: game.game_info
            })
        });

        r.categoryBackgroundImage = cfg.imagesUrl + games[0].category_id.category_img;
        r.categoryCountryIcon = cfg.imagesUrl +  games[0].category_id.country_id.country_icon;
        r.categoryIcon = cfg.imagesUrl +  games[0].category_id.category_icon;
        r.categoryName = games[0].category_id.category_name;

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
            filter(x => x.category_id != null).
            length;

        const gamesInCategory = await db.Games.
            find({category_id: categoryId}).
            count();

        if (passedGames >= gamesInCategory){
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
            
            await achievements4Category.forEach(ac =>
                r.achievements.push({
                    src: ac.achievement_id.achievement_img,
                    name: ac.achievement_id.achievement_name})
            );
            r.coins = category.prize_coins;
            r.experiencePoints = category.prize_points;

            await session.commitTransaction();
            res.json(r);
        }
        else
            throw Error;
    }
    catch(err){
        await session.abortTransaction();
        res.status(400).send();
    } finally {
        await session.endSession();
    }
});


module.exports = router;