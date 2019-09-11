const cfg = require('../config');
const functions = require('../functions');
const express = require('express');
const db = require('../' + cfg.dbPath);
const router = express.Router();


router.get('/', async function(req, res) {
    r = { notificationsArray: [] };

    try{
        const notifications = await db.Notifications.
            find({user_id: USER_ID}).
            sort('-date_of_receiving');
        
        for (const n of notifications){
            if (!n.is_deleted)
                await r.notificationsArray.push({
                    id: n._id,
                    type: n.type,
                    userId: n.user_from_id,
                    img: cfg.imagesUrl + n.notification_img,
                    name: n.name,
                    dateOfReceiving: n.date_of_receiving,
                    isRead: n.is_read
                })
        }
        res.json(r.notificationsArray);

    }catch(err){
        console.log(err);
        return res.status(404).send();
    }
});

router.post('/mark-as-read', async function(req, res) {
    const notificationId = req.body.notificationId;
    try{
        const notification = await db.Notifications.findById(notificationId);
        notification.is_read = true;
        await notification.save();

        res.status(200).json("Marked as read");
    }catch(err){
        console.log(err);
        return res.status(404).send();
    }
});

router.post('/remove', async function(req, res) {
    const notificationId = req.body.notificationId;
    try{
        await functions.removeNotificationAsync(notificationId);
        res.status(200).json("Deleted");
    }catch(err){
        console.log(err);
        return res.status(404).send();
    }
});

module.exports = router;
