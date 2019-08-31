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

router.get('/friends', async function(req, res) {    
    const r = {friends: []};

    try{
        const userFrom = await db.Friendship.
            find({user_from_id: USER_ID, date_of_beginning: {$ne: null}}).
            populate({
                path: 'user_to_id',
                populate: {path: 'picked_avatar_id'}
            });
    
        const userTo = await db.Friendship.
            find({user_to_id: USER_ID, date_of_beginning: {$ne: null}}).
            populate({
                path: 'user_from_id',
                populate: {path: 'picked_avatar_id'}
            });

        for (const user of userFrom){
            await r.friends.push({
                id: user.user_to_id._id,
                name: user.user_to_id.login,
                avatar: cfg.imagesUrl + user.user_to_id.picked_avatar_id.avatar_img
            })
        }

        for (const user of userTo){
            await r.friends.push({
                id: user.user_from_id._id,
                name: user.user_from_id.login,
                avatar: cfg.imagesUrl + user.user_from_id.picked_avatar_id.avatar_img
            })
        }

        return res.json(r.friends);
    }catch(err){
        console.log(err);
        return res.status(404).send();
    } 
});

router.get('/search', async function(req, res) {
    const query = decodeURIComponent(req.query.query);
    const r = { users: [] };

    try{
        r.users = await (await db.User.
            find({login: {$regex: '.*' + query + '.*', $options: 'i'}})).
            map(u => {
                return {
                    userId: u._id,
                    userName: u.login
                }
            })
        
        res.json(r.users);
    }catch(err){
        console.log(err);
        return res.status(404).send();
    }
});

router.get('/status', async function(req, res) {    
    const r = {};

    try{
        const user = await db.User.findById(USER_ID);
        r.status = user.beginners_test_status

        switch (r.status) {
            case enums.BeginnersTestStatus.TEST:
            case enums.BeginnersTestStatus.TEST_STARTED:
                r.testCategoryId = (await db.Categories.
                    findOne({category_type: enums.CategoryType.BEGINNER_TEST}))._id;
                break;
            case enums.BeginnersTestStatus.BEGINNER:
                const numberOfPassedBeginnersCategories = await (await db.User_Category.
                    find({user_id: USER_ID}).
                    populate({
                        path: 'category_id',
                        match: {category_type: {$eq: enums.CategoryType.BEGINNER}}
                    })).
                    filter(x => x.category_id != null).
                    length;

                r.beginnersCategories = await (await db.Categories.
                    find({category_type: enums.CategoryType.BEGINNER})).
                    map(c => {
                        return {
                            id: c._id,
                            img: c.category_img,
                            name: c.category_name,
                            isUnlocked: numberOfPassedBeginnersCategories >= c.category_order ? true : false
                        }
                    })
                break;
        }
        return res.json(r);
    }catch(err){
        console.log(err);
        return res.status(404).send();
    } 
});

module.exports = router;
