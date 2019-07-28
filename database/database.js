var cfg = require('../config');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var connection = mongoose.connect(cfg.dbConnectionString);
// var autoIncrement = require('mongoose-auto-increment');

// autoIncrement.initialize(mongoose.connection);
// Test Field



// Test Field

let userSchema = mongoose.Schema({
    //user_id: Number,
    login: String,
    password: String,
    mail: String,
    exp_points: { type : Number, default: 0 },
    points_to_new_level: { type : Number, default: 100 },
    level: { type : Number, default: 1 },
    amount_of_coins: { type : Number, default: 100 },
    is_daily_mission_completed: { type : Boolean, default: false },
    is_account_private: { type : Boolean, default: false },
    logging_streak: { type : Number, default: 1 },
    date_of_creating_account: { type : Date, default: Date.now },
    date_of_last_login: { type : Date, default: null },
    background_img_id: { type: Schema.Types.ObjectId, ref: 'BackgroundImages' },
    picked_avatar_id: { type: Schema.Types.ObjectId, ref: 'Avatars' },
    current_country_id: { type: Schema.Types.ObjectId, ref: 'Countries' }
});
//userSchema.plugin(autoIncrement.plugin, { model: 'User', field: 'user_id', startAt: 1 });
var User = mongoose.model("User", userSchema);

let availableCountriesSchema = mongoose.Schema({
    user_id: { type: Schema.Types.ObjectId, ref: 'User' },
    country_id: { type: Schema.Types.ObjectId, ref: 'Countries' },
    level_of_advancement: Number,
    date_of_unlocking: { type : Date, default: Date.now },
    is_completed: Boolean
});
var AvailableCountries = mongoose.model("AvailableCountries", availableCountriesSchema);

let countriesSchema = mongoose.Schema({
    //country_id: Number,
    country_name: String
});
//countriesSchema.plugin(autoIncrement.plugin, { model: 'Countries', field: 'country_id', startAt: 1 });
var Countries = mongoose.model("Countries", countriesSchema);

let neighbouringCountriesSchema = mongoose.Schema({
    country_1: { type: Schema.Types.ObjectId, ref: 'Countries' },
    country_2: { type: Schema.Types.ObjectId, ref: 'Countries' }
});
var NeighbouringCountries = mongoose.model("NeighbouringCountries", neighbouringCountriesSchema);

let user_AvatarsSchema = mongoose.Schema({
    user_id: { type: Schema.Types.ObjectId, ref: 'User' },
    avatar_id: { type: Schema.Types.ObjectId, ref: 'Avatars' },
    date_of_reciving: { type : Date, default: Date.now },

});
var User_Avatar = mongoose.model("User_Avatar", user_AvatarsSchema);

let avatarsSchema = mongoose.Schema({
    //avatar_id: Number,
    avatar_name: String,
    avatar_img: String,
    price: Number
});
//avatarsSchema.plugin(autoIncrement.plugin, { model: 'Avatars', field: 'avatar_id', startAt: 1 });
var Avatars = mongoose.model("Avatars", avatarsSchema);

let messagesSchema = mongoose.Schema({
    //message_id: Number,
    content: String,
    user_from_id: { type: Schema.Types.ObjectId, ref: 'User' },
    user_to_id: { type: Schema.Types.ObjectId, ref: 'User' },
    date_of_seeing: Date,
    date_of_sending: { type : Date, default: Date.now }
});
//messagesSchema.plugin(autoIncrement.plugin, { model: 'Messages', field: 'message_id', startAt: 1 });
var Messages = mongoose.model("Messages", messagesSchema);

let user_QuestSchema = mongoose.Schema({
    user_id: { type: Schema.Types.ObjectId, ref: 'User' },
    quest_id: { type: Schema.Types.ObjectId, ref: 'DailyQuest' },
    date_of_making: { type : Date, default: Date.now },

});
var User_Quest = mongoose.model("User_Quest", user_QuestSchema);

let dailyQuestsSchema = mongoose.Schema({
    //quest_id: Number,
    name: String,
    due_date: Date,
});
//dailyQuestsSchema.plugin(autoIncrement.plugin, { model: 'DailyQuests', field: 'quest_id', startAt: 1 });
var DailyQuests = mongoose.model("DailyQuests", dailyQuestsSchema);

