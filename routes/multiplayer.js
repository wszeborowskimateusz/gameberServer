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

router.post('/challenge', async function(req,res){
    const userId = req.body.userId;
    const categoryId = req.body.categoryId;
    const session = await DB_CONNECTION.startSession();   

    try{
        await session.startTransaction();

        const pickedCategoryId = await getCategoryId(categoryId);
        if (pickedCategoryId == null)
            throw Error;

        const newClash = new db.Clashes({
            user_from_id: USER_ID,
            user_to_id: userId,
            category_id: pickedCategoryId
        })
        await newClash.save({ session });

        const userFrom = await db.User.findById(USER_ID);
        await functions.addNotificationAsync(
            enums.NotificationType.CLASH_REQUEST,
            cfg.randomCategoryImage,
            userFrom.login,
            userId,
            userFrom._id,
            {clashId: newClash._id},
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
