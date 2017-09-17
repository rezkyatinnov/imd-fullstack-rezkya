var express = require('express');
var router = express.Router();
let passport = require('passport');
let jwt = require('jsonwebtoken');
var User = require('../models/user');
let config = require('../config/config');

// Register new users
router.post('/register', function (req, res) {
    if (!req.body.email || !req.body.password) {
        res.json({
            success: false,
            message: 'Please enter email and password.'
        });
    } else {
        let newUser = new User({
            name: req.body.name,
            email: req.body.email,
            password: req.body.password
        });

        let promise = newUser.save();

        promise.then(function (doc) {
            res.json({
                success: true,
                message: 'Successfully created new user.'
            });
        }, function (err) {
            if (!err.message) {
                return res.json({
                    success: false,
                    message: 'That email address already exists.'
                });
            } else {
                return res.json({
                    success: false,
                    message: err.message
                });
            }
        });
    }
});

router.get('/', function (req, res) {
    let promise = User.find().select('-_id -__v -password').exec();
    promise.then(function (users) {
        res.json(users);
    });
});

// Authenticate the user and get a JSON Web Token to include in the header of future requests.
router.post('/auth', (req, res) => {
    let promise = User.findOne({
        email: req.body.email
    }).then(function (user) {

        if (!user) {
            res.send({
                success: false,
                message: 'Authentication failed. User not found.'
            });
        } else {
            // Check if password matches
            user.comparePassword(req.body.password, function (err, isMatch) {
                if (isMatch && !err) {
                    // Create token if the password matched and no error was thrown
                    var token = jwt.sign(user, config.auth.secret, {
                        expiresIn: "2 days"
                    });
                    res.json({
                        success: true,
                        message: 'Authentication successfull',
                        token
                    });
                } else {
                    res.send({
                        success: false,
                        message: 'Authentication failed. Passwords did not match.'
                    });
                }
            });
        }
    }, function (err) {

        if (err) throw err;
    });
})
;


// Example of required auth: protect dashboard route with JWT
router.get('/dashboard', passport.authenticate('jwt', {
    session: false
}), function (req, res) {
    res.send('It worked! User email is: ' + req.user.email + '.');
});

module.exports = router;
