var cfg = require('../../config');
var express = require('express');
var db = require('../../' + cfg.dbPath);
var router = express.Router();
var mongoose = require('mongoose');

router.get('/:categoryId', async function(req, res) {
    console.log(req);
    var r = {
        games: []
    };
    var catId = req.params.categoryId;
    var game = null;

    try{
        var games = await db.GamesContent.
        find().
        populate({
            path: 'game_id',
            populate: {
                path: 'category_id',
                match: { _id: { $eq: catId }}
            }
        });

        if (!games.length)
            throw Error;

        games = await games.filter(game => game.game_id.category_id)

        for (var i = 0; i < games.length; ++i) {
            game = games[i];
            console.log('Game == ' + game);
        }
        res.status(200).send();

    }catch(err){
        console.log(err);
        res.status(404).send();
    }
});


module.exports = router;