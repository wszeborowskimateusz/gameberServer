var cfg = require('../../config');
var express = require('express');
var db = require('../../' + cfg.dbPath);
var router = express.Router();

router.get('/', function(req, res) {
  
});

router.post('/change-avatar', function(req, res){

});

router.post('/change-image', function(req, res){

});

module.exports = router;
