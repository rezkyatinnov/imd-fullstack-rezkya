var express = require('express');
var router = express.Router();
var User = require('../models/user');
let config = require('../config/config');

// Register new users
router.post('/register', function(req, res) {
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
		},function(err) {
			if (!err.message) {
				return res.json({
					success: false,
					message: 'That email address already exists.'
				});
			}else{
				return res.json({
					success: false,
					message: err.message
				});
			}
		});
	}
});

router.get('/', function(req, res) {
	let promise = User.find().select('-_id -__v -password').exec();
	promise.then(function (users) {
		res.json(users);
	});
});


module.exports = router;
