const cfg = require('../config');
const express = require('express');
const functions = require('../functions');
const enums = require('../enums');
const db = require('../' + cfg.dbPath);
const router = express.Router();


router.get('/:userId', async function(req, res) {
    const userId = req.params.userId;
    const limit = req.query.limit;
    const offset = req.query.offset;

    r = { messages: [] };

    try{
        const messagesFrom = await (await db.Messages.
            find({user_from_id: USER_ID, user_to_id: userId}).
            select('content date_of_sending')).
            map(m => {
                return {
                    date: m.date_of_sending,
                    content: m.content,
                    isOurMessage: true
                }
            });

        const messagesTo = await (await db.Messages.
            find({user_to_id: USER_ID, user_from_id: userId}).
            select('content date_of_sending')).
            map(m => {
                return {
                    date: m.date_of_sending,
                    content: m.content,
                    isOurMessage: false
                }
            })

        r.messages = await messagesFrom.
            concat(messagesTo).
            sort((a, b) => a.date < b.date).
            slice(offset, limit + offset);

        res.json(r.messages);
    }catch(err){
        console.log(err);
        return res.status(404).send();
    }
});

router.post('/send/:userId', async function(req, res) {
    const userId = req.params.userId;
    const content = req.body.content;
    const session = await DB_CONNECTION.startSession();

    try{
        await session.startTransaction();

        const sender = await db.User.
            findById(USER_ID).
            populate('picked_avatar_id');

        const receiver = await db.User.findById(userId);
        if (!receiver)
            throw Error;

        const newMessage = new db.Messages({user_from_id: USER_ID, user_to_id: userId, content: content});
        await newMessage.save({ session });

        await functions.addNotificationAsync(enums.NotificationType.NEW_MESSAGE, sender.picked_avatar_id.avatar_img,
             sender.login, receiver._id, sender._id, null, session);

        await session.commitTransaction();
        res.status(200).json("Sent");
    }catch(err){
        await session.abortTransaction();
        console.log(err);
        return res.status(404).send();
    }finally {
        await session.endSession();
    }
});

module.exports = router;
