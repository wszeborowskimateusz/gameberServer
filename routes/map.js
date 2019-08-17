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
        var countries = await db.AvailableCountries.find({});
        r.unlockedCountries = countries.filter(c => c.user_id == USER_ID);
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

    try 
    {
        let data = req.body;
        let country = await db.Countries.findOne({ISO: data.countryISO});

        // Check if user already bought country
        let isBought = await db.AvailableCountries.countDocuments({user_id: USER_ID, country_id: country._id});
        if (!isBought)
        {
            // get user hajs
            const user = await db.User.findById(USER_ID);
            if (country.price <= user.amount_of_coins)
            {
                let new_amount_of_coins = user.amount_of_coins - country.price;
                await db.User.findByIdAndUpdate(USER_ID, {amount_of_coins: new_amount_of_coins});
                let newCountryUnlock = new db.AvailableCountries({
                    user_id: USER_ID,
                    country_id: country._id,
                    level_of_advancement: 0,
                    date_of_unlocking: Date.now(),
                    is_completed: false
                });
                newCountryUnlock.save();
                
                response.status = true;
                return res.json(response);
            }
            else
            {
                response.status = false;
                response.comment = 'user jest zbyt biedakiem';
                return res.json(response);
            }
        }
        else
        {
            response.status = false;
            response.commend = 'Country alredy bought by user';
            return res.json(response);
        }
    }
    catch(err)
    {
        console.log(err);
        return res.status(404);
    }
});

router.post('/countryCategories', async function(req, res)
{
    let response = {
    };
    const data = req.body;
    const countryISO = data.countryISO;
    console.log('get categories for country: ' + countryISO);

    try
    {
        const categories = db.Categories.find({country_ISO: countryISO});
        response.categories = categories;
        return res.json(response);
    }
    catch(err)
    {
        console.log(err);
        return res.status(404);
    }

});

module.exports = router;