let mongoose = require('mongoose');
let Schema = mongoose.Schema;

// Schema defines how the user data will be stored in MongoDB
var BlockSchema = new Schema({
    // users is array with size 2
    // user with index 0 is blocker
    // user with index 1 is blocked
    users:[{ "type": Schema.Types.ObjectId, ref: "User" }]
});

// Export the model
module.exports = mongoose.model('Block', BlockSchema);
