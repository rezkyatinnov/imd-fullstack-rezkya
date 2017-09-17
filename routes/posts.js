var express = require('express');
var router = express.Router();
let passport = require('passport');
let jwt = require('jsonwebtoken');
var User = require('../models/user');
var Friend = require('../models/friend');
var FriendHelper = require('../helpers/friend-helper');
var Follow = require('../models/follow');
var FollowHelper = require('../helpers/follow-helper');
var Block = require('../models/block');
var BlockHelper = require('../helpers/block-helper');
let config = require('../config/config');
let resBuilder = require('../builders/response');
let _ = require('underscore');
let async = require('async');

// post new update
router.post('/new', function (req, res) {
    if (req.body.sender && req.body.text) {

        let sender = User.findOne({email: req.body.sender}).exec();
        sender.then(function (userSender) {
            if(userSender){
                var subscribers;
                FriendHelper.friendList(userSender._id,function(results){
                    subscribers = results;
                    FollowHelper.followerList(userSender._id,function(results){
                        subscribers = _.union(subscribers,results);
                        BlockHelper.blockedList(userSender._id,function (results) {
                            subscribers = _.difference(subscribers,results);
                            resBuilder.postUpdate(res,true,"post update success",subscribers);
                        })
                    });
                });
            }else{
                resBuilder.buildBasic(res, false, 'no user with email: '.concat(req.body.sender));
            }
        });

    } else if (!req.body.sender && !req.body.text) {
        resBuilder.buildBasic(res, false, 'missing "sender" and "text" field');
    } else if (!req.body.sender) {
        resBuilder.buildBasic(res, false, 'missing "sender" field');
    } else if (!req.body.text) {
        resBuilder.buildBasic(res, false, 'missing "text" field');
    } else {
        resBuilder.buildBasic(res, false, 'unknown error')
    }
});

module.exports = router;
