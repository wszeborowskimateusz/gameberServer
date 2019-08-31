// To run db type "npm install run-rs -g" -> then "run-rs --mongod --dbpath c:\path_to_mongo_data\dbs -h "localhost" --keep"

const cfg = require('../config');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const enums = require('../enums');

// Test Field



// Test Field
const notificationsSchema = mongoose.Schema({
    type: String,
    notification_img: String,
    date_of_receiving: { type : Date, default: Date.now },
    title: String,
    name: String,
    description: String,
    is_read: { type : Boolean, default: false },
    is_deleted: { type : Boolean, default: false },
    user_id: { type: Schema.Types.ObjectId, ref: 'User' }
});
const Notifications = mongoose.model("Notifications", notificationsSchema);

const experienceSchema = mongoose.Schema({
    earned_points: Number,
    subject: String,
    date_of_receiving: { type : Date, default: Date.now },
    user_id: { type: Schema.Types.ObjectId, ref: 'User' }
});
const Experience = mongoose.model("Experience", experienceSchema);

const userSchema = mongoose.Schema({
    //user_id: Number,
    login: String,
    password: String,
    mail: String,
    points_to_new_level: { type : Number, default: 100 },
    points: { type : Number, default: 0 },
    level: { type : Number, default: 1 },
    amount_of_coins: { type : Number, default: 100 },
    is_daily_mission_completed: { type : Boolean, default: false },
    is_account_private: { type : Boolean, default: false },
    logging_streak: { type : Number, default: 0 },
    beginners_test_status: { type: String, default: enums.BeginnersTestStatus.TEST},
    date_of_creating_account: { type : Date, default: Date.now },
    date_of_last_login: { type : Date, default: "0-1-1" },
    background_img_id: { type: Schema.Types.ObjectId, ref: 'BackgroundImages' },
    picked_avatar_id: { type: Schema.Types.ObjectId, ref: 'Avatars' },
    current_country_id: { type: Schema.Types.ObjectId, ref: 'Countries' }
});
const User = mongoose.model("User", userSchema);

const availableCountriesSchema = mongoose.Schema({
    user_id: { type: Schema.Types.ObjectId, ref: 'User' },
    country_id: { type: Schema.Types.ObjectId, ref: 'Countries' },
    level_of_advancement: Number,
    date_of_unlocking: { type : Date, default: Date.now },
    is_completed: Boolean
});
const AvailableCountries = mongoose.model("AvailableCountries", availableCountriesSchema);

const countriesSchema = mongoose.Schema({
    ISO: String,
    country_name: String,
    price: Number,
    centerLatitude: Number,
    centerLongitude: Number,
    country_icon: String
    //country_id: Number,
});
const Countries = mongoose.model("Countries", countriesSchema);

const neighbouringCountriesSchema = mongoose.Schema({
    country_1: { type: Schema.Types.ObjectId, ref: 'Countries' },
    country_2: { type: Schema.Types.ObjectId, ref: 'Countries' }
});
const NeighbouringCountries = mongoose.model("NeighbouringCountries", neighbouringCountriesSchema);

const user_AvatarsSchema = mongoose.Schema({
    user_id: { type: Schema.Types.ObjectId, ref: 'User' },
    avatar_id: { type: Schema.Types.ObjectId, ref: 'Avatars' },
    date_of_reciving: { type : Date, default: Date.now },

});
const User_Avatar = mongoose.model("User_Avatar", user_AvatarsSchema);

const avatarsSchema = mongoose.Schema({
    //avatar_id: Number,
    avatar_name: String,
    avatar_img: String,
    price: Number
});
const Avatars = mongoose.model("Avatars", avatarsSchema);

const messagesSchema = mongoose.Schema({
    //message_id: Number,
    content: String,
    user_from_id: { type: Schema.Types.ObjectId, ref: 'User' },
    user_to_id: { type: Schema.Types.ObjectId, ref: 'User' },
    date_of_seeing: Date,
    date_of_sending: { type : Date, default: Date.now }
});
const Messages = mongoose.model("Messages", messagesSchema);

