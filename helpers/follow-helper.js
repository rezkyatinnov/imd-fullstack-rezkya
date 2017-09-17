var Follow = require('../models/follow');
var User = require('../models/user');
let _ = require('underscore');
let async = require('async');

module.exports = {
    followerList:function(userId,callback){
        let followQuery = Follow.find().select('users')
            .where('users.0').equals(userId).exec();
        followQuery.then(function (followlist) {
            if(followlist){
                var followFunc = [];
                _.each(followlist, function(follow) {
                    let followid;
                    if(follow.users[0].toString().toUpperCase()==userId.toString().toUpperCase()){
                        followid = follow.users[1];
                    }else{
                        followid = follow.users[0];
                    }
                    followFunc.push(function (cb) {
                        let userQuery = User.findOne({_id:followid}).select('email').exec();
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
                    followFunc,
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