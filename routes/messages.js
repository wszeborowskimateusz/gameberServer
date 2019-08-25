const cfg = require('../config');
const express = require('express');
const db = require('../' + cfg.dbPath);
const router = express.Router();


router.get('/:userId', async function(req, res) {
    const userId = req.params.userId;
    const limit = req.query.limit;
    const offset = req.query.offset;

    r = { messages: [] };

    try{


        res.json(r.messages);
    }catch(err){
        console.log(err);
        return res.status(404).send();
    }
});

router.post('/remove', async function(req, res) {
    try{

        
        res.status(200).send("Deleted");
    }catch(err){
        console.log(err);
        return res.status(404).send();
    }
});

module.exports = router;
