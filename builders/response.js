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
    }
}