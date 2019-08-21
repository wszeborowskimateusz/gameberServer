var cfg = require('../config');
var express = require('express');
var db = require('../' + cfg.dbPath);
var router = express.Router();
var fs = fileSystem = require('fs');

// unused

router.get('/:name', function(req,res){
    try{
        const imageName = req.params.name;
        const extension = imageName.split('.').pop();
        let contentType = 'image/jpeg';
        if (extension == 'png') contentType = 'image/png';
        res.setHeader("content-type", contentType);
        fs.createReadStream('images/' + imageName).pipe(res);
    } catch(err) {
        res.status(404).send('Image/File not found');
        console.log(err);
    }
});

module.exports = router;
