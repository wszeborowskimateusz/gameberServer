var cfg = require('../config');
var express = require('express');
var db = require('../' + cfg.dbPath);
var router = express.Router();


router.get('/countries', async function(req, res) {
    var r = {
        availableCountries: [],
    }

    try
    {
        var countries = await db.Countries.find({});
        r.availableCountries = countries;

        res.json(r);
    }
    catch(err)
    {
        console.log(err);
        return res.status(404);
    }
});

router.get('/unlockedCountries', async function(req,res) {
    var r = {
        unlockedCountries: [],
    }

    try
    {
        r.unlockedCountries = await db.AvailableCountries.find({user_id: USER_ID});
        res.json(r);
    }
    catch(err)
    {
        console.log(err);
        return res.status(404);
    }
});

router.post('/buyCountry', async function(req, res){
    let response = {
        status: false,
    };
    const session = await DB_CONNECTION.startSession();

    try 
    {
        await session.startTransaction();

        let data = req.body;
        let country = await db.Countries.findById(data.countryId);

        // Check if user already bought country
        let isBought = await db.AvailableCountries.countDocuments({user_id: USER_ID, country_id: country._id});
        if (!isBought)
        {
            // get user hajs
            const user = await db.User.findById(USER_ID);
            if (country.price <= user.amount_of_coins)
            {
                let new_amount_of_coins = user.amount_of_coins - country.price;
                user.amount_of_coins = new_amount_of_coins;
                await user.save({ session });
                
                let newCountryUnlock = new db.AvailableCountries({
                    user_id: USER_ID,
                    country_id: country._id,
                    level_of_advancement: 0,
                    date_of_unlocking: Date.now(),
                    is_completed: false
                });
                await newCountryUnlock.save({ session });
                
                response.status = true;
            }
            else
            {
                response.status = false;
                response.comment = 'Not enough money';
            }
        }
        else
        {
            response.status = false;
            response.commend = 'Country alredy bought by user';
        }
        await session.commitTransaction();
        return res.json(response);
    }
    catch(err)
    {
        await session.abortTransaction();
        console.log(err);
        return res.status(404);
    } finally {
        await session.endSession();
    }
});

router.post('/getCategories', async function(req, res)
{
    const response = {};

    try
    {
        // get catgories
        response.categories = await db.Categories.find({country_id: {$in: req.body.countriesIds}});

        // get category completition info
        let completedCategories = await db.User_Category.find({user_id: USER_ID});


        response.categories.forEach(c => {
            c._doc["status"] = "";

            if (completedCategories.some(e => JSON.stringify(e.category_id) === JSON.stringify(c._id))) {
                c._doc["status"] = "completed";
            }
            else if (/* CATEGORY IS STARTED*/true) {
                c._doc["status"] = "started";
            }
        });
        
        return res.json(response);
    }
    catch(err)
    {
        console.log(err);
        return res.status(404);
    }

});

module.exports = router;