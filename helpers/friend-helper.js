var Friend = require('../models/friend');
var User = require('../models/user');
let _ = require('underscore');
let async = require('async');

module.exports = {
    friendList:function(userId,callback){
        let friendQuery = Friend.find().select('users')
            .where('users').in([userId]).exec();
        friendQuery.then(function (friendlist) {
            if(friendlist){
                var friendFunc = [];
                _.each(friendlist, function(friend) {
                    let friendid;
                    if(friend.users[0].toString().toUpperCase()==userId.toString().toUpperCase()){
                        friendid = friend.users[1];
                    }else{
                        friendid = friend.users[0];
                    }
                    friendFunc.push(function (cb) {
                        let userQuery = User.findOne({_id:friendid}).select('email').exec();
                        userQuery.then(function (user) {
                            if(user){
                                cb(null,user.email);
                            }else{
                                cb(null,null);
                            }
                        })
                    });
                });
                async.parallel(
                    friendFunc,
                    function (err,results) {
                        callback(results);
                    }
                )
            }else{
                callback([])
            }
        });
    }
}