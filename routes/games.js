const cfg = require('../config');
const express = require('express');
const db = require('../' + cfg.dbPath);
const router = express.Router();

const categoriesRouter = require('./games/categories');


router.use('/categories', categoriesRouter);

router.post('/check-answer', async function(req,res){
    const r = {};
    const gameId = req.body.gameId;
    const answer = req.body.answer;
    
    try{
        const isPassed = await db.User_Game.findOne({game_id: gameId, user_id: USER_ID});
        if (isPassed)
            throw Error;

        const isCorrect = await db.Games.findOne({_id: gameId, correct_answer: answer});
        if (isCorrect){
            const newPassedGame = new db.User_Game({
                game_id: gameId,
                user_id: USER_ID
            });
            await newPassedGame.save();
            r.isCorrect = true;
        }
        else
            r.isCorrect = false;
        
        res.status(200).json(r);
    } catch(err) {
        res.status(400).send();
    }
});

module.exports = router;
