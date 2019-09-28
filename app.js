const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cfg = require('./config');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const mongoose = require('mongoose');


const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const accountsRouter = require('./routes/accounts');
const imagesRouter = require('./routes/images');
const shopRouter = require('./routes/shop');
const mapRouter = require('./routes/map');
const gamesRouter = require('./routes/games');
const notificationsRouter = require('./routes/notifications');
const messagesRouter = require('./routes/messages');
const friendsRouter = require('./routes/friends');
const multiplayerRouter = require('./routes/multiplayer');

const app = express();

app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.disable('etag'); // disables 304 response


USER_ID = 0;
DB_CONNECTION = null;

// Db connection
app.use(async function(req, res, next){
    try {
      DB_CONNECTION = await mongoose.connect(cfg.dbConnectionString, { useNewUrlParser: true, useUnifiedTopology: true });
      Object.freeze(DB_CONNECTION);
      next()
    } catch (err) {
      console.log(err.message);
      res.status(500).send();
  }
});

app.use('/accounts', accountsRouter);

// Authentication
app.use(function(req, res, next){
    console.log("A new request received at " + Date.now());
    try {
        const auth = req.headers.authorization.split(" ");
        if (auth[0] !== "Bearer")
          throw Error;
        const decoded = jwt.verify(auth[1], cfg.jwtSecret);
        USER_ID = decoded.user_id;
        Object.freeze(USER_ID);
        console.log("Zautentykowany " + Date.now());

        const refreshedJwtToken = jwt.sign({ login: decoded.login, user_id: decoded.user_id }, cfg.jwtSecret, { expiresIn: cfg.expirationTimeJWT });
        res.set('refreshedJwtToken', refreshedJwtToken);
        next()
      } catch (err) {
        console.log(err.message);
        res.status(401).json({message: "Unauthorised access", type: "error"});
        //next();
    }
 });

app.use('/map', mapRouter);
app.use('/users', usersRouter);
app.use('/shop', shopRouter);
app.use('/games', gamesRouter);
app.use('/notifications', notificationsRouter);
app.use('/messages', messagesRouter);
app.use('/friends', friendsRouter);
app.use('/multiplayer', multiplayerRouter)

// Global error handler
app.use((err, req, res, next) => {
  console.log(err.message);
  res.status(500).send();
});

module.exports = app;
