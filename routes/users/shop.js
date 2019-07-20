var cfg = require('../../config');
var express = require('express');
var db = require('../../' + cfg.dbPath);
var router = express.Router();


router.post('/avatars/buy', async function(req, res){
    var newAvatar = req.body.avatar;

    var mUser = await db.User.findById(USER_ID);
    var mAvatar = await db.Avatars.findById(newAvatar.id);

    if (mUser == null || mAvatar == null)
        return res.status(404).json({message: "Not found"});

    if (mUser.ammount_of_coins < mAvatar.price)
        return res.status(406).json({message: "Not acceptable"});

    db.User_Avatar.create({ user_id: mUser._id, avatar_id = mAvatar._id }, function (err) {
        if (err)
            return res.status(500).json({message: "DB error"});

        mUser.ammount_of_coins -= mAvatar.price;
        mUser.save(function (err) {
            if (err)
                return res.status(500).json({message: "DB error"});
            else
                res.status(200).json({message: "The avatar has been bought"});
        });
    });
});

router.post('/images/buy', async function(req, res){
    var newImage = req.body.image;

    var mUser = await db.User.findById(USER_ID);
    var mImage = await db.BackgroundImages.findById(newImage.id);

    if (mUser == null || mImage == null)
        return res.status(404).json({message: "Not found"});

    if (mUser.ammount_of_coins < mImage.price)
        return res.status(406).json({message: "Not acceptable"});

    db.User_Image.create({ user_id: mUser._id, avatar_id = mImage._id }, function (err) {
        if (err)
            return res.status(500).json({message: "DB error"});

        mUser.ammount_of_coins -= mImage.price;
        mUser.save(function (err) {
            if (err)
                return res.status(500).json({message: "DB error"});
            else
                res.status(200).json({message: "The background image has been bought"});
        });
    });
});

module.exports = router;
