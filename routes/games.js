const cfg = require('../config');
const enums = require('../enums');
const express = require('express');
const db = require('../' + cfg.dbPath);
const router = express.Router();

const categoriesRouter = require('./games/categories');


router.use('/categories', categoriesRouter);

router.post('/check-answer', async function(req,res){
    const r = {};
    const gameId = req.body.gameId;
    let answer = req.body.answer;
    if (answer.startsWith('"')) answer = answer.slice(1);
    if (answer.endsWith('"')) answer = answer.slice(0, answer.length - 1);
    const session = await DB_CONNECTION.startSession();
    
    try{
        await session.startTransaction();

        const user = await db.User.findById(USER_ID);
        if (user.beginners_test_status == enums.BeginnersTestStatus.TEST){
            user.beginners_test_status = enums.BeginnersTestStatus.TEST_STARTED;
            await user.save({ session });
        }

        const isPassed = await db.User_Game.findOne({game_id: gameId, user_id: USER_ID});
        if (isPassed)
            throw Error;

            const isCorrect = await db.Games.findOne({_id: gameId, correct_answer: answer});
        if (isCorrect){
            const newPassedGame = new db.User_Game({
                game_id: gameId,    
                user_id: USER_ID
            });
            await newPassedGame.save({ session });
            r.isCorrect = true;
        }
        else
            r.isCorrect = false;
        
        await session.commitTransaction();
        res.status(200).json(r);
    } catch(err) {
        await session.abortTransaction();
        res.status(400).send();
    } finally {
        await session.endSession();
    }
});

module.exports = router;
