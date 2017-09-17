var express = require('express');
var router = express.Router();
let passport = require('passport');
let jwt = require('jsonwebtoken');
var User = require('../models/user');
var Friend = require('../models/friend');
var FriendHelper = require('../helpers/friend-helper');
let config = require('../config/config');
let resBuilder = require('../builders/response');
let _ = require('underscore');
let async = require('async');

function buildFailedSaveFriendResponse(err) {
    if (!err.message) {
        resBuilder.buildBasic(res, false, 'Created new friendship failed.');
    } else {
        resBuilder.buildBasic(res, false, err.message);
    }
}

function hasFriendConnection(userfrom, userto, isFriendCallback, unapprovedCallback, notAFriendCallback) {
    let query = Friend.findOne()
        .or([{ users: [userfrom._id, userto._id] }, { users: [userto._id, userfrom._id] }]).exec();
    query.then(function (friend) {
        if(friend){
            hasConnection(friend);
        }else{
            notAFriendCallback();
        }
    }, function (err) {
        notAFriendCallback();
    });

    function hasConnection(friend) {
        if (friend.approved) {
            isFriendCallback();
        } else {
            unapprovedCallback();
        }
    }
}

// Register new friend
router.post('/add', function (req, res) {
    if (req.body.friends &&
        (req.body.friends.length == 2) &&
        (req.body.friends[0].toUpperCase() != req.body.friends[1].toUpperCase())) {

        let fromPromise = User.findOne({email: req.body.friends[0]}).exec();
        fromPromise.then(function (userFrom) {
            if(userFrom){
                let toPromise = User.findOne({email: req.body.friends[1]}).exec();
                toPromise.then(function (userTo) {
                    if(userTo){
                        hasFriendConnection(
                            userFrom,
                            userTo,
                            function () {
                                resBuilder.buildBasic(res, false, 'already friend');
                            },
                            function () {
                                resBuilder.buildBasic(res, false, 'already requested but pending');
                            },
                            function () {
                                let newFriend = new Friend({
                                    users: [userFrom._id,userTo._id],
                                    approved: true
                                });
                                let promise = newFriend.save();

                                promise.then(function (doc) {
                                    resBuilder.buildBasic(res, true, 'Successfully created new friendship.');
                                }, function (err) {
                                    buildFailedSaveFriendResponse(err);
                                });
                            }
                        );
                    }else{
                        resBuilder.buildBasic(res, false, 'no user with email: '.concat(req.body.friends[1]));
                    }
                });
            }else{
                resBuilder.buildBasic(res, false, 'no user with email: '.concat(req.body.friends[0]));
            }
        });

    } else if (!req.body.friends) {
        resBuilder.buildBasic(res, false, 'missing "friends" field');
    } else if (req.body.friends.length != 2) {
        resBuilder.buildBasic(res, false, 'field "friends" should be an array of user emails with size of 2 items')
    } else if (req.body.friends[0].toUpperCase() == req.body.friends[1].toUpperCase()) {
        resBuilder.buildBasic(res, false, 'can\'t do friend request with yourself')
    } else {
        resBuilder.buildBasic(res, false, 'unknown error')
    }
});


// retrieve friend list
router.post('/list', function (req, res) {
    if (req.body.email) {
        let userQuery = User.findOne({email: req.body.email}).exec();
        userQuery.then(function (user) {
            if(user){
                FriendHelper.friendList(user._id,function(results){
                    if(results.length>0){
                        resBuilder.friendList(res,true,"retrieving user's friend success",results);
                    }else{
                        resBuilder.buildBasic(res, false, 'user has no friend');
                    }
                });
            }else{
                resBuilder.buildBasic(res, false, 'no user with email: '.concat(req.body.email));
            }
        });
    } else {
        resBuilder.buildBasic(res, false, 'missing "email" field');
    }
});

// retrieve mutual friend list
router.post('/mutual', function (req, res) {
    if (req.body.friends &&
        (req.body.friends.length == 2) &&
        (req.body.friends[0].toUpperCase() != req.body.friends[1].toUpperCase())) {
        let user1Query = User.findOne({email: req.body.friends[0]}).exec();
        user1Query.then(function (user1) {
            if(user1){

                let user2Query = User.findOne({email: req.body.friends[1]}).exec();
                user2Query.then(function (user2) {
                    if (user2) {
                        let friendQuery = Friend.find().select('users')
                            .where('users').in([user1._id,user2._id]).exec();
                        friendQuery.then(function (friendlist) {
                            if(friendlist){
                                var friendFunc = [];
                                var friend1 = [];
                                var friend2 = [];
                                _.each(friendlist, function(friend) {
                                    let friends = [friend.users[0].toString().toUpperCase(),friend.users[1].toString().toUpperCase()];
                                    if(_.indexOf(friends,user1._id.toString().toUpperCase())>=0){
                                        let i = _.indexOf(friends,user1._id.toString().toUpperCase())==0?1:0;
                                        friend1.push(friend.users[i].toString());
                                    }else if(_.indexOf(friends,user2._id.toString().toUpperCase()>=0)){
                                        let i = _.indexOf(friends,user2._id.toString().toUpperCase())==0?1:0;
                                        friend2.push(friend.users[i].toString());
                                    }
                                });
                                var mutualfriends = _.intersection(friend1,friend2);
                                _.each(mutualfriends,function (friend) {
                                    friendFunc.push(function (callback) {
                                        let userQuery = User.findOne({_id:friend}).select('email').exec();
                                        userQuery.then(function (user) {
                                            if(user){
                                                callback(null,user.email);
                                            }else{
                                                callback(null,null);
                                            }
                                        })
                                    });
                                });
                                async.parallel(
                                    friendFunc,
                                    function (err,results) {
                                        if(results && results.length>0){
                                            resBuilder.friendList(res,true,"retrieving mutual friends success",results);
                                        }else{
                                            resBuilder.friendList(res,true,"both users have no mutual friend",results);
                                        }
                                    }
                                );
                            }else{
                                resBuilder.buildBasic(res, false, 'both users have no friend');
                            }
                        });
                    }else{
                        resBuilder.buildBasic(res, false, 'no user with email: '.concat(req.body.friends[1]));
                    }
                });
            }else{
                resBuilder.buildBasic(res, false, 'no user with email: '.concat(req.body.friends[0]));
            }
        });
    } else if (!req.body.friends) {
        resBuilder.buildBasic(res, false, 'missing "friends" field');
    } else if (req.body.friends.length != 2) {
        resBuilder.buildBasic(res, false, 'field "friends" should be an array of user emails with size of 2 items')
    } else if (req.body.friends[0].toUpperCase() == req.body.friends[1].toUpperCase()) {
        resBuilder.buildBasic(res, false, 'can\'t search mutual friends with same email')
    } else {
        resBuilder.buildBasic(res, false, 'unknown error')
    }
});

module.exports = router;
