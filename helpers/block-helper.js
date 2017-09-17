var Block = require('../models/block');
var User = require('../models/user');
let _ = require('underscore');
let async = require('async');

module.exports = {
    blockedList:function(userId,callback){
        let blockQuery = Block.find().select('users')
            .where('users').in([userId]).exec();
        blockQuery.then(function (blockList) {
            if(blockList){
                var blockFunc = [];
                _.each(blockList, function(block) {
                    let blockid;
                    if(block.users[0].toString().toUpperCase()==userId.toString().toUpperCase()){
                        blockid = block.users[1];
                    }else{
                        blockid = block.users[0];
                    }
                    blockFunc.push(function (cb) {
                        let userQuery = User.findOne({_id:blockid}).select('email').exec();
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
                    blockFunc,
                    function (err,results) {
                        callback([results]);
                    }
                )
            }else{
                callback([])
            }
        });
    }
}