const express = require('express');

//#region notifications
module.exports.NotificationType = Object.freeze({
    FRIEND_REQUEST: 1,
    NEW_MESSAGE: 2
});

module.exports.NotificationImage = Object.freeze({
    NEW_MESSAGE: 'new_message.jpg',
    FRIEND_REQUEST: 'friend_request.jpg'
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
    NORMAL: 'N'
});
//#endregion

// //#region friendship
// module.exports.FriendshipRequestState = Object.freeze({
//     SENT: 1,
//     ACCEPTED: 2,
//     DECLINED: 3
// });