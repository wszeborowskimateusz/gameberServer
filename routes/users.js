var cfg = require('../config');
var express = require('express');
var db = require('../' + cfg.dbPath);
var router = express.Router();

var profileRouter = require('./users/profile');

app.use('/profile', profileRouter);

module.exports = router;
