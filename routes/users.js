const cfg = require('../config');
const functions = require('../functions');
const enums = require('../enums');
const express = require('express');
const db = require('../' + cfg.dbPath);
const router = express.Router();

const profileRouter = require('./users/profile');
const shopRouter = require('./users/shop');
const rankingsRouter = require('./users/rankings');

//TEST FIELD


//TEST FIELD - END

router.use('/profile', profileRouter);
router.use('/shop', shopRouter);
router.use('/rankings', rankingsRouter);


router.post('/add-to-friends', async function(req, res) {
    const userId = req.body.userId;
    const session = await DB_CONNECTION.startSession();

    try{
        await session.startTransaction();

        const userFrom = await db.Friendship.findOne({user_from_id: USER_ID, user_to_id: userId});
        const userTo = await db.Friendship.findOne({user_to_id: USER_ID, user_from_id: userId});
        if (userFrom || userTo)
            throw Error;
        
        const requestSender = await db.User.findById(USER_ID);
        
        const newFriendship = new db.Friendship({user_from_id: USER_ID, user_to_id: userId});
        await newFriendship.save();

        await functions.addNotificationAsync(enums.NotificationType.MESSAGE, "", "New friend invitation", requestSender.login, "New friend request from " + requestSender.login, userId, session);

        await session.commitTransaction();
        res.status(200).send("Sent");
    }catch(err){
        await session.abortTransaction();
        console.log(err);
        return res.status(404).send();
    } finally {
        await session.endSession();
    }
});

module.exports = router;
