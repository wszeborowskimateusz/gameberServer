var cfg = require('../../config');
var express = require('express');
var db = require('../../' + cfg.dbPath);
var router = express.Router();
var mongoose = require('mongoose');

router.get('/:categoryId', async function(req, res) {
    console.log(req);
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


module.exports = router;