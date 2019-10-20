const express = require('express');

//#region notifications
module.exports.NotificationType = Object.freeze({
    FRIEND_REQUEST: 'friendship_request',
    NEW_MESSAGE: 'message_received',
    NEW_ACHIEVEMENT: 'achievement_receive',
    FRIEND_REQUEST_ACCEPTED: 'friendship_accepted',
    CLASH_REQUEST: 'clash_request',
    CLASH_WON: 'clash_won',
    CLASH_LOST: 'clash_lost',
    CLASH_DRAW: 'clash_draw',
    CLASH_ACCEPTED: 'clash_accepted'
});

module.exports.NotificationImage = Object.freeze({
    NEW_MESSAGE: 'new_message.jpg',
    FRIEND_REQUEST: 'friend_request.jpg',
    CLASH_REQUEST: 'notifications/clash_request.jpg'
});
//#endregion

//#region beginnersTest
module.exports.BeginnersTestStatus = Object.freeze({
    MAP: 'map',
    TEST: 'test',
    BEGINNER: 'beginner',
    TEST_STARTED: 'testStarted'
});
//#endregion

//#region categories
module.exports.CategoryType = Object.freeze({
    BEGINNER_TEST: 'BT',
    BEGINNER: 'B',
    NORMAL: 'N',
    CLASH: 'C',
    SEASONAL: 'S'
});
//#endregion

//#region experience
module.exports.ExperienceSubject = Object.freeze({
    LOGIN_STREAK: 'Login Streak',
    CLASH: 'Clash'
});
//#endregion

//#region achievements
module.exports.AchievementsSymbol = Object.freeze({
    LOGIN_STREAK_5: 'login5',
    LOGIN_STREAK_10: 'login10',
    LOGIN_STREAK_15: 'login15',
    LOGIN_STREAK_20: 'login20',
    FIRST_STEP: 'first_step',
});
//#endregion

//#region messages
module.exports.Message = Object.freeze({
    BAD_REQUEST: "Błędne żądanie",
    LOGIN_EXISTS: "Login jest zajęty. Wybierz inny",
    MAIL_EXISTS: "Adres e-mail jest zajęty. Wybierz inny",
    SERVER_ERROR: "Błąd serwera",
    UNAUTHORISED_ACCESS: "Nieprawidłowe dane logowania",
    SUCCESS_LOGIN: "Zalogowano"
});
//#endregion

