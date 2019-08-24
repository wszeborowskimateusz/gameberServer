const cfg = require('../config');
const express = require('express');
const db = require('../' + cfg.dbPath);
const router = express.Router();


router.get('/', async function(req, res) {
    r = { notificationsArray: [] };

    try{
        const notifications = await db.Notifications.find({user_id: USER_ID});

        for (const n of notifications){
            if (!n.is_deleted)
                await r.notificationsArray.push({
                    id: n._id,
                    type: n.type,
                    img: cfg.imagesUrl + n.notification_img,
                    title: n.title,
                    name: n.name,
                    description: n.description,
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

        res.status(200).send("Marked as read");
    }catch(err){
        console.log(err);
        return res.status(404).send();
    }
});

router.post('/remove', async function(req, res) {
    const notificationId = req.body.notificationId;
    try{
        const notification = await db.Notifications.findById(notificationId);
        notification.is_deleted = true;
        await notification.save();
        
        res.status(200).send("Deleted");
    }catch(err){
        console.log(err);
        return res.status(404).send();
    }
});

module.exports = router;