let friendshipSchema = mongoose.Schema({
    user_from_id: { type: Schema.Types.ObjectId, ref: 'User' },
    user_to_id: { type: Schema.Types.ObjectId, ref: 'User' },
    date_of_beginning: Date,
    date_od_invitation: { type : Date, default: Date.now }
});
var Friendship = mongoose.model("Friendship", friendshipSchema);

let backgroundImagesSchema = mongoose.Schema({
    //image_id: Number,
    image_name: String,
    image_img: String,
    price: Number
});
//backgroundImagesSchema.plugin(autoIncrement.plugin, { model: 'BackgroundImages', field: 'image_id', startAt: 1 });
var BackgroundImages = mongoose.model("BackgroundImages", backgroundImagesSchema);

let user_ImageSchema = mongoose.Schema({
    user_id: { type: Schema.Types.ObjectId, ref: 'User' },
    image_id: { type: Schema.Types.ObjectId, ref: 'BackgroundImages' },
    date_of_reciving: { type : Date, default: Date.now },
});
var User_Image = mongoose.model("User_Image", user_ImageSchema);

let achievementsSchema = mongoose.Schema({
    //achievement_id: Number,
    achievement_name: String,
    achievement_img: String,
    achievement_description: String,
});
//achievementsSchema.plugin(autoIncrement.plugin, { model: 'Achievements', field: 'achievement_id', startAt: 1 });
var Achievements = mongoose.model("Achievements", achievementsSchema);

let user_AchievementSchema = mongoose.Schema({
    user_id: { type: Schema.Types.ObjectId, ref: 'User' },
    achievement_id: { type: Schema.Types.ObjectId, ref: 'Achievements' },
    date_of_reciving: { type : Date, default: Date.now },
});
var User_Achievement = mongoose.model("User_Achievement", user_AchievementSchema);

let abstractCategorySchema = mongoose.Schema({
    //abstract_category_id: Number,
    name: String,
    description: String
});
//abstractCategorySchema.plugin(autoIncrement.plugin, { model: 'AbstractCategory', field: 'abstract_category_id', startAt: 1 });
var AbstractCategory = mongoose.model("AbstractCategory", abstractCategorySchema);

let categoriesSchema = mongoose.Schema({
    //category_id: Number,
    category_name: String,
    category_img: String,
    //repetition_category_id: { type: Schema.Types.ObjectId, ref: 'Categories' },
    coutnry_id: { type: Schema.Types.ObjectId, ref: 'Countries' },
    abstract_category_id: { type: Schema.Types.ObjectId, ref: 'AbstractCategory' }
});
//categoriesSchema.plugin(autoIncrement.plugin, { model: 'Categories', field: 'category_id', startAt: 1 });
var Categories = mongoose.model("Categories", categoriesSchema);

let gamesSchema = mongoose.Schema({
    //game_id: Number,
    game_img: String,
    game_name: String,
    game_type: String,
    category_id: { type: Schema.Types.ObjectId, ref: 'Categories' },
});
//gamesSchema.plugin(autoIncrement.plugin, { model: 'Games', field: 'game_id', startAt: 1 });
var Games = mongoose.model("Games", gamesSchema);

let gamesContentSchema = mongoose.Schema({
    //games_content_id: Number,
    image: String,
    learning_phrase: String,
    game_description: String,
    game_sound: String,
    correct_answer: String,
    game_id: { type: Schema.Types.ObjectId, ref: 'Games' },
});
//gamesContentSchema.plugin(autoIncrement.plugin, { model: 'GamesContent', field: 'games_content_id', startAt: 1 });
var GamesContent = mongoose.model("GamesContent", gamesContentSchema);

module.exports = {
    User: User,
    AvailableCountries: AvailableCountries,
    Countries: Countries,
    NeighbouringCountries: NeighbouringCountries,
    User_Avatar: User_Avatar,
    Avatars: Avatars,
    Messages: Messages,
    User_Quest: User_Quest,
    DailyQuests: DailyQuests,
    Friendship: Friendship,
    BackgroundImages: BackgroundImages,
    User_Image: User_Image,
    Achievements: Achievements,
    AbstractCategory: AbstractCategory,
    User_Achievement: User_Achievement,
    Categories: Categories,
    Games: Games,
    GamesContent: GamesContent
};
