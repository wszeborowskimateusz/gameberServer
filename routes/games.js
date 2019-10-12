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
    const answer = req.body.answer;
    const session = await DB_CONNECTION.startSession();
    
    try{
        await session.startTransaction();

        const isPassed = await db.User_Game.findOne({game_id: gameId, user_id: USER_ID});
        r.wasAlreadySolved = isPassed == null ? false : true;

        const game = await db.Games.
            findById(gameId).
            populate('category_id');

        if (game.correct_answer == answer){
            if (!isPassed){
                const newPassedGame = new db.User_Game({
                    game_id: gameId,
                    user_id: USER_ID
                });
                await newPassedGame.save({ session });
            }
            r.isCorrect = true;
        }
        else
            r.isCorrect = false;

        if (game.category_id.category_type == enums.CategoryType.BEGINNER_TEST) {
            const user = await db.User.findById(USER_ID);
            if (user.beginners_test_status == enums.BeginnersTestStatus.TEST){
                user.beginners_test_status = enums.BeginnersTestStatus.TEST_STARTED;
                await user.save({ session });
            }
        }
        
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
