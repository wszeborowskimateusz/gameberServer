var cfg = require('../config');
var mongoose = require('mongoose');
var connection = mongoose.connect(cfg.dbConnectionString);
var autoIncrement = require('mongoose-auto-increment');

autoIncrement.initialize(mongoose.connection);


let userSchema = mongoose.Schema({
    user_id: Number,
    login: String,
    password: String,
    mail: String,
    exp_points: Number,
    level: Number,
    ammount_of_coins: Number,
    is_daily_mission_completed: Boolean,
    is_account_private: Boolean,
    logging_streak: Number,
    date_of_creating_account: { type : Date, default: Date.now },
    date_of_last_login: Date,
    background_img_id: Number,
    picked_avatar_id: Number,
    current_country_id: Number,
});
userSchema.plugin(autoIncrement.plugin, { model: 'User', field: 'user_id', startAt: 1 });
var User = mongoose.model("User", userSchema);

let availableCountriesSchema = mongoose.Schema({
    user_id: Number,
    country_id: Number,
    level_of_advancement: number,
    date_of_unlocking: { type : Date, default: Date.now },
    is_completed: Boolean
});
var AvailableCountries = mongoose.model("AvailableCountries", availableCountriesSchema);

// usunięcie wszędzie xxx_id
let countriesSchema = mongoose.Schema({
    country_id: Number,
    level_of_advancement: number,
    date_of_unlocking: { type : Date, default: Date.now },
    is_completed: Boolean
});
userSchema.plugin(autoIncrement.plugin, { model: 'User', field: 'user_id', startAt: 1 });
var AvailableCountries = mongoose.model("AvailableCountries", availableCountriesSchema);

// The rest of schemas goes here

module.exports = {
    User: User
};