const user_QuestSchema = mongoose.Schema({
    user_id: { type: Schema.Types.ObjectId, ref: 'User' },
    quest_id: { type: Schema.Types.ObjectId, ref: 'DailyQuest' },
    date_of_making: { type : Date, default: Date.now },

});
const User_Quest = mongoose.model("User_Quest", user_QuestSchema);

const dailyQuestsSchema = mongoose.Schema({
    //quest_id: Number,
    name: String,
    due_date: Date,
});
const DailyQuests = mongoose.model("DailyQuests", dailyQuestsSchema);

const friendshipSchema = mongoose.Schema({
    user_from_id: { type: Schema.Types.ObjectId, ref: 'User' },
    user_to_id: { type: Schema.Types.ObjectId, ref: 'User' },
    date_of_beginning: Date,
    date_od_invitation: { type : Date, default: Date.now },
    //state: { type : String, default: enums.FriendshipRequestState.SENT },
});
const Friendship = mongoose.model("Friendship", friendshipSchema);

const backgroundImagesSchema = mongoose.Schema({
    //image_id: Number,
    image_name: String,
    image_img: String,
    price: Number
});
const BackgroundImages = mongoose.model("BackgroundImages", backgroundImagesSchema);

const user_ImageSchema = mongoose.Schema({
    user_id: { type: Schema.Types.ObjectId, ref: 'User' },
    image_id: { type: Schema.Types.ObjectId, ref: 'BackgroundImages' },
    date_of_reciving: { type : Date, default: Date.now },
});
const User_Image = mongoose.model("User_Image", user_ImageSchema);

const achievementsSchema = mongoose.Schema({
    //achievement_id: Number,
    achievement_name: String,
    achievement_img: String,
    achievement_description: String,
});
const Achievements = mongoose.model("Achievements", achievementsSchema);

const user_AchievementSchema = mongoose.Schema({
    user_id: { type: Schema.Types.ObjectId, ref: 'User' },
    achievement_id: { type: Schema.Types.ObjectId, ref: 'Achievements' },
    date_of_reciving: { type : Date, default: Date.now },
});
const User_Achievement = mongoose.model("User_Achievement", user_AchievementSchema);

const abstractCategorySchema = mongoose.Schema({
    //abstract_category_id: Number,
    name: String,
    description: String
});
const AbstractCategory = mongoose.model("AbstractCategory", abstractCategorySchema);

const categoriesSchema = mongoose.Schema({
    //category_id: Number,
    category_name: String,
    category_img: String,
    category_icon: String,
    category_type: String,
    category_order: Number,
    prize_points: Number,
    prize_coins: Number,
    //repetition_category_id: { type: Schema.Types.ObjectId, ref: 'Categories' },
    country_id: { type: Schema.Types.ObjectId, ref: 'Countries' },
    abstract_category_id: { type: Schema.Types.ObjectId, ref: 'AbstractCategory' }
});
const Categories = mongoose.model("Categories", categoriesSchema);

const gamesSchema = mongoose.Schema({
    //game_id: Number,
    game_name: String,
    game_info: String,
    correct_answer: String,
    category_id: { type: Schema.Types.ObjectId, ref: 'Categories' },
});
const Games = mongoose.model("Games", gamesSchema);

const user_GameSchema = mongoose.Schema({
    game_id: { type: Schema.Types.ObjectId, ref: 'Games' },
    user_id: { type: Schema.Types.ObjectId, ref: 'User' },
    date_of_passing: { type : Date, default: Date.now },
});
const User_Game = mongoose.model("User_Game", user_GameSchema);

const user_CategorySchema = mongoose.Schema({
    category_id: { type: Schema.Types.ObjectId, ref: 'Categories' },
    user_id: { type: Schema.Types.ObjectId, ref: 'User' },
    date_of_passing: { type : Date, default: Date.now }
});
const User_Category = mongoose.model("User_Category", user_CategorySchema);

const achievement_CategorySchema = mongoose.Schema({
    category_id: { type: Schema.Types.ObjectId, ref: 'Categories' },
    achievement_id: { type: Schema.Types.ObjectId, ref: 'Achievements' },
});
const Achievement_Category = mongoose.model("Achievement_Category", achievement_CategorySchema);


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
    Experience: Experience,
    User_Game: User_Game,
    User_Category: User_Category,
    Achievement_Category: Achievement_Category,
    Notifications: Notifications
};
