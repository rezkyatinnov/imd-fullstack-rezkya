var express = require('express');
var router = express.Router();
let passport = require('passport');
let jwt = require('jsonwebtoken');
var User = require('../models/user');
var Block = require('../models/block');
var BlockHelper = require('../helpers/block-helper');
let config = require('../config/config');
let resBuilder = require('../builders/response');
let _ = require('underscore');
let async = require('async');

function buildFailedSaveBlockResponse(err) {
    if (!err.message) {
        resBuilder.buildBasic(res, false, 'Created new Blocked User failed.');
    } else {
        resBuilder.buildBasic(res, false, err.message);
    }
}

function hasBlockConnection(blocker, blocking, isBlockedCallback, notBlockedCallback) {
    let query = Block.findOne()
        .where({ users: [blocker._id, blocking._id] }).exec();
    query.then(function (block) {
        if(block){
            isBlockedCallback(block);
        }else{
            notBlockedCallback();
        }
    }, function (err) {
        notBlockedCallback();
    });
}

// Register new block
router.post('/add', function (req, res) {
    if (req.body.requestor && req.body.target) {

        let fromPromise = User.findOne({email: req.body.requestor}).exec();
        fromPromise.then(function (userFrom) {
            if(userFrom){
                let toPromise = User.findOne({email: req.body.target}).exec();
                toPromise.then(function (userTo) {
                    if(userTo){
                        hasBlockConnection(
                            userFrom,
                            userTo,
                            function () {
                                resBuilder.buildBasic(res, false, 'already blocked');
                            },
                            function () {
                                let newBlock = new Block({
                                    users: [userFrom._id,userTo._id],
                                    approved: true
                                });
                                let promise = newBlock.save();

                                promise.then(function (doc) {
                                    resBuilder.buildBasic(res, true, 'Successfully block.');
                                }, function (err) {
                                    buildFailedSaveBlockResponse(err);
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
        resBuilder.buildBasic(res, false, 'can\'t block yourself')
    } else {
        resBuilder.buildBasic(res, false, 'unknown error')
    }
});

// retrieve blocked list
router.post('/list', function (req, res) {
    if (req.body.email) {
        let userQuery = User.findOne({email: req.body.email}).exec();
        userQuery.then(function (user) {
            if(user){
                BlockHelper.blockedList(user._id,function(results){
                    if(results.length>0){
                        resBuilder.blockList(res,true,"retrieving user's blocked list success",results);
                    }else{
                        resBuilder.buildBasic(res, false, 'user has no blocked follower/friend');
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
