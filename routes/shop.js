var cfg = require('../config');
var express = require('express');
var db = require('../' + cfg.dbPath);
var router = express.Router();
var fs = fileSystem = require('fs');

// unused

router.get('/avatars', async function(req, res) {
    var r = {
        avatars: []
    };

    try{
        var avatars = await db.Avatars.find({});
        var len = await db.Avatars.count({});

        for (let i = 0; i < len; ++i){
            var a = avatars[i];
            var foundAvatar = await db.User_Avatar.count({user_id: USER_ID, avatar_id: a.avatar_id});
            if (foundAvatar == 0)
                await r.avatars.push({
                    id: a._id,
                    name: a.avatar_name,
                    img: cfg.imagesUrl + a.avatar_img,
                    price: a.price
                })
        }
        res.json(r);

    }catch(err){
        console.log(err);
        return res.status(404);
    }
});

router.get('/images', async function(req, res) {
    var r = {
        backgroundImages: []
    };

    try{
        var backgrounds = await db.BackgroundImages.find({});
        var len = await db.BackgroundImages.count({});
        for (let i = 0; i < len; ++i){
            var b = backgrounds[i];
            var foundBackground = await db.User_Image.count({user_id: USER_ID, image_id: b.image_id});
            if (foundBackground == 0)
                await r.backgroundImages.push({
                    id: b._id,
                    name: b.image_name,
                    img: cfg.imagesUrl + b.image_img,
                    price: b.price
                })
        }
        res.json(r);
    }catch(err){
        console.log(err);
        return res.status(404);
    }
});

module.exports = router;
