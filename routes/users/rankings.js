var cfg = require('../../config');
var functions = require('../../functions');
var express = require('express');
var db = require('../../' + cfg.dbPath);
var router = express.Router();



router.get('/', async function(req, res){
    var r = {};

    try
    {
        var date = new Date();

        r.overall = await functions.fillRankingAsync(1, 1, 1, 10);
        r.monthly = await functions.fillRankingAsync(date.getFullYear(), date.getMonth() + 1, 1, 10);
        r.daily = await functions.fillRankingAsync(date.getFullYear(), date.getMonth() + 1, date.getDate(), 10);

        res.json(r);
    }catch(err){
        console.log(err);
        return res.status(404).send();
    }
});

module.exports = router;
