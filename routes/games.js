var cfg = require('../config');
var express = require('express');
var db = require('../' + cfg.dbPath);
var router = express.Router();

var categoriesRouter = require('./games/categories');


router.use('/categories', categoriesRouter);

router.get('/check-answer/:gameId/:answer', async function(req,res){
    try{
        var gameId = req.params.gameId;
        var answer = req.params.answer;
        
        var answers = await db.Games.findOne({_id: gameId, correct_answer: answer});

        if (!answers)
            throw Error;
        
        res.status(200).send('Correct answer');
    } catch(err) {
        res.status(400).send('Wrong answer');
    }
});

module.exports = router;
