let mongoose = require('mongoose');
let Schema = mongoose.Schema;

// Schema defines how the user data will be stored in MongoDB
var FollowSchema = new Schema({
    // users is array with size 2
    // user with index 0 is follower
    // user with index 1 is following
    users:[{ "type": Schema.Types.ObjectId, ref: "User" }],
    approved: {
        type: Boolean,
        required: true,
        default: false
    }
});

// Export the model
module.exports = mongoose.model('Follow', FollowSchema);
