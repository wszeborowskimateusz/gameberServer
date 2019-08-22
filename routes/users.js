var cfg = require('../config');
var express = require('express');
var db = require('../' + cfg.dbPath);
var router = express.Router();

var profileRouter = require('./users/profile');
var shopRouter = require('./users/shop');
var rankingsRouter = require('./users/rankings');

//TEST FIELD


//TEST FIELD - END

router.use('/profile', profileRouter);
router.use('/shop', shopRouter);
router.use('/rankings', rankingsRouter);

module.exports = router;
