const express = require('express');

//#region notifications
module.exports.NotificationType = Object.freeze({
    FRIEND_REQUEST: 1,
    NEW_MESSAGE: 2
});

module.exports.NotificationImage = Object.freeze({
    NEW_MESSAGE: 'new_message.jpg'
});

// //#region friendship
// module.exports.FriendshipRequestState = Object.freeze({
//     SENT: 1,
//     ACCEPTED: 2,
//     DECLINED: 3
// });