var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cfg = require('./config');
var jwt = require('jsonwebtoken');



var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/users', usersRouter);

app.use(function(req, res, next){
    console.log("A new request received at " + Date.now());
    try {
        var decoded = jwt.verify(req.body.jwtToken, cfg.jwtSecret);
        console.log(req.body.jwtToken);
        console.log(cfg.jwtSecret);
        res.status(200).json({message: "Authenticated", type: "success"});
        next()
      } catch (err) {
        console.log(err.message);
        res.status(401).json({message: "Unauthorised access", type: "error"});
    }
 });

app.use('/', indexRouter);

module.exports = app;
