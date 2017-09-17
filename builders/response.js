module.exports = {
    buildBasic : function (res, success, message) {
        return res.json({
            success: success,
            message: message
        });
    },
    friendList : function (res, success, message,friends) {
        return res.json({
            success: success,
            message: message,
            friends:friends,
            count:friends.length
        });
    },
    followList : function (res, success, message,follower) {
        return res.json({
            success: success,
            message: message,
            follower:follower,
            count:follower.length
        });
    },
    blockList : function (res, success, message,blocked) {
        return res.json({
            success: success,
            message: message,
            blocked:blocked,
            count:blocked.length
        });
    }
}