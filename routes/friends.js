var express = require('express');
var router = express.Router();
let passport = require('passport');
let jwt = require('jsonwebtoken');
var User = require('../models/user');
var Friend = require('../models/friend');
let config = require('../config/config');
let resBuilder = require('../builders/response');

function buildFailedSaveFriendResponse(err) {
    if (!err.message) {
        resBuilder.buildBasic(res, false, 'Created new friendship failed.');
    } else {
        resBuilder.buildBasic(res, false, err.message);
    }
}

function hasFriendConnection(userfrom, userto, isFriendCallback, unapprovedCallback, notAFriendCallback) {
    let fromPromise = Friend.findOne({from: userfrom._id,to:userto._id}).exec();
    fromPromise.then(function (friend) {
        hasConnection(friend);
    }, function (err) {
        let toPromise = Friend.findOne({from: userto._id,to:userfrom._id}).exec();
        toPromise.then(function (friend) {
            hasConnection(friend);
        }, function (err) {
            notAFriendCallback();
        });
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
                                    from: userFrom._id,
                                    to: userTo._id,
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

module.exports = router;
