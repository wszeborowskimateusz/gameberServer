const cfg = require('../config');
const enums = require('../enums');
const express = require('express');
const functions = require('../functions');
const db = require('../' + cfg.dbPath);
const router = express.Router();


router.get('/categories', async function(req, res) {
    var r = [{
        categoryName: cfg.randomCategoryName,
        img: cfg.imagesUrl + cfg.randomCategoryImage,
        id: cfg.randomCategoryId
    }];
    
    res.json(r);
});

router.get('/clashes', async function(req, res) {
    var r = {
        clashes: []
    };
    
    try{
        const clashes = await db.Clashes.
            find({$or: [
                    {user_from_id: USER_ID},
                    {user_to_id: USER_ID}],
                 date_of_accepting: {$ne: null}}).
            populate('category_id');

        for (const clash of clashes){
            const areWeUserFrom = clash.user_from_id == USER_ID;
            const userId = areWeUserFrom ? clash.user_to_id : clash.user_from_id;
            const user = await db.User.
                findById(userId).
                populate('picked_avatar_id')

            await r.clashes.push({
                clashId: clash._id,
                userId: userId,
                userName: user.login,
                userAvatar: cfg.imagesUrl + user.picked_avatar_id.avatar_img,
                categoryId: clash.category_id._id,
                percentage: areWeUserFrom ? clash.user_from_percentage : clash.user_to_percentage, 
                opponentsPercentage: areWeUserFrom ? clash.user_to_percentage : clash.user_from_percentage, 
                categoryName: clash.category_id.category_name,
                categoryIcon: cfg.imagesUrl + clash.category_id.category_icon
            })
        }

        res.status(200).json(r.clashes);
    } catch(err) {
        res.status(400).send();
    } 
});

router.post('/challenge', async function(req,res){
    const userId = req.body.userId;
    const categoryId = req.body.categoryId;
    const session = await DB_CONNECTION.startSession();   

    try{
        await session.startTransaction();

        const alreadyChallenged = await db.Clashes.findOne({
            $and: [
                {$or: [{user_from_id: USER_ID, user_to_id: userId},
                    {user_from_id: userId, user_to_id: USER_ID}]},
                {$or: [{user_from_percentage: null},
                    {user_to_percentage: null}]}
                ]});
        if (alreadyChallenged)
            throw Error;

        const pickedCategoryId = await getCategoryId(categoryId);
        if (pickedCategoryId == null)
            throw Error;
 
        const userFrom = await db.User.findById(USER_ID);
        
        const newClash = new db.Clashes({
            user_from_id: USER_ID,
            user_to_id: userId,
            category_id: pickedCategoryId
        })

        const notificationId = await functions.addNotificationAsync(
            enums.NotificationType.CLASH_REQUEST,
            cfg.randomCategoryImage,
            userFrom.login,
            userId,
            userFrom._id,
            {clashId: newClash._id},
            session);
            
        newClash.notification_id = notificationId;
        await newClash.save({ session });

        await session.commitTransaction();
        res.status(200).send();
    } catch(err) {
        await session.abortTransaction();
        res.status(400).send();
    } finally {
        await session.endSession();
    }
});

router.post('/accept-request', async function(req,res){
    const clashId = req.body.clashId;
    const session = await DB_CONNECTION.startSession();   

    try{
        await session.startTransaction();

        const clash = await db.Clashes.
            findById(clashId).
            populate({
                path: 'user_to_id',
                populate: {path: 'picked_avatar_id'}
            })

        clash.date_of_accepting = new Date();
        await clash.save({ session });
        await functions.removeNotificationAsync(clash.notification_id, session);
           
        await functions.addNotificationAsync(
            enums.NotificationType.CLASH_ACCEPTED,
            clash.user_to_id.picked_avatar_id.avatar_img,
            clash.user_to_id.login,
            clash.user_from_id,
            clash.user_to_id,
            null,
            session);

        await session.commitTransaction();
        res.status(200).send();
    } catch(err) {
        await session.abortTransaction();
        res.status(400).send();
    } finally {
        await session.endSession();
    }
});

router.post('/decline-request', async function(req,res){
    const clashId = req.body.clashId;
    const session = await DB_CONNECTION.startSession();   

    try{
        await session.startTransaction();

        const clash = await db.Clashes.findById(clashId);

        await functions.removeNotificationAsync(clash.notification_id, session);
        await clash.remove({ session });

        await session.commitTransaction();
        res.status(200).send();
    } catch(err) {
            await session.abortTransaction();
            res.status(400).send();
    } finally {
            await session.endSession();
    }
});


// Functions

async function getCategoryId(categoryId){
    let pickedCategoryId;
    switch (categoryId){
        case cfg.randomCategoryId:
            const numerOfClashCategories = await db.Categories.
                countDocuments({category_type: enums.CategoryType.CLASH});
            const rndCategoryIndex = Math.floor(Math.random() * numerOfClashCategories);
            pickedCategoryId = await db.Categories.
                findOne({category_type:enums.CategoryType.CLASH}, null, {skip: rndCategoryIndex})
            break;
        default:
            break;
    }

    return pickedCategoryId;
}

module.exports = router;
