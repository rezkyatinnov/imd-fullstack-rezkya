var express = require('express');
var router = express.Router();
let passport = require('passport');
let jwt = require('jsonwebtoken');
var User = require('../models/user');
var Friend = require('../models/friend');
let config = require('../config/config');

// Register new friend
router.post('/add', function (req, res) {
    if (req.body.friends && (req.body.friends.length==2)) {

        let fromPromise = User.findOne({email:req.body.friends[0]}).exec();
        fromPromise.then(function (userFrom) {
            let toPromise = User.findOne({email:req.body.friends[1]}).exec();
            toPromise.then(function (userTo) {

                let newFriend = new Friend({
                    from: userFrom._id,
                    to: userTo._id,
                    approved: true
                });
                let promise = newFriend.save();

                promise.then(function (doc) {
                    res.json({
                        success: true,
                        message: 'Successfully created new friendship.'
                    });
                }, function (err) {
                    if (!err.message) {
                        return res.json({
                            success: false,
                            message: 'Created new friendship failed.'
                        });
                    } else {
                        return res.json({
                            success: false,
                            message: err.message
                        });
                    }
                });
            }, function (err) {
                if (!err.message) {
                    return res.json({
                        success: false,
                        message: 'Created new friendship failed.'
                    });
                } else {
                    return res.json({
                        success: false,
                        message: err.message
                    });
                }
            });
        }, function (err) {
            if (!err.message) {
                return res.json({
                    success: false,
                    message: 'Created new friendship failed.'
                });
            } else {
                return res.json({
                    success: false,
                    message: err.message
                });
            }
        });
    } else if(!req.body.friends){
        return res.json({
            success: false,
            message: 'missing "friends" field'
        });
    } else if(req.body.friends.length!=2){
        return res.json({
            success: false,
            message: 'field "friends" should be an array of user emails with size of 2 items'
        });
    }
});

module.exports = router;
