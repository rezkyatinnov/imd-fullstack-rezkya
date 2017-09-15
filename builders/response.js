module.exports = {
    buildBasic : function (res, success, message) {
        return res.json({
            success: success,
            message: message
        });
    }
}