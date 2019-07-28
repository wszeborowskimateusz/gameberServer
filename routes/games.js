var cfg = require('../config');
var express = require('express');
var db = require('../' + cfg.dbPath);
var router = express.Router();

var categoriesRouter = require('./games/categories');


router.use('/categories', categoriesRouter);

module.exports = router;
