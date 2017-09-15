let mongoose = require('mongoose');
let Schema = mongoose.Schema;

// Schema defines how the user data will be stored in MongoDB
var FriendSchema = new Schema({
    // users is array with size 2
    users:[{ "type": Schema.Types.ObjectId, ref: "User" }],
    approved: {
        type: Boolean,
        required: true,
        default: false
    }
});

// Export the model
module.exports = mongoose.model('Friend', FriendSchema);
