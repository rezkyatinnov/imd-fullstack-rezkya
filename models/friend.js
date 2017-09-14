let mongoose = require('mongoose');
let Schema = mongoose.Schema;

// Schema defines how the user data will be stored in MongoDB
var FriendSchema = new Schema({
    from: { type: Schema.Types.ObjectId, ref: 'User' },
    to: { type: Schema.Types.ObjectId, ref: 'User' },
    approved: {
        type: Boolean,
        required: true,
        default: false
    }
});

// Export the model
module.exports = mongoose.model('Friend', FriendSchema);
