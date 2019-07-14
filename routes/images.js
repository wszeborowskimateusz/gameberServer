var cfg = require('../config');
var express = require('express');
var db = require('../' + cfg.dbPath);
var router = express.Router();
var fs = fileSystem = require('fs');

// unused

router.get('/:name', function(req,res){
    try{
        res.setHeader("content-type", "image/jpeg");
        fs.createReadStream('images/' + req.params.name).pipe(res);
    } catch(err) {
        res.status(404).send('Image/File not found');
        console.log(err);
    }
});

module.exports = router;
