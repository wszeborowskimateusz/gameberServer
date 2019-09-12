var cfg = require('../../config');
var express = require('express');
var db = require('../../' + cfg.dbPath);
var router = express.Router();


router.post('/avatars/buy', async function(req, res){
    let errorMessage = "";
    const newAvatar = req.body;
    const session = await DB_CONNECTION.startSession();

    try{
        await session.startTransaction();

        var mUser = await db.User.findById(USER_ID);
        var mAvatar = await db.Avatars.findById(newAvatar.id);

        if (mUser == null || mAvatar == null) {
            errorMessage = "Not Found";
            throw Error;
        }

        var foundAvatar = await db.User_Avatar.count({user_id: USER_ID, avatar_id: mAvatar._id});

        if (mUser.amount_of_coins < mAvatar.price || foundAvatar) {
            errorMessage = "Not acceptable";
            throw Error;
        }

        const newUserAvatar = new db.User_Avatar({ user_id: mUser._id, avatar_id: mAvatar._id });
        await newUserAvatar.save({ session });

        mUser.amount_of_coins -= mAvatar.price;
        await mUser.save({ session });

        await session.commitTransaction();
        res.status(200).json({message: "The avatar has been bought"});
    } catch(err) {
        await session.abortTransaction();
        console.log(err);
        res.status(500).json({message: errorMessage});
    } finally {
        await session.endSession();
    }
});

router.post('/images/buy', async function(req, res){
    let errorMessage = "";
    const newImage = req.body;
    const session = await DB_CONNECTION.startSession();

    try{
        await session.startTransaction();

        var mUser = await db.User.findById(USER_ID);
        var mImage = await db.BackgroundImages.findById(newImage.id);

        if (mUser == null || mImage == null) {
            errorMessage = "Not Found";
            throw Error;
        }

        var foundImage = await db.User_Image.count({user_id: USER_ID, image_id: mImage._id});

        if (mUser.amount_of_coins < mImage.price || foundImage) {
            errorMessage = "Not acceptable";
            throw Error;
        }

        const newUserImage = new db.User_Image({ user_id: mUser._id, image_id: mImage._id });
        await newUserImage.save({ session });

        mUser.amount_of_coins -= mImage.price;
        await mUser.save({ session });

        await session.commitTransaction();
        res.status(200).json({message: "The background image has been bought"});
    } catch(err) {
        await session.abortTransaction();
        console.log(err);
        res.status(500).json({message: errorMessage});
    } finally {
        await session.endSession();
    }
});

module.exports = router;
