var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cfg = require('./config');
var jwt = require('jsonwebtoken');
var cors = require('cors');


var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));



app.use('/users', usersRouter);

app.use(function(req, res, next){
    console.log("A new request received at " + Date.now());
    try {
        var auth = req.headers.authorization.split(" ");
        console.log(auth);
        if (auth[0] !== "Bearer")
          throw Error;
        var decoded = jwt.verify(auth[1], cfg.jwtSecret);
        console.log(cfg.jwtSecret);
        res.status(200).json({message: "Authenticated", type: "success"});
        next()
      } catch (err) {
        console.log(err.message);
        res.status(401).json({message: "Unauthorised access", type: "error"});
    }
 });

console.log("Zautentykowany " + Date.now());

app.use('/home', indexRouter);

module.exports = app;
