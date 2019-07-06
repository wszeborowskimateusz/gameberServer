var cfg = require('../../config');
var express = require('express');
var db = require('../../' + cfg.dbPath);
var router = express.Router();


router.get('/', function(req, res) {
    var r = {};
    r['user'] = [];

    console.log('DEBUG#0');


    db.User_Avatar.
        find({user_id: USER_ID}).
        populate('user_id').
        populate('avatar_id').
        exec(function (err, ua) {
            if (err) {
                console.log(err);
                return res.status(404);
            }
            console.log('DEBUG#1');
            //console.log(ua);

            var avatarsArr = [];
            var backgroundsArr = [];

            ua.forEach(function(a) {
                avatarsArr.push({
                    id: a.avatar_id.avatar_id,
                    name: a.avatar_id.avatar_name,
                    img: a.avatar_id.avatar_img,
                    price: a.avatar_id.price
                })
            })
            
            console.log(avatarsArr);

            db.User_Image.
                find({user_id: USER_ID}).
                populate('image_id').
                exec(function (err, ui) {
                    if (err) return res.status(404);

                    for (i in ui){
                        backgroundsArr.push({
                            id: i.image_id,
                            name: i.image_id.image_name,
                            img: i.image_id.image_img,
                            price: i.image_id.price
                        })
                    }
                })

            // r['user'].push({
            //     avatarId: ua[0].user_id.picked_avatar_id,
            //     avatars: avatarsArr,
            //     username: ua[0].user_id.login,
            //     backgroundImageId: ua[0].user_id.background_image_id,

            // })
        });


    // db.User.find(function(err, User){
    //     console.log(User)
    // })
    // console.log(USER_ID)



    res.json(r);
});

router.post('/change-avatar', function(req, res){

});

router.post('/change-image', function(req, res){

});

module.exports = router;
