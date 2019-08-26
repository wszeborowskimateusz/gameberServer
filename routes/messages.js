const cfg = require('../config');
const express = require('express');
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

router.post('/remove', async function(req, res) {
    try{

        
        res.status(200).send("Deleted");
    }catch(err){
        console.log(err);
        return res.status(404).send();
    }
});

module.exports = router;
