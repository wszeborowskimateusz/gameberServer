const express = require('express');

//#region notifications
module.exports.NotificationType = Object.freeze({
    FRIEND_REQUEST: 1
});

// //#region friendship
// module.exports.FriendshipRequestState = Object.freeze({
//     SENT: 1,
//     ACCEPTED: 2,
//     DECLINED: 3
// });