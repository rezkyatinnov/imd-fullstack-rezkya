var express = require('express');
var router = express.Router();
let passport = require('passport');
let jwt = require('jsonwebtoken');
var User = require('../models/user');
var Follow = require('../models/follow');
var FollowHelper = require('../helpers/follow-helper');
let config = require('../config/config');
let resBuilder = require('../builders/response');
let _ = require('underscore');
let async = require('async');

function buildFailedSaveFollowResponse(err) {
    if (!err.message) {
        resBuilder.buildBasic(res, false, 'Created new follow failed.');
    } else {
        resBuilder.buildBasic(res, false, err.message);
    }
}

function hasFollowConnection(follower, following, isFollowCallback, unapprovedCallback, notFollowCallback) {
    let query = Follow.findOne()
        .where({ users: [follower._id, following._id] }).exec();
    query.then(function (follow) {
        if(follow){
            hasConnection(follow);
        }else{
            notFollowCallback();
        }
    }, function (err) {
        notFollowCallback();
    });

    function hasConnection(follow) {
        if (follow.approved) {
            isFollowCallback();
        } else {
            unapprovedCallback();
        }
    }
}

// Register new follow
router.post('/add', function (req, res) {
    if (req.body.requestor && req.body.target) {

        let fromPromise = User.findOne({email: req.body.requestor}).exec();
        fromPromise.then(function (userFrom) {
            if(userFrom){
                let toPromise = User.findOne({email: req.body.target}).exec();
                toPromise.then(function (userTo) {
                    if(userTo){
                        hasFollowConnection(
                            userFrom,
                            userTo,
                            function () {
                                resBuilder.buildBasic(res, false, 'already following');
                            },
                            function () {
                                resBuilder.buildBasic(res, false, 'already requested but pending');
                            },
                            function () {
                                let newFollow = new Follow({
                                    users: [userFrom._id,userTo._id],
                                    approved: true
                                });
                                let promise = newFollow.save();

                                promise.then(function (doc) {
                                    resBuilder.buildBasic(res, true, 'Successfully created new follow.');
                                }, function (err) {
                                    buildFailedSaveFollowResponse(err);
                                });
                            }
                        );
                    }else{
                        resBuilder.buildBasic(res, false, 'no user with email: '.concat(req.body.target));
                    }
                });
            }else{
                resBuilder.buildBasic(res, false, 'no user with email: '.concat(req.body.requestor));
            }
        });

    } else if (!req.body.requestor && !req.body.target) {
        resBuilder.buildBasic(res, false, 'missing "requestor" and "target" field');
    } else if (!req.body.requestor) {
        resBuilder.buildBasic(res, false, 'missing "requestor" field');
    } else if (!req.body.target) {
        resBuilder.buildBasic(res, false, 'missing "target" field');
    } else if (req.body.requestor.toUpperCase() == req.body.target.toUpperCase()) {
        resBuilder.buildBasic(res, false, 'can\'t following yourself')
    } else {
        resBuilder.buildBasic(res, false, 'unknown error')
    }
});

// retrieve follower list
router.post('/list', function (req, res) {
    if (req.body.email) {
        let userQuery = User.findOne({email: req.body.email}).exec();
        userQuery.then(function (user) {
            if(user){
                FollowHelper.followerList(user._id,function(results){
                    if(results.length>0){
                        resBuilder.followList(res,true,"retrieving user's follower success",results);
                    }else{
                        resBuilder.buildBasic(res, false, 'user has no follower');
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

module.exports = router;
