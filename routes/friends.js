const cfg = require('../config');
const express = require('express');
const functions = require('../functions');
const enums = require('../enums');
const db = require('../' + cfg.dbPath);
const router = express.Router();


router.post('/accept-request', async function(req, res) {
    const userId = req.body.userId;
    const session = await DB_CONNECTION.startSession();

    try{
        await session.startTransaction();

        const friendshipRequest = await db.Friendship.findOne({user_from_id: userId, user_to_id: USER_ID, date_of_beginning: null});
        if (!friendshipRequest)
            throw Error;
        await functions.removeNotificationAsync(friendshipRequest.notification_id, session);
        friendshipRequest.date_of_beginning = Date.now();
        friendshipRequest.notification_id = null;
        await friendshipRequest.save({ session });

        await session.commitTransaction();
        res.status(200).json("Accepted");
    }catch(err){
        await session.abortTransaction();
        console.log(err);
        return res.status(404).send();
    }finally {
        await session.endSession();
    }
});

router.post('/decline-request', async function(req, res) {
    const userId = req.body.userId;
    const session = await DB_CONNECTION.startSession();

    try{
        await session.startTransaction();

        const friendshipRequest = await db.Friendship.findOne({user_from_id: userId, user_to_id: USER_ID});
        if (!friendshipRequest)
            throw Error;
        await functions.removeNotificationAsync(friendshipRequest.notification_id, session);
        await friendshipRequest.remove({ session });

        await session.commitTransaction();
        res.status(200).json("Declined");
    }catch(err){
        await session.abortTransaction();
        console.log(err);
        return res.status(404).send();
    }finally {
        await session.endSession();
    }
});

module.exports = router;
